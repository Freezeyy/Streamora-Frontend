import { Link } from 'react-router-dom';

function Navbar() {
  return (
    <nav className="bg-gray-800 p-4 shadow-lg sticky top-0 z-50">
      {/* Flex container to align items on the same line */}
      <div className="flex justify-between items-center">
        
        {/* Left-side element: STREAMORA */}
        <div className="text-white text-xl font-bold">
          STREAMORA
        </div>
        
        {/* Centered navigation links */}
        <ul className="flex list-none space-x-8 justify-center">
          <li>
            <Link to="/" className="text-white hover:text-yellow-400 transition-colors duration-300">Home</Link>
          </li>
          <li>
            <Link to="/login" className="text-white hover:text-yellow-400 transition-colors duration-300">Login</Link>
          </li>
          <li>
            <Link to="/signup" className="text-white hover:text-yellow-400 transition-colors duration-300">Signup</Link>
          </li>
        </ul>
      </div>
    </nav>
  );
}

export default Navbar;
