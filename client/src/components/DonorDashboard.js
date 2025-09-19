import React, { useState, useEffect } from 'react';
import DonationForm from './DonationForm';
import './DonorDashboard.css';

function DonorDashboard({ user, onLogout }) {
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [donations, setDonations] = useState([]);
  const [editingDonation, setEditingDonation] = useState(null);
  const [isApproved, setIsApproved] = useState(user?.status === 'Approved');

  const fetchDonations = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/donations/donor', {
          headers: { 'x-auth-token': token }
      });
      const data = await response.json();
      setDonations(data);
    } catch (error) {
      console.error("Failed to fetch donations:", error);
    }
  };

  useEffect(() => {
    fetchDonations();
  }, []);

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

  return (
    <div className="dashboard-container">
      {isFormVisible && (
        <DonationForm 
          onClose={() => { setIsFormVisible(false); setEditingDonation(null); }}
          onSubmit={handleFormSubmit}
          existingDonation={editingDonation}
        />
      )}
      <header className="dashboard-header">
        <div className="header-content">
          <h1>Welcome, {user.name}!</h1>
          <h2>Donor Dashboard</h2>
        </div>
        <button className="logout-btn" onClick={onLogout}>Logout</button>
      </header>
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
  );
}
export default DonorDashboard;