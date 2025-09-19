import React, { useState, useEffect } from 'react';
import HomePage from './components/HomePage';
import DonorDashboard from './components/DonorDashboard';
import CharityDashboard from './components/CharityDashboard';
import WorkerDashboard from './components/WorkerDashboard';
import AdminDashboard from './components/AdminDashboard';
import AuthPage from './components/AuthPage';
import './App.css'; 

function App() {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [view, setView] = useState('home'); 

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
      setView('dashboard');
    }
  }, []);

  const handleLogin = (newToken, userData) => {
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(userData));
    setToken(newToken);
    setUser(userData);
    setView('dashboard');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    setView('home');
  };

  const renderView = () => {
    if (view === 'home') {
      return <HomePage onNavigate={() => setView('auth')} />;
    }
    if (view === 'auth') {
      return <AuthPage onLogin={handleLogin} />;
    }
    if (view === 'dashboard' && user) {
      switch (user.role) {
        case 'Donor':
          return <DonorDashboard user={user} onLogout={handleLogout} />;
        case 'Charity':
          return <CharityDashboard user={user} onLogout={handleLogout} />;
        case 'Worker':
          return <WorkerDashboard user={user} onLogout={handleLogout} />;
        case 'Admin':
          return <AdminDashboard user={user} onLogout={handleLogout} />;
        default:
          setView('home');
          return null;
      }
    }
    return <HomePage onNavigate={() => setView('auth')} />;
  };

  return (
    <div className="App">
      {renderView()}
    </div>
  );
}

export default App;