import apiInstance from '@/configs/instance'

type AnyRecord = Record<string, any>

const createLearningPath = async (payload: AnyRecord) => {
  const response = await apiInstance.post('/learning-path', payload)
  return response
}

const assignLessonToPath = async (payload: AnyRecord) => {
  const response = await apiInstance.post('/learning-path/assign', payload)
  return response
}

const getAllLearningPaths = async (params?: AnyRecord) => {
  const response = await apiInstance.get('/learning-path', { params })
  return response
}

const getLearningPathHierarchy = async (params: {
  isLevel?: boolean
  isModule?: boolean
  isLesson?: boolean
  levelOrder?: number
  moduleId?: string
}) => {
  const response = await apiInstance.get('/learning-path/hierarchy', { params })
  return response
}

const createLevel = async (payload: AnyRecord) => {
  const response = await apiInstance.post('/learning-path/level', payload)
  return response
}

const getByTarget = async (targetIds: string[]) => {
  const response = await apiInstance.post('/learning-path/by-target', { targetIds })
  return response
}

export {
  createLearningPath,
  assignLessonToPath,
  getAllLearningPaths,
  getLearningPathHierarchy,
  createLevel,
  getByTarget,
}



