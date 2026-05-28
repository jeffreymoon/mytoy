'use client'

import { Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'
import { Button } from '@/components/ui/button'

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      aria-label="다크모드 토글"
      className="px-2"
    >
      {theme === 'dark' ? (
        <Sun data-icon="inline-start" />
      ) : (
        <Moon data-icon="inline-start" />
      )}
    </Button>
  )
}
