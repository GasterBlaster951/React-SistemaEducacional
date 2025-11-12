import { useEffect, useState } from 'react'
import api from '../api'
import Loader from '../components/Loader'
import { FaPlus, FaEdit, FaTrash } from 'react-icons/fa'
import { displayClass, getObjId } from '../utils'
import type { Class as ClassType, Course } from '../types'

export default function Classes() {
  const [classes, setClasses] = useState<ClassType[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [name, setName] = useState('')
  const [courseId, setCourseId] = useState<string | null>(null)
  const [editing, setEditing] = useState<ClassType | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    setLoading(true)
    Promise.all([api.getClasses(), api.getCourses()])
      .then(([cls, crs]) => { setClasses(cls); setCourses(crs) })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const save = async () => {
    if (!name.trim()) { alert('O nome da turma é obrigatório'); return }
    try {
      setSaving(true)
      const payload = { name, courseId }
      if (editing) await api.updateClass(getObjId(editing) ?? '', payload)
      else await api.createClass(payload)
      setClasses(await api.getClasses())
      setName('')
      setCourseId(null)
      setEditing(null)
    } catch (e) { console.error(e); alert('Erro ao salvar') }
    finally { setSaving(false) }
  }

  const remove = async (id: string) => {
    if (!confirm('Excluir turma?')) return
    try {
      setLoading(true)
      await api.deleteClass(id)
      setClasses(await api.getClasses())
    } catch (e) { console.error(e); alert('Erro ao excluir') }
    finally { setLoading(false) }
  }

  const startEdit = (t: ClassType) => { setEditing(t); setName(t.name || ''); setCourseId(t.courseId || null) }

  return (
    <div>
      <h2>Turmas</h2>
      <div className="form-row">
        <input placeholder="Nome da turma" value={name} onChange={e => setName(e.target.value)} />
        <select value={courseId ?? ''} onChange={e => setCourseId(e.target.value || null)}>
          <option value="">-- Selecionar curso --</option>
          {courses.map(c => <option key={getObjId(c)} value={getObjId(c)}>{c.title ?? c.name}</option>)}
        </select>
        <button className="btn" onClick={save} disabled={saving}>{editing ? <><FaEdit className="icon-sm"/> Salvar</> : <><FaPlus className="icon-sm"/> Criar</>}</button>
        {editing && <button onClick={() => { setEditing(null); setName(''); setCourseId(null) }}>Cancelar</button>}
      </div>

      {loading ? <Loader /> : (
        classes.length === 0 ? <div className="empty">Nenhuma turma encontrada</div> : (
          <ul className="item-list">
            {classes.map(t => (
                <li key={getObjId(t)}>
                  <strong>{displayClass(t)}</strong> {t.courseId ? `(curso ${courses.find(c => getObjId(c) === t.courseId)?.title ?? courses.find(c => getObjId(c) === t.courseId)?.name})` : ''}
                  <div>
                    <button onClick={() => startEdit(t)} className="icon-btn"><FaEdit className="icon-sm"/> Editar</button>
                    <button onClick={() => remove(getObjId(t) ?? '')} className="icon-btn danger"><FaTrash className="icon-sm"/> Excluir</button>
                  </div>
                </li>
              ))}
          </ul>
        )
      )}
    </div>
  )
}