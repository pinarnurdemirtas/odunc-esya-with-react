import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Home from './components/Home';

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/components/login" />} />
      <Route path="/components/login" element={<Login />} />
      <Route path="/components/home" element={<Home />} />
    </Routes>
  );
};

export default App;
