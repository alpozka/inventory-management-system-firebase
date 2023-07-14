import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './components/HomePage';
import PeoplePage from './components/PeoplePage';
import ProfilePage from './components/ProfilePage';
import ProductPage from './components/ProductPage';
import ProductProfile from './components/ProductProfile';
import LoginPage from './components/LoginPage';
import { AuthContextProvider, useAuth } from './context/AuthContext';
import ResetPassword from './components/ResetPassword';
// import PrivateRoute from './context/PrivateRoute';

function RequireAuth({ children }) {
    const { currentUser } = useAuth();
    return currentUser ? children : <Navigate to="/login" />;
}

function App() {
    return (
        <AuthContextProvider>
            <BrowserRouter>
                <Routes>
                <Route path="/login" element={<LoginPage />} />
                    <Route path="/" element={<RequireAuth><HomePage /></RequireAuth>} />
                    <Route path="/people" element={<RequireAuth><PeoplePage /></RequireAuth>} />
                    <Route path="/profile/:id" element={<RequireAuth><ProfilePage /></RequireAuth>} />
                    <Route path="/products" element={<RequireAuth><ProductPage /></RequireAuth>} />
                    <Route path="/productprofile/:id" element={<RequireAuth><ProductProfile /></RequireAuth>} />
                    <Route path="/reset-password" element={<ResetPassword />} />
                </Routes>
            </BrowserRouter>
        </AuthContextProvider>
    );
}

export default App;
