import { NavLink } from 'react-router-dom';

// Barra de navegación
function Navbar() {
  return (
    <nav className="bottom-nav">
      <NavLink to="/inicio" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
        Inicio
      </NavLink>
      <NavLink to="/donar" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
        Donar
      </NavLink>
      <NavLink to="/mis-donaciones" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
        Mis donaciones
      </NavLink>
      <NavLink to="/perfil" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
        Perfil
      </NavLink>
    </nav>
  );
}

export default Navbar;