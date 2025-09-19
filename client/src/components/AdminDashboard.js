import React, { useState, useEffect } from 'react';
import Navbar from './Navbar';
import BackButton from './BackButton';
import './AdminDashboard.css';

function AdminDashboard({ user, onLogout }) {
    const [pendingUsers, setPendingUsers] = useState([]);
    const [carousel, setCarousel] = useState([]);
    const [newImageUrl, setNewImageUrl] = useState('');
    const [newImageTitle, setNewImageTitle] = useState('');

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
        fetchCarousel();
    }, []);

    const fetchCarousel = async () => {
        try {
            const res = await fetch('http://localhost:5000/api/carousel');
            if (res.ok) {
                const data = await res.json();
                setCarousel(data);
            }
        } catch (e) {}
    };

    const addCarouselImage = async (e) => {
        e.preventDefault();
        if (!newImageUrl.trim()) return;
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('http://localhost:5000/api/carousel', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'x-auth-token': token },
                body: JSON.stringify({ url: newImageUrl.trim(), title: newImageTitle.trim() })
            });
            if (!res.ok) throw new Error('Failed to add');
            setNewImageUrl('');
            setNewImageTitle('');
            fetchCarousel();
        } catch (e) { alert('Failed to add image'); }
    };

    const removeCarouselImage = async (id) => {
        if (!window.confirm('Remove this image?')) return;
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`http://localhost:5000/api/carousel/${id}`, {
                method: 'DELETE',
                headers: { 'x-auth-token': token }
            });
            if (!res.ok) throw new Error('Failed to delete');
            fetchCarousel();
        } catch (e) { alert('Failed to delete image'); }
    };

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
        <>
            <Navbar user={user} onLogout={onLogout} />
            <div className="admin-dashboard-container">
                <BackButton onClick={() => window.history.back()} text="← Back" />
                <header className="dashboard-header">
                    <h1>Admin Dashboard</h1>
                    <p>Welcome, {user.name}! 👑</p>
                </header>
                <main>
                    <section className="donations-section">
                        <h3>Homepage Carousel Images</h3>
                        <form onSubmit={addCarouselImage} className="carousel-form">
                            <input type="url" placeholder="Image URL" value={newImageUrl} onChange={(e) => setNewImageUrl(e.target.value)} required />
                            <input type="text" placeholder="Title (optional)" value={newImageTitle} onChange={(e) => setNewImageTitle(e.target.value)} />
                            <button type="submit" className="approve-btn">Add Image</button>
                        </form>
                        <div className="carousel-admin-grid">
                            {carousel.map(img => (
                                <div key={img._id} className="carousel-admin-card">
                                    <img src={img.url} alt={img.title || 'Carousel'} />
                                    <div className="carousel-admin-meta">
                                        <span>{img.title || 'Untitled'}</span>
                                        <button className="reject-btn" onClick={() => removeCarouselImage(img._id)}>Remove</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                    <section className="donations-section">
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
                    </section>
                </main>
            </div>
        </>
    );
}

export default AdminDashboard;