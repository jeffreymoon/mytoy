import type { User, GameSession, Difficulty } from '@/types/sudoku'

const USERS_KEY = 'sudoku-users'
const SESSIONS_KEY = 'sudoku-sessions'

function readJSON<T>(key: string): T[] {
  if (typeof window === 'undefined') return []
  try {
    return JSON.parse(localStorage.getItem(key) ?? '[]')
  } catch {
    return []
  }
}

function writeJSON<T>(key: string, data: T[]): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(key, JSON.stringify(data))
}

export function getUsers(): User[] {
  return readJSON<User>(USERS_KEY)
}

export function upsertUser(user: User): void {
  const users = getUsers()
  const idx = users.findIndex(u => u.id === user.id)
  if (idx === -1) users.push(user)
  else users[idx] = user
  writeJSON(USERS_KEY, users)
}

export function getSessions(): GameSession[] {
  return readJSON<GameSession>(SESSIONS_KEY)
}

export function addSession(session: GameSession): void {
  const sessions = getSessions()
  sessions.push(session)
  writeJSON(SESSIONS_KEY, sessions)
}

export function getUserSessions(userId: string, difficulty?: Difficulty): GameSession[] {
  const sessions = getSessions().filter(s => s.userId === userId)
  return difficulty ? sessions.filter(s => s.difficulty === difficulty) : sessions
}
