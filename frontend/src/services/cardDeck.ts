import apiInstance from '@/configs/instance'

type AnyRecord = Record<string, any>

const getCardDecks = async (params?: AnyRecord) => {
  const response = await apiInstance.get('/card-deck', { params })
  return response
}

const createCardDeck = async (payload: AnyRecord) => {
  const response = await apiInstance.post('/card-deck', payload)
  return response
}

const updateCardDeck = async (id: string, payload: AnyRecord) => {
  const response = await apiInstance.put(`/card-deck/${id}`, payload)
  return response
}

const deleteCardDeck = async (id: string) => {
  const response = await apiInstance.delete(`/card-deck/${id}`)
  return response
}

const getCardDeckByCategory = async (categoryId: string, params?: AnyRecord) => {
  const response = await apiInstance.get(`/card-deck/category/${categoryId}`, { params })
  return response
}

export {
  getCardDecks,
  createCardDeck,
  updateCardDeck,
  deleteCardDeck,
  getCardDeckByCategory,
}



