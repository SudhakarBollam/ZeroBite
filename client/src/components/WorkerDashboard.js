import React, { useState, useEffect } from 'react';
import './WorkerDashboard.css';

function WorkerDashboard({ user, onLogout }) {
    const [tasks, setTasks] = useState([]);

    const fetchTasks = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:5000/api/donations/claimed', {
                headers: { 'x-auth-token': token }
            });
            const data = await response.json();
            setTasks(data);
        } catch (error) {
            console.error("Failed to fetch tasks:", error);
        }
    };

    useEffect(() => {
        fetchTasks();
    }, []);

    const handleStatusUpdate = async (donationId, newStatus) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:5000/api/donations/${donationId}/status`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': token
                },
                body: JSON.stringify({ status: newStatus })
            });
            if (!response.ok) throw new Error('Failed to update status');
            alert(`Donation marked as ${newStatus}!`);
            fetchTasks(); // Refresh list
        } catch (error) {
            console.error("Error updating status:", error);
            alert("Error updating status.");
        }
    };

    return (
        <div className="worker-dashboard-container">
            <header className="worker-dashboard-header">
                <div className="header-content">
                    <h1>Welcome, {user.name}!</h1>
                    <h2>Worker Dashboard</h2>
                </div>
                <button className="logout-btn" onClick={onLogout}>Logout</button>
            </header>
            <main>
                <h3>Assigned Pickups</h3>
                <div className="task-list">
                    {tasks.length > 0 ? (
                        tasks.map(task => (
                            <div key={task._id} className="task-card">
                                <div className="task-food-details">
                                    <h4>{task.foodDescription}</h4>
                                    <p>{task.quantity} portions, serves ~{task.serves}</p>
                                </div>
                                <hr />
                                <div className="task-details">
                                    <h5>Pickup From: {task.donorName}</h5>
                                    <p><strong>Address:</strong> {task.donorAddress}</p>
                                    <p><strong>Contact:</strong> {task.donorContact}</p>
                                </div>
                                <hr />
                                <div className="task-details">
                                    <h5>Deliver to: {task.charityName}</h5>
                                    <p><strong>Address:</strong> {task.charityAddress}</p>
                                </div>
                                <div className="task-status">
                                    <p>Current Status: <strong>{task.status}</strong></p>
                                </div>
                                <div className="task-actions">
                                    {task.status === 'Claimed' && (
                                        <button onClick={() => handleStatusUpdate(task._id, 'In Transit')}>
                                            Mark as Picked Up
                                        </button>
                                    )}
                                    {task.status === 'In Transit' && (
                                        <button onClick={() => handleStatusUpdate(task._id, 'Delivered')}>
                                            Mark as Delivered
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))
                    ) : (
                        <p>No assigned tasks at the moment.</p>
                    )}
                </div>
            </main>
        </div>
    );
}

export default WorkerDashboard;