import './App.css'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Nav from './components/Nav'
import Courses from './pages/Courses'
import Classes from './pages/Classes'
import Students from './pages/Students'
import Grades from './pages/Grades'
import StudentProfile from './pages/StudentProfile'
import TeacherProfile from './pages/TeacherProfile'
import Dashboard from './pages/Dashboard'
import Teachers from './pages/Teachers'

export default function App() {
  return (
    <BrowserRouter>
      <div id="root" className="app">
        <Nav />
        <main className="main">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/courses" element={<Courses />} />
            <Route path="/classes" element={<Classes />} />
            <Route path="/students" element={<Students />} />
            <Route path="/students/:id" element={<StudentProfile />} />
            <Route path="/teachers" element={<Teachers />} />
            <Route path="/teachers/:id" element={<TeacherProfile />} />
            <Route path="/grades" element={<Grades />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}
