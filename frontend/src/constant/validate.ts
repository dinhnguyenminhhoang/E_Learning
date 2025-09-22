
export const validateName = (name: string): string | null => {
  if (!name || name.trim().length === 0) {
    return 'Họ tên là bắt buộc'
  }

  if (name.trim().length < 2) {
    return 'Họ tên phải có ít nhất 2 ký tự'
  }

  if (name.trim().length > 100) {
    return 'Họ tên không được vượt quá 100 ký tự'
  }

  // Check for valid characters (letters, spaces, Vietnamese characters)
  const nameRegex = /^[\p{L}\s\-'\.]+$/u
  if (!nameRegex.test(name.trim())) {
    return 'Họ tên chỉ được chứa chữ cái, khoảng trắng và dấu gạch ngang'
  }

  return null
}

export const validatePhoneNumber = (phone: string): string | null => {
  if (!phone || phone.trim().length === 0) {
    return null // Optional field
  }

  // Remove all non-digit characters for validation
  const cleanPhone = phone.replace(/\D/g, '')

  // Vietnamese phone number validation
  if (cleanPhone.length < 9 || cleanPhone.length > 12) {
    return 'Số điện thoại không hợp lệ'
  }

  // Must start with 0 (domestic) or country code
  const phoneRegex = /^(\+84|84|0)(3|5|7|8|9)[0-9]{8}$/
  if (!phoneRegex.test(cleanPhone.startsWith('84') ? '+' + cleanPhone : cleanPhone)) {
    return 'Số điện thoại không đúng định dạng Việt Nam'
  }

  return null
}

// Cập nhật validateEmail nếu cần
export const validateEmail = (email: string): string | null => {
  if (!email || email.trim().length === 0) {
    return 'Email là bắt buộc'
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email.trim())) {
    return 'Email không hợp lệ'
  }

  if (email.length > 254) {
    return 'Email quá dài'
  }

  return null
}

// Cập nhật validatePassword để mạnh hơn
export const validatePassword = (password: string): string | null => {
  if (!password || password.length === 0) {
    return 'Mật khẩu là bắt buộc'
  }

  if (password.length < 8) {
    return 'Mật khẩu phải có ít nhất 8 ký tự'
  }

  if (password.length > 128) {
    return 'Mật khẩu không được vượt quá 128 ký tự'
  }

  // Check for at least one lowercase letter
  if (!/[a-z]/.test(password)) {
    return 'Mật khẩu phải có ít nhất 1 chữ thường'
  }

  // Check for at least one uppercase letter
  if (!/[A-Z]/.test(password)) {
    return 'Mật khẩu phải có ít nhất 1 chữ hoa'
  }

  // Check for at least one number
  if (!/\d/.test(password)) {
    return 'Mật khẩu phải có ít nhất 1 số'
  }

  // Check for at least one special character
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    return 'Mật khẩu phải có ít nhất 1 ký tự đặc biệt'
  }

  return null
}
