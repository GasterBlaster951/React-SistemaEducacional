export interface Course {
  id?: string
  _id?: string
  title?: string
  name?: string
}

export interface Class {
  id?: string
  _id?: string
  name?: string
  room?: string
  semester?: string | number
  courseId?: string
  teacherId?: string
  title?: string
}

export interface Student {
  id?: string
  _id?: string
  firstName?: string
  lastName?: string
  first_name?: string
  last_name?: string
  name?: string
  email?: string
  registeredAt?: string
  classId?: string | Class | null
  turmaId?: string
  class?: Class | null
  turma?: Class | null
  avatarUrl?: string
}

export interface Grade {
  id?: string
  _id?: string
  studentId?: string
  classId?: string
  assessment?: string
  score?: number
}

export interface Teacher {
  id?: string
  _id?: string
  name?: string
  firstName?: string
  lastName?: string
  email?: string
  avatarUrl?: string
}
