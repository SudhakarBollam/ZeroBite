import React, { useState, useEffect } from 'react';
import Navbar from './Navbar';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, PointElement, LineElement } from 'chart.js';
import { Pie, Bar, Line } from 'react-chartjs-2';
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, PointElement, LineElement);
import BackButton from './BackButton';
import './CharityDashboard.css';

function CharityDashboard({ user, onLogout }) {
  const [availableDonations, setAvailableDonations] = useState([]);
  const [myPickups, setMyPickups] = useState([]);
  const [charityStats, setCharityStats] = useState({});
  const [selectedDonation, setSelectedDonation] = useState(null);
  const [purpose, setPurpose] = useState('');
  const [etaMap, setEtaMap] = useState({});
  const isApproved = user?.status === 'Approved';

  const fetchDonations = async () => {
    try {
      const token = localStorage.getItem('token');
      const availableRes = await fetch('http://localhost:5000/api/donations/available', { headers: { 'x-auth-token': token } });
      const availableData = await availableRes.json();
      setAvailableDonations(availableData);

      const myPickupsRes = await fetch('http://localhost:5000/api/donations/charity', { headers: { 'x-auth-token': token } });
      const myPickupsData = await myPickupsRes.json();
      setMyPickups(myPickupsData);

      // Fetch ETA for active pickups
      const etaEntries = await Promise.all(
        myPickupsData
          .filter(d => d.status !== 'Delivered')
          .map(async d => {
            try {
              const res = await fetch(`http://localhost:5000/api/donations/${d._id}/eta`, { headers: { 'x-auth-token': token } });
              if (!res.ok) return [d._id, null];
              const data = await res.json();
              return [d._id, data];
            } catch {
              return [d._id, null];
            }
          })
      );
      const etaObj = Object.fromEntries(etaEntries);
      setEtaMap(etaObj);

      // Calculate stats for charts
      const stats = {
        totalPickups: myPickupsData.length,
        deliveredPickups: myPickupsData.filter(d => d.status === 'Delivered').length,
        activePickups: myPickupsData.filter(d => d.status !== 'Delivered').length,
        totalMeals: myPickupsData.reduce((sum, d) => sum + (d.quantity || 0), 0),
        monthlyData: getMonthlyData(myPickupsData),
        statusData: getStatusData(myPickupsData)
      };
      setCharityStats(stats);

    } catch (error) {
      console.error("Failed to fetch donations:", error);
    }
  };

  const getMonthlyData = (pickups) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyCounts = new Array(12).fill(0);
    
    pickups.forEach(pickup => {
      const date = new Date(pickup.createdAt);
      const month = date.getMonth();
      monthlyCounts[month]++;
    });
    
    return months.map((month, index) => ({
      month,
      count: monthlyCounts[index]
    }));
  };

  const getStatusData = (pickups) => {
    const statusCounts = {};
    pickups.forEach(pickup => {
      statusCounts[pickup.status] = (statusCounts[pickup.status] || 0) + 1;
    });
    
    return Object.entries(statusCounts).map(([status, count]) => ({
      status,
      count
    }));
  };

  useEffect(() => {
    if (isApproved) {
        fetchDonations();
    }
  }, [isApproved]);

  const handleClaim = async (donationId) => {
    if (!purpose.trim()) {
      alert('Please specify the purpose for accepting this donation.');
      return;
    }
    
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:5000/api/donations/${donationId}/claim`, {
            method: 'PATCH',
            headers: { 
              'Content-Type': 'application/json',
              'x-auth-token': token 
            },
            body: JSON.stringify({ purpose })
        });
        if (!response.ok) {
            const errData = await response.json();
            throw new Error(errData.msg || 'Failed to claim donation');
        }
        alert('Donation claimed successfully!');
        setSelectedDonation(null);
        setPurpose('');
        fetchDonations();
    } catch (error) {
        alert(`Error: ${error.message}`);
    }
  };

  const openClaimModal = (donation) => {
    setSelectedDonation(donation);
    setPurpose('');
  };

  const closeClaimModal = () => {
    setSelectedDonation(null);
    setPurpose('');
  };

  // Chart data
  const monthlyChartData = {
    labels: charityStats.monthlyData?.map(item => item.month) || [],
    datasets: [{
      label: 'Pickups per Month',
      data: charityStats.monthlyData?.map(item => item.count) || [],
      backgroundColor: 'rgba(52, 152, 219, 0.6)',
      borderColor: '#3498db',
      borderWidth: 2,
      tension: 0.4
    }]
  };

  const statusChartData = {
    labels: charityStats.statusData?.map(item => item.status) || [],
    datasets: [{
      label: 'Pickups by Status',
      data: charityStats.statusData?.map(item => item.count) || [],
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
    const totalMeals = charityStats.totalMeals || 0;
    if (totalMeals >= 200) return "🌟 Community Champion";
    if (totalMeals >= 100) return "💝 Heart of Service";
    if (totalMeals >= 50) return "🤝 Compassionate Helper";
    if (totalMeals >= 10) return "🌱 Making Impact";
    return "🚀 Starting Journey";
  };

  return (
    <>
      <Navbar user={user} onLogout={onLogout} />
      <div className="charity-dashboard-container">
        <BackButton onClick={() => window.history.back()} text="Back" />
        <header className="dashboard-header">
            <h1>Charity Dashboard</h1>
            <p>Welcome, {user.name}! {getMotivationalTag()}</p>
        </header>
        
        {/* Stats Cards */}
        <div className="stats-cards">
          <div className="stat-card">
            <h3>{charityStats.totalPickups || 0}</h3>
            <p>Total Pickups</p>
          </div>
          <div className="stat-card">
            <h3>{charityStats.deliveredPickups || 0}</h3>
            <p>Delivered</p>
          </div>
          <div className="stat-card">
            <h3>{charityStats.totalMeals || 0}</h3>
            <p>Meals Served</p>
          </div>
          <div className="stat-card">
            <h3>{charityStats.activePickups || 0}</h3>
            <p>Active</p>
          </div>
        </div>

        {/* Charts Section */}
        <section className="charts-section">
          <h3>Your Impact Analytics</h3>
          <div className="charts-container">
            <div className="chart-card">
              <h4>Monthly Pickup Trend</h4>
              <Bar data={monthlyChartData} options={{ responsive: true, plugins: { legend: { display: false }}}} />
            </div>
            <div className="chart-card">
              <h4>Pickup Status Overview</h4>
              <Pie data={statusChartData} options={{ responsive: true, plugins: { legend: { position: 'bottom' }}}} />
            </div>
          </div>
        </section>

        <main>
          {!isApproved && (
              <div className="approval-notice">Your account is pending approval. You will be able to claim donations once an admin has verified your account.</div>
          )}
          <section className="donations-section">
              <h3>My Pickups</h3>
              <div className="donations-list">
                  {myPickups.length > 0 ? (
                      myPickups.map(donation => (
                          <div key={donation._id} className={`donation-card-charity status-${donation.status.toLowerCase().replace(' ', '-')}`}>
                              <div className="donation-info">
                                  <h4>{donation.foodDescription} from {donation.donorName}</h4>
                                  <p><strong>Quantity:</strong> {donation.quantity} portions, <strong>Serves:</strong> {donation.serves} people</p>
                                  <p><strong>Status:</strong> {donation.status}</p>
                                  {donation.workerName && <p><strong>Assigned Worker:</strong> {donation.workerName} ({donation.workerContact})</p>}
                                  {etaMap[donation._id] && (
                                    <p><strong>ETA:</strong> {etaMap[donation._id].etaMinutes} min</p>
                                  )}
                              </div>
                          </div>
                      ))
                  ) : (
                      <p>You have not claimed any donations yet.</p>
                  )}
              </div>
          </section>

          {isApproved && (
              <section className="donations-section">
                  <h3>Available Donations</h3>
                  <div className="donations-list">
                  {availableDonations.length > 0 ? (
                      availableDonations.map(donation => (
                      <div key={donation._id} className="donation-card-charity">
                          <div className="donation-info">
                              <h4>{donation.foodDescription}</h4>
                              <p><strong>From:</strong> {donation.donorName}</p>
                              <p><strong>Quantity:</strong> {donation.quantity} portions</p>
                              <p><strong>Serves:</strong> {donation.serves} people</p>
                              <p><strong>Pickup Location:</strong> {donation.pickupLocation}</p>
                              <p><strong>Contact:</strong> {donation.contactNumber}</p>
                              {donation.cookingTime && <p><strong>Cooked:</strong> {donation.cookingTime} hours ago</p>}
                              {donation.specialInstructions && <p><strong>Instructions:</strong> {donation.specialInstructions}</p>}
                          </div>
                          <div className="donation-actions">
                              <button className="claim-btn" onClick={() => openClaimModal(donation)}>
                                  Claim
                              </button>
                          </div>
                      </div>
                      ))
                  ) : (
                      <p>No available donations at the moment.</p>
                  )}
                  </div>
              </section>
          )}
        </main>
      </div>

      {/* Claim Modal */}
      {selectedDonation && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Claim Donation</h3>
            <div className="donation-details">
              <h4>{selectedDonation.foodDescription}</h4>
              <p><strong>From:</strong> {selectedDonation.donorName}</p>
              <p><strong>Quantity:</strong> {selectedDonation.quantity} portions</p>
              <p><strong>Serves:</strong> {selectedDonation.serves} people</p>
            </div>
            <div className="form-group">
              <label htmlFor="purpose">Purpose for accepting this donation *</label>
              <textarea 
                id="purpose" 
                value={purpose} 
                onChange={(e) => setPurpose(e.target.value)} 
                placeholder="e.g., For feeding homeless people in our shelter, For our community kitchen, etc."
                rows="3"
                required
              />
            </div>
            <div className="form-actions">
              <button className="btn-submit" onClick={() => handleClaim(selectedDonation._id)}>
                Accept Donation
              </button>
              <button className="btn-cancel" onClick={closeClaimModal}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default CharityDashboard;