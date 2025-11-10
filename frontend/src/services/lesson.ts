import apiInstance from '@/configs/instance'

type AnyRecord = Record<string, any>

const listLessons = async (params?: AnyRecord) => {
  const response = await apiInstance.get('/lesson', { params })
  return response
}

const createLesson = async (payload: AnyRecord) => {
  const response = await apiInstance.post('/lesson', payload)
  return response
}

const getLessonById = async (id: string) => {
  const response = await apiInstance.get(`/lesson/${id}`)
  return response
}

const updateLesson = async (id: string, payload: AnyRecord) => {
  const response = await apiInstance.put(`/lesson/${id}`, payload)
  return response
}

const deleteLesson = async (id: string) => {
  const response = await apiInstance.delete(`/lesson/${id}`)
  return response
}

export { listLessons, createLesson, getLessonById, updateLesson, deleteLesson }



