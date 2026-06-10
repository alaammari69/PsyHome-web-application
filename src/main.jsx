import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import LoginPage from './pages/LoginPage'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import PatientPage from './pages/PatientPage'
import AllPatientsPage from './pages/AllPatientsPage'
import SessionPage from './pages/SessionPage'
import ReferencePage from './pages/ReferencePage'
import ProfilePage from './pages/ProfilePage'
import SignupPage from './pages/SignupPage'
import CreateSessionPage from './pages/CreateSessionPage'
import AdminPage from './pages/AdminPage'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage/>}/>
        <Route path="/patients" element={<AllPatientsPage />} />
        <Route path="/patient/id/:patient_id" element={<PatientPage />} />
        <Route path="/sessions/:thread_id" element={<SessionPage />} />
        <Route path="/reference" element={<ReferencePage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/session/:patient_id" element={<CreateSessionPage />} />
        <Route path="/admin" element={<AdminPage/>}/>
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)