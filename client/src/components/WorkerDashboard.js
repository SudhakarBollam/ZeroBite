import React, { useState, useEffect } from 'react';
import Navbar from './Navbar';
import BackButton from './BackButton';
import './WorkerDashboard.css';

function WorkerDashboard({ user, onLogout }) {
    const [tasks, setTasks] = useState([]);
    const [workerStats, setWorkerStats] = useState({});
    const [deliveryProgress, setDeliveryProgress] = useState({});

    const fetchTasks = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:5000/api/donations/claimed', {
                headers: { 'x-auth-token': token }
            });
            const data = await response.json();
            setTasks(data);
            
            // Calculate stats for charts
            const stats = {
                totalTasks: data.length,
                completedTasks: data.filter(t => t.status === 'Delivered').length,
                activeTasks: data.filter(t => t.status !== 'Delivered').length,
                totalMeals: data.reduce((sum, t) => sum + (t.quantity || 0), 0),
                monthlyData: getMonthlyData(data),
                statusData: getStatusData(data)
            };
            setWorkerStats(stats);
        } catch (error) {
            console.error("Failed to fetch tasks:", error);
        }
    };

    const getMonthlyData = (tasks) => {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const monthlyCounts = new Array(12).fill(0);
        
        tasks.forEach(task => {
            const date = new Date(task.createdAt);
            const month = date.getMonth();
            monthlyCounts[month]++;
        });
        
        return months.map((month, index) => ({
            month,
            count: monthlyCounts[index]
        }));
    };

    const getStatusData = (tasks) => {
        const statusCounts = {};
        tasks.forEach(task => {
            statusCounts[task.status] = (statusCounts[task.status] || 0) + 1;
        });
        
        return Object.entries(statusCounts).map(([status, count]) => ({
            status,
            count
        }));
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
            fetchTasks();
        } catch (error) {
            alert("Error updating status.");
        }
    };

    const updateDeliveryProgress = (taskId, progress) => {
        setDeliveryProgress(prev => ({
            ...prev,
            [taskId]: progress
        }));
    };

    const getDeliveryStatus = (task) => {
        if (task.status === 'Delivered') return { status: 'Delivered', message: 'Successfully delivered!', color: '#2ecc71' };
        if (task.status === 'In Transit') return { status: 'In Transit', message: 'On the way to charity', color: '#f39c12' };
        if (task.status === 'Claimed') return { status: 'Ready for Pickup', message: 'Ready to start delivery', color: '#3498db' };
        return { status: 'Pending', message: 'Waiting for pickup', color: '#95a5a6' };
    };

    // Chart data
    const monthlyChartData = {
        labels: workerStats.monthlyData?.map(item => item.month) || [],
        datasets: [{
            label: 'Tasks per Month',
            data: workerStats.monthlyData?.map(item => item.count) || [],
            backgroundColor: 'rgba(155, 89, 182, 0.6)',
            borderColor: '#9b59b6',
            borderWidth: 2,
            tension: 0.4
        }]
    };

    const statusChartData = {
        labels: workerStats.statusData?.map(item => item.status) || [],
        datasets: [{
            label: 'Tasks by Status',
            data: workerStats.statusData?.map(item => item.count) || [],
            backgroundColor: [
                '#f39c12', // Claimed - Orange
                '#e74c3c', // In Transit - Red
                '#2ecc71', // Delivered - Green
            ],
            borderColor: '#ffffff',
            borderWidth: 2
        }]
    };

    const getMotivationalTag = () => {
        const totalMeals = workerStats.totalMeals || 0;
        if (totalMeals >= 300) return "🌟 Delivery Champion";
        if (totalMeals >= 150) return "💝 Service Hero";
        if (totalMeals >= 75) return "🤝 Dedicated Helper";
        if (totalMeals >= 25) return "🌱 Building Impact";
        return "🚀 Getting Started";
    };

    return (
        <>
            <Navbar user={user} onLogout={onLogout} />
            <div className="worker-dashboard-container">
                <BackButton onClick={() => window.history.back()} text="← Back" />
                <header className="dashboard-header">
                    <h1>Worker Dashboard</h1>
                    <p>Welcome, {user.name}! {getMotivationalTag()}</p>
                </header>
                
                {/* Stats Cards */}
                <div className="stats-cards">
                    <div className="stat-card">
                        <h3>{workerStats.totalTasks || 0}</h3>
                        <p>Total Tasks</p>
                    </div>
                    <div className="stat-card">
                        <h3>{workerStats.completedTasks || 0}</h3>
                        <p>Completed</p>
                    </div>
                    <div className="stat-card">
                        <h3>{workerStats.totalMeals || 0}</h3>
                        <p>Meals Delivered</p>
                    </div>
                    <div className="stat-card">
                        <h3>{workerStats.activeTasks || 0}</h3>
                        <p>Active</p>
                    </div>
                </div>

                {/* Charts Section - Temporarily disabled */}
                <section className="charts-section">
                    <h3>Your Performance Analytics</h3>
                    <div className="charts-container">
                        <div className="chart-card">
                            <h4>Monthly Task Trend</h4>
                            <p>Chart will be displayed here</p>
                        </div>
                        <div className="chart-card">
                            <h4>Task Status Overview</h4>
                            <p>Chart will be displayed here</p>
                        </div>
                    </div>
                </section>

                <main>
                    <section className="donations-section">
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
                                            <p><strong>Address:</strong> {task.pickupLocation}</p>
                                            <p><strong>Contact:</strong> {task.contactNumber}</p>
                                            {task.cookingTime && <p><strong>Cooked:</strong> {task.cookingTime} hours ago</p>}
                                            {task.specialInstructions && <p><strong>Instructions:</strong> {task.specialInstructions}</p>}
                                        </div>
                                        <hr />
                                        <div className="task-details">
                                            <h5>Deliver to: {task.charityName}</h5>
                                            <p><strong>Address:</strong> {task.charityAddress}</p>
                                            {task.purpose && <p><strong>Purpose:</strong> {task.purpose}</p>}
                                        </div>
                                        <div className="task-status">
                                            <p>Current Status: <strong style={{color: getDeliveryStatus(task).color}}>{getDeliveryStatus(task).status}</strong></p>
                                            <p className="delivery-message">{getDeliveryStatus(task).message}</p>
                                        </div>
                                        
                                        {/* Delivery Progress Bar */}
                                        <div className="delivery-progress">
                                            <div className="progress-bar">
                                                <div 
                                                    className="progress-fill" 
                                                    style={{ 
                                                        width: task.status === 'Delivered' ? '100%' : 
                                                               task.status === 'In Transit' ? '60%' : 
                                                               task.status === 'Claimed' ? '30%' : '0%',
                                                        backgroundColor: getDeliveryStatus(task).color
                                                    }}
                                                ></div>
                                            </div>
                                            <div className="progress-steps">
                                                <span className={task.status === 'Claimed' || task.status === 'In Transit' || task.status === 'Delivered' ? 'completed' : ''}>Picked Up</span>
                                                <span className={task.status === 'In Transit' || task.status === 'Delivered' ? 'completed' : ''}>In Transit</span>
                                                <span className={task.status === 'Delivered' ? 'completed' : ''}>Delivered</span>
                                            </div>
                                        </div>

                                        <div className="task-actions">
                                            {task.status === 'Claimed' && (
                                                <button className="action-btn pickup-btn" onClick={() => handleStatusUpdate(task._id, 'In Transit')}>
                                                    🚚 Start Delivery
                                                </button>
                                            )}
                                            {task.status === 'In Transit' && (
                                                <button className="action-btn deliver-btn" onClick={() => handleStatusUpdate(task._id, 'Delivered')}>
                                                    ✅ Mark as Delivered
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p>No assigned tasks at the moment.</p>
                            )}
                        </div>
                    </section>
                </main>
            </div>
        </>
    );
}

export default WorkerDashboard;