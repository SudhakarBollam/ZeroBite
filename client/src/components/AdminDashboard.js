import React, { useState, useEffect } from 'react';
import './AdminDashboard.css';

function AdminDashboard({ user, onLogout }) {
    const [pendingUsers, setPendingUsers] = useState([]);

    const fetchPendingUsers = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:5000/api/admin/pending-users', {
                headers: { 'x-auth-token': token }
            });
            const data = await response.json();
            setPendingUsers(data);
        } catch (error) {
            console.error("Failed to fetch pending users:", error);
        }
    };

    useEffect(() => {
        fetchPendingUsers();
    }, []);

    const handleApproval = async (userId, status) => {
        try {
            const token = localStorage.getItem('token');
            await fetch(`http://localhost:5000/api/admin/users/${userId}/status`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': token
                },
                body: JSON.stringify({ status })
            });
            alert(`User has been ${status}.`);
            fetchPendingUsers(); // Refresh the list
        } catch (error) {
            alert('Failed to update user status.');
        }
    };

    return (
        <div className="admin-dashboard-container">
            <header className="admin-dashboard-header">
                <div className="header-content">
                    <h1>Welcome, {user.name}!</h1>
                    <h2>Admin Dashboard</h2>
                </div>
                <button className="logout-btn" onClick={onLogout}>Logout</button>
            </header>
            <main>
                <h3>Pending User Verifications</h3>
                <div className="user-list">
                    {pendingUsers.length > 0 ? (
                        pendingUsers.map(pUser => (
                            <div key={pUser._id} className="user-card">
                                <div className="user-details">
                                    <h4>{pUser.role}: {pUser.businessName || pUser.charityName || pUser.contactPerson}</h4>
                                    <p><strong>Contact:</strong> {pUser.contactPerson} ({pUser.contactNumber})</p>
                                    <p><strong>Email:</strong> {pUser.email}</p>
                                    {pUser.address && <p><strong>Address:</strong> {pUser.address}</p>}
                                    {pUser.businessLicense && <p><strong>License #:</strong> {pUser.businessLicense}</p>}
                                    {pUser.ngoLicense && <p><strong>License #:</strong> {pUser.ngoLicense}</p>}
                                </div>
                                <div className="user-actions">
                                    <button className="approve-btn" onClick={() => handleApproval(pUser._id, 'Approved')}>Approve</button>
                                    <button className="reject-btn" onClick={() => handleApproval(pUser._id, 'Rejected')}>Reject</button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p>No users are currently pending approval.</p>
                    )}
                </div>
            </main>
        </div>
    );
}

export default AdminDashboard;