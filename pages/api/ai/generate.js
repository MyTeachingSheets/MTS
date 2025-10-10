import OpenAI from 'openai'
import { createClient } from '@supabase/supabase-js'

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export default async function handler(req, res) {
  // Basic CORS handling: allow preflight and POST
  // Use NEXT_PUBLIC_SITE_URL in production or '*' for local/dev
  const allowOrigin = process.env.NEXT_PUBLIC_SITE_URL || '*'
  res.setHeader('Access-Control-Allow-Origin', allowOrigin)
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  // Respond to CORS preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  // Only allow POST requests for actual generation
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  // Validate API key is configured
  if (!process.env.OPENAI_API_KEY) {
    console.error('OPENAI_API_KEY is not configured')
    return res.status(500).json({ 
      error: 'OpenAI API key is not configured',
      details: 'Please add OPENAI_API_KEY to your .env.local file' 
    })
  }

  try {
    const { 
      subject, 
      framework, 
      grade, 
      lesson,
      lessonDescription,
      worksheetType, 
      customInstructions,
      assistantId // OpenAI Assistant/Prompt ID
    } = req.body

    // Validation
    if (!subject || !grade || !worksheetType) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        details: 'subject, grade, and worksheetType are required' 
      })
    }

    // Build the user message with worksheet requirements
    const userMessage = buildUserMessage({
      subject,
      framework,
      grade,
      lesson,
      lessonDescription,
      worksheetType,
      customInstructions
    })

    console.log('Generating worksheet with OpenAI...')
    console.log('Subject:', subject, '| Grade:', grade, '| Type:', worksheetType)

    let completion
    let aiResponse
    let templateConfig = null

    // If promptTemplateName is provided, fetch full configuration from database
    if (req.body.promptTemplateName) {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      )
      
      const { data: template, error } = await supabase
        .from('prompt_templates')
        .select('*')
        .eq('name', req.body.promptTemplateName)
        .eq('is_active', true)
        .single()
      
      if (!error && template) {
        templateConfig = template
        console.log(`Using template: ${template.display_name}`)
      }
    }

    // Determine which API to use: Assistants API or Chat Completions API
    const useAssistantId = assistantId || templateConfig?.assistant_id

    // If Assistant ID is provided, use Assistants API (custom prompts)
    if (useAssistantId) {
      console.log('Using OpenAI Assistant ID:', useAssistantId)
      
      // Create a thread
      const thread = await openai.beta.threads.create()
      
      // Add user message to thread
      await openai.beta.threads.messages.create(thread.id, {
        role: 'user',
        content: userMessage
      })
      
      // Run the assistant
      const run = await openai.beta.threads.runs.create(thread.id, {
        assistant_id: useAssistantId
      })
      
      // Wait for completion (poll for status)
      let runStatus = await openai.beta.threads.runs.retrieve(thread.id, run.id)
      let attempts = 0
      const maxAttempts = 60 // 60 seconds max wait
      
      while (runStatus.status !== 'completed' && attempts < maxAttempts) {
        if (runStatus.status === 'failed' || runStatus.status === 'cancelled' || runStatus.status === 'expired') {
          throw new Error(`Assistant run ${runStatus.status}: ${runStatus.last_error?.message || 'Unknown error'}`)
        }
        
        await new Promise(resolve => setTimeout(resolve, 1000)) // Wait 1 second
        runStatus = await openai.beta.threads.runs.retrieve(thread.id, run.id)
        attempts++
      }
      
      if (runStatus.status !== 'completed') {
        throw new Error('Assistant run timed out')
      }
      
      // Get the assistant's response
      const messages = await openai.beta.threads.messages.list(thread.id)
      const assistantMessage = messages.data.find(msg => msg.role === 'assistant')
      
      if (!assistantMessage || !assistantMessage.content[0]?.text?.value) {
        throw new Error('No response from assistant')
      }
      
      aiResponse = assistantMessage.content[0].text.value
      
      // Return metadata for Assistants API
      completion = {
        model: runStatus.model,
        usage: runStatus.usage || { total_tokens: 0, prompt_tokens: 0, completion_tokens: 0 }
      }
      
    } else {
      // Use standard Chat Completions API with inline prompt
      console.log('Using Chat Completions API with inline prompt')
      
      // Use system prompt from template config or fallback to default
      const systemPrompt = templateConfig?.system_prompt || buildSystemPrompt()
      
      // Use model settings from template config (fallback to hardcoded defaults)
      // Note: When using Assistant ID, these settings are ignored (configured in OpenAI platform)
      const model = templateConfig?.model || 'gpt-4o'
      const temperature = templateConfig?.temperature || 0.7
      const maxTokens = templateConfig?.max_tokens || 4000
      const responseFormat = templateConfig?.response_format || 'json_object'
      
      console.log(`Model: ${model}, Temperature: ${temperature}, Max Tokens: ${maxTokens}`)
      
      completion = await openai.chat.completions.create({
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage }
        ],
        temperature,
        max_tokens: maxTokens,
        response_format: { type: responseFormat }
      })
      
      aiResponse = completion.choices[0].message.content
    }
    
    // Parse the JSON response
    let worksheetData
    try {
      worksheetData = JSON.parse(aiResponse)
    } catch (parseError) {
      console.error('Failed to parse OpenAI response:', parseError)
      return res.status(500).json({ 
        error: 'Failed to parse AI response',
        details: 'The AI response was not valid JSON',
        rawResponse: aiResponse 
      })
    }

    // Return the generated worksheet data
    return res.status(200).json({
      success: true,
      worksheet: worksheetData,
      metadata: {
        model: completion.model,
        tokensUsed: completion.usage.total_tokens,
        promptTokens: completion.usage.prompt_tokens,
        completionTokens: completion.usage.completion_tokens
      }
    })

  } catch (error) {
    console.error('OpenAI API Error:', error)
    
    // Handle specific OpenAI errors
    if (error.status === 401) {
      return res.status(500).json({ 
        error: 'Invalid OpenAI API key',
        details: 'Please check your OPENAI_API_KEY in .env.local' 
      })
    }
    
    if (error.status === 429) {
      return res.status(429).json({ 
        error: 'Rate limit exceeded',
        details: 'Too many requests to OpenAI. Please try again later.' 
      })
    }

    if (error.status === 500) {
      return res.status(500).json({ 
        error: 'OpenAI service error',
        details: 'OpenAI service is currently unavailable' 
      })
    }

    return res.status(500).json({ 
      error: 'Failed to generate worksheet',
      details: error.message 
    })
  }
}

/**
 * Build the system prompt that defines the AI's role and output format
 */
function buildSystemPrompt() {
  return `You are an expert educational content creator specializing in generating high-quality worksheets for teachers.

Your task is to create comprehensive, age-appropriate worksheets based on the provided educational criteria.

IMPORTANT: You must respond with ONLY valid JSON in the following format:

{
  "title": "Worksheet title",
  "description": "Brief description of the worksheet",
  "subject": "Subject name",
  "grade": "Grade level",
  "estimatedTime": 30,
  "totalMarks": 20,
  "instructions": "Instructions for students",
  "sections": [
    {
      "id": "section_1",
      "title": "Section Title",
      "type": "questions",
      "instructions": "Section-specific instructions",
      "questions": [
        {
          "id": "q1",
          "number": 1,
          "type": "multiple_choice",
          "text": "Question text",
          "options": ["A", "B", "C", "D"],
          "correctAnswer": "A",
          "explanation": "Why this is correct",
          "marks": 1,
          "difficulty": "easy"
        }
      ]
    }
  ],
  "answerKey": {
    "q1": "A"
  }
}

Question types can be: "multiple_choice", "short_answer", "long_answer", "true_false", "fill_in_blank", "matching", "calculation"

Difficulty levels: "easy", "medium", "hard"

Ensure all content is:
- Age-appropriate for the specified grade level
- Aligned with educational standards
- Clear and unambiguous
- Free of errors and typos
- Educationally valuable`
}

/**
 * Build the user message with specific worksheet requirements
 */
function buildUserMessage({ subject, framework, grade, lesson, lessonDescription, worksheetType, customInstructions }) {
  let prompt = `Generate a ${worksheetType} worksheet with the following specifications:\n\n`
  
  prompt += `Subject: ${subject}\n`
  prompt += `Grade Level: ${grade}\n`
  
  if (framework) {
    prompt += `Educational Framework: ${framework}\n`
  }
  
  if (lesson) {
    prompt += `Lesson Topic: ${lesson}\n`
  }
  
  if (lessonDescription) {
    prompt += `Lesson Description: ${lessonDescription}\n`
  }
  
  prompt += `\nWorksheet Type: ${worksheetType}\n`
  
  if (customInstructions) {
    prompt += `\nAdditional Instructions:\n${customInstructions}\n`
  }
  
  // Add worksheet type specific guidance
  prompt += `\n${getWorksheetTypeGuidance(worksheetType)}`
  
  return prompt
}

/**
 * Get specific guidance based on worksheet type
 */
function getWorksheetTypeGuidance(worksheetType) {
  const guidance = {
    'Practice': 'Create 15-20 practice problems with varying difficulty levels. Include a mix of question types.',
    'Quiz': 'Create 10-12 quiz questions focusing on key concepts. Make questions clear and objective.',
    'Test': 'Create 20-25 comprehensive test questions covering all major topics. Include various question types and difficulty levels.',
    'Homework': 'Create 10-15 homework problems that reinforce lesson concepts. Include some challenging questions.',
    'Review': 'Create a comprehensive review with 15-20 questions covering all key topics.',
    'Assessment': 'Create 15-20 assessment questions with clear learning objectives and rubrics.',
    'Warm-up': 'Create 5-8 quick warm-up questions to activate prior knowledge.',
    'Exit Ticket': 'Create 3-5 quick questions to assess understanding at the end of class.',
    'Vocabulary': 'Create vocabulary-focused activities with definitions, context, and usage examples.',
    'Word Problems': 'Create 8-12 word problems that apply concepts to real-world scenarios.',
    'Puzzle': 'Create engaging puzzle-style activities that make learning fun.',
    'Coloring': 'Create activities suitable for coloring with educational content.'
  }
  
  return guidance[worksheetType] || 'Create an engaging and educational worksheet appropriate for the grade level.'
}
