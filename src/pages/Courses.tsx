import { useEffect, useState } from 'react'
import api from '../api'
import Loader from '../components/Loader'
import { FaPlus, FaEdit, FaTrash, FaSave } from 'react-icons/fa'

export default function Courses() {
  const [courses, setCourses] = useState<any[]>([])
  const [title, setTitle] = useState('')
  const [editing, setEditing] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    setLoading(true)
    api.getCourses().then(setCourses).catch(console.error).finally(() => setLoading(false))
  }, [])

  const save = async () => {
    if (!title.trim()) { alert('O título é obrigatório'); return }
    try {
      setSaving(true)
      if (editing) {
        await api.updateCourse(editing.id ?? editing._id, { title })
      } else {
        await api.createCourse({ title })
      }
      const updated = await api.getCourses()
      setCourses(updated)
      setTitle('')
      setEditing(null)
    } catch (e) { console.error(e); alert('Erro ao salvar') }
    finally { setSaving(false) }
  }

  const remove = async (id: string) => {
    if (!confirm('Excluir curso?')) return
    try {
      setLoading(true)
      await api.deleteCourse(id)
      setCourses(await api.getCourses())
    } catch (e) { console.error(e); alert('Erro ao excluir') }
    finally { setLoading(false) }
  }

  const startEdit = (c: any) => { setEditing(c); setTitle(c.title || '') }

  return (
    <div>
      <h2>Cursos</h2>
      <div className="form-row">
        <input placeholder="Título" value={title} onChange={e => setTitle(e.target.value)} />
        <button className="btn" onClick={save} disabled={saving}>{editing ? <><FaSave className="icon-sm"/> Salvar</> : <><FaPlus className="icon-sm"/> Criar</>}</button>
        {editing && <button onClick={() => { setEditing(null); setTitle('') }}>Cancelar</button>}
      </div>

      {loading ? <Loader /> : (
        courses.length === 0 ? <div className="empty">Nenhum curso encontrado</div> : (
          <ul className="item-list">
            {courses.map(c => (
                <li key={c.id || c._id}>
                  <strong>{c.title || c.name}</strong>
                  <div>
                    <button onClick={() => startEdit(c)} className="icon-btn"><FaEdit className="icon-sm"/> Editar</button>
                    <button onClick={() => remove(c.id || c._id)} className="icon-btn danger"><FaTrash className="icon-sm"/> Excluir</button>
                  </div>
                </li>
              ))}
          </ul>
        )
      )}
    </div>
  )
}