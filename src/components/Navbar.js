// src/components/Navbar.js
import { Link } from 'react-router-dom';

function Navbar() {
  return (
    <nav>
      <ul className="flex list-none p-0 space-x-4">
        <li><Link to="/">Home</Link></li>
        <li><Link to="/login">Login</Link></li>
        <li><Link to="/signup">Signup</Link></li>
      </ul>
    </nav>
  );
}

export default Navbar;
