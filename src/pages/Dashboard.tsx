import { useEffect, useState } from 'react'
import api from '../api'
import Loader from '../components/Loader'
import { FaBook, FaUsers, FaChalkboardTeacher } from 'react-icons/fa'
import type { Course, Class as ClassType, Student, Teacher, Grade } from '../types'
import SmallChart from '../components/SmallChart'

export default function Dashboard() {
  const [courses, setCourses] = useState<Course[]>([])
  const [classes, setClasses] = useState<ClassType[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [loading, setLoading] = useState(true)
  const [avgScores, setAvgScores] = useState<number[]>([])
  const [labels, setLabels] = useState<string[]>([])

  useEffect(() => {
    setLoading(true)
    Promise.all([api.getCourses(), api.getClasses(), api.getStudents(), api.getTeachers()])
      .then(([c, cls, st, t]) => { setCourses(c); setClasses(cls); setStudents(st); setTeachers(t) })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    // calcular médias por turma a partir das grades
    api.getGrades().then((gr) => {
      const map: Record<string, { sum: number; count: number }> = {}
      gr.forEach((g: Grade) => {
        const cid = String(g.classId ?? '')
        if (!map[cid]) map[cid] = { sum: 0, count: 0 }
        map[cid].sum += Number(g.score ?? 0)
        map[cid].count += 1
      })

      // mapa de id -> nome da turma a partir das classes carregadas
      const classMap: Record<string, string> = {}
      classes.forEach(c => {
        const id = String(c.id ?? c._id ?? '')
        classMap[id] = c.name ?? c.title ?? `Turma ${id}`
      })

      const l: string[] = []
      const d: number[] = []
      Object.keys(map).forEach(k => {
        l.push(classMap[k] || k || 'N/A')
        d.push(map[k].count ? Math.round(map[k].sum / map[k].count) : 0)
      })
      setLabels(l)
      setAvgScores(d)
    }).catch(console.error)
  }, [classes])

  if (loading) return <Loader />

  return (
    <div>
      <h2>Dashboard</h2>
      <div className="dashboard-grid">
        <div className="card">
          <h3><FaBook /> Cursos</h3>
          <p style={{ fontSize: 24, fontWeight: 'bold' }}>{courses.length}</p>
        </div>
        <div className="card">
          <h3><FaChalkboardTeacher /> Turmas</h3>
          <p style={{ fontSize: 24, fontWeight: 'bold' }}>{classes.length}</p>
        </div>
        <div className="card">
          <h3><FaUsers /> Estudantes</h3>
          <p style={{ fontSize: 24, fontWeight: 'bold' }}>{students.length}</p>
        </div>
        <div className="card">
          <h3><FaChalkboardTeacher /> Professores</h3>
          <p style={{ fontSize: 24, fontWeight: 'bold' }}>{teachers.length}</p>
        </div>
      </div>
      <div style={{ marginTop: 16, background: 'white', padding: 12, borderRadius: 8 }}>
        <h3>Média de notas por turma</h3>
        {labels.length > 0 ? <SmallChart labels={labels} data={avgScores} /> : <div className="empty">Sem dados de notas</div>}
      </div>
    </div>
  )
}
