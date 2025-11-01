import {
  UserProfile,
  Module,
  ModuleContent,
  Item,
  Attempt,
  Placement,
  getUserProfile as apiGetUserProfile,
  updateUserProfile as apiUpdateUserProfile,
  createModule as apiCreateModule,
  getModules as apiGetModules,
  getModuleById as apiGetModuleById,
  createModuleContent as apiCreateModuleContent,
  getModuleContentByModuleAndLevel as apiGetModuleContentByModuleAndLevel,
  getModuleContentsByModule as apiGetModuleContentsByModule,
  createItem as apiCreateItem,
  createItems as apiCreateItems,
  getItemsByModuleAndType as apiGetItemsByModuleAndType,
  getItemsByModuleAndLevel as apiGetItemsByModuleAndLevel,
  createAttempt as apiCreateAttempt,
  createPlacement as apiCreatePlacement,
  getPlacementByUserAndModule as apiGetPlacementByUserAndModule,
} from '@/utils/api-client'

// Server-side functions
export const getServerSupabaseClient = (cookieStore: any) => {
  // Placeholder function - in the new implementation, we don't need Supabase client
  // This maintains the same interface for compatibility
  console.warn('getServerSupabaseClient is deprecated. Use API routes instead.')
  return null
}

// Browser-side functions
export const getBrowserSupabaseClient = () => {
  // Placeholder function - in the new implementation, we don't need Supabase client
  // This maintains the same interface for compatibility
  console.warn(
    'getBrowserSupabaseClient is deprecated. Use API routes instead.',
  )
  return null
}

// Profile functions
export const getUserProfile = async (userId: string): Promise<UserProfile> => {
  return apiGetUserProfile(userId)
}

export const updateUserProfile = async (
  userId: string,
  profile: Partial<UserProfile>,
): Promise<UserProfile> => {
  return apiUpdateUserProfile(userId, profile)
}

// Module functions
export const createModule = async (
  module: Omit<Module, 'id' | 'created_at'>,
): Promise<Module> => {
  return apiCreateModule(module)
}

export const getModules = async (): Promise<Module[]> => {
  return apiGetModules()
}

export const getModuleById = async (id: string): Promise<Module> => {
  return apiGetModuleById(id)
}

// Module content functions
export const createModuleContent = async (
  content: Omit<ModuleContent, 'id' | 'created_at'>,
): Promise<ModuleContent> => {
  return apiCreateModuleContent(content)
}

export const getModuleContentByModuleAndLevel = async (
  moduleId: string,
  level: string,
): Promise<ModuleContent> => {
  return apiGetModuleContentByModuleAndLevel(moduleId, level)
}

export const getModuleContentsByModule = async (
  moduleId: string,
): Promise<ModuleContent[]> => {
  return apiGetModuleContentsByModule(moduleId)
}

// Items (questions) functions
export const createItem = async (
  item: Omit<Item, 'id' | 'created_at'>,
): Promise<Item> => {
  return apiCreateItem(item)
}

export const createItems = async (
  items: Omit<Item, 'id' | 'created_at'>[],
): Promise<Item[]> => {
  return apiCreateItems(items)
}

export const getItemsByModuleAndType = async (
  moduleId: string,
  type: string,
  level?: string,
): Promise<Item[]> => {
  return apiGetItemsByModuleAndType(moduleId, type, level)
}

export const getItemsByModuleAndLevel = async (
  moduleId: string,
  level: string,
): Promise<Item[]> => {
  return apiGetItemsByModuleAndLevel(moduleId, level)
}

// Attempt functions
export const createAttempt = async (
  attempt: Omit<Attempt, 'id' | 'created_at'>,
): Promise<Attempt> => {
  return apiCreateAttempt(attempt)
}

// Placement functions
export const createPlacement = async (
  placement: Omit<Placement, 'id' | 'updated_at'>,
): Promise<Placement> => {
  return apiCreatePlacement(placement)
}

export const getPlacementByUserAndModule = async (
  userId: string,
  moduleId: string,
): Promise<Placement> => {
  return apiGetPlacementByUserAndModule(userId, moduleId)
}
