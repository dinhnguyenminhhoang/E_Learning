import apiInstance from '@/configs/instance'

type AnyRecord = Record<string, any>

const createWord = async (payload: AnyRecord) => {
  const response = await apiInstance.post('/word/create', payload)
  return response
}

const getWordsByCategory = async (categoryId: string, params?: AnyRecord) => {
  const response = await apiInstance.get(`/word/category/${categoryId}`, { params })
  return response
}

const updateWord = async (wordId: string, payload: AnyRecord) => {
  const response = await apiInstance.put(`/word/${wordId}`, payload)
  return response
}

const deleteWord = async (wordId: string) => {
  const response = await apiInstance.delete(`/word/delete/${wordId}`)
  return response
}

const importWords = async (formData: FormData) => {
  const response = await apiInstance.post('/word/import', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return response
}

const exportSampleWords = async () => {
  const response = await apiInstance.get('/word/export-sample', {
    responseType: 'blob' as any,
  })
  return response
}

export {
  createWord,
  getWordsByCategory,
  updateWord,
  deleteWord,
  importWords,
  exportSampleWords,
}



