import { useState, useEffect } from 'react'

const PRIVACY_STORAGE_KEY = '@financehub/show-values'

export function usePrivacy() {
  const [showValues, setShowValues] = useState<boolean>(() => {
    try {
      const stored = localStorage.getItem(PRIVACY_STORAGE_KEY)
      return stored !== null ? JSON.parse(stored) : true
    } catch {
      return true
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem(PRIVACY_STORAGE_KEY, JSON.stringify(showValues))
    } catch (error) {
      console.warn('Não foi possível persistir preferência de privacidade no localStorage:', error)
    }
  }, [showValues])

  const toggleShowValues = () => setShowValues((prev) => !prev)

  return {
    showValues,
    toggleShowValues,
  }
}
