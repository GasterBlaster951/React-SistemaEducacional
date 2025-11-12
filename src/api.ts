const API_BASE = 'https://api-estudo-educacao-1.onrender.com'

async function request(path: string, options: RequestInit = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    // do not send credentials by default (API hosted externally)
    ...options,
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`API ${res.status} ${text}`)
  }
  // If no content
  if (res.status === 204) return null
  return res.json()
}

import type { Course, Class as ClassType, Student, Grade, Teacher } from './types'

// helper to safely read fields from unknown input
function getStr(data: unknown, key: string): string | undefined {
  if (data && typeof data === 'object' && key in data) {
    const v = (data as Record<string, unknown>)[key]
    if (typeof v === 'string') return v
    if (typeof v === 'number') return String(v)
  }
  return undefined
}

function getAny(data: unknown, key: string): unknown {
  if (data && typeof data === 'object' && key in data) return (data as Record<string, unknown>)[key]
  return undefined
}

function getIdFromNested(nested: unknown): string | undefined {
  if (nested && typeof nested === 'object') {
    const obj = nested as Record<string, unknown>
    const id = obj['id'] ?? obj['_id']
    if (typeof id === 'string') return id
    if (typeof id === 'number') return String(id)
  }
  return undefined
}

// Courses
export const getCourses = (): Promise<Course[]> => request('/courses') as Promise<Course[]>
export const createCourse = (data: Partial<Course>): Promise<Course> => request('/courses', { method: 'POST', body: JSON.stringify(data) }) as Promise<Course>
export const updateCourse = (id: string, data: Partial<Course>): Promise<Course> => request(`/courses/${id}`, { method: 'PUT', body: JSON.stringify(data) }) as Promise<Course>
export const deleteCourse = (id: string) => request(`/courses/${id}`, { method: 'DELETE' })

// Classes
export const getClasses = (): Promise<ClassType[]> => request('/classes') as Promise<ClassType[]>
export const createClass = (data: unknown): Promise<ClassType> => {
  const name = getStr(data, 'name')
  const room = getStr(data, 'room')
  const semester = getStr(data, 'semester') ?? getStr(data, 'semestre')
  const courseId = getStr(data, 'courseId') ?? getStr(data, 'course')
  const teacherId = getStr(data, 'teacherId')
  const payload: Partial<ClassType> = { room: name ?? room ?? undefined, semester: semester ?? undefined, courseId: courseId ?? undefined, teacherId: teacherId ?? undefined }
  return request('/classes', { method: 'POST', body: JSON.stringify(payload) }) as Promise<ClassType>
}
export const updateClass = (id: string, data: unknown): Promise<ClassType> => {
  const name = getStr(data, 'name')
  const room = getStr(data, 'room')
  const semester = getStr(data, 'semester') ?? getStr(data, 'semestre')
  const courseId = getStr(data, 'courseId') ?? getStr(data, 'course')
  const teacherId = getStr(data, 'teacherId')
  const payload: Partial<ClassType> = { room: name ?? room ?? undefined, semester: semester ?? undefined, courseId: courseId ?? undefined, teacherId: teacherId ?? undefined }
  return request(`/classes/${id}`, { method: 'PUT', body: JSON.stringify(payload) }) as Promise<ClassType>
}
export const deleteClass = (id: string) => request(`/classes/${id}`, { method: 'DELETE' })

// Students
export const getStudents = (): Promise<Student[]> => request('/students') as Promise<Student[]>
export const getStudent = (id: string): Promise<Student> => request(`/students/${id}`) as Promise<Student>

function buildStudentPayload(data: unknown): Partial<Student> {
  const firstName = getStr(data, 'firstName') ?? getStr(data, 'first_name') ?? undefined
  const lastName = getStr(data, 'lastName') ?? getStr(data, 'last_name') ?? undefined
  let f = firstName
  let l = lastName
  if (!f) {
    const name = getStr(data, 'name')
    if (name) {
      const parts = name.trim().split(/\s+/)
      f = parts.shift() || ''
      l = parts.join(' ') || ''
    }
  }
  const email = getStr(data, 'email')
  const registeredAt = getStr(data, 'registeredAt') ?? getStr(data, 'registered_at')
  const classId = (() => {
    const cid = getStr(data, 'classId') ?? getStr(data, 'class') ?? getStr(data, 'turma') ?? undefined
    if (cid) return cid
    // nested object?
    const nested = getAny(data, 'class') ?? getAny(data, 'turma')
    return getIdFromNested(nested)
  })()
  const payload: Partial<Student> = { firstName: f, lastName: l, email: email ?? undefined, registeredAt: registeredAt ?? undefined, classId: classId ?? undefined }
  return payload
}

export const createStudent = (data: unknown): Promise<Student> => {
  const payload = buildStudentPayload(data)
  return request('/students', { method: 'POST', body: JSON.stringify(payload) }) as Promise<Student>
}
export const updateStudent = (id: string, data: unknown): Promise<Student> => {
  const payload = buildStudentPayload(data)
  return request(`/students/${id}`, { method: 'PUT', body: JSON.stringify(payload) }) as Promise<Student>
}
export const deleteStudent = (id: string) => request(`/students/${id}`, { method: 'DELETE' })

// Grades
export const getGrades = (): Promise<Grade[]> => request('/grades') as Promise<Grade[]>
export const getGradesByClass = (classId: string | number): Promise<Grade[]> => request(`/grades?classId=${Number(classId)}`) as Promise<Grade[]>
export const updateGrade = (id: string | number, data: Partial<Grade>) => request(`/grades/${id}`, { method: 'PUT', body: JSON.stringify(data) })
export const createGrade = (data: Partial<Grade>) => request('/grades', { method: 'POST', body: JSON.stringify(data) })

// Teachers (optional)
export const getTeacher = (id: string): Promise<Teacher> => request(`/teachers/${id}`) as Promise<Teacher>
export const getTeachers = (): Promise<Teacher[]> => request('/teachers') as Promise<Teacher[]>
export const createTeacher = (data: Partial<Teacher>): Promise<Teacher> => request('/teachers', { method: 'POST', body: JSON.stringify(data) }) as Promise<Teacher>
export const updateTeacher = (id: string, data: Partial<Teacher>): Promise<Teacher> => request(`/teachers/${id}`, { method: 'PUT', body: JSON.stringify(data) }) as Promise<Teacher>
export const deleteTeacher = (id: string) => request(`/teachers/${id}`, { method: 'DELETE' })

export default {
  getCourses,
  createCourse,
  updateCourse,
  deleteCourse,
  getClasses,
  createClass,
  updateClass,
  deleteClass,
  getStudents,
  getStudent,
  createStudent,
  updateStudent,
  deleteStudent,
  getGrades,
  getGradesByClass,
  updateGrade,
  createGrade,
  getTeacher,
  getTeachers,
  createTeacher,
  updateTeacher,
  deleteTeacher,
}
