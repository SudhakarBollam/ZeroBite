import React, { useState } from 'react';
import './AuthPage.css';

function AuthPage({ onLogin }) {
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState(null); // New state for error messages
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: 'Donor',
    contactPerson: '',
    contactNumber: '',
    address: '',
    businessName: '',
    businessLicense: '',
    foodSafetyCert: '',
    charityName: '',
    ngoLicense: '',
    beneficiaryType: '',
    storageFacilities: '',
    employeeId: '',
    areaOfOperation: '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null); // Reset error on new submission
    const endpoint = isLogin ? '/api/users/login' : '/api/users/register';
    
    const payload = isLogin ? { email: formData.email, password: formData.password } : formData;

    try {
      const response = await fetch(`http://localhost:5000${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.msg || 'Something went wrong');
      }

      if (isLogin) {
        onLogin(data.token, data.user);
      } else {
        alert('Registration successful! Please log in.');
        setIsLogin(true);
      }
    } catch (error) {
      setError(error.message); // Set the specific error message
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-form">
        <form onSubmit={handleSubmit}>
          <h2>{isLogin ? 'Login' : 'Register'}</h2>
          
          {/* Display the error message here */}
          {error && <p className="error-message">{error}</p>}

          {/* Common Fields for Login */}
          <div className="form-group">
            <label>Email</label>
            <input type="email" name="email" value={formData.email} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input type="password" name="password" value={formData.password} onChange={handleChange} required />
          </div>

          {/* Registration-only Fields */}
          {!isLogin && (
            <>
              <div className="form-group">
                <label>I am a...</label>
                <select name="role" value={formData.role} onChange={handleChange}>
                  <option value="Donor">Donor (Restaurant, Hall)</option>
                  <option value="Charity">Charity (Shelter)</option>
                  <option value="Worker">Municipality Worker</option>
                </select>
              </div>

              {/* Fields for Donor */}
              {formData.role === 'Donor' && (
                <>
                  <div className="form-group"><label>Business Name</label><input type="text" name="businessName" value={formData.businessName} onChange={handleChange} required /></div>
                  <div className="form-group"><label>Contact Person Name</label><input type="text" name="contactPerson" value={formData.contactPerson} onChange={handleChange} required /></div>
                  <div className="form-group"><label>Contact Number</label><input type="text" name="contactNumber" value={formData.contactNumber} onChange={handleChange} required /></div>
                  <div className="form-group"><label>Address</label><input type="text" name="address" value={formData.address} onChange={handleChange} required /></div>
                  <div className="form-group"><label>Business License Number</label><input type="text" name="businessLicense" value={formData.businessLicense} onChange={handleChange} required /></div>
                  <div className="form-group"><label>Food Safety Certificate (Optional)</label><input type="text" name="foodSafetyCert" value={formData.foodSafetyCert} onChange={handleChange} /></div>
                </>
              )}

              {/* Fields for Charity */}
              {formData.role === 'Charity' && (
                <>
                  <div className="form-group"><label>Charity Name</label><input type="text" name="charityName" value={formData.charityName} onChange={handleChange} required /></div>
                  <div className="form-group"><label>Contact Person Name</label><input type="text" name="contactPerson" value={formData.contactPerson} onChange={handleChange} required /></div>
                  <div className="form-group"><label>Contact Number</label><input type="text" name="contactNumber" value={formData.contactNumber} onChange={handleChange} required /></div>
                  <div className="form-group"><label>Address</label><input type="text" name="address" value={formData.address} onChange={handleChange} required /></div>
                  <div className="form-group"><label>NGO License Number</label><input type="text" name="ngoLicense" value={formData.ngoLicense} onChange={handleChange} required /></div>
                  <div className="form-group"><label>Type of Beneficiaries</label><input type="text" name="beneficiaryType" value={formData.beneficiaryType} onChange={handleChange} placeholder="e.g., Orphanage, Shelter" required /></div>
                  <div className="form-group"><label>Storage Facilities</label><input type="text" name="storageFacilities" value={formData.storageFacilities} onChange={handleChange} placeholder="e.g., Refrigerators available" required /></div>
                </>
              )}

              {/* Fields for Worker */}
              {formData.role === 'Worker' && (
                <>
                  <div className="form-group"><label>Full Name</label><input type="text" name="contactPerson" value={formData.contactPerson} onChange={handleChange} required /></div>
                  <div className="form-group"><label>Contact Number</label><input type="text" name="contactNumber" value={formData.contactNumber} onChange={handleChange} required /></div>
                  <div className="form-group"><label>Municipality Employee ID</label><input type="text" name="employeeId" value={formData.employeeId} onChange={handleChange} required /></div>
                  <div className="form-group"><label>Area of Operation</label><input type="text" name="areaOfOperation" value={formData.areaOfOperation} onChange={handleChange} required /></div>
                </>
              )}
            </>
          )}
          <button type="submit" className="auth-btn">{isLogin ? 'Login' : 'Register'}</button>
          <p className="toggle-auth" onClick={() => setIsLogin(!isLogin)}>
            {isLogin ? "Don't have an account? Register" : 'Already have an account? Login'}
          </p>
        </form>
      </div>
    </div>
  );
}

export default AuthPage;