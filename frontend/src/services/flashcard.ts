import apiInstance from '@/configs/instance'

type AnyRecord = Record<string, any>

const createFlashcard = async (payload: AnyRecord) => {
  const response = await apiInstance.post('/flashcard/create', payload)
  return response
}

const listFlashcards = async (params?: { q?: string; limit?: number; skip?: number }) => {
  if (params?.q) {
    const response = await apiInstance.get('/flashcard/search', { params })
    return response
  }
  const response = await apiInstance.get('/flashcard', { params })
  return response
}

const getFlashcardById = async (id: string) => {
  const response = await apiInstance.get(`/flashcard/getById/${id}`)
  return response
}

const updateFlashcard = async (id: string, payload: AnyRecord) => {
  const response = await apiInstance.put(`/flashcard/${id}`, payload)
  return response
}

const deleteFlashcard = async (id: string) => {
  const response = await apiInstance.delete(`/flashcard/delete/${id}`)
  return response
}

export {
  createFlashcard,
  listFlashcards,
  getFlashcardById,
  updateFlashcard,
  deleteFlashcard,
}



