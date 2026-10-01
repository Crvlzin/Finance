import { useState, useCallback } from 'react'

export interface User {
  id: string
  name: string
  email: string
  avatar?: string
}

const AUTH_USER_KEY = '@financehub/auth-user'
const AUTH_PASSWORD_KEY = '@financehub/auth-password'
const AUTH_STATUS_KEY = '@financehub/auth-status'

const DEFAULT_USER: User = {
  id: 'usr-1',
  name: 'Lucas Carvalho',
  email: 'lucas@finance.com',
}

const DEFAULT_PASSWORD = '123456'

export function useAuth() {
  const [user, setUser] = useState<User>(() => {
    try {
      const stored = localStorage.getItem(AUTH_USER_KEY)
      return stored ? JSON.parse(stored) : DEFAULT_USER
    } catch {
      return DEFAULT_USER
    }
  })

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    try {
      const stored = localStorage.getItem(AUTH_STATUS_KEY)
      return stored !== null ? JSON.parse(stored) : true
    } catch {
      return true
    }
  })

  // Login com validação de credenciais
  const login = useCallback((emailInput: string, passwordInput: string): { success: boolean; error?: string } => {
    const trimmedEmail = emailInput.trim().toLowerCase()
    
    // Obter senha cadastrada atual
    let currentStoredPassword = DEFAULT_PASSWORD
    try {
      const p = localStorage.getItem(AUTH_PASSWORD_KEY)
      if (p) currentStoredPassword = JSON.parse(p)
    } catch {
      currentStoredPassword = DEFAULT_PASSWORD
    }

    // Obter dados do usuário cadastrado
    let currentStoredUser = DEFAULT_USER
    try {
      const u = localStorage.getItem(AUTH_USER_KEY)
      if (u) currentStoredUser = JSON.parse(u)
    } catch {
      currentStoredUser = DEFAULT_USER
    }

    if (!trimmedEmail || !passwordInput) {
      return { success: false, error: 'Por favor, preencha o e-mail e a senha.' }
    }

    // Permite login com usuário registrado ou email atual
    if (
      trimmedEmail === currentStoredUser.email.toLowerCase() ||
      trimmedEmail === DEFAULT_USER.email.toLowerCase()
    ) {
      if (passwordInput === currentStoredPassword || passwordInput === DEFAULT_PASSWORD) {
        setIsAuthenticated(true)
        localStorage.setItem(AUTH_STATUS_KEY, JSON.stringify(true))
        return { success: true }
      }
      return { success: false, error: 'Senha incorreta. Tente novamente.' }
    }

    // Se for um novo email direto no login demo, aceita com senha >= 4 digitos
    if (passwordInput.length >= 4) {
      const newUser: User = {
        id: `usr-${Date.now()}`,
        name: trimmedEmail.split('@')[0],
        email: trimmedEmail,
      }
      setUser(newUser)
      setIsAuthenticated(true)
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(newUser))
      localStorage.setItem(AUTH_PASSWORD_KEY, JSON.stringify(passwordInput))
      localStorage.setItem(AUTH_STATUS_KEY, JSON.stringify(true))
      return { success: true }
    }

    return { success: false, error: 'Credenciais inválidas. Verifique os dados informados.' }
  }, [])

  // Cadastro de nova conta
  const register = useCallback((nameInput: string, emailInput: string, passwordInput: string): { success: boolean; error?: string } => {
    const trimmedName = nameInput.trim()
    const trimmedEmail = emailInput.trim().toLowerCase()

    if (!trimmedName || !trimmedEmail || !passwordInput) {
      return { success: false, error: 'Preencha todos os campos para cadastrar.' }
    }

    if (passwordInput.length < 6) {
      return { success: false, error: 'A senha deve conter no mínimo 6 caracteres.' }
    }

    const newUser: User = {
      id: `usr-${Date.now()}`,
      name: trimmedName,
      email: trimmedEmail,
    }

    setUser(newUser)
    setIsAuthenticated(true)
    try {
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(newUser))
      localStorage.setItem(AUTH_PASSWORD_KEY, JSON.stringify(passwordInput))
      localStorage.setItem(AUTH_STATUS_KEY, JSON.stringify(true))
    } catch (e) {
      console.warn('Erro ao salvar cadastro:', e)
    }

    return { success: true }
  }, [])

  // Atualizar perfil (Nome e Email)
  const updateProfile = useCallback((newName: string, newEmail: string): { success: boolean; error?: string } => {
    const trimmedName = newName.trim()
    const trimmedEmail = newEmail.trim().toLowerCase()

    if (!trimmedName) {
      return { success: false, error: 'O nome não pode estar em branco.' }
    }
    if (!trimmedEmail || !trimmedEmail.includes('@')) {
      return { success: false, error: 'Informe um endereço de e-mail válido.' }
    }

    const updated: User = {
      ...user,
      name: trimmedName,
      email: trimmedEmail,
    }

    setUser(updated)
    try {
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(updated))
    } catch (e) {
      console.warn('Erro ao salvar perfil:', e)
    }

    return { success: true }
  }, [user])

  // Trocar senha
  const changePassword = useCallback((currentPasswordInput: string, newPasswordInput: string): { success: boolean; error?: string } => {
    let currentStoredPassword = DEFAULT_PASSWORD
    try {
      const p = localStorage.getItem(AUTH_PASSWORD_KEY)
      if (p) currentStoredPassword = JSON.parse(p)
    } catch {
      currentStoredPassword = DEFAULT_PASSWORD
    }

    if (currentPasswordInput !== currentStoredPassword && currentPasswordInput !== DEFAULT_PASSWORD) {
      return { success: false, error: 'A senha atual informada está incorreta.' }
    }

    if (!newPasswordInput || newPasswordInput.length < 6) {
      return { success: false, error: 'A nova senha deve possuir pelo menos 6 caracteres.' }
    }

    if (newPasswordInput === currentStoredPassword) {
      return { success: false, error: 'A nova senha deve ser diferente da senha atual.' }
    }

    try {
      localStorage.setItem(AUTH_PASSWORD_KEY, JSON.stringify(newPasswordInput))
    } catch (e) {
      console.warn('Erro ao salvar nova senha:', e)
    }

    return { success: true }
  }, [])

  // Sair da conta
  const logout = useCallback(() => {
    setIsAuthenticated(false)
    try {
      localStorage.setItem(AUTH_STATUS_KEY, JSON.stringify(false))
    } catch (e) {
      console.warn('Erro ao deslogar:', e)
    }
  }, [])

  return {
    user,
    isAuthenticated,
    login,
    register,
    updateProfile,
    changePassword,
    logout,
  }
}
