import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import MovieDetail from "./pages/MovieDetail";
import Login from "./pages/auth/pages/Login";
import Signup from "./pages/auth/pages/Signup";
import ForgotPassword from "./pages/auth/pages/ForgotPassword";
import ResetPassword from "./pages/auth/pages/ResetPassword";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/profile/pages/Profile";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/movie/:id" element={<MovieDetail />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
    </Router>
  );
}
<link
  href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap"
  rel="stylesheet"
/>;

export default App;
