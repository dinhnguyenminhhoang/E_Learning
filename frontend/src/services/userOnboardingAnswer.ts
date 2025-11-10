import apiInstance from '@/configs/instance'

type AnyRecord = Record<string, any>

const saveUserOnboardingAnswer = async (payload: AnyRecord) => {
  const response = await apiInstance.post('/userOnboardingAnswer', payload)
  return response
}

export { saveUserOnboardingAnswer }



