import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api'
import Loader from '../components/Loader'
import { FaPlus, FaEdit, FaTrash } from 'react-icons/fa'
import { displayClass, getObjId, getStudentFullName, getClassId } from '../utils'
import type { Student, Class as ClassType } from '../types'

export default function Students() {
  const [students, setStudents] = useState<Student[]>([])
  const [classes, setClasses] = useState<ClassType[]>([])
  const [name, setName] = useState('')
  const [classId, setClassId] = useState<string | null>(null)
  const [editing, setEditing] = useState<Student | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    setLoading(true)
    Promise.all([api.getStudents(), api.getClasses()])
      .then(([st, cls]) => { setStudents(st); setClasses(cls) })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const save = async () => {
    if (!name.trim()) { alert('O nome é obrigatório'); return }
    try {
      setSaving(true)
      const payload = { name, classId }
      if (editing) await api.updateStudent(getObjId(editing) ?? '', payload)
      else await api.createStudent(payload)
      setStudents(await api.getStudents())
      setName('')
      setClassId(null)
      setEditing(null)
    } catch (e) { console.error(e); alert('Erro ao salvar') }
    finally { setSaving(false) }
  }

  const remove = async (id: string) => {
    if (!confirm('Excluir estudante?')) return
    try {
      setLoading(true)
      await api.deleteStudent(id)
      setStudents(await api.getStudents())
    } catch (e) { console.error(e); alert('Erro ao excluir') }
    finally { setLoading(false) }
  }

  const extractClassIdFromStudent = (s: Student | null) => getClassId(s)

  const getClassNameForStudent = (s: Student | null) => {
    const id = extractClassIdFromStudent(s)
    if (id) {
      const cls = classes.find(c => (getObjId(c)) === id)
      if (cls) return cls.name ?? cls.title
      return id
    }
    // fallback to nested object
    const nested = (s as unknown as Record<string, unknown>)['class'] ?? (s as unknown as Record<string, unknown>)['turma']
    if (nested && typeof nested === 'object') return (nested as Record<string, unknown>)['name'] as string ?? (nested as Record<string, unknown>)['title'] as string
    return null
  }

  const startEdit = (s: Student) => {
    setEditing(s)
    // set combined name from firstName/lastName if available
    setName(getStudentFullName(s))
    setClassId(getClassId(s) ?? null)
  }

  return (
    <div>
      <h2>Estudantes</h2>
      <div className="form-row">
        <input placeholder="Nome" value={name} onChange={e => setName(e.target.value)} />
        <select value={classId ?? ''} onChange={e => setClassId(e.target.value || null)}>
          <option value="">-- Selecionar turma --</option>
          {classes.map(c => <option key={getObjId(c)} value={getObjId(c)}>{displayClass(c)}</option>)}
        </select>
        <button className="btn" onClick={save} disabled={saving}>{editing ? <><FaEdit className="icon-sm"/> Salvar</> : <><FaPlus className="icon-sm"/> Criar</>}</button>
        {editing && <button onClick={() => { setEditing(null); setName(''); setClassId(null) }}>Cancelar</button>}
      </div>

      {loading ? <Loader /> : (
        students.length === 0 ? <div className="empty">Nenhum estudante encontrado</div> : (
          <ul className="item-list">
            {students.map(s => (
                <li key={getObjId(s) ?? ''}>
                  <strong><Link to={`/students/${getObjId(s)}`}>{getStudentFullName(s)}</Link></strong> {getClassNameForStudent(s) ? ` (turma ${getClassNameForStudent(s)})` : ''}
                  <div>
                    <button onClick={() => startEdit(s)} className="icon-btn"><FaEdit className="icon-sm"/> Editar</button>
                    <button onClick={() => remove(getObjId(s) ?? '')} className="icon-btn danger"><FaTrash className="icon-sm"/> Excluir</button>
                  </div>
                </li>
              ))}
          </ul>
        )
      )}
    </div>
  )
}