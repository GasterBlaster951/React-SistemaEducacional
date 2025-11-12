import type { Class as ClassType, Student } from './types'

export function getObjId(obj?: unknown): string | undefined {
  if (obj == null) return undefined
  if (typeof obj === 'string') return obj
  if (typeof obj === 'number') return String(obj)
  if (typeof obj === 'object') {
    const o = obj as Record<string, unknown>
    const id = o['id'] ?? o['_id']
    if (typeof id === 'string') return id
    if (typeof id === 'number') return String(id)
  }
  return undefined
}

export function displayClass(c?: ClassType | string | undefined) {
  if (!c) return ''
  if (typeof c === 'string') return `Turma ${c}`
  // prefer explicit name/title
  if (c.name) return c.name
  if (c.title) return c.title
  // otherwise build a readable label
  const parts: string[] = []
  const id = getObjId(c)
  if (id != null) parts.push(`Turma ${id}`)
  if (c.room) parts.push(c.room)
  if (c.semester != null) parts.push(String(c.semester))
  return parts.join(' • ')
}

export function getStudentFullName(s?: Student | null) {
  if (!s) return ''
  if (typeof (s as Record<string, unknown>)['name'] === 'string' && ((s as Record<string, unknown>)['name'] as string).trim() !== '') return (s as Record<string, unknown>)['name'] as string
  const fn = s.firstName ?? (s as Record<string, unknown>)['first_name'] ?? ''
  const ln = s.lastName ?? (s as Record<string, unknown>)['last_name'] ?? ''
  return `${fn} ${ln}`.trim()
}

export function getClassId(s?: Student | ClassType | null): string | undefined {
  if (!s) return undefined
  // if passed a plain string id
  if (typeof s === 'string') return s
  // if it's a Student-like object
  const raw = s as Record<string, unknown>
  const classId = raw['classId'] ?? raw['class'] ?? raw['turma'] ?? raw['turmaId']
  if (typeof classId === 'string') return classId
  if (typeof classId === 'number') return String(classId)
  // nested object
  if (typeof classId === 'object' && classId != null) {
    const nested = classId as Record<string, unknown>
    const nestedId = nested['id'] ?? nested['_id']
    if (typeof nestedId === 'string') return nestedId
    if (typeof nestedId === 'number') return String(nestedId)
  }
  // fallback: maybe s itself is a class-like object with id
  const ownId = getObjId(s)
  if (ownId) return ownId
  return undefined
}
