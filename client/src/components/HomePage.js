import React, { useState } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';
import './HomePage.css';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

const pieChartData = {
  labels: ['Meals (Biryani, Rice)', 'Tiffins (Idli, Dosa)', 'Baked Goods'],
  datasets: [ { label: '# of Donations', data: [12, 19, 3], backgroundColor: ['#2ecc71', '#3498db', '#f1c40f'], borderColor: ['#ffffff', '#ffffff', '#ffffff'], borderWidth: 2, }, ],
};
const barChartData = {
  labels: ['May', 'June', 'July', 'August'],
  datasets: [ { label: 'Meals Donated per Month', data: [300, 500, 750, 1200], backgroundColor: '#2ecc71', }, ],
};

function HomePage({ onNavigate }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="homepage-container">
      <nav className="navbar">
        <div className="nav-logo">ZeroBite</div>
        <div className="nav-links">
          <a href="#impact">Impact</a>
          <a href="#about">About</a>
        </div>
        <div className="hamburger" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            <div className="line"></div>
            <div className="line"></div>
            <div className="line"></div>
        </div>
        <button className="nav-cta" onClick={onNavigate}>Login / Register</button>
      </nav>

      {isMenuOpen && (
          <div className={`mobile-menu ${isMenuOpen ? 'open' : ''}`}>
              <a href="#impact" onClick={() => setIsMenuOpen(false)}>Impact</a>
              <a href="#about" onClick={() => setIsMenuOpen(false)}>About</a>
              <button className="nav-cta" onClick={() => { onNavigate(); setIsMenuOpen(false); }}>Login / Register</button>
          </div>
      )}

      <header className="homepage-header">
        <div className="header-overlay">
          <h1>ZeroBite Bhimavaram</h1>
          <p>A community-driven initiative to fight hunger by rescuing surplus food.</p>
          <button className="homepage-cta" onClick={onNavigate}>
            Join Our Mission
          </button>
        </div>
      </header>
      <main className="homepage-main">
        <section id="impact" className="impact-section">
          <h2>Our Collective Impact</h2>
          <div className="impact-stats">
            <div className="stat-card"><h3>1,200+</h3><p>Meals Served</p></div>
            <div className="stat-card"><h3>15+</h3><p>Partner Restaurants</p></div>
            <div className="stat-card"><h3>8+</h3><p>Partner Charities</p></div>
            <div className="stat-card"><h3>500+ kg</h3><p>Food Rescued</p></div>
          </div>
        </section>
        <section className="dashboard-section">
           <h2>Impact Dashboard</h2>
           <div className="charts-container">
              <div className="chart-card"><h3>Donation Types</h3><Pie data={pieChartData} /></div>
              <div className="chart-card"><h3>Monthly Growth</h3><Bar data={barChartData} /></div>
           </div>
        </section>
        <section id="about" className="contributors-section">
          <h2>Our Top Contributors</h2>
          <div className="contributors-list">
            <div className="contributor-card">Bawarchi Restaurant</div>
            <div className="contributor-card">RR Grand Function Hall</div>
            <div className="contributor-card">Coastal City Bakers</div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default HomePage;