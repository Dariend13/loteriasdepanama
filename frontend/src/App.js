import React, { useState, useEffect } from 'react';
import './App.css';
import AuthForm from './components/AuthForm';
import Dashboard from './components/Dashboard';
import GameHistory from './components/GameHistory';
import Horoscope from './components/Horoscope';
import Lotto from './components/Lotto';
import { HashRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import { Box, CircularProgress, Typography } from '@mui/material';

const MainComponent = () => {
  const [isLoading, setIsLoading] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => setIsLoading(false), 1000); 
    return () => clearTimeout(timer);  // limpieza en desmontar
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
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/gamehistory" element={<GameHistory />} />
      <Route path="/horoscope" element={<Horoscope />} />
      <Route path='/lotto' element={<Lotto />}/>
    </Routes>
  );
}

function App() {
  return (
    <div className="App">
      <Router>
        <MainComponent />
      </Router>
    </div>
  );
}

export default App;
