import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import CreateDonation from './pages/CreateDonation';
import MyDonations from './pages/MyDonations';
import Profile from './pages/Profile';
import RequestDetail from './pages/RequestDetail';
import Chat from './pages/Chat';
import AdminPanel from './pages/AdminPanel';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/registro" element={<Register />} />
        <Route path="/inicio" element={<Home />} />
        <Route path="/donar" element={<CreateDonation />} />
        <Route path="/mis-donaciones" element={<MyDonations />} />
        <Route path="/perfil" element={<Profile />} />
        <Route path="/donacion/:id" element={<RequestDetail />} />
        <Route path="/chat/:id_solicitud" element={<Chat />} />
        {/* Ruta del Panel de Administración (Figura 5) */}
        <Route path="/admin" element={<AdminPanel />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;