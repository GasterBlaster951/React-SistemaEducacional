import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import api from '../api'
import Loader from '../components/Loader'
import { displayClass, getObjId, getStudentFullName, getClassId } from '../utils'
import type { Student, Class as ClassType } from '../types'

export default function StudentProfile() {
  const { id } = useParams<{ id: string }>()
  const [student, setStudent] = useState<Student | null>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [classId, setClassId] = useState<string | null>(null)
  const [classes, setClasses] = useState<ClassType[]>([])
  const [saving, setSaving] = useState(false)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)

  useEffect(() => {
    if (!id) return
    setLoading(true)
    Promise.all([api.getStudent(id), api.getClasses()])
      .then(([s, cls]) => {
        setStudent(s)
        setClasses(cls || [])
        // prefill form
        setName(getStudentFullName(s))
        setEmail(s?.email ?? '')
        setClassId(getClassId(s) ?? null)
        // if student has avatar url
        if (s?.avatarUrl) setAvatarPreview(s.avatarUrl)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [id])

  const fileToBase64 = (file: File) => new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = reject
    reader.readAsDataURL(file)
  })

  const onSelectAvatar = (file?: File) => {
    if (!file) return
    setAvatarFile(file)
    const url = URL.createObjectURL(file)
    setAvatarPreview(url)
  }

  const save = async () => {
    if (!id) return
    if (!name.trim()) { alert('O nome é obrigatório'); return }
    try {
      setSaving(true)
      const payload: Partial<Student> = { name: name.trim(), email: email || undefined, classId: classId ?? undefined }
      if (avatarFile) {
        try {
          payload.avatarUrl = await fileToBase64(avatarFile)
        } catch (e) { console.error('Erro ao converter imagem', e) }
      }
      await api.updateStudent(id, payload)
      const refreshed = await api.getStudent(id)
      setStudent(refreshed)
      setEditing(false)
      setAvatarFile(null)
    } catch (e) { console.error(e); alert('Erro ao salvar') }
    finally { setSaving(false) }
  }

  if (loading) return <Loader />
  if (!student) return <div>Estudante não encontrado</div>

  const fullName = getStudentFullName(student)
  const cls = student.class ?? student.turma ?? (typeof student.classId === 'string' ? student.classId : undefined)

  return (
    <div>
      <h2>Perfil do Estudante</h2>
      {!editing ? (
        <>
          <p><strong>Nome:</strong> {fullName}</p>
          {student.email && <p><strong>E-mail:</strong> {student.email}</p>}
          {student.registeredAt && <p><strong>Registrado em:</strong> {new Date(student.registeredAt).toLocaleString()}</p>}
          {cls && <p><strong>Turma:</strong> {typeof cls === 'object' ? (cls.name ?? cls.title) : displayClass(cls)}</p>}
          <p>
            <button className="btn" onClick={() => setEditing(true)}>Editar perfil</button>
            &nbsp;
            <Link to="/students">← Voltar à lista</Link>
          </p>
        </>
      ) : (
        <div className="form-row">
          <input placeholder="Nome" value={name} onChange={e => setName(e.target.value)} />
          <input placeholder="E-mail" value={email} onChange={e => setEmail(e.target.value)} />
          <input type="file" accept="image/*" onChange={e => onSelectAvatar(e.target.files ? e.target.files[0] : undefined)} />
          <select value={classId ?? ''} onChange={e => setClassId(e.target.value || null)}>
            <option value="">-- Selecionar turma --</option>
            {classes.map(c => <option key={getObjId(c)} value={getObjId(c)}>{displayClass(c)}</option>)}
          </select>
          {avatarPreview && <img src={avatarPreview} alt="Preview" style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: '50%' }} />}
          <button className="btn" onClick={save} disabled={saving}>{saving ? 'Salvando...' : 'Salvar'}</button>
          <button onClick={() => setEditing(false)}>Cancelar</button>
        </div>
      )}
    </div>
  )
}
