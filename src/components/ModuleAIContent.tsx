// components/ModuleAIContent.tsx
// Komponen kecil untuk menampilkan konten AI yang tersimpan di DB (kolom ai_content).
// Jika kolom kamu beda, ganti props ‘aiContentRaw’.

'use client'

import { useMemo } from 'react'
import type { ModuleContent } from '@/lib/ai'

export default function ModuleAIContent({
  aiContentRaw,
}: {
  aiContentRaw?: string | null
}) {
  const parsed = useMemo<ModuleContent | null>(() => {
    if (!aiContentRaw) return null
    try {
      return JSON.parse(aiContentRaw) as ModuleContent
    } catch {
      return null
    }
  }, [aiContentRaw])

  if (!aiContentRaw) {
    return (
      <p className="text-sm text-gray-500">AI content not generated yet.</p>
    )
  }
  if (!parsed) {
    return (
      <p className="text-sm text-red-600">Failed to parse saved AI content.</p>
    )
  }

  const Section = ({ title, body }: { title: string; body: string }) => (
    <div className="mt-3">
      <h5 className="font-semibold">{title}</h5>
      <p className="whitespace-pre-wrap text-sm text-gray-700">{body}</p>
    </div>
  )

  const QAList = ({ items }: { items: any[] }) => (
    <ol className="list-decimal space-y-2 pl-5">
      {items.map((q, idx) => (
        <li key={idx} className="text-sm">
          <div className="font-medium">{q.question}</div>
          {Array.isArray(q.options) && q.options.length > 0 && (
            <ul className="list-disc pl-5">
              {q.options.map((o: string, i: number) => (
                <li key={i}>{o}</li>
              ))}
            </ul>
          )}
          <div className="text-green-700">Answer: {q.answer}</div>
          <div className="text-gray-600">Explanation: {q.explanation}</div>
        </li>
      ))}
    </ol>
  )

  return (
    <div className="mt-4 rounded-md bg-gray-50 p-3">
      <h4 className="font-medium">AI-Generated Content</h4>
      <Section title="Easy Summary" body={parsed.content_easy} />
      <Section title="Medium Summary" body={parsed.content_medium} />
      <Section title="High Summary" body={parsed.content_high} />

      <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
        <div>
          <h5 className="mb-2 font-semibold">Easy Questions</h5>
          <QAList
            items={[
              ...(parsed.questions.easy.mcq || []),
              ...(parsed.questions.easy.short || []),
            ]}
          />
        </div>
        <div>
          <h5 className="mb-2 font-semibold">Medium Questions</h5>
          <QAList
            items={[
              ...(parsed.questions.medium.mcq || []),
              ...(parsed.questions.medium.short || []),
            ]}
          />
        </div>
        <div>
          <h5 className="mb-2 font-semibold">High Questions</h5>
          <QAList
            items={[
              ...(parsed.questions.high.mcq || []),
              ...(parsed.questions.high.short || []),
            ]}
          />
        </div>
      </div>
    </div>
  )
}
