import React, { useState, useEffect } from 'react';
import './App.css';
import AuthForm from './components/AuthForm';
import Dashboard from './components/Dashboard';
import GameHistory from './components/GameHistory';
import Horoscope from './components/Horoscope';
import Lotto from './components/Lotto';
import Inventory from './components/Inventory';
import Terms from './components/Terms';
import { HashRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import { Box, CircularProgress, Typography } from '@mui/material';
import { getRoleFromJWT } from './utils/AuthUtils';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const userRole = getRoleFromJWT();
  if (!userRole || !allowedRoles.includes(userRole)) {
    return <Navigate to="/" replace />;
  }
  return children;
};

const MainComponent = () => {
  const [isLoading, setIsLoading] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => setIsLoading(false), 1000); 
    return () => clearTimeout(timer);
  }, [location]);

  if (isLoading) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
        }}
      >
        <Typography variant="h4" gutterBottom>
          Zipply Panamá
        </Typography>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Routes>
      <Route path="/" element={
        <div>
          <header className="App-header">
            <h1>Zipply Panama</h1>
            <AuthForm />
          </header>
        </div>
      } />
      <Route path="/dashboard" element={<ProtectedRoute allowedRoles={['admin']}><Dashboard /></ProtectedRoute>} />
      <Route path="/gamehistory" element={<ProtectedRoute allowedRoles={['admin']}><GameHistory /></ProtectedRoute>} />
      <Route path="/horoscope" element={<ProtectedRoute allowedRoles={['admin']}><Horoscope /></ProtectedRoute>} />
      <Route path="/lotto" element={<ProtectedRoute allowedRoles={['admin']}><Lotto /></ProtectedRoute>} />
      <Route path="/inventory" element={<ProtectedRoute allowedRoles={['visitante', 'admin']}><Inventory /></ProtectedRoute>} />
    </Routes>
  );
};

function App() {
  return (
    <div className="App">
      <Router>
        <Routes>
          <Route path="/terms" element={<Terms />} />
          <Route path="*" element={<MainComponent />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
