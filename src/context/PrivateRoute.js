import { Outlet, useLocation, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PrivateRoute = () => {
  const { currentUser } = useAuth();
  const location = useLocation();

  return currentUser ? <Outlet /> : <Navigate to="/" state={{ from: location }} />;
};

export default PrivateRoute;
