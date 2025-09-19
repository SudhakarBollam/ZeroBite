import React, { useState, useEffect } from 'react';
import HomePage from './components/HomePage';
import DonorDashboard from './components/DonorDashboard';
import CharityDashboard from './components/CharityDashboard';
import WorkerDashboard from './components/WorkerDashboard';
import AdminDashboard from './components/AdminDashboard';
import AuthPage from './components/AuthPage';
import Navbar from './components/Navbar';
import BackButton from './components/BackButton';
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

  const renderDashboard = () => {
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
  };

  return (
    <div className="App">
      {view === 'home' && (
        <>
          <Navbar user={user} onLogout={handleLogout} />
          <div style={{ marginTop: '80px' }}>
            <HomePage onNavigate={() => setView('auth')} />
          </div>
        </>
      )}
      {view === 'auth' && (
        <>
          <Navbar user={user} onLogout={handleLogout} />
          <div style={{ marginTop: '80px' }}>
            <BackButton onClick={() => setView('home')} text="← Back to Home" />
            <AuthPage onLogin={handleLogin} onBack={() => setView('home')} />
          </div>
        </>
      )}
      {view === 'dashboard' && user && renderDashboard()}
    </div>
  );
}

export default App;