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

  // Require an authenticated user header (set by the client after sign-in)
  // This is a lightweight enforcement to ensure only signed-in users trigger expensive AI calls.
  // The client should send the current user's id in `x-user-id` header.
  const userId = req.headers['x-user-id']
  if (!userId) {
    return res.status(401).json({ error: 'Authentication required', details: 'Please sign in to generate worksheets' })
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
      assistantId, // OpenAI Assistant ID (asst_*)
      promptId, // OpenAI Stored Prompt ID (pmpt_*)
      customTypeId, // Custom worksheet type ID (if custom)
      jsonSchema // Custom JSON schema (if custom type selected)
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
      customInstructions,
      jsonSchema // Pass custom JSON schema if provided
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

    // Determine which ID to use: Assistant ID, Prompt ID, or from template config
    const useAssistantId = assistantId || templateConfig?.assistant_id
    const usePromptId = promptId || templateConfig?.prompt_id

    // Priority: Stored Prompt (pmpt_*) > Assistant (asst_*) > Inline prompt
    
    // If Stored Prompt ID is provided (pmpt_*), use Responses API with prompt reference
    // This uses your published prompt directly from OpenAI (recommended approach)
    if (usePromptId) {
      console.log('Using OpenAI Published Prompt ID:', usePromptId)
      console.log('Fetching prompt configuration from OpenAI dashboard...')

      // Basic validation: prompt IDs from OpenAI stored prompts typically start with 'pmpt_'
      if (typeof usePromptId !== 'string' || !usePromptId.startsWith('pmpt_')) {
        console.warn('Invalid promptId format:', usePromptId)
        return res.status(400).json({
          error: 'Invalid promptId format',
          details: 'Stored prompt IDs should start with "pmpt_"'
        })
      }

      // Use Responses API with prompt reference - OpenAI handles prompt content
      // This is the RECOMMENDED way to use published prompts
      let response
      try {
        response = await openai.responses.create({
          prompt: {
            id: usePromptId // Your published prompt ID
          },
          input: [
            { role: 'user', content: userMessage } // Only user message needed
          ],
          store: true, // This makes it appear in OpenAI Logs/Responses
          metadata: {
            prompt_id: usePromptId,
            subject: subject,
            grade: grade,
            worksheetType: worksheetType,
            framework: framework || 'none',
            lesson: lesson || 'none'
          },
          user: req.headers['x-user-id'] || 'anonymous' // For user attribution in logs
        })
      } catch (openaiErr) {
        // If the prompt isn't found, OpenAI returns a 404 with a message containing "Prompt with id '...' not found"
        const msg = openaiErr?.message || ''
        const status = openaiErr?.status || openaiErr?.statusCode || null
        console.error('OpenAI error when using promptId:', usePromptId, openaiErr)

        if (status === 404 || /Prompt with id .* not found/.test(msg)) {
          return res.status(404).json({
            error: 'Prompt not found',
            details: `Prompt with id '${usePromptId}' was not found in OpenAI account. Please check the prompt ID or remove it to use an inline prompt.`
          })
        }

        // For other OpenAI errors, rethrow to be caught by outer try/catch and handled consistently
        throw openaiErr
      }
      
      // Extract response text from OpenAI Responses API
      // Priority: response.text (complete) > response.output[].content > response.output_text (may be truncated)
      
      // Check if response.text has the complete output
      if (response.text && typeof response.text === 'string') {
        // Primary: Use top-level text field (most complete)
        aiResponse = response.text
        console.log('✅ Using response.text (length:', aiResponse.length, ')')
      } else if (response.output && Array.isArray(response.output) && response.output[0]?.content) {
        // Secondary: Get content from output array
        const content = response.output[0].content
        
        // Content can be an array of content parts or a string
        if (Array.isArray(content)) {
          // If it's an array, get the text from the first content part
          aiResponse = content[0]?.text || content[0]?.content || JSON.stringify(content[0])
        } else if (typeof content === 'string') {
          aiResponse = content
        } else if (content && typeof content === 'object') {
          // If it's an object, try to extract text field
          aiResponse = content.text || content.content || JSON.stringify(content)
        } else {
          aiResponse = String(content)
        }
        
        console.log('✅ Using response.output[0].content (length:', aiResponse.length, ')')
      } else if (response.text) {
        // Alternative: Use text field
        aiResponse = response.text
        console.log('✅ Using response.text (length:', aiResponse.length, ')')
      } else if (response.output_text) {
        // Fallback: output_text may be truncated but try anyway
        aiResponse = response.output_text
        console.log('⚠️  Using response.output_text (length:', aiResponse.length, ') - may be truncated')
      } else if (response.choices && response.choices[0]?.message?.content) {
        // Last resort: Chat completions format
        aiResponse = response.choices[0].message.content
        console.log('✅ Using response.choices[0].message.content (length:', aiResponse.length, ')')
      } else {
        console.error('❌ Unknown response format. Available keys:', Object.keys(response))
        if (response.output) {
          console.error('response.output type:', typeof response.output)
          if (Array.isArray(response.output)) {
            console.error('response.output[0] keys:', response.output[0] ? Object.keys(response.output[0]) : 'none')
          }
        }
        throw new Error('Could not extract AI response from OpenAI API response')
      }
      
      // Create completion object for consistent metadata handling
      completion = {
        model: response.model,
        usage: response.usage || { 
          total_tokens: 0, 
          prompt_tokens: 0, 
          completion_tokens: 0 
        }
      }
      
      console.log('✅ Used OpenAI prompt configuration')
      console.log('Response ID:', response.id, '| Model:', completion.model, '| Tokens:', completion.usage.total_tokens)
      
    } else if (useAssistantId) {
      // If Assistant ID is provided, use Assistants API (asst_*)
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
      // Use Responses API with inline prompt (fallback when no prompt_id)
      console.log('Using Responses API with inline prompt (no prompt_id configured)')
      
      // Use system prompt from template config or fallback to default
      const systemPrompt = templateConfig?.system_prompt || buildSystemPrompt()
      
      // Use model settings from template config (fallback to hardcoded defaults)
      const model = templateConfig?.model || 'gpt-5'
      const temperature = templateConfig?.temperature || 1.0
      const maxTokens = templateConfig?.max_tokens || 2048
      const responseFormat = templateConfig?.response_format || 'json_object'
      
      console.log(`Model: ${model}, Temperature: ${temperature}, Max Output Tokens: ${maxTokens}`)
      
      // Use Responses API for consistent logging
      const response = await openai.responses.create({
        model,
        input: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage }
        ],
        temperature,
        max_output_tokens: maxTokens,
        response_format: { type: responseFormat },
        store: true,
        metadata: {
          subject: subject,
          grade: grade,
          worksheetType: worksheetType,
          framework: framework || 'none',
          lesson: lesson || 'none'
        },
        user: req.headers['x-user-id'] || 'anonymous'
      })
      
      aiResponse = response.output_text
      
      completion = {
        model: response.model || model,
        usage: response.usage || { 
          total_tokens: 0, 
          prompt_tokens: 0, 
          completion_tokens: 0 
        }
      }
      
      console.log('Response ID:', response.id, '| Tokens:', completion.usage.total_tokens)
    }
    
    console.log('AI Response type:', typeof aiResponse)
    console.log('AI Response length:', aiResponse?.length)
    console.log('AI Response preview:', aiResponse?.substring(0, 100))
    
    // Parse the JSON response
    let worksheetData
    try {
      worksheetData = JSON.parse(aiResponse)
    } catch (parseError) {
      console.error('Failed to parse OpenAI response:', parseError)
      console.error('Raw response:', aiResponse?.substring(0, 500)) // Log first 500 chars
      return res.status(500).json({ 
        error: 'Failed to parse AI response',
        details: 'The AI response was not valid JSON. This may indicate an OpenAI API error or configuration issue.',
        parseError: parseError.message,
        rawResponsePreview: aiResponse?.substring(0, 200) // Include preview for debugging
      })
    }

    // Save the generated worksheet to the database
    let savedWorksheet = null
    try {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      )

      const { data: insertedWorksheet, error: dbError } = await supabase
        .from('worksheets')
        .insert([{
          user_id: userId,
          title: worksheetData.title || 'Untitled Worksheet',
          subject: subject,
          grade: grade,
          framework: framework || null,
          domain: lesson || null,
          worksheet_type: worksheetType,
          content: worksheetData,
          custom_instructions: customInstructions || null,
          status: 'draft',
          is_listed: false,
          thumbnail_uploaded: false
        }])
        .select()
        .single()

      if (dbError) {
        console.error('Failed to save worksheet to database:', dbError)
        // Don't fail the request, just log the error
      } else {
        savedWorksheet = insertedWorksheet
        console.log('✅ Worksheet saved to database with ID:', savedWorksheet.id)
      }
    } catch (dbError) {
      console.error('Database error:', dbError)
      // Don't fail the request
    }

    // Return the generated worksheet data
    return res.status(200).json({
      success: true,
      worksheet: worksheetData,
      worksheetId: savedWorksheet?.id || null, // Include DB ID if saved
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
function buildUserMessage({ subject, framework, grade, lesson, lessonDescription, worksheetType, customInstructions, jsonSchema }) {
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
  
  // If custom JSON schema provided, use it; otherwise use default guidance
  if (jsonSchema) {
    prompt += `\n\nJSON STRUCTURE REQUIRED:\nPlease follow this EXACT JSON structure for your response:\n\n`
    prompt += JSON.stringify(jsonSchema, null, 2)
    prompt += `\n\nGenerate all questions according to the types and counts specified in the schema.`
  } else {
    // Add worksheet type specific guidance for default types
    prompt += `\n${getWorksheetTypeGuidance(worksheetType)}`
  }
  
  // IMPORTANT: When using json_object format, must explicitly request JSON
  prompt += `\n\nIMPORTANT: Please respond with a valid JSON object containing the complete worksheet data following the structure above.`
  
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
