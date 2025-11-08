import apiInstance from '@/configs/instance'

type AnyRecord = Record<string, any>

const createCategory = async (payload: AnyRecord) => {
  const response = await apiInstance.post('/category/create', payload)
  return response
}

const listCategories = async (params?: AnyRecord) => {
  const response = await apiInstance.get('/category', { params })
  return response
}

const getCategoryById = async (id: string) => {
  const response = await apiInstance.get(`/category/getById/${id}`)
  return response
}

const updateCategory = async (id: string, payload: AnyRecord) => {
  const response = await apiInstance.put(`/category/${id}`, payload)
  return response
}

const deleteCategory = async (id: string) => {
  const response = await apiInstance.delete(`/category/delete/${id}`)
  return response
}

export {
  createCategory,
  listCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
}



