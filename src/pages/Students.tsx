import { useEffect, useState } from 'react'
import api from '../api'
import Loader from '../components/Loader'
import { FaPlus, FaEdit, FaTrash } from 'react-icons/fa'
import { displayClass } from '../utils'

export default function Students() {
  const [students, setStudents] = useState<any[]>([])
  const [classes, setClasses] = useState<any[]>([])
  const [name, setName] = useState('')
  const [classId, setClassId] = useState<string | null>(null)
  const [editing, setEditing] = useState<any | null>(null)
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
      if (editing) await api.updateStudent(editing.id ?? editing._id, payload)
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

  const extractClassIdFromStudent = (s: any) => {
    if (!s) return null
    const candidate = s.classId ?? s.turmaId ?? s.class ?? s.turma
    if (!candidate) return null
    if (typeof candidate === 'string') return candidate
    if (typeof candidate === 'object') return candidate.id ?? candidate._id ?? null
    return null
  }

  const getClassNameForStudent = (s: any) => {
    const id = extractClassIdFromStudent(s)
    if (id) {
      const cls = classes.find(c => (c.id ?? c._id) === id)
      if (cls) return cls.name ?? cls.title
      return id
    }
    // fallback to nested object
    const nested = s.class ?? s.turma
    if (nested && typeof nested === 'object') return nested.name ?? nested.title
    return null
  }

  const startEdit = (s: any) => {
    setEditing(s)
    // set combined name from firstName/lastName if available
    const first = s.firstName ?? s.first_name ?? ''
    const last = s.lastName ?? s.last_name ?? ''
    setName(s.name ?? `${first} ${last}`.trim())
    setClassId(extractClassIdFromStudent(s))
  }

  const getStudentFullName = (s: any) => {
    if (!s) return ''
    if (s.name) return s.name
    const fn = s.firstName ?? s.first_name ?? ''
    const ln = s.lastName ?? s.last_name ?? ''
    return `${fn} ${ln}`.trim()
  }

  return (
    <div>
      <h2>Estudantes</h2>
      <div className="form-row">
        <input placeholder="Nome" value={name} onChange={e => setName(e.target.value)} />
        <select value={classId ?? ''} onChange={e => setClassId(e.target.value || null)}>
          <option value="">-- Selecionar turma --</option>
          {classes.map(c => <option key={c.id || c._id} value={c.id ?? c._id}>{displayClass(c)}</option>)}
        </select>
        <button className="btn" onClick={save} disabled={saving}>{editing ? <><FaEdit className="icon-sm"/> Salvar</> : <><FaPlus className="icon-sm"/> Criar</>}</button>
        {editing && <button onClick={() => { setEditing(null); setName(''); setClassId(null) }}>Cancelar</button>}
      </div>

      {loading ? <Loader /> : (
        students.length === 0 ? <div className="empty">Nenhum estudante encontrado</div> : (
          <ul className="item-list">
            {students.map(s => (
                <li key={s.id || s._id}>
                  <strong>{getStudentFullName(s)}</strong> {getClassNameForStudent(s) ? ` (turma ${getClassNameForStudent(s)})` : ''}
                  <div>
                    <button onClick={() => startEdit(s)} className="icon-btn"><FaEdit className="icon-sm"/> Editar</button>
                    <button onClick={() => remove(s.id || s._id)} className="icon-btn danger"><FaTrash className="icon-sm"/> Excluir</button>
                  </div>
                </li>
              ))}
          </ul>
        )
      )}
    </div>
  )
}