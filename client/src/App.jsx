import { Routes, Route } from 'react-router-dom';
import Homepage from './pages/public/Homepage';
import LoginGateway from './pages/public/LoginGateway';
import PatientLogin from './pages/patient/PatientLogin';
import DoctorLogin from './pages/doctor/DoctorLogin';
import PatientDashboard from './pages/patient/PatientDashboard';
import DoctorDashboard from './pages/doctor/DoctorDashboard';
import NewConsultation from './pages/doctor/NewConsultation';
import NotFound from './pages/NotFound';
import ProtectedRoute from './components/ProtectedRoute';
import PatientLayout from './components/PatientLayout';
import DoctorLayout from './components/DoctorLayout';

function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Homepage />} />
      <Route path="/login" element={<LoginGateway />} />
      <Route path="/login/patient" element={<PatientLogin />} />
      <Route path="/login/doctor" element={<DoctorLogin />} />

      {/* Patient Routes */}
      <Route
        path="/patient/dashboard"
        element={
          <ProtectedRoute role="PATIENT">
            <PatientLayout>
              <PatientDashboard />
            </PatientLayout>
          </ProtectedRoute>
        }
      />

      {/* Doctor Routes */}
      <Route
        path="/doctor/dashboard"
        element={
          <ProtectedRoute role="DOCTOR">
            <DoctorLayout>
              <DoctorDashboard />
            </DoctorLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/doctor/consultation/new"
        element={
          <ProtectedRoute role="DOCTOR">
            <DoctorLayout>
              <NewConsultation />
            </DoctorLayout>
          </ProtectedRoute>
        }
      />
      
      {/* Not Found */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;