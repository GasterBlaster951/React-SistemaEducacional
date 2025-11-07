import { Link } from 'react-router-dom'
import { FaHome, FaBook, FaUsers, FaChalkboardTeacher } from 'react-icons/fa'

export default function Nav() {
  return (
    <nav style={{ padding: 10, borderBottom: '1px solid rgba(15,23,42,0.06)', marginBottom: 16 }}>
      <Link to="/" style={{ marginRight: 12 }} className="icon"><FaHome className="icon-sm" /> Home</Link>
      <Link to="/courses" style={{ marginRight: 12 }} className="icon"><FaBook className="icon-sm" /> Cursos</Link>
      <Link to="/classes" style={{ marginRight: 12 }} className="icon"><FaChalkboardTeacher className="icon-sm" /> Turmas</Link>
      <Link to="/students" style={{ marginRight: 12 }} className="icon"><FaUsers className="icon-sm" /> Estudantes</Link>
      <Link to="/grades" className="icon">Notas</Link>
    </nav>
  )
}
