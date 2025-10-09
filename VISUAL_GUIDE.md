# 🎨 Worksheet Generator - Visual Feature Guide

This document shows what each feature looks like and how it works.

---

## 📝 Main Generate Page

```
┌─────────────────────────────────────────────────────────────┐
│                    📝 Worksheet Generator                     │
│  Create custom worksheets with AI. Configure, generate,      │
│  upload thumbnail, and list on marketplace.                   │
└─────────────────────────────────────────────────────────────┘

┌──────────────────┐  ┌─────────────────────────────────────┐
│  ⚙️ Configuration │  │  Generated Worksheets (3)            │
│                  │  │                                       │
│  Subject *       │  │  ┌─────────────────────────────┐    │
│  [Mathematics ▼] │  │  │ [Thumbnail/Placeholder]     │    │
│                  │  │  │ 📄 DRAFT                    │    │
│  Grade Level *   │  │  │                             │    │
│  [Grade 5 ▼]     │  │  │ Grade 5 - Mathematics       │    │
│                  │  │  │ Worksheet                   │    │
│  Domain          │  │  │                             │    │
│  [Algebra ▼]     │  │  │ 📚 Mathematics 🎓 Grade 5  │    │
│                  │  │  │ ⏱️ 30 min 📊 20 marks       │    │
│  Standard        │  │  │                             │    │
│  [CCSS ▼]        │  │  │ [Edit][Thumbnail]          │    │
│                  │  │  │ [Publish][Download][Delete] │    │
│  Worksheet Type *│  │  └─────────────────────────────┘    │
│  [Practice ▼]    │  │                                       │
│  [+ Create...]   │  │  [More cards...]                     │
│                  │  │                                       │
│  Instructions    │  │                                       │
│  ┌──────────────┐│  │                                       │
│  │Add specific  ││  │                                       │
│  │requirements  ││  │                                       │
│  └──────────────┘│  │                                       │
│                  │  │                                       │
│ [Generate ➕]    │  │                                       │
│ [Clear All]      │  │                                       │
└──────────────────┘  └─────────────────────────────────────┘
```

**Key Features:**
- ✅ Left panel: Configuration (sticky)
- ✅ Right panel: Results grid
- ✅ Required fields marked with *
- ✅ Card-based worksheet display
- ✅ Color-coded action buttons

---

## 🎯 Custom Worksheet Type Creator

```
┌─────────────────────────────────────────────────────────────┐
│ Create Custom Worksheet Type                            [×] │
│ Define a reusable worksheet template                        │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│ Basic Information                                            │
│                                                              │
│ Worksheet Type Name *                                        │
│ ┌──────────────────────────────────────────────────────┐   │
│ │ Reading Comprehension Quiz                            │   │
│ └──────────────────────────────────────────────────────┘   │
│                                                              │
│ Description                                                  │
│ ┌──────────────────────────────────────────────────────┐   │
│ │ Multiple choice questions with passages               │   │
│ └──────────────────────────────────────────────────────┘   │
│                                                              │
│ Estimated Time (minutes): [30]                              │
│                                                              │
│ Question Types                        [+ Add Question Type] │
│                                                              │
│ ┌──────────────────────────────────────────────────────┐   │
│ │ ① [Multiple Choice ▼]                            [×] │   │
│ │                                                       │   │
│ │  Question Count  Marks Each  Options    Subtotal     │   │
│ │     [10]            [2]        [4]      20 marks     │   │
│ └──────────────────────────────────────────────────────┘   │
│                                                              │
│ ☑ Include Reading Passages                                  │
│ Number of Passages: [2]                                     │
│                                                              │
│ Summary                                                      │
│ ┌────────────┬────────────┬────────────┐                   │
│ │     10     │     20     │     30     │                   │
│ │  Questions │   Marks    │  Minutes   │                   │
│ └────────────┴────────────┴────────────┘                   │
│                                                              │
├─────────────────────────────────────────────────────────────┤
│                         [Cancel] [Create Worksheet Type]    │
└─────────────────────────────────────────────────────────────┘
```

**Key Features:**
- ✅ Add multiple question type sections
- ✅ Configure each type independently
- ✅ Live summary calculations
- ✅ Optional reading passages
- ✅ Reusable templates

---

## ✏️ Worksheet Editor

```
┌─────────────────────────────────────────────────────────────┐
│ Worksheet Editor                                        [×] │
│ [👁️ Preview] [✏️ Edit]                                      │
├─────────────────────────────────────────────────────────────┤
│                    PREVIEW MODE                              │
│                                                              │
│          Grade 5 - Mathematics - Algebra Worksheet           │
│                                                              │
│     Subject: Mathematics  Grade: Grade 5  Type: Practice    │
│              ⏱️ 30 minutes    📊 Total Marks: 20            │
│                                                              │
│ Instructions:                                                │
│ • Read all questions carefully before answering              │
│ • Write your answers clearly                                │
│ • Time limit: 30 minutes                                    │
│ • Total marks: 20                                           │
│                                                              │
│ Section 1                                                    │
│                                                              │
│ Q1. (2 marks)                                               │
│ What is the value of x in: 2x + 5 = 13?                    │
│                                                              │
│ A) 2                                                         │
│ B) 4                                                         │
│ C) 8                                                         │
│ D) 13                                                        │
│                                                              │
│ [More questions...]                                         │
│                                                              │
├─────────────────────────────────────────────────────────────┤
│                                    [Close] [Save Changes]   │
└─────────────────────────────────────────────────────────────┘

                        EDIT MODE

┌─────────────────────────────────────────────────────────────┐
│ Worksheet Editor                                        [×] │
│ [👁️ Preview] [✏️ Edit]                                      │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│ Basic Information                                            │
│                                                              │
│ Title                                                        │
│ ┌──────────────────────────────────────────────────────┐   │
│ │ Grade 5 - Mathematics - Algebra Worksheet             │   │
│ └──────────────────────────────────────────────────────┘   │
│                                                              │
│ Section 1                               [+ Add Question]    │
│                                                              │
│ ┌──────────────────────────────────────────────────────┐   │
│ │ Q1                                                [×] │   │
│ │                                                       │   │
│ │ Question Text                                         │   │
│ │ ┌───────────────────────────────────────────────┐    │   │
│ │ │ What is the value of x in: 2x + 5 = 13?      │    │   │
│ │ └───────────────────────────────────────────────┘    │   │
│ │                                                       │   │
│ │ Type: [Multiple Choice ▼]    Marks: [2]             │   │
│ │                                                       │   │
│ │ Options (one per line)                               │   │
│ │ ┌───────────────────────────────────────────────┐    │   │
│ │ │ 2                                             │    │   │
│ │ │ 4                                             │    │   │
│ │ │ 8                                             │    │   │
│ │ │ 13                                            │    │   │
│ │ └───────────────────────────────────────────────┘    │   │
│ └──────────────────────────────────────────────────────┘   │
│                                                              │
├─────────────────────────────────────────────────────────────┤
│                                    [Close] [Save Changes]   │
└─────────────────────────────────────────────────────────────┘
```

**Key Features:**
- ✅ Two-tab interface (Preview/Edit)
- ✅ Print-ready preview
- ✅ Edit all content inline
- ✅ Add/remove questions
- ✅ Change question types

---

## 🖼️ Thumbnail Upload

```
┌─────────────────────────────────────────────────────────────┐
│ Upload Worksheet Thumbnail                              [×] │
│ Add an eye-catching thumbnail for your worksheet            │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│ ┌──────────────────────────────────────────────────────┐   │
│ │ Grade 5 - Mathematics - Algebra Worksheet             │   │
│ │ Mathematics • Grade 5 • Practice                      │   │
│ └──────────────────────────────────────────────────────┘   │
│                                                              │
│ ┌──────────────────────────────────────────────────────┐   │
│ │                                                       │   │
│ │                     🖼️                                │   │
│ │                                                       │   │
│ │            Click to upload image                     │   │
│ │            JPG, PNG, GIF up to 5MB                   │   │
│ │                                                       │   │
│ └──────────────────────────────────────────────────────┘   │
│                                                              │
│ 💡 Tips for Great Thumbnails:                              │
│ • Use high-quality, clear images                            │
│ • Recommended size: 1200×630 pixels (16:9 ratio)           │
│ • Include relevant educational graphics                     │
│ • Avoid cluttered or text-heavy images                     │
│ • Make sure image represents the content                   │
│                                                              │
├─────────────────────────────────────────────────────────────┤
│                               [Cancel] [Upload Thumbnail]   │
└─────────────────────────────────────────────────────────────┘

                    AFTER UPLOAD

┌─────────────────────────────────────────────────────────────┐
│ Upload Worksheet Thumbnail                              [×] │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│ ┌──────────────────────────────────────────────────────┐   │
│ │                                                       │   │
│ │        [IMAGE PREVIEW - 16:9 ASPECT RATIO]           │   │
│ │                                                       │   │
│ └──────────────────────────────────────────────────────┘   │
│                                                              │
│ [🗑️ Remove Image]                                           │
│                                                              │
│ 💡 Tips...                                                  │
│                                                              │
├─────────────────────────────────────────────────────────────┤
│                               [Cancel] [Upload Thumbnail]   │
└─────────────────────────────────────────────────────────────┘
```

**Key Features:**
- ✅ Drag-and-drop support
- ✅ Image preview
- ✅ File validation
- ✅ Upload tips
- ✅ Easy removal

---

## 🎴 Worksheet Card States

### Draft (No Thumbnail)
```
┌─────────────────────────────┐
│                             │
│          [📷 Icon]          │
│       No Thumbnail          │
│         📄 DRAFT            │
│                             │
├─────────────────────────────┤
│ Grade 5 Math Worksheet      │
│                             │
│ 📚 Mathematics 🎓 Grade 5  │
│ 📖 Algebra                  │
│                             │
│ ⏱️ 30 min │ 📊 20 marks    │
│ 📐 Practice                 │
│                             │
│ [✏️ Edit] [🖼️ Thumbnail]   │
│ [📥] [🗑️]                   │
└─────────────────────────────┘
```

### With Thumbnail
```
┌─────────────────────────────┐
│                             │
│    [Colorful Thumbnail]     │
│         📄 DRAFT            │
│                             │
├─────────────────────────────┤
│ Grade 5 Math Worksheet      │
│                             │
│ 📚 Mathematics 🎓 Grade 5  │
│                             │
│ ⏱️ 30 min │ 📊 20 marks    │
│                             │
│ [✏️ Edit] [✅ Publish]      │
│ [📥] [🗑️]                   │
└─────────────────────────────┘
```

### Published
```
┌─────────────────────────────┐
│                             │
│    [Colorful Thumbnail]     │
│       ✅ PUBLISHED          │
│                             │
├─────────────────────────────┤
│ Grade 5 Math Worksheet      │
│                             │
│ 📚 Mathematics 🎓 Grade 5  │
│                             │
│ ⏱️ 30 min │ 📊 20 marks    │
│                             │
│ [✏️ Edit] [📥] [🗑️]        │
└─────────────────────────────┘
```

---

## 🎨 Color Coding

### Action Buttons

```
[✏️ Edit]         - Primary Blue (#0b2b4a)
[🖼️ Thumbnail]    - Warning Orange (#e65100) - Until uploaded
[✅ Publish]       - Success Green (#2e7d32) - After thumbnail
[📥 Download]      - Neutral Gray
[🗑️ Delete]        - Danger Red (#dc3545)
```

### Status Badges

```
📄 DRAFT         - Gray background
✅ PUBLISHED     - Green background
```

---

## 📱 Responsive Layouts

### Desktop (> 900px)
```
┌─────────────────────────────────────────────────────┐
│               [Configuration Panel]                 │
│                   (Left - 320px)                    │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│            [Worksheet Grid - 3 columns]             │
│  [Card] [Card] [Card]                               │
│  [Card] [Card] [Card]                               │
└─────────────────────────────────────────────────────┘
```

### Tablet (600px - 900px)
```
┌─────────────────────────────────────────────────────┐
│          [Configuration Panel - Full Width]         │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│            [Worksheet Grid - 2 columns]             │
│       [Card] [Card]                                 │
│       [Card] [Card]                                 │
└─────────────────────────────────────────────────────┘
```

### Mobile (< 600px)
```
┌─────────────────────────────────────────────────────┐
│          [Configuration Panel - Full Width]         │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│            [Worksheet Grid - 1 column]              │
│                   [Card]                            │
│                   [Card]                            │
│                   [Card]                            │
└─────────────────────────────────────────────────────┘
```

---

## 🔄 User Flow Diagram

```
START
  │
  ├─→ [Select Configuration]
  │     Subject, Grade, Type, etc.
  │
  ├─→ [Add Custom Instructions]
  │     (Optional)
  │
  ├─→ [Generate Worksheet]
  │     ↓
  │   [AI Generates Content]
  │     ↓
  │   [Worksheet Card Appears]
  │     Status: DRAFT
  │
  ├─→ [Edit Worksheet?]
  │     ├─ Yes → [Open Editor] → [Save Changes]
  │     └─ No → Continue
  │
  ├─→ [Upload Thumbnail]
  │     ↓
  │   [Select/Drag Image]
  │     ↓
  │   [Preview Image]
  │     ↓
  │   [Upload to Server]
  │     ↓
  │   Status: Thumbnail ✅
  │
  ├─→ [Publish Worksheet]
  │     ↓
  │   Status: PUBLISHED
  │     ↓
  │   [Listed on Marketplace]
  │
  └─→ [Download PDF]
        (Optional)

END
```

---

## 💾 Data Flow

```
USER INPUT
    │
    ├─→ Generate Worksheet
    │      ↓
    │   [POST /api/worksheets/save]
    │      ↓
    │   Save to Database
    │      ↓
    │   Return Worksheet ID
    │
    ├─→ Upload Thumbnail
    │      ↓
    │   [POST /api/worksheets/upload-thumbnail]
    │      ↓
    │   Store in Supabase Storage
    │      ↓
    │   Update Worksheet Record
    │
    ├─→ Publish Worksheet
    │      ↓
    │   [PUT /api/worksheets/save]
    │      ↓
    │   Update Status → Published
    │      ↓
    │   Set is_listed = true
    │
    └─→ List Worksheets
           ↓
        [GET /api/worksheets/list]
           ↓
        Fetch from Database
           ↓
        Return with Filters
```

---

## 🎭 Component Hierarchy

```
generate.js (Main Page)
├── Page Header
├── Configuration Panel (Left)
│   ├── Subject Dropdown
│   ├── Grade Dropdown
│   ├── Domain Dropdown
│   ├── Standard Dropdown
│   ├── Type Dropdown
│   ├── Instructions Textarea
│   └── Generate Button
│
├── Results Panel (Right)
│   ├── Empty State (or)
│   └── Worksheet Grid
│       └── Worksheet Cards
│           ├── Thumbnail/Placeholder
│           ├── Status Badge
│           ├── Metadata
│           └── Action Buttons
│
└── Modals
    ├── CustomWorksheetTypeModal
    │   ├── Basic Info Form
    │   ├── Question Types List
    │   └── Summary Section
    │
    ├── WorksheetEditorModal
    │   ├── Tab Buttons
    │   ├── Preview Tab
    │   └── Edit Tab
    │
    └── ThumbnailUploadModal
        ├── Worksheet Info
        ├── Upload Area
        └── Preview/Tips
```

---

## 🎯 Key UI Elements

### Empty State
```
┌─────────────────────────────────────────┐
│                                         │
│                  📄                     │
│                                         │
│          No Worksheets Yet              │
│                                         │
│  Configure settings and click Generate  │
│                                         │
│         💡 Quick Tips:                  │
│    • Select required fields             │
│    • Add custom instructions            │
│    • Create custom types                │
│                                         │
└─────────────────────────────────────────┘
```

### Loading State
```
┌─────────────────────────────────────────┐
│                                         │
│         [🔄 Generating...]              │
│                                         │
└─────────────────────────────────────────┘
```

### Success Message
```
┌─────────────────────────────────────────┐
│ ✅ Worksheet published successfully!    │
│ It will now appear on the marketplace   │
└─────────────────────────────────────────┘
```

---

## 📊 Typography & Spacing

### Font Sizes
- Page Title: 2rem (32px)
- Card Title: 1.05rem (17px)
- Body Text: 1rem (16px)
- Small Text: 0.85rem (14px)
- Tiny Text: 0.75rem (12px)

### Spacing
- Section Gap: 24px
- Card Gap: 20px
- Button Gap: 8-12px
- Form Field Gap: 16px
- Modal Padding: 32px

### Border Radius
- Cards: 12px
- Buttons: 6-8px
- Inputs: 6px
- Modals: 12px

---

This visual guide shows the complete UI structure and user experience of your worksheet generator! 🎨
