import React, { useState, useEffect } from 'react';
import './CharityDashboard.css';

function CharityDashboard({ user, onLogout }) {
  const [availableDonations, setAvailableDonations] = useState([]);
  const [myPickups, setMyPickups] = useState([]);
  const [isApproved, setIsApproved] = useState(user?.status === 'Approved');

  const fetchDonations = async () => {
    try {
      const token = localStorage.getItem('token');
      const availableRes = await fetch('http://localhost:5000/api/donations/available', { headers: { 'x-auth-token': token } });
      const availableData = await availableRes.json();
      setAvailableDonations(availableData);

      const myPickupsRes = await fetch('http://localhost:5000/api/donations/charity', { headers: { 'x-auth-token': token } });
      const myPickupsData = await myPickupsRes.json();
      setMyPickups(myPickupsData);

    } catch (error) {
      console.error("Failed to fetch donations:", error);
    }
  };

  useEffect(() => {
    if (isApproved) {
        fetchDonations();
    }
  }, [isApproved]);

  const handleClaim = async (donationId) => {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:5000/api/donations/${donationId}/claim`, {
            method: 'PATCH',
            headers: { 'x-auth-token': token }
        });
        if (!response.ok) {
            const errData = await response.json();
            throw new Error(errData.msg || 'Failed to claim donation');
        }
        alert('Donation claimed successfully!');
        fetchDonations();
    } catch (error) {
        console.error('Error claiming donation:', error);
        alert(`Error: ${error.message}`);
    }
  };

  return (
    <div className="charity-dashboard-container">
      <header className="charity-dashboard-header">
        <div className="header-content">
          <h1>Welcome, {user.name}!</h1>
          <h2>Charity Dashboard</h2>
        </div>
        <button className="logout-btn" onClick={onLogout}>Logout</button>
      </header>
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
                            <p><strong>Pickup Address:</strong> {donation.donorAddress}</p>
                            <p><strong>Contact:</strong> {donation.donorContact}</p>
                        </div>
                        <div className="donation-actions">
                            <button className="claim-btn" onClick={() => handleClaim(donation._id)}>
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
  );
}

export default CharityDashboard;