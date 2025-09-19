import React, { useState, useEffect } from 'react';
import DonationForm from './DonationForm';
import Navbar from './Navbar';
import BackButton from './BackButton';
import './DonorDashboard.css';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, PointElement, LineElement } from 'chart.js';
import { Pie, Bar, Line } from 'react-chartjs-2';
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, PointElement, LineElement);

function DonorDashboard({ user, onLogout }) {
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [donations, setDonations] = useState([]);
  const [editingDonation, setEditingDonation] = useState(null);
  const [donationStats, setDonationStats] = useState({});
  const isApproved = user?.status === 'Approved';

  const fetchDonations = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/donations/donor', {
          headers: { 'x-auth-token': token }
      });
      const data = await response.json();
      setDonations(data);
      
      // Calculate stats for charts
      const stats = {
        totalDonations: data.length,
        deliveredDonations: data.filter(d => d.status === 'Delivered').length,
        activeDonations: data.filter(d => d.status !== 'Delivered').length,
        totalMeals: data.reduce((sum, d) => sum + (d.quantity || 0), 0),
        monthlyData: getMonthlyData(data),
        statusData: getStatusData(data)
      };
      setDonationStats(stats);
    } catch (error) {
      console.error("Failed to fetch donations:", error);
    }
  };

  const getMonthlyData = (donations) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyCounts = new Array(12).fill(0);
    
    donations.forEach(donation => {
      const date = new Date(donation.createdAt);
      const month = date.getMonth();
      monthlyCounts[month]++;
    });
    
    return months.map((month, index) => ({
      month,
      count: monthlyCounts[index]
    }));
  };

  const getStatusData = (donations) => {
    const statusCounts = {};
    donations.forEach(donation => {
      statusCounts[donation.status] = (statusCounts[donation.status] || 0) + 1;
    });
    
    return Object.entries(statusCounts).map(([status, count]) => ({
      status,
      count
    }));
  };

  useEffect(() => {
    if(isApproved) {
        fetchDonations();
    }
  }, [isApproved]);

  const handleFormSubmit = async (formData) => {
    const isEditing = !!editingDonation;
    const endpoint = isEditing ? `http://localhost:5000/api/donations/${editingDonation._id}` : 'http://localhost:5000/api/donations';
    const method = isEditing ? 'PUT' : 'POST';

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(endpoint, {
        method: method,
        headers: { 
            'Content-Type': 'application/json',
            'x-auth-token': token 
        },
        body: JSON.stringify(formData),
      });
      if (!response.ok) throw new Error('Network response was not ok');
      
      alert(`Donation ${isEditing ? 'updated' : 'created'} successfully!`);
      fetchDonations();
    } catch (error) {
      alert(`Failed to ${isEditing ? 'update' : 'create'} donation. Please try again.`);
    }
    setIsFormVisible(false);
    setEditingDonation(null);
  };

  const handleEdit = (donation) => {
    setEditingDonation(donation);
    setIsFormVisible(true);
  };

  const handleDelete = async (donationId) => {
    if (window.confirm("Are you sure you want to delete this donation?")) {
        try {
            const token = localStorage.getItem('token');
            await fetch(`http://localhost:5000/api/donations/${donationId}`, {
                method: 'DELETE',
                headers: { 'x-auth-token': token }
            });
            alert('Donation deleted successfully!');
            fetchDonations();
        } catch (error) {
            alert('Failed to delete donation.');
        }
    }
  };

  const activeDonations = donations.filter(d => d.status !== 'Delivered');
  const pastDonations = donations.filter(d => d.status === 'Delivered');

  // Chart data
  const monthlyChartData = {
    labels: donationStats.monthlyData?.map(item => item.month) || [],
    datasets: [{
      label: 'Donations per Month',
      data: donationStats.monthlyData?.map(item => item.count) || [],
      backgroundColor: 'rgba(46, 204, 113, 0.6)',
      borderColor: '#2ecc71',
      borderWidth: 2,
      tension: 0.4
    }]
  };

  const statusChartData = {
    labels: donationStats.statusData?.map(item => item.status) || [],
    datasets: [{
      label: 'Donations by Status',
      data: donationStats.statusData?.map(item => item.count) || [],
      backgroundColor: [
        '#2ecc71', // Available - Green
        '#f39c12', // Claimed - Orange
        '#e74c3c', // In Transit - Red
        '#3498db', // Delivered - Blue
      ],
      borderColor: '#ffffff',
      borderWidth: 2
    }]
  };

  const getMotivationalTag = () => {
    const totalMeals = donationStats.totalMeals || 0;
    if (totalMeals >= 100) return "🌟 Community Hero";
    if (totalMeals >= 50) return "💝 Generous Giver";
    if (totalMeals >= 20) return "🤝 Kind Helper";
    if (totalMeals >= 5) return "🌱 Growing Impact";
    return "🚀 Getting Started";
  };

  return (
    <>
      <Navbar user={user} onLogout={onLogout} />
      <div className="dashboard-container">
        <BackButton onClick={() => window.history.back()} text="← Back" />
        {isFormVisible && (
          <DonationForm 
            onClose={() => { setIsFormVisible(false); setEditingDonation(null); }}
            onSubmit={handleFormSubmit}
            existingDonation={editingDonation}
          />
        )}
        <header className="dashboard-header">
          <h1>Donor Dashboard</h1>
          <p>Welcome, {user.name}! {getMotivationalTag()}</p>
        </header>
        
        {/* Stats Cards */}
        <div className="stats-cards">
          <div className="stat-card">
            <h3>{donationStats.totalDonations || 0}</h3>
            <p>Total Donations</p>
          </div>
          <div className="stat-card">
            <h3>{donationStats.deliveredDonations || 0}</h3>
            <p>Delivered</p>
          </div>
          <div className="stat-card">
            <h3>{donationStats.totalMeals || 0}</h3>
            <p>Meals Served</p>
          </div>
          <div className="stat-card">
            <h3>{donationStats.activeDonations || 0}</h3>
            <p>Active</p>
          </div>
        </div>

        {/* Charts Section */}
        <section className="charts-section">
          <h3>Your Impact Analytics</h3>
          <div className="charts-container">
            <div className="chart-card">
              <h4>Monthly Donation Trend</h4>
              <Bar data={monthlyChartData} options={{ responsive: true, plugins: { legend: { display: false }}}} />
            </div>
            <div className="chart-card">
              <h4>Donation Status Overview</h4>
              <Pie data={statusChartData} options={{ responsive: true, plugins: { legend: { position: 'bottom' }}}} />
            </div>
          </div>
        </section>

        <main className="dashboard-main">
          {isApproved ? (
              <div className="dashboard-actions">
                  <button className="create-donation-btn" onClick={() => setIsFormVisible(true)}>
                      + Create New Donation
                  </button>
              </div>
          ) : (
              <div className="approval-notice">Your account is pending approval. You will be able to create donations once an admin has verified your account.</div>
          )}
          <section className="donations-section">
            <h3>Active Donations</h3>
            <div className="donations-list">
              {activeDonations.length > 0 ? (
                activeDonations.map(donation => (
                  <div key={donation._id} className={`donation-card status-${donation.status.toLowerCase().replace(' ', '-')}`}>
                    <div className="donation-card-info">
                      <p className="donation-food">{`${donation.foodDescription} (${donation.quantity} portions)`}</p>
                      <p className={`donation-status status-${donation.status.toLowerCase().replace(' ', '-')}`}>{donation.status}</p>
                    </div>
                    {donation.status === 'Available' && isApproved && (
                      <div className="donation-card-actions">
                          <button className="edit-btn" onClick={() => handleEdit(donation)}>Edit</button>
                          <button className="delete-btn" onClick={() => handleDelete(donation._id)}>Delete</button>
                      </div>
                    )}
                  </div>
                ))
              ) : ( <p>No active donations.</p> )}
            </div>
          </section>
          <section className="donations-section">
            <h3>Donation History</h3>
            <div className="donations-list">
              {pastDonations.map(donation => (
                <div key={donation._id} className="donation-card status-delivered">
                   <div className="donation-card-info">
                      <p className="donation-food">{`${donation.foodDescription} (${donation.quantity} portions)`}</p>
                      <p className="donation-status status-delivered">{donation.status}</p>
                   </div>
                </div>
              ))}
            </div>
          </section>
        </main>
      </div>
    </>
  );
}
export default DonorDashboard;