'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@/contexts/UserContext'
import {
  createModule,
  createModuleContent,
  createItems,
} from '@/utils/supabase-client'
import { generateModuleContent } from '@/lib/ai'

export default function ModuleUploadPage() {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadStatus, setUploadStatus] = useState('')
  const router = useRouter()
  const { user } = useUser()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!file) {
      alert('Please select a file to upload')
      return
    }

    if (!user) {
      alert('User profile not found')
      return
    }

    setIsUploading(true)
    setUploadStatus('Processing file and generating content...')

    try {
      // Read file content
      const content = await file.text()

      // Generate AI content
      const aiContent = await generateModuleContent(content, title)

      // Create module
      const newModule = await createModule({
        instructor_id: user.id,
        title,
        description,
      })

      // Save module contents for each level
      for (const level of ['easy', 'medium', 'high']) {
        if (aiContent[`content_${level as 'easy' | 'medium' | 'high'}`]) {
          await createModuleContent({
            module_id: newModule.id,
            level: level as 'easy' | 'medium' | 'high',
            content:
              aiContent[`content_${level as 'easy' | 'medium' | 'high'}`],
          })
        }
      }

      // Save questions for each level
      for (const level of ['easy', 'medium', 'high']) {
        const questions =
          aiContent.questions[level as 'easy' | 'medium' | 'high']
        if (questions) {
          // Combine MCQ and short answer questions
          const allQuestions = [
            ...questions.mcq.map((q: any) => ({ ...q, question_type: 'mcq' })),
            ...questions.short.map((q: any) => ({
              ...q,
              question_type: 'short',
            })),
          ]

          const itemsToInsert = allQuestions.map((q: any) => ({
            module_id: newModule.id,
            level: level as 'easy' | 'medium' | 'high',
            type: 'practice', // Default to practice, can be changed later
            question_type: q.question_type,
            question: q.question,
            options: q.question_type === 'mcq' ? q.options : null,
            answer: q.answer,
            explanation: q.explanation,
          }))

          if (itemsToInsert.length > 0) {
            await createItems(itemsToInsert)
          }
        }
      }

      setUploadStatus('Module created successfully!')
      setTimeout(() => {
        router.push('/instructor/dashboard')
      }, 2000)
    } catch (error) {
      console.error('Error uploading module:', error)
      setUploadStatus(
        `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      )
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="mx-auto max-w-2xl p-6">
      <h1 className="mb-6 text-2xl font-bold">Upload Learning Module</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="title" className="mb-2 block text-sm font-medium">
            Module Title
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-md border px-3 py-2"
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
            className="w-full rounded-md border px-3 py-2"
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
            className="w-full rounded-md border px-3 py-2"
            required
          />
        </div>

        <button
          type="submit"
          disabled={isUploading}
          className="w-full rounded-md bg-green-700 px-4 py-2 text-white hover:bg-green-800 disabled:opacity-50"
        >
          {isUploading ? 'Uploading and Generating...' : 'Upload Module'}
        </button>

        {uploadStatus && (
          <div
            className={`rounded-md p-3 ${
              uploadStatus.includes('Error')
                ? 'bg-red-100 text-red-700'
                : 'bg-green-100 text-green-700'
            }`}
          >
            {uploadStatus}
          </div>
        )}
      </form>
    </div>
  )
}
