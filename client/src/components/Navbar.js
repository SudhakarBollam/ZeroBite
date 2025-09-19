import React from 'react';
import './Navbar.css';

function Navbar({ user, onLogout }) {
    return (
        <nav className="app-navbar">
            <div className="nav-logo">ZeroBite</div>
            <div className="nav-user-info">
                {user ? (
                    <>
                        <span>{user.name} ({user.role})</span>
                        <button className="logout-btn-nav" onClick={onLogout}>Logout</button>
                    </>
                ) : (
                    <span>Welcome to ZeroBite</span>
                )}
            </div>
        </nav>
    );
}

export default Navbar;