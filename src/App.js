import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import HomePage from './components/HomePage';
import PeoplePage from './components/PeoplePage';
import ProfilePage from './components/ProfilePage';
import ProductPage from './components/ProductPage';
import ProductProfile from './components/ProductProfile';
import LoginPage from './components/LoginPage';
import { AuthContextProvider } from './context/AuthContext';
import ResetPassword from './components/ResetPassword';
import PrivateRoute from './context/PrivateRoute';

function App() {
  return (
    <AuthContextProvider>
      <Router>
          <Routes>
              <Route path="/" element={<LoginPage />} />
              <Route path="/home" element={<PrivateRoute />} >
                  <Route index element={<HomePage />} />
              </Route>
              <Route path="/people" element={<PrivateRoute />} >
                  <Route index element={<PeoplePage />} />
              </Route>
              <Route path="/profile/:id" element={<PrivateRoute />} >
                  <Route index element={<ProfilePage />} />
              </Route>
              <Route path="/products" element={<PrivateRoute />} >
                  <Route index element={<ProductPage />} />
              </Route>
              <Route path="/ProductProfile/:id" element={<PrivateRoute />} >
                  <Route index element={<ProductProfile />} />
              </Route>
              <Route path="/reset-password" element={<ResetPassword />} />
          </Routes>
      </Router>
    </AuthContextProvider>
  );
}

export default App;
