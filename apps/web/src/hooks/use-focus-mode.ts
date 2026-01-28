import { useState, useCallback, useEffect } from "react"

const STORAGE_KEY = "hiremeplz:focus-mode"

export function useFocusMode(): [boolean, (enabled: boolean) => void] {
  const [enabled, setEnabledState] = useState(false)

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored === "true") {
        setEnabledState(true)
      }
    } catch {
      // localStorage unavailable
    }
  }, [])

  const setEnabled = useCallback((value: boolean) => {
    setEnabledState(value)
    try {
      localStorage.setItem(STORAGE_KEY, String(value))
    } catch {
      // ignore
    }
  }, [])

  return [enabled, setEnabled]
}
