import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from './DashboardLayout';
import WeeklyBoard from './WeeklyBoard';
import EmployeePublicView from './EmployeePublicView';
import EmployeesView from './EmployeesView';
import DashboardView from './DashboardView';
import LoginView from './LoginView';
import SettingsView from './SettingsView';
import EmployeePortal from './EmployeePortal'; // <-- Tu nuevo portal importado

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginView />} />

        {/* --- RUTAS PRIVADAS (Área de Administración) --- */}
        <Route path="/" element={<PrivateRoute><DashboardLayout /></PrivateRoute>}>
          <Route index element={<DashboardView />} />
          <Route path="calendar" element={<WeeklyBoard />} />
          <Route path="employees" element={<EmployeesView />} />
          <Route path="settings" element={<SettingsView />} />
        </Route>

        {/* --- RUTAS PÚBLICAS (Enlaces Mágicos para Empleados) --- */}
        <Route path="/s/:employeeId" element={<EmployeePublicView />} />
        
        {/* <-- ¡Aquí habilitamos el Portal Interactivo del empleado! */}
        <Route path="/empleado/:id" element={<EmployeePortal />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;