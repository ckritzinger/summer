const USERS_KEY = 'tts_users'
const SETTINGS_KEY = 'tts_settings'
const ACTIVE_USER_KEY = 'tts_active_user'

const DEFAULT_SETTINGS = {
  rangeMin: 1,
  rangeMax: 5,
  rounds: 20,
  roundMs: 30000,
  allowMultipleTries: true,
}

export const AVATARS = ['🦁', '🐯', '🐸', '🐵', '🦊', '🐼', '🦄', '🐙', '🦖', '🐝', '🦋', '🐢']

function read(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

function write(key, value) {
  localStorage.setItem(key, JSON.stringify(value))
}

export function getUsers() {
  return read(USERS_KEY, [])
}

export function saveUsers(users) {
  write(USERS_KEY, users)
}

export function createUser(name, avatar) {
  const users = getUsers()
  const user = {
    id: crypto.randomUUID(),
    name,
    avatar,
    bestScore: 0,
    lastScore: 0,
    createdAt: Date.now(),
  }
  users.push(user)
  saveUsers(users)
  return user
}

export function updateUserScore(userId, score) {
  const users = getUsers()
  const user = users.find((u) => u.id === userId)
  if (!user) return null
  user.lastScore = score
  if (score > user.bestScore) user.bestScore = score
  saveUsers(users)
  return user
}

export function getSettings() {
  return { ...DEFAULT_SETTINGS, ...read(SETTINGS_KEY, {}) }
}

export function saveSettings(settings) {
  write(SETTINGS_KEY, settings)
}

export function getActiveUserId() {
  return read(ACTIVE_USER_KEY, null)
}

export function setActiveUserId(id) {
  write(ACTIVE_USER_KEY, id)
}
