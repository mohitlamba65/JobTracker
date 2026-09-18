import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from './layout/DashboardLayout';
import Applications from './pages/Applications';
import Opportunities from './pages/Opportunities';
import Contacts from './pages/Contacts';
import CandidateProfile from './pages/CandidateProfile';
import RoleProfiles from './pages/RoleProfiles';
import ResumeStudio from './pages/ResumeStudio';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<DashboardLayout />}>
          <Route index element={<Navigate to="/applications" replace />} />
          <Route path="opportunities" element={<Opportunities />} />
          <Route path="applications" element={<Applications />} />
          <Route path="contacts" element={<Contacts />} />
          <Route path="profile" element={<CandidateProfile />} />
          <Route path="roles" element={<RoleProfiles />} />
          <Route path="resume" element={<ResumeStudio />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
