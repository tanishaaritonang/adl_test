// Type definitions for the application
export type UserProfile = {
  id: string
  full_name: string | null
  email: string | null
  role: 'student' | 'instructor' | null
  created_at: string | null
}

export type Module = {
  id: string
  instructor_id: string
  title: string
  description: string
  created_at: string
}

export type ModuleContent = {
  id: string
  module_id: string
  level: 'easy' | 'medium' | 'high'
  content: string
  created_at: string
}

export type Item = {
  id: string
  module_id: string
  level: 'easy' | 'medium' | 'high'
  type: 'pretest' | 'practice' | 'posttest'
  question_type: 'mcq' | 'short'
  question: string
  options: string[] | null
  answer: string
  explanation: string
  created_at: string
}

export type Attempt = {
  id: string
  user_id: string
  item_id: string
  selected_answer: string
  ai_feedback: string
  is_correct: boolean
  created_at: string
}

export type Placement = {
  id: string
  user_id: string
  module_id: string
  level: 'easy' | 'medium' | 'high'
  score: number
  updated_at: string
}

// Profile functions
export const getUserProfile = async (userId: string): Promise<UserProfile> => {
  const response = await fetch(`/api/profiles?userId=${userId}`)

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to get user profile')
  }

  return await response.json()
}

export const updateUserProfile = async (
  userId: string,
  profile: Partial<UserProfile>,
): Promise<UserProfile> => {
  const response = await fetch(`/api/profiles?userId=${userId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(profile),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to update user profile')
  }

  return await response.json()
}

// Module functions
export const createModule = async (
  module: Omit<Module, 'id' | 'created_at'>,
): Promise<Module> => {
  const response = await fetch('/api/modules', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(module),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to create module')
  }

  return await response.json()
}

export const getModules = async (): Promise<Module[]> => {
  const response = await fetch('/api/modules')

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to get modules')
  }

  return await response.json()
}

export const getModuleById = async (id: string): Promise<Module> => {
  const response = await fetch(`/api/modules/${id}`)

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to get module')
  }

  return await response.json()
}

// Module content functions
export const createModuleContent = async (
  content: Omit<ModuleContent, 'id' | 'created_at'>,
): Promise<ModuleContent> => {
  const response = await fetch('/api/modules/content', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(content),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to create module content')
  }

  return await response.json()
}

export const getModuleContentByModuleAndLevel = async (
  moduleId: string,
  level: string,
): Promise<ModuleContent> => {
  const response = await fetch(
    `/api/modules/content/get?moduleId=${moduleId}&level=${level}`,
  )

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to get module content')
  }

  return await response.json()
}

export const getModuleContentsByModule = async (
  moduleId: string,
): Promise<ModuleContent[]> => {
  const response = await fetch(`/api/modules/content/all?moduleId=${moduleId}`)

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to get module contents')
  }

  return await response.json()
}

// Items (questions) functions
export const createItem = async (
  item: Omit<Item, 'id' | 'created_at'>,
): Promise<Item> => {
  const response = await fetch('/api/items', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(item),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to create item')
  }

  return await response.json()
}

export const createItems = async (
  items: Omit<Item, 'id' | 'created_at'>[],
): Promise<Item[]> => {
  const response = await fetch('/api/items', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(items),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to create items')
  }

  return await response.json()
}

export const getItemsByModuleAndType = async (
  moduleId: string,
  type: string,
  level?: string,
): Promise<Item[]> => {
  let url = `/api/items/by-module-type?moduleId=${moduleId}&type=${type}`
  if (level) {
    url += `&level=${level}`
  }

  const response = await fetch(url)

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to get items')
  }

  return await response.json()
}

export const getItemsByModuleAndLevel = async (
  moduleId: string,
  level: string,
): Promise<Item[]> => {
  const response = await fetch(
    `/api/items/by-module-level?moduleId=${moduleId}&level=${level}`,
  )

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to get items')
  }

  return await response.json()
}

// Attempt functions
export const createAttempt = async (
  attempt: Omit<Attempt, 'id' | 'created_at'>,
): Promise<Attempt> => {
  const response = await fetch('/api/attempts', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(attempt),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to create attempt')
  }

  return await response.json()
}

// Placement functions
export const createPlacement = async (
  placement: Omit<Placement, 'id' | 'updated_at'>,
): Promise<Placement> => {
  const response = await fetch('/api/placements', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(placement),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to create placement')
  }

  return await response.json()
}

export const getPlacementByUserAndModule = async (
  userId: string,
  moduleId: string,
): Promise<Placement> => {
  const response = await fetch(
    `/api/placements?userId=${userId}&moduleId=${moduleId}`,
  )

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to get placement')
  }

  return await response.json()
}
