import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import LoginPage from './pages/LoginPage'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import PatientPage from './pages/PatientPage'
import AllPatientsPage from './pages/AllPatientsPage'
import SessionPage from './pages/SessionPage'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/patients" element={<AllPatientsPage />} />
        <Route path="/patient/id/:patient_id" element={<PatientPage />} />
        <Route path="/sessions/:thread_id" element={<SessionPage />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)