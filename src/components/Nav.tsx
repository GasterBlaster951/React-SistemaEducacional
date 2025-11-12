import { Link } from 'react-router-dom'
import { FaHome, FaBook, FaUsers, FaChalkboardTeacher } from 'react-icons/fa'

export default function Nav() {
  return (
    <nav className="nav">
      <Link to="/" className="nav-link"><FaHome className="nav-icon" /> Dashboard</Link>
      <Link to="/courses" className="nav-link"><FaBook className="nav-icon" /> Cursos</Link>
      <Link to="/classes" className="nav-link"><FaChalkboardTeacher className="nav-icon" /> Turmas</Link>
      <Link to="/students" className="nav-link"><FaUsers className="nav-icon" /> Estudantes</Link>
      <Link to="/teachers" className="nav-link"><FaChalkboardTeacher className="nav-icon" /> Professores</Link>
      <Link to="/grades" className="nav-link">Notas</Link>
    </nav>
  )
}