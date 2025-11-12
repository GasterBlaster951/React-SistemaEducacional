import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import api from '../api'
import Loader from '../components/Loader'
import type { Teacher } from '../types'

export default function TeacherProfile() {
  const { id } = useParams<{ id: string }>()
  const [teacher, setTeacher] = useState<Teacher | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    setLoading(true)
    api.getTeacher(id).then(t => setTeacher(t)).catch(console.error).finally(() => setLoading(false))
  }, [id])

  if (loading) return <Loader />
  if (!teacher) return <div>Professor não encontrado ou API não disponível</div>

  const fullName = teacher.name ?? `${teacher.firstName ?? ''} ${teacher.lastName ?? ''}`.trim()
  const avatarUrl = teacher.avatarUrl ?? null

  return (
    <div>
      <h2>Perfil do Professor</h2>
      {avatarUrl && <img src={avatarUrl} alt="Avatar" style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: '50%' }} />}
      <p><strong>Nome:</strong> {fullName}</p>
      {teacher.email && <p><strong>E-mail:</strong> {teacher.email}</p>}
      <p><Link to="/teachers">← Voltar</Link></p>
    </div>
  )
}
