const API_BASE = 'https://api-estudo-educacao-1.onrender.com'

async function request(path: string, options: RequestInit = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
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
export const createClass = (data: any) => request('/classes', { method: 'POST', body: JSON.stringify(data) })
export const updateClass = (id: string, data: any) => request(`/classes/${id}`, { method: 'PUT', body: JSON.stringify(data) })
export const deleteClass = (id: string) => request(`/classes/${id}`, { method: 'DELETE' })

// Students
export const getStudents = () => request('/students')
export const createStudent = (data: any) => request('/students', { method: 'POST', body: JSON.stringify(data) })
export const updateStudent = (id: string, data: any) => request(`/students/${id}`, { method: 'PUT', body: JSON.stringify(data) })
export const deleteStudent = (id: string) => request(`/students/${id}`, { method: 'DELETE' })

// Grades
export const getGrades = () => request('/grades')
export const getGradesByClass = (classId: string) => request(`/grades?classId=${classId}`)
export const updateGrade = (id: string, data: any) => request(`/grades/${id}`, { method: 'PUT', body: JSON.stringify(data) })
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
