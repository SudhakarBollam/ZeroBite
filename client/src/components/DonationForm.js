import React, { useState, useEffect } from 'react';
import './DonationForm.css';

function DonationForm({ onClose, onSubmit, existingDonation }) {
  const [foodDescription, setFoodDescription] = useState('');
  const [quantity, setQuantity] = useState('');
  const [serves, setServes] = useState('');
  const [cookingTime, setCookingTime] = useState('');
  const [pickupLocation, setPickupLocation] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [specialInstructions, setSpecialInstructions] = useState('');

  useEffect(() => {
    if (existingDonation) {
      setFoodDescription(existingDonation.foodDescription);
      setQuantity(existingDonation.quantity);
      setServes(existingDonation.serves);
      setCookingTime(existingDonation.cookingTime || '');
      setPickupLocation(existingDonation.pickupLocation || '');
      setContactNumber(existingDonation.contactNumber || '');
      setSpecialInstructions(existingDonation.specialInstructions || '');
    }
  }, [existingDonation]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!foodDescription || !quantity || !serves || !pickupLocation || !contactNumber) {
      alert('Please fill out all required fields.');
      return;
    }
    onSubmit({ 
      foodDescription, 
      quantity, 
      serves, 
      cookingTime, 
      pickupLocation, 
      contactNumber, 
      specialInstructions 
    });
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
          <div className="form-group">
            <label htmlFor="cookingTime">Hours completed from cooking food</label>
            <input type="number" id="cookingTime" value={cookingTime} onChange={(e) => setCookingTime(e.target.value)} placeholder="e.g., 2" step="0.5" />
          </div>
          <div className="form-group">
            <label htmlFor="pickupLocation">Pickup Location *</label>
            <input type="text" id="pickupLocation" value={pickupLocation} onChange={(e) => setPickupLocation(e.target.value)} placeholder="e.g., Restaurant Name, Street, City" required />
          </div>
          <div className="form-group">
            <label htmlFor="contactNumber">Contact Number *</label>
            <input type="tel" id="contactNumber" value={contactNumber} onChange={(e) => setContactNumber(e.target.value)} placeholder="e.g., +91 9876543210" required />
          </div>
          <div className="form-group">
            <label htmlFor="specialInstructions">Special Instructions (Optional)</label>
            <textarea id="specialInstructions" value={specialInstructions} onChange={(e) => setSpecialInstructions(e.target.value)} placeholder="Any special instructions for pickup..." rows="3"></textarea>
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