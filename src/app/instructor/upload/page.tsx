'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@/contexts/UserContext'
import {
  createModule,
  createModuleContent,
  createItems,
} from '@/utils/supabase-client'
import { generateModuleContent, ModuleContent } from '@/lib/ai'
import ModuleContentGenerator from '@/components/ModuleContentGenerator'

export default function ModuleUploadPage() {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [moduleText, setModuleText] = useState<string>('')
  const [moduleId, setModuleId] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [uploadStatus, setUploadStatus] = useState('')
  const [generatedContent, setGeneratedContent] = useState<
    Partial<ModuleContent>
  >({})
  const router = useRouter()
  const { user } = useUser()

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0]
      setFile(selectedFile)

      // Read file content for generation
      const content = await selectedFile.text()
      setModuleText(content)
    }
  }

  const handleCreateModule = async () => {
    if (!file || !moduleText) {
      alert('Please select a file to upload')
      return
    }

    if (!user) {
      alert('User profile not found')
      return
    }

    setIsProcessing(true)
    setUploadStatus('Creating module...')

    try {
      // Create module first without content
      const newModule = await createModule({
        instructor_id: user.id,
        title,
        description,
      })

      setModuleId(newModule.id)
      setUploadStatus(
        'Module created successfully! Now generate content using the buttons below.',
      )

      // If user wants to generate all content at once instead of separately
      // const aiContent = await generateModuleContent(moduleText, title)
      // setGeneratedContent(aiContent)
    } catch (error) {
      console.error('Error creating module:', error)
      setUploadStatus(
        `Error creating module: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`,
      )
    } finally {
      setIsProcessing(false)
    }
  }

  const handleContentGenerated = async (
    difficulty: 'easy' | 'medium' | 'high',
    content: Partial<ModuleContent>,
  ) => {
    if (!moduleId) {
      console.error('Module ID not set')
      return
    }

    console.log(
      `[DEBUG] Content generated callback for ${difficulty} difficulty:`,
      content,
    )

    try {
      // Update state with generated content
      setGeneratedContent((prev) => ({
        ...prev,
        ...(difficulty === 'easy' && content.content_easy
          ? { content_easy: content.content_easy }
          : {}),
        ...(difficulty === 'medium' && content.content_medium
          ? { content_medium: content.content_medium }
          : {}),
        ...(difficulty === 'high' && content.content_high
          ? { content_high: content.content_high }
          : {}),
        questions: {
          ...prev.questions,
          ...(content.questions?.[difficulty]
            ? { [difficulty]: content.questions[difficulty] }
            : {}),
        },
      }))

      console.log(`[DEBUG] Attempting to save ${difficulty} content to DB:`, {
        hasContent: !!content[`content_${difficulty}`],
        hasQuestions: !!content.questions?.[difficulty],
        content: content[`content_${difficulty}`],
        questions: content.questions?.[difficulty],
      })

      // Save the content to the database
      if (content[`content_${difficulty}`]) {
        const contentToSave = {
          module_id: moduleId,
          level: difficulty,
          content: content[`content_${difficulty}`] as string,
        }
        console.log(
          `[DEBUG] Saving content to module_contents table:`,
          contentToSave,
        )

        try {
          const savedContent = await createModuleContent(contentToSave)
          console.log(
            `[DEBUG] Content saved to module_contents table successfully:`,
            savedContent,
          )
        } catch (contentError) {
          console.error(
            `[ERROR] Failed to save content to module_contents table:`,
            contentError,
          )
          // Show a more specific error to the user
          setUploadStatus(
            `Error saving ${difficulty} content to database: ${
              contentError instanceof Error
                ? contentError.message
                : 'Unknown error'
            }`,
          )
          throw contentError // Re-throw to be caught by the outer catch block
        }
      }

      // Save questions for this difficulty level
      const questions = content.questions?.[difficulty]
      if (questions) {
        console.log(
          `[DEBUG] Attempting to save questions for ${difficulty} level:`,
          questions,
        )

        const allQuestions = [
          ...questions.mcq.map((q: any) => ({ ...q, question_type: 'mcq' })),
          ...questions.short.map((q: any) => ({
            ...q,
            question_type: 'short',
          })),
        ]

        const itemsToInsert = allQuestions.map((q: any) => ({
          module_id: moduleId,
          level: difficulty,
          type: 'practice',
          question_type: q.question_type,
          question: q.question,
          options: q.question_type === 'mcq' ? q.options : null,
          answer: q.answer,
          explanation: q.explanation,
        }))

        console.log(`[DEBUG] Prepared items for insertion:`, itemsToInsert)

        if (itemsToInsert.length > 0) {
          try {
            const savedItems = await createItems(itemsToInsert)
            console.log(
              `[DEBUG] ${itemsToInsert.length} items saved to items table successfully:`,
              savedItems,
            )
          } catch (itemsError) {
            console.error(
              `[ERROR] Failed to save items to items table:`,
              itemsError,
            )
            throw itemsError // Re-throw to be caught by the outer catch block
          }
        }
      }

      setUploadStatus(
        `${
          difficulty.charAt(0).toUpperCase() + difficulty.slice(1)
        } content generated and saved successfully!`,
      )
    } catch (error) {
      console.error(`Error saving ${difficulty} content:`, error)
      setUploadStatus(
        `Error saving ${difficulty} content: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`,
      )
    }
  }

  return (
    <div className="mx-auto max-w-4xl p-6 text-black">
      <h1 className="mb-6 text-2xl font-bold">Upload Learning Module</h1>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Left column - Module info form */}
        <div className="rounded-lg bg-white p-6 shadow-md">
          <h2 className="mb-4 text-xl font-semibold">Module Information</h2>
          <form className="space-y-4">
            <div>
              <label htmlFor="title" className="mb-2 block text-sm font-medium">
                Module Title
              </label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded-md border px-3 py-2 text-black"
                required
              />
            </div>

            <div>
              <label
                htmlFor="description"
                className="mb-2 block text-sm font-medium"
              >
                Description
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full rounded-md border px-3 py-2 text-black"
                rows={3}
              />
            </div>

            <div>
              <label htmlFor="file" className="mb-2 block text-sm font-medium">
                Upload Content (Text or PDF)
              </label>
              <input
                type="file"
                id="file"
                accept=".txt,.pdf"
                onChange={handleFileChange}
                className="w-full rounded-md border px-3 py-2 text-black"
                required
              />
            </div>

            <button
              type="button"
              onClick={handleCreateModule}
              disabled={isProcessing || !file}
              className="w-full rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {isProcessing ? 'Processing...' : 'Create Module'}
            </button>
          </form>

          {uploadStatus && (
            <div
              className={`mt-4 rounded-md p-3 ${
                uploadStatus.includes('Error')
                  ? 'bg-red-100 text-red-800'
                  : 'bg-green-100 text-green-800'
              }`}
            >
              {uploadStatus}
            </div>
          )}
        </div>

        {/* Right column - Content generation */}
        <div className="rounded-lg bg-white p-6 shadow-md">
          <h2 className="mb-4 text-xl font-semibold">Generate Content</h2>
          {moduleId ? (
            <ModuleContentGenerator
              moduleId={moduleId}
              moduleText={moduleText}
              moduleTitle={title}
              onContentGenerated={handleContentGenerated}
            />
          ) : (
            <div className="py-8 text-center text-gray-500">
              <p>Create a module first to generate content</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
