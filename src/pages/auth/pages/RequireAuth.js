import React, { useEffect, useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { isAuthenticated } from '../../../utils/auth';

const RequireAuth = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [authed, setAuthed] = useState(isAuthenticated);

  useEffect(() => {
    const verifySession = () => {
      const ok = isAuthenticated();
      setAuthed(ok);
      if (!ok) {
        navigate('/login', { replace: true, state: { from: location } });
      }
    };

    verifySession();

    const handlePageShow = (event) => {
      if (event.persisted || !isAuthenticated()) {
        verifySession();
      }
    };

    window.addEventListener('pageshow', handlePageShow);
    window.addEventListener('focus', verifySession);

    return () => {
      window.removeEventListener('pageshow', handlePageShow);
      window.removeEventListener('focus', verifySession);
    };
  }, [location.pathname, navigate, location]);

  if (!authed) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return children;
};

export default RequireAuth;
