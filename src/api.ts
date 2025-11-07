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

// Courses
export const getCourses = () => request('/courses')
export const createCourse = (data: any) => request('/courses', { method: 'POST', body: JSON.stringify(data) })
export const updateCourse = (id: string, data: any) => request(`/courses/${id}`, { method: 'PUT', body: JSON.stringify(data) })
export const deleteCourse = (id: string) => request(`/courses/${id}`, { method: 'DELETE' })

// Classes
export const getClasses = () => request('/classes')
// create/update class: map UI field `name` -> room, keep other known fields
export const createClass = (data: any) => {
  const payload = { room: data.name ?? data.room ?? null, semester: data.semester ?? data.semestre ?? null, courseId: data.courseId ?? null, teacherId: data.teacherId ?? null }
  return request('/classes', { method: 'POST', body: JSON.stringify(payload) })
}
export const updateClass = (id: string, data: any) => {
  const payload = { room: data.name ?? data.room ?? null, semester: data.semester ?? data.semestre ?? null, courseId: data.courseId ?? null, teacherId: data.teacherId ?? null }
  return request(`/classes/${id}`, { method: 'PUT', body: JSON.stringify(payload) })
}
export const deleteClass = (id: string) => request(`/classes/${id}`, { method: 'DELETE' })

// Students
export const getStudents = () => request('/students')
// create/update student: support `name` -> split to firstName/lastName, accept classId
export const createStudent = (data: any) => {
  let firstName = data.firstName || ''
  let lastName = data.lastName || ''
  if (!firstName && data.name) {
    const parts = String(data.name).trim().split(/\s+/)
    firstName = parts.shift() || ''
    lastName = parts.join(' ') || ''
  }
  const payload: any = { firstName, lastName, email: data.email ?? null, registeredAt: data.registeredAt ?? null, classId: data.classId ?? data.class ?? null }
  return request('/students', { method: 'POST', body: JSON.stringify(payload) })
}
export const updateStudent = (id: string, data: any) => {
  let firstName = data.firstName || ''
  let lastName = data.lastName || ''
  if (!firstName && data.name) {
    const parts = String(data.name).trim().split(/\s+/)
    firstName = parts.shift() || ''
    lastName = parts.join(' ') || ''
  }
  const payload: any = { firstName, lastName, email: data.email ?? null, registeredAt: data.registeredAt ?? null, classId: data.classId ?? data.class ?? null }
  return request(`/students/${id}`, { method: 'PUT', body: JSON.stringify(payload) })
}
export const deleteStudent = (id: string) => request(`/students/${id}`, { method: 'DELETE' })

// Grades
export const getGrades = () => request('/grades')
export const getGradesByClass = (classId: string | number) => request(`/grades?classId=${Number(classId)}`)
export const updateGrade = (id: string | number, data: any) => request(`/grades/${id}`, { method: 'PUT', body: JSON.stringify(data) })
export const createGrade = (data: any) => request('/grades', { method: 'POST', body: JSON.stringify(data) })

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
  createStudent,
  updateStudent,
  deleteStudent,
  getGrades,
  getGradesByClass,
  updateGrade,
  createGrade,
}
