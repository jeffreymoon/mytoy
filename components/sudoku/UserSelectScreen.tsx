'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { getUsers } from '@/services/storage'
import type { User } from '@/types/sudoku'

interface UserSelectScreenProps {
  onSelectUser: (user: User) => void
  onCreateUser: (name: string) => void
}

export function UserSelectScreen({ onSelectUser, onCreateUser }: UserSelectScreenProps) {
  const [users, setUsers] = useState<User[]>([])
  const [creating, setCreating] = useState(true)
  const [name, setName] = useState('')

  useEffect(() => {
    const stored = getUsers()
    setUsers(stored)
    setCreating(stored.length === 0)
  }, [])

  const handleCreate = () => {
    const trimmed = name.trim()
    if (!trimmed) return
    onCreateUser(trimmed)
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-1">스도쿠</h1>
        <p className="text-muted-foreground text-sm">사용자를 선택하거나 등록하세요</p>
      </div>

      {!creating && users.length > 0 && (
        <div className="flex flex-col gap-2">
          {users.map(user => (
            <Button
              key={user.id}
              variant="outline"
              className="justify-start h-11 text-base"
              onClick={() => onSelectUser(user)}
            >
              {user.name}
            </Button>
          ))}
          <Button variant="ghost" onClick={() => setCreating(true)} className="mt-1">
            + 새 사용자 등록
          </Button>
        </div>
      )}

      {creating && (
        <div className="flex flex-col gap-3">
          <Input
            placeholder="이름을 입력하세요"
            value={name}
            onChange={e => setName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleCreate()}
            autoFocus
          />
          <Button onClick={handleCreate} disabled={!name.trim()}>
            시작하기
          </Button>
          {users.length > 0 && (
            <Button variant="ghost" onClick={() => setCreating(false)}>
              기존 사용자 선택
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
