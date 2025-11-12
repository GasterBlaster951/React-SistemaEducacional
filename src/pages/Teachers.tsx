import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api'
import Loader from '../components/Loader'
import { FaEdit, FaTrash } from 'react-icons/fa'
import { getObjId } from '../utils'
import type { Teacher } from '../types'

export default function Teachers() {
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [editing, setEditing] = useState<Teacher | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)

  useEffect(() => {
    setLoading(true)
    api.getTeachers().then(setTeachers).catch(console.error).finally(() => setLoading(false))
  }, [])

  const onSelectAvatar = (file?: File) => {
    if (!file) return
    setAvatarFile(file)
    const url = URL.createObjectURL(file)
    setAvatarPreview(url)
  }

  const fileToBase64 = (file: File) => new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = reject
    reader.readAsDataURL(file)
  })

  const save = async () => {
    if (!name.trim()) { alert('O nome é obrigatório'); return }
    try {
      setSaving(true)
      const payload: Partial<Teacher> = { name, email: email || undefined }
      if (avatarFile) {
        try { payload.avatarUrl = await fileToBase64(avatarFile) } catch (e) { console.error('Erro ao converter imagem', e) }
      }
      if (editing) await api.updateTeacher(getObjId(editing) ?? '', payload)
      else await api.createTeacher(payload)
      setTeachers(await api.getTeachers())
      setName('')
      setEmail('')
      setEditing(null)
      setAvatarFile(null)
      setAvatarPreview(null)
    } catch (e) { console.error(e); alert('Erro ao salvar') }
    finally { setSaving(false) }
  }

  const remove = async (id: string) => {
    if (!confirm('Excluir professor?')) return
    try {
      setLoading(true)
      await api.deleteTeacher(id)
      setTeachers(await api.getTeachers())
    } catch (e) { console.error(e); alert('Erro ao excluir') }
    finally { setLoading(false) }
  }

  const startEdit = (t: Teacher) => { setEditing(t); setName(t.name || ''); setEmail(t.email || '') }

  return (
    <div>
      <h2>Professores</h2>
      <div className="form-row">
        <input placeholder="Nome" value={name} onChange={e => setName(e.target.value)} />
        <input placeholder="E-mail" value={email} onChange={e => setEmail(e.target.value)} />
        <input type="file" accept="image/*" onChange={e => onSelectAvatar(e.target.files ? e.target.files[0] : undefined)} />
        {avatarPreview && <img src={avatarPreview} alt="Preview" style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: '50%' }} />}
        <button className="btn" onClick={save} disabled={saving}>{editing ? 'Salvar' : 'Criar'}</button>
        {editing && <button onClick={() => { setEditing(null); setName(''); setEmail('') }}>Cancelar</button>}
      </div>

      {loading ? <Loader /> : (
        teachers.length === 0 ? <div className="empty">Nenhum professor encontrado</div> : (
          <ul className="item-list">
            {teachers.map(t => (
                <li key={getObjId(t)}>
                  <strong><Link to={`/teachers/${getObjId(t)}`}>{t.name}</Link></strong>
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
