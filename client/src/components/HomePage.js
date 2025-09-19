import React, { useState, useEffect } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';
import './HomePage.css';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

function HomePage({ onNavigate }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [stats, setStats] = useState({ donors: 0, charities: 0, meals: 0, foodKg: 0 });
  const [donationData, setDonationData] = useState({ types: [], monthly: [] });
  const [contributors, setContributors] = useState({ donors: [], charities: [] });
  const [carouselImages, setCarouselImages] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const fetchStats = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/stats');
            if (response.ok) {
                const data = await response.json();
                setStats(data);
            } else {
                // Fallback data when API is not available
                setStats({ donors: 25, charities: 12, meals: 150 });
            }
        } catch (error) {
            console.error("Could not fetch stats", error);
            // Fallback data when API is not available
            setStats({ donors: 25, charities: 12, meals: 150 });
        }
    };

    const fetchDonationData = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/donations/stats');
            if (response.ok) {
                const data = await response.json();
                setDonationData(data);
            } else {
                // Fallback data when API is not available
                setDonationData({
                    types: [
                        { type: 'Meals (Biryani, Rice)', count: 12 },
                        { type: 'Tiffins (Idli, Dosa)', count: 19 },
                        { type: 'Baked Goods', count: 3 }
                    ],
                    monthly: [
                        { month: 'May', count: 300 },
                        { month: 'June', count: 500 },
                        { month: 'July', count: 750 },
                        { month: 'August', count: 150 }
                    ]
                });
            }
        } catch (error) {
            console.error("Could not fetch donation data", error);
            // Fallback data when API is not available
            setDonationData({
                types: [
                    { type: 'Meals (Biryani, Rice)', count: 12 },
                    { type: 'Tiffins (Idli, Dosa)', count: 19 },
                    { type: 'Baked Goods', count: 3 }
                ],
                monthly: [
                    { month: 'May', count: 300 },
                    { month: 'June', count: 500 },
                    { month: 'July', count: 750 },
                    { month: 'August', count: 150 }
                ]
            });
        }
    };

    const fetchContributors = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/contributors');
        if (res.ok) {
          const data = await res.json();
          setContributors(data);
        } else {
          setContributors({ donors: [], charities: [] });
        }
      } catch {
        setContributors({ donors: [], charities: [] });
      }
    };
    const fetchCarousel = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/carousel');
        if (res.ok) {
          const data = await res.json();
          setCarouselImages(data);
        } else {
          setCarouselImages([]);
        }
      } catch {
        setCarouselImages([]);
      }
    };

    fetchStats();
    fetchDonationData();
    fetchContributors();
    fetchCarousel();
  }, []);

  useEffect(() => {
    if ((carouselImages?.length || 0) === 0) return;
    const id = setInterval(() => {
      setCurrentSlide(prev => {
        const total = carouselImages.length;
        return (prev + 1) % total;
      });
    }, 4000);
    return () => clearInterval(id);
  }, [carouselImages]);

  const handlePrev = () => {
    const total = (carouselImages?.length || 0) || 3;
    setCurrentSlide(prev => (prev - 1 + total) % total);
  };
  const handleNext = () => {
    const total = (carouselImages?.length || 0) || 3;
    setCurrentSlide(prev => (prev + 1) % total);
  };

  const pieChartData = {
    labels: donationData.types.length > 0 ? donationData.types.map(item => item.type) : ['Meals (Biryani, Rice)', 'Tiffins (Idli, Dosa)', 'Baked Goods'],
    datasets: [ 
      { 
        label: '# of Donations', 
        data: donationData.types.length > 0 ? donationData.types.map(item => item.count) : [12, 19, 3], 
        backgroundColor: ['#2ecc71', '#3498db', '#f1c40f', '#e74c3c', '#9b59b6', '#f39c12'], 
        borderColor: ['#ffffff', '#ffffff', '#ffffff', '#ffffff', '#ffffff', '#ffffff'], 
        borderWidth: 2, 
      }, 
    ],
  };
  
  const barChartData = {
    labels: donationData.monthly.length > 0 ? donationData.monthly.map(item => item.month) : ['May', 'June', 'July', 'August'],
    datasets: [ 
      { 
        label: 'Meals Donated per Month', 
        data: donationData.monthly.length > 0 ? donationData.monthly.map(item => item.count) : [300, 500, 750, stats.meals], 
        backgroundColor: '#2ecc71',
        borderColor: '#27ae60',
        borderWidth: 2,
      }, 
    ],
  };

  return (
    <div className="homepage-container">

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
        {/* Carousel */}
        <section className="carousel-section">
          <h2>Recent Events</h2>
          <div className="carousel">
            {((carouselImages.length > 0 ? carouselImages : [
                { url: '/images/event1.jpg', title: 'Event 1' },
                { url: '/images/event2.jpg', title: 'Event 2' },
                { url: '/images/event3.jpg', title: 'Event 3' }
              ])).map((img, idx) => (
                <div key={idx} className={`carousel-slide ${idx === currentSlide ? 'active' : ''}`}>
                  <img src={img.url} alt={img.title || `Event ${idx+1}`} />
                  {img.title && <div className="carousel-caption">{img.title}</div>}
                </div>
              ))}
            <button className="carousel-control prev" onClick={handlePrev}>‹</button>
            <button className="carousel-control next" onClick={handleNext}>›</button>
            <div className="carousel-dots">
              {(carouselImages.length > 0 ? carouselImages : [{}, {}, {}]).map((_, i) => (
                <span key={i} className={`dot ${i === currentSlide ? 'active' : ''}`} onClick={() => setCurrentSlide(i)}></span>
              ))}
            </div>
          </div>
        </section>
        <section id="impact" className="impact-section">
          <h2>Our Collective Impact</h2>
          <div className="impact-stats">
            <div className="stat-card"><h3>{stats.meals}+</h3><p>Meals Served</p></div>
            <div className="stat-card"><h3>{stats.donors}+</h3><p>Partner Restaurants</p></div>
            <div className="stat-card"><h3>{stats.charities}+</h3><p>Partner Charities</p></div>
            <div className="stat-card"><h3>{stats.foodKg}+ kg</h3><p>Food Rescued</p></div>
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
            {contributors.donors.length > 0 ? (
              contributors.donors.map((c, idx) => (
                <div key={idx} className="contributor-card">{c.name} <span>({c.donations})</span></div>
              ))
            ) : (
              <>
                <div className="contributor-card">Bawarchi Restaurant</div>
                <div className="contributor-card">RR Grand Function Hall</div>
                <div className="contributor-card">Coastal City Bakers</div>
              </>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

export default HomePage;