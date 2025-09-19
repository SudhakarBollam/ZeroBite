import React, { useState, useEffect } from 'react';
import './DonationForm.css';

function DonationForm({ onClose, onSubmit, existingDonation }) {
  const [foodDescription, setFoodDescription] = useState('');
  const [quantity, setQuantity] = useState('');
  const [serves, setServes] = useState('');

  useEffect(() => {
    if (existingDonation) {
      setFoodDescription(existingDonation.foodDescription);
      setQuantity(existingDonation.quantity);
      setServes(existingDonation.serves);
    }
  }, [existingDonation]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!foodDescription || !quantity || !serves) {
      alert('Please fill out all fields.');
      return;
    }
    onSubmit({ foodDescription, quantity, serves });
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <form onSubmit={handleSubmit}>
          <h2>{existingDonation ? 'Edit Donation' : 'Create New Donation'}</h2>
          <div className="form-group">
            <label htmlFor="foodDescription">Food Description</label>
            <input type="text" id="foodDescription" value={foodDescription} onChange={(e) => setFoodDescription(e.target.value)} placeholder="e.g., Vegetable Biryani" required />
          </div>
          <div className="form-group">
            <label htmlFor="quantity">Quantity (Number of portions)</label>
            <input type="number" id="quantity" value={quantity} onChange={(e) => setQuantity(e.target.value)} placeholder="e.g., 20" required />
          </div>
          <div className="form-group">
            <label htmlFor="serves">Approximation of people that can have that food</label>
            <input type="number" id="serves" value={serves} onChange={(e) => setServes(e.target.value)} placeholder="e.g., 50" required />
          </div>
          <div className="form-actions">
            <button type="submit" className="btn-submit">{existingDonation ? 'Update Donation' : 'Submit Donation'}</button>
            <button type="button" className="btn-cancel" onClick={onClose}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}
export default DonationForm;