import { useNavigate } from 'react-router-dom';
import { clearAuthSession } from '../../utils/auth';

const useLogout = () => {
  const navigate = useNavigate();

  const logout = () => {
    clearAuthSession();
    navigate('/login', { replace: true });
  };

  return { logout };
};

export default useLogout;
