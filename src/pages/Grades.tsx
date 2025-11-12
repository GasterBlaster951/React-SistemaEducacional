import { useEffect, useState } from 'react'
import api from '../api'
import Loader from '../components/Loader'
import { FaSave } from 'react-icons/fa'
import { displayClass, getObjId, getStudentFullName, getClassId } from '../utils'
import type { Class as ClassType, Student, Grade as GradeType } from '../types'

export default function Grades() {
  const [classes, setClasses] = useState<ClassType[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [grades, setGrades] = useState<GradeType[]>([])
  const [selectedClass, setSelectedClass] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [localGrades, setLocalGrades] = useState<Record<string, { prova?: number | '' ; trabalho?: number | '' }>>({})
  const [savingMap, setSavingMap] = useState<Record<string, boolean>>({})

  useEffect(() => {
    setLoading(true)
    Promise.all([api.getClasses(), api.getStudents(), api.getGrades()])
      .then(([cls, st, gr]) => {
        setClasses(cls)
        setStudents(st)
        setGrades(gr)
        // build localGrades map (normalize assessment names to lowercase keys: 'prova'|'trabalho')
        const map: Record<string, { prova?: number | '' ; trabalho?: number | '' }> = {}
        gr.forEach((g) => {
          const sid = g.studentId ?? ''
          if (!map[sid]) map[sid] = {}
          const key = String(g.assessment ?? '').toLowerCase()
          if (key === 'prova') map[sid].prova = g.score ?? ''
          else if (key === 'trabalho') map[sid].trabalho = g.score ?? ''
        })
        setLocalGrades(map)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const studentsInClass = students.filter(s => String(getClassId(s) ?? '') === String(selectedClass ?? ''))

  const onChangeLocal = (studentId: string, type: 'prova' | 'trabalho', value: string) => {
    setLocalGrades(prev => ({ ...prev, [studentId]: { ...(prev[studentId] || {}), [type]: value === '' ? '' : Number(value) } }))
  }

  const saveStudentGrades = async (studentId: string) => {
    if (!selectedClass) return
    const local = localGrades[studentId] || {}
    setSavingMap(m => ({ ...m, [studentId]: true }))
    try {
      for (const type of ['prova', 'trabalho'] as const) {
        const val = local[type]
        if (val === '' || val == null) continue
        const assessmentLabel = type === 'prova' ? 'Prova' : 'Trabalho'
        const existing = grades.find(g => (g.studentId ?? '') === studentId && String(g.assessment ?? '').toLowerCase() === type)
        if (existing) await api.updateGrade(existing.id ?? existing._id ?? '', { assessment: existing.assessment, score: val })
        else await api.createGrade({ studentId, classId: selectedClass, assessment: assessmentLabel, score: val })
      }
      const updated = await api.getGrades()
      setGrades(updated)
      // rebuild local map from updated grades
      const map: Record<string, { prova?: number | '' ; trabalho?: number | '' }> = {}
      updated.forEach((g) => {
        const sid = g.studentId ?? ''
        if (!map[sid]) map[sid] = {}
        const key = String(g.assessment ?? '').toLowerCase()
        if (key === 'prova') map[sid].prova = g.score ?? ''
        else if (key === 'trabalho') map[sid].trabalho = g.score ?? ''
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
          {classes.map(c => <option key={getObjId(c)} value={getObjId(c)}>{displayClass(c)}</option>)}
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
              {studentsInClass.map(s => {
                const sid = getObjId(s) ?? ''
                return (
                  <tr key={sid}>
                    <td>{getStudentFullName(s)}</td>
                    <td>
                      <input type="number" value={localGrades[sid]?.prova ?? ''} onChange={e => onChangeLocal(sid, 'prova', e.target.value)} />
                    </td>
                    <td>
                      <input type="number" value={localGrades[sid]?.trabalho ?? ''} onChange={e => onChangeLocal(sid, 'trabalho', e.target.value)} />
                    </td>
                    <td>
                      <button className="btn" onClick={() => saveStudentGrades(sid)} disabled={!!savingMap[sid]}><FaSave className="icon-sm"/> Salvar</button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        ) : <div className="empty">Selecione uma turma para ver/lançar notas</div>
      )}
    </div>
  )
}