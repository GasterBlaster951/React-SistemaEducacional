import { useEffect, useState } from 'react'
import api from '../api'
import Loader from '../components/Loader'
import { FaSave } from 'react-icons/fa'
import { displayClass } from '../utils'

type Grade = { id?: string; studentId: string; classId: string; assessment: string; score: number }

export default function Grades() {
  const [classes, setClasses] = useState<any[]>([])
  const [students, setStudents] = useState<any[]>([])
  const [grades, setGrades] = useState<Grade[]>([])
  const [selectedClass, setSelectedClass] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [localGrades, setLocalGrades] = useState<Record<string, { prova?: number | '' | undefined; trabalho?: number | '' | undefined }>>({})
  const [savingMap, setSavingMap] = useState<Record<string, boolean>>({})

  useEffect(() => {
    setLoading(true)
    Promise.all([api.getClasses(), api.getStudents(), api.getGrades()])
      .then(([cls, st, gr]) => {
        setClasses(cls)
        setStudents(st)
        setGrades(gr)
        // build localGrades map (normalize assessment names to lowercase keys: 'prova'|'trabalho')
        const map: Record<string, any> = {}
        gr.forEach((g: Grade) => {
          if (!map[g.studentId]) map[g.studentId] = {}
          const key = String(g.assessment ?? '').toLowerCase()
          map[g.studentId][key] = g.score
        })
        setLocalGrades(map)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const studentsInClass = students.filter(s => String(s.classId ?? s.turmaId ?? (s.class && (s.class.id ?? s.class._id)) ?? '') === String(selectedClass ?? ''))

  const getStudentFullName = (s: any) => {
    if (!s) return ''
    if (s.name) return s.name
    const fn = s.firstName ?? s.first_name ?? ''
    const ln = s.lastName ?? s.last_name ?? ''
    return `${fn} ${ln}`.trim()
  }

  const onChangeLocal = (studentId: string, type: 'prova' | 'trabalho', value: string) => {
    setLocalGrades(prev => ({ ...prev, [studentId]: { ...(prev[studentId] || {}), [type]: value === '' ? '' : Number(value) } }))
  }

  const saveStudentGrades = async (studentId: string) => {
    if (!selectedClass) return
    const local = localGrades[studentId] || {}
    setSavingMap(m => ({ ...m, [studentId]: true }))
    try {
      for (const type of ['prova', 'trabalho']) {
        const val = local[type as 'prova' | 'trabalho']
        if (val === '' || val == null) continue
        // API uses 'assessment' and 'score' (values like 'Prova'/'Trabalho')
        const assessmentLabel = type === 'prova' ? 'Prova' : 'Trabalho'
        const existing = grades.find(g => g.studentId === studentId && String(g.assessment ?? '').toLowerCase() === type)
        if (existing) await api.updateGrade(existing.id!, { ...existing, score: val })
        else await api.createGrade({ studentId, classId: selectedClass, assessment: assessmentLabel, score: val })
      }
      const updated = await api.getGrades()
      setGrades(updated)
      // rebuild local map from updated grades
      const map: Record<string, any> = {}
      updated.forEach((g: Grade) => {
        if (!map[g.studentId]) map[g.studentId] = {}
        const key = String(g.assessment ?? '').toLowerCase()
        map[g.studentId][key] = g.score
      })
      setLocalGrades(map)
    } catch (e) { console.error(e); alert('Erro ao salvar notas') }
    finally { setSavingMap(m => ({ ...m, [studentId]: false })) }
  }

  return (
    <div>
      <h2>Notas</h2>
      <div className="form-row">
        <select value={selectedClass ?? ''} onChange={e => setSelectedClass(e.target.value || null)}>
          <option value="">-- Selecione uma turma --</option>
          {classes.map(c => <option key={c.id || c._id} value={c.id ?? c._id}>{displayClass(c)}</option>)}
        </select>
      </div>

      {loading ? <Loader /> : (
        selectedClass ? (
          <table className="table">
            <thead>
              <tr>
                <th>Estudante</th>
                <th>Prova</th>
                <th>Trabalho</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {studentsInClass.length === 0 && <tr><td colSpan={4} className="empty">Nenhum estudante nessa turma</td></tr>}
              {studentsInClass.map(s => (
                <tr key={s.id || s._id}>
                  <td>{getStudentFullName(s)}</td>
                  <td>
                    <input type="number" value={localGrades[s.id || s._id]?.prova ?? ''} onChange={e => onChangeLocal(s.id || s._id, 'prova', e.target.value)} />
                  </td>
                  <td>
                    <input type="number" value={localGrades[s.id || s._id]?.trabalho ?? ''} onChange={e => onChangeLocal(s.id || s._id, 'trabalho', e.target.value)} />
                  </td>
                  <td>
                    <button className="btn" onClick={() => saveStudentGrades(s.id || s._id)} disabled={!!savingMap[s.id || s._id]}><FaSave className="icon-sm"/> Salvar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : <div className="empty">Selecione uma turma para ver/lançar notas</div>
      )}
    </div>
  )
}