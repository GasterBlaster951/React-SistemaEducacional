import { useEffect, useState } from 'react'
import api from '../api'
import Loader from '../components/Loader'
import { FaPlus, FaEdit, FaTrash } from 'react-icons/fa'

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

  const startEdit = (s: any) => { setEditing(s); setName(s.name || ''); setClassId(s.classId || null) }

  return (
    <div>
      <h2>Estudantes</h2>
      <div className="form-row">
        <input placeholder="Nome" value={name} onChange={e => setName(e.target.value)} />
        <select value={classId ?? ''} onChange={e => setClassId(e.target.value || null)}>
          <option value="">-- Selecionar turma --</option>
          {classes.map(c => <option key={c.id || c._id} value={c.id ?? c._id}>{c.name ?? c.title}</option>)}
        </select>
        <button className="btn" onClick={save} disabled={saving}>{editing ? <><FaEdit className="icon-sm"/> Salvar</> : <><FaPlus className="icon-sm"/> Criar</>}</button>
        {editing && <button onClick={() => { setEditing(null); setName(''); setClassId(null) }}>Cancelar</button>}
      </div>

      {loading ? <Loader /> : (
        students.length === 0 ? <div className="empty">Nenhum estudante encontrado</div> : (
          <ul>
            {students.map(s => (
                <li key={s.id || s._id} style={{ marginBottom: 8 }}>
                  <strong>{s.name}</strong> {s.classId ? `(turma ${s.classId})` : ''}
                  <button onClick={() => startEdit(s)} style={{ marginLeft: 8 }} className="icon"><FaEdit className="icon-sm"/> Editar</button>
                  <button onClick={() => remove(s.id || s._id)} style={{ marginLeft: 6 }} className="icon"><FaTrash className="icon-sm"/> Excluir</button>
                </li>
              ))}
          </ul>
        )
      )}
    </div>
  )
}
