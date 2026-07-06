import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/auth/pages/Login";
import Signup from "./pages/auth/pages/Signup";
import ForgotPassword from "./pages/auth/pages/ForgotPassword";
import ResetPassword from "./pages/auth/pages/ResetPassword";
import VerifyEmail from "./pages/auth/pages/VerifyEmail";
import Feed from "./pages/Feed";
import Community from "./pages/Community";
import GroupPage from "./pages/GroupPage";
import Dashboard from "./pages/Dashboard";
import Calendar from "./pages/Calendar";
import Settings from "./pages/Settings";
import Profile from "./pages/profile/pages/Profile";
import RequireAuth from "./pages/auth/pages/RequireAuth";
import GuestRoute from "./pages/auth/pages/GuestRoute";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<GuestRoute><Login /></GuestRoute>} />
        <Route path="/signup" element={<GuestRoute><Signup /></GuestRoute>} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/feed" element={<RequireAuth><Feed /></RequireAuth>} />
        <Route path="/community" element={<RequireAuth><Community /></RequireAuth>} />
        <Route path="/community/:slug" element={<RequireAuth><GroupPage /></RequireAuth>} />
        <Route path="/dashboard" element={<RequireAuth><Dashboard /></RequireAuth>} />
        <Route path="/calendar" element={<RequireAuth><Calendar /></RequireAuth>} />
        <Route path="/settings" element={<RequireAuth><Settings /></RequireAuth>} />
        <Route path="/profile" element={<RequireAuth><Profile /></RequireAuth>} />
        <Route path="/profile/:userId" element={<RequireAuth><Profile /></RequireAuth>} />
      </Routes>
    </Router>
  );
}

export default App;
