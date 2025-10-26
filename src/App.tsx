import React from 'react'
import { Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import Landing from './pages/landing'
import Auth from './pages/Auth'
import Dashboard from './pages/Dashboard'
import Step1 from './pages/Step1';
import Step2 from './pages/Step2';
import Step3 from './pages/Step3';
import Record from './pages/Record';
import FinalResult from './pages/FinalResult';


function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/step1" element={<Step1 />} />
        <Route path="/step2" element={<Step2 />} />
        <Route path="/step3" element={<Step3 />} />
        <Route path="/record" element={<Record />} />
         <Route path="/record/:id" element={<Record />} /> 
        <Route path="/final-result/:castId?" element={<FinalResult />} />
        
      </Routes>
    </AuthProvider>
  )
}

export default App