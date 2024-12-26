import { Routes, Route } from 'react-router-dom'
import EmailVerification from './pages/EmailVerification'
import EmployeeWizard from './pages/EmployeeWizard'
import ThankYou from './pages/ThankYou'

function App() {
  return (
    <Routes>
      <Route path="/" element={<EmailVerification />} />
      <Route path="/wizard" element={<EmployeeWizard />} />
      <Route path="/thank-you" element={<ThankYou />} />
    </Routes>
  )
}

export default App