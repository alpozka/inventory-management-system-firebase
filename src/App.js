import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import HomePage from './components/HomePage';
import PeoplePage from './components/PeoplePage';
import ProfilePage from './components/ProfilePage';
import ProductPage from './components/ProductPage';

function App() {
  return (
    <Router>
        <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/people" element={<PeoplePage />} />
            <Route path="/profile/:id" element={<ProfilePage />} />
            <Route path="/products" element={<ProductPage />} />
        </Routes>
  </Router>
  );
}

export default App;