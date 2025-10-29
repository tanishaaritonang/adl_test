import { createBrowserClient, createServerClient } from '@/utils/supabase'
import { Database } from './database.types'

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

// Server-side functions
export const getServerSupabaseClient = (cookieStore: any) => {
  return createServerClient(cookieStore)
}

// Browser-side functions
export const getBrowserSupabaseClient = () => {
  return createBrowserClient()
}

// Profile functions
export const getUserProfile = async (userId: string) => {
  const supabase = getBrowserSupabaseClient()

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()

  if (error) throw error
  return data as UserProfile
}

export const updateUserProfile = async (
  userId: string,
  profile: Partial<UserProfile>,
) => {
  const supabase = getBrowserSupabaseClient()

  const { data, error } = await supabase
    .from('profiles')
    .update(profile)
    .eq('id', userId)
    .select()
    .single()

  if (error) throw error
  return data as UserProfile
}

// Module functions
export const createModule = async (
  module: Omit<Module, 'id' | 'created_at'>,
) => {
  const supabase = getBrowserSupabaseClient()

  const { data, error } = await supabase
    .from('modules')
    .insert([module])
    .select()
    .single()

  if (error) throw error
  return data as Module
}

export const getModules = async () => {
  const supabase = getBrowserSupabaseClient()

  const { data, error } = await supabase
    .from('modules')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data as Module[]
}

export const getModuleById = async (id: string) => {
  const supabase = getBrowserSupabaseClient()

  const { data, error } = await supabase
    .from('modules')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw error
  return data as Module
}

// Module content functions
export const createModuleContent = async (
  content: Omit<ModuleContent, 'id' | 'created_at'>,
) => {
  const supabase = getBrowserSupabaseClient()

  const { data, error } = await supabase
    .from('module_contents')
    .insert([content])
    .select()
    .single()

  if (error) throw error
  return data as ModuleContent
}

export const getModuleContentByModuleAndLevel = async (
  moduleId: string,
  level: string,
) => {
  const supabase = getBrowserSupabaseClient()

  const { data, error } = await supabase
    .from('module_contents')
    .select('*')
    .eq('module_id', moduleId)
    .eq('level', level)
    .single()

  if (error) throw error
  return data as ModuleContent
}

export const getModuleContentsByModule = async (moduleId: string) => {
  const supabase = getBrowserSupabaseClient()

  const { data, error } = await supabase
    .from('module_contents')
    .select('*')
    .eq('module_id', moduleId)

  if (error) throw error
  return data as ModuleContent[]
}

// Items (questions) functions
export const createItem = async (item: Omit<Item, 'id' | 'created_at'>) => {
  const supabase = getBrowserSupabaseClient()

  const { data, error } = await supabase
    .from('items')
    .insert([item])
    .select()
    .single()

  if (error) throw error
  return data as Item
}

export const createItems = async (items: Omit<Item, 'id' | 'created_at'>[]) => {
  const supabase = getBrowserSupabaseClient()

  const { data, error } = await supabase.from('items').insert(items).select()

  if (error) throw error
  return data as Item[]
}

export const getItemsByModuleAndType = async (
  moduleId: string,
  type: string,
  level?: string,
) => {
  const supabase = getBrowserSupabaseClient()

  let query = supabase
    .from('items')
    .select('*')
    .eq('module_id', moduleId)
    .eq('type', type)

  if (level) {
    query = query.eq('level', level)
  }

  const { data, error } = await query

  if (error) throw error
  return data as Item[]
}

export const getItemsByModuleAndLevel = async (
  moduleId: string,
  level: string,
) => {
  const supabase = getBrowserSupabaseClient()

  const { data, error } = await supabase
    .from('items')
    .select('*')
    .eq('module_id', moduleId)
    .eq('level', level)

  if (error) throw error
  return data as Item[]
}

// Attempt functions
export const createAttempt = async (
  attempt: Omit<Attempt, 'id' | 'created_at'>,
) => {
  const supabase = getBrowserSupabaseClient()

  const { data, error } = await supabase
    .from('attempts')
    .insert([attempt])
    .select()
    .single()

  if (error) throw error
  return data as Attempt
}

// Placement functions
export const createPlacement = async (
  placement: Omit<Placement, 'id' | 'updated_at'>,
) => {
  const supabase = getBrowserSupabaseClient()

  const { data, error } = await supabase
    .from('placements')
    .insert([placement])
    .select()
    .single()

  if (error) throw error
  return data as Placement
}

export const getPlacementByUserAndModule = async (
  userId: string,
  moduleId: string,
) => {
  const supabase = getBrowserSupabaseClient()

  const { data, error } = await supabase
    .from('placements')
    .select('*')
    .eq('user_id', userId)
    .eq('module_id', moduleId)
    .single()

  if (error) throw error
  return data as Placement
}
