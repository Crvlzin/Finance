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

const EMPTY_USER: User = {
  id: '',
  name: '',
  email: '',
}

export function useAuth() {
  const [user, setUser] = useState<User>(() => {
    try {
      const stored = localStorage.getItem(AUTH_USER_KEY)
      return stored ? JSON.parse(stored) : EMPTY_USER
    } catch {
      return EMPTY_USER
    }
  })

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    try {
      const stored = localStorage.getItem(AUTH_STATUS_KEY)
      return stored !== null ? JSON.parse(stored) : false
    } catch {
      return false
    }
  })

  // Login com validação de credenciais cadastradas
  const login = useCallback((emailInput: string, passwordInput: string): { success: boolean; error?: string } => {
    const trimmedEmail = emailInput.trim().toLowerCase()
    
    if (!trimmedEmail || !passwordInput) {
      return { success: false, error: 'Por favor, preencha o e-mail e a senha.' }
    }

    let storedUser: User | null = null
    let storedPassword = ''
    try {
      const u = localStorage.getItem(AUTH_USER_KEY)
      const p = localStorage.getItem(AUTH_PASSWORD_KEY)
      if (u) storedUser = JSON.parse(u)
      if (p) storedPassword = JSON.parse(p)
    } catch {
      storedUser = null
    }

    if (storedUser && storedUser.email.toLowerCase() === trimmedEmail) {
      if (storedPassword === passwordInput) {
        setUser(storedUser)
        setIsAuthenticated(true)
        localStorage.setItem(AUTH_STATUS_KEY, JSON.stringify(true))
        return { success: true }
      }
      return { success: false, error: 'Senha incorreta. Tente novamente.' }
    }

    return { success: false, error: 'Usuário não encontrado. Crie uma conta na aba "Criar Conta".' }
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
    let storedPassword = ''
    try {
      const p = localStorage.getItem(AUTH_PASSWORD_KEY)
      if (p) storedPassword = JSON.parse(p)
    } catch {
      storedPassword = ''
    }

    if (currentPasswordInput !== storedPassword) {
      return { success: false, error: 'A senha atual informada está incorreta.' }
    }

    if (!newPasswordInput || newPasswordInput.length < 6) {
      return { success: false, error: 'A nova senha deve possuir pelo menos 6 caracteres.' }
    }

    if (newPasswordInput === storedPassword) {
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
