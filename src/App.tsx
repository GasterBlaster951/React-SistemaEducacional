import './App.css'
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import Nav from './components/Nav'
import Courses from './pages/Courses'
import Classes from './pages/Classes'
import Students from './pages/Students'
import Grades from './pages/Grades'

export default function App() {
  return (
    <BrowserRouter>
      <div id="root">
        <Nav />
        <main>
          <Routes>
            <Route path="/" element={<div><h1>Sistema Educacional</h1><p>Use o menu para navegar.</p></div>} />
            <Route path="/courses" element={<Courses />} />
            <Route path="/classes" element={<Classes />} />
            <Route path="/students" element={<Students />} />
            <Route path="/grades" element={<Grades />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}
