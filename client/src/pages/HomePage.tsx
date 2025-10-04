import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import GitHubDatabase from '../services/githubDatabase';

const HomePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('buy');
  const [searchFilters, setSearchFilters] = useState({
    category: '',
    minPrice: '',
    maxPrice: '',
    location: '',
    bedrooms: '',
    bathrooms: ''
  });

  const { data: allProperties = [], isLoading, error } = useQuery({
    queryKey: ['properties'],
    queryFn: () => GitHubDatabase.getAllProperties(),
  });

  const { data: stats } = useQuery({
    queryKey: ['property-stats'],
    queryFn: () => GitHubDatabase.getPropertyStats(),
  });

  // Filter properties based on search criteria
  const properties = allProperties.filter(property => {
    const matchesCategory = !searchFilters.category || property.category === searchFilters.category;
    const matchesMinPrice = !searchFilters.minPrice || property.price_usd >= parseInt(searchFilters.minPrice);
    const matchesMaxPrice = !searchFilters.maxPrice || property.price_usd <= parseInt(searchFilters.maxPrice);
    const matchesLocation = !searchFilters.location || property.location.toLowerCase().includes(searchFilters.location.toLowerCase());
    
    return matchesCategory && matchesMinPrice && matchesMaxPrice && matchesLocation;
  });

  if (isLoading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-red-600">
          <h2>Error loading properties</h2>
          <p>Please check your internet connection and try again.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation Header */}
      <nav className="nav">
        <div className="container">
          <div className="nav-container">
            <a href="#" className="nav-logo">
              🇨🇷 Costa Rica MLS
            </a>
            <div className="nav-links">
              <a href="#listings" className="nav-link">Listings</a>
              <a href="#new-homes" className="nav-link">New Homes</a>
              <a href="#agents" className="nav-link">Find an Agent</a>
              <a href="#insights" className="nav-link">Market Insights</a>
            </div>
            <div className="flex items-center gap-4">
              <button className="btn btn-ghost btn-sm">Login</button>
              <button className="btn btn-primary btn-sm">Sign Up</button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="hero">
        <img 
          src="/cover.jpg" 
          alt="Costa Rica rainforest to ocean view" 
          className="hero-bg"
          onError={(e) => {
            // Fallback if image doesn't exist yet
            (e.target as HTMLImageElement).style.display = 'none';
          }}
        />
        <div className="hero-overlay"></div>
        <div className="container">
          <div className="hero-content">
            <h1 className="hero-title">
              Discover Paradise
              <br />Costa Rica Real Estate
            </h1>
            <p className="hero-subtitle">
              From Rainforest to Ocean - Your Dream Home Awaits
            </p>
            <p className="hero-description">
              Explore luxury villas, beachfront properties, mountain retreats, and investment opportunities across Costa Rica's most beautiful locations.
            </p>

            {/* Search Form */}
            <div className="search-form">
              <div className="search-tabs">
                <button
                  className={`search-tab ${
                    activeTab === 'buy' ? 'active' : ''
                  }`}
                  onClick={() => setActiveTab('buy')}
                >
                  🏠 Find Real Estate
                </button>
                <button
                  className={`search-tab ${
                    activeTab === 'new' ? 'active' : ''
                  }`}
                  onClick={() => setActiveTab('new')}
                >
                  🆕 Find New Homes
                </button>
                <button
                  className={`search-tab ${
                    activeTab === 'agent' ? 'active' : ''
                  }`}
                  onClick={() => setActiveTab('agent')}
                >
                  👨‍💼 Find Agents
                </button>
              </div>
              {activeTab === 'buy' && (
                <>
                  <h3 className="text-xl font-semibold text-gray-800 mb-6">
                    🔍 Find your perfect property in Costa Rica
                  </h3>
                  <div className="search-grid">
                    <div className="form-group">
                      <label className="form-label">
                        📍 Location <span className="text-primary">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="San José, Manuel Antonio, Tamarindo..."
                        className="form-input"
                        value={searchFilters.location}
                        onChange={(e) => setSearchFilters({...searchFilters, location: e.target.value})}
                      />
                    </div>
                    
                    <div className="form-group">
                      <label className="form-label">🏠 Property Type</label>
                      <select
                        className="form-select"
                        value={searchFilters.category}
                        onChange={(e) => setSearchFilters({...searchFilters, category: e.target.value})}
                      >
                        <option value="">All Property Types</option>
                        <option value="residential">🏡 Residential Homes</option>
                        <option value="luxury">🏨 Luxury Villas</option>
                        <option value="land">🌳 Land & Lots</option>
                        <option value="commercial">🏢 Commercial</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label className="form-label">💰 Price Range</label>
                      <div className="grid grid-cols-2 gap-2">
                        <select
                          className="form-select"
                          value={searchFilters.minPrice}
                          onChange={(e) => setSearchFilters({...searchFilters, minPrice: e.target.value})}
                        >
                          <option value="">Min Price</option>
                          <option value="50000">$50K</option>
                          <option value="100000">$100K</option>
                          <option value="200000">$200K</option>
                          <option value="300000">$300K</option>
                          <option value="500000">$500K</option>
                          <option value="750000">$750K</option>
                          <option value="1000000">$1M+</option>
                        </select>
                        <select
                          className="form-select"
                          value={searchFilters.maxPrice}
                          onChange={(e) => setSearchFilters({...searchFilters, maxPrice: e.target.value})}
                        >
                          <option value="">Max Price</option>
                          <option value="200000">$200K</option>
                          <option value="300000">$300K</option>
                          <option value="500000">$500K</option>
                          <option value="750000">$750K</option>
                          <option value="1000000">$1M</option>
                          <option value="2000000">$2M+</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="text-center mt-8">
                    <button className="btn btn-primary btn-xl">
                      🔍 Search Properties
                    </button>
                  </div>
                </>
              )}

              {activeTab === 'new' && (
                <>
                  <h3 className="text-xl font-semibold text-gray-800 mb-6">
                    🆕 Discover new construction projects
                  </h3>
                  <div className="search-grid">
                    <div className="form-group">
                      <label className="form-label">
                        📍 Enter Location
                      </label>
                      <input
                        type="text"
                        placeholder="Enter city or province in Costa Rica"
                        className="form-input"
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">💰 Price Range</label>
                      <div className="grid grid-cols-2 gap-2">
                        <select className="form-select">
                          <option>Min Price</option>
                          <option>$100K</option>
                          <option>$200K</option>
                          <option>$300K</option>
                          <option>$500K</option>
                        </select>
                        <select className="form-select">
                          <option>Max Price</option>
                          <option>$300K</option>
                          <option>$500K</option>
                          <option>$750K</option>
                          <option>$1M+</option>
                        </select>
                      </div>
                    </div>
                  </div>
                  <div className="text-center mt-8">
                    <button className="btn btn-secondary btn-xl">
                      🆕 Search New Homes
                    </button>
                  </div>
                </>
              )}

              {activeTab === 'agent' && (
                <>
                  <h3 className="text-xl font-semibold text-gray-800 mb-6">
                    👨‍💼 Connect with local real estate experts
                  </h3>
                  <div className="max-w-md mx-auto mb-6">
                    <div className="form-group">
                      <label className="form-label">
                        📍 Enter Location
                      </label>
                      <input
                        type="text"
                        placeholder="Enter City or Province"
                        className="form-input"
                      />
                    </div>
                  </div>
                  <div className="text-center mt-8">
                    <button className="btn btn-outline btn-xl">
                      👨‍💼 Find An Agent
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Costa Rica Provinces Section */}
      <div className="section bg-gray-50">
        <div className="container">
          <h2 className="section-title">
            🇨🇷 Explore Costa Rica by Province
          </h2>
          <p className="section-subtitle">
            Click on any province to discover properties in your desired location
          </p>
          
          <div className="province-grid">
            {[
              { name: 'San José', emoji: '🏢' },
              { name: 'Alajuela', emoji: '🌋' },
              { name: 'Cartago', emoji: '⛰️' },
              { name: 'Heredia', emoji: '🌿' },
              { name: 'Guanacaste', emoji: '🏖️' },
              { name: 'Puntarenas', emoji: '🌊' },
              { name: 'Limón', emoji: '🌴' }
            ].map((province) => (
              <button
                key={province.name}
                className="province-card"
                onClick={() => setSearchFilters({...searchFilters, location: province.name})}
              >
                <div className="text-2xl mb-2">{province.emoji}</div>
                {province.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Featured Properties Section */}
      <div className="section bg-white">
        <div className="container">
          <div className="flex justify-between items-center mb-12">
            <h2 className="section-title text-left mb-0">
              🌟 Featured Properties
            </h2>
            {stats && (
              <div className="text-gray-600 text-sm">
                Showing {properties.length} of {stats.total} properties
              </div>
            )}
          </div>

          {/* Properties Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {properties.slice(0, 8).map((property) => (
              <div key={property.id} className="property-card">
                <div className="property-card-image">
                  {property.images.length > 0 ? (
                    <>
                      <div className="text-center text-white">
                        <div className="text-3xl mb-2">📷</div>
                        <span className="text-sm font-medium">
                          {property.images.length} Photo{property.images.length > 1 ? 's' : ''}
                        </span>
                      </div>
                      <div className="property-card-badge">
                        {property.category}
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="text-center text-white">
                        <div className="text-4xl mb-2">🏠</div>
                        <span className="text-sm opacity-80">No Photos</span>
                      </div>
                      <div className="property-card-badge">
                        {property.category}
                      </div>
                    </>
                  )}
                </div>
                
                <div className="property-card-content">
                  <div className="property-card-price">
                    ${property.price_usd?.toLocaleString() || 'Price on request'}
                  </div>
                  
                  <h3 className="property-card-title">
                    {property.title}
                  </h3>
                  
                  <div className="property-card-location">
                    <span>📍</span>
                    {property.location.split(',').slice(0, 2).join(', ')}
                  </div>
                  
                  <div className="property-card-footer">
                    <span>Listed {new Date(property.scraped_at).toLocaleDateString()}</span>
                    <button className="text-primary hover:text-primary font-semibold transition-colors">
                      View Details →
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {properties.length === 0 && (
            <div className="text-center py-16">
              <div className="text-6xl mb-6">🔍</div>
              <h3 className="text-2xl font-semibold text-gray-800 mb-4">No properties match your search</h3>
              <p className="text-gray-600 mb-8">Try adjusting your search criteria or explore different locations to discover amazing properties.</p>
              <button 
                className="btn btn-outline btn-lg"
                onClick={() => setSearchFilters({category: '', minPrice: '', maxPrice: '', location: '', bedrooms: '', bathrooms: ''})}
              >
                🔄 Clear All Filters
              </button>
            </div>
          )}
        </div>
      </div>

      {/* About Section */}
      <div className="section bg-gray-50">
        <div className="container">
          <h2 className="section-title">
            What is Costa Rica MLS?
          </h2>
          <p className="section-subtitle max-w-4xl">
            Costa Rica MLS is a comprehensive property search platform connecting you with the finest real estate opportunities throughout this beautiful Central American paradise. From beachfront villas in Guanacaste to mountain retreats in the Central Valley, we feature properties from trusted professionals across all categories.
          </p>
          
          <div className="feature-grid">
            <div className="feature-card">
              <div className="feature-icon">🏖️</div>
              <h3 className="feature-title">Beach Properties</h3>
              <p className="feature-description">Discover stunning oceanfront homes, beachside condos, and coastal investment opportunities along Costa Rica's pristine shores.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🏔️</div>
              <h3 className="feature-title">Mountain Retreats</h3>
              <p className="feature-description">Find your perfect mountain sanctuary with breathtaking views, cool climates, and tranquil settings in the Central Valley.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🏢</div>
              <h3 className="feature-title">Commercial Properties</h3>
              <p className="feature-description">Explore lucrative business opportunities and investment properties in Costa Rica's growing commercial markets.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-grid">
            <div className="footer-section">
              <h3>🇨🇷 Costa Rica MLS</h3>
              <p>
                Your trusted source for Costa Rica real estate listings, market insights, and property investment opportunities across all seven provinces.
              </p>
            </div>
            <div className="footer-section">
              <h3>Quick Links</h3>
              <ul className="footer-links">
                <li><a href="#listings">🏠 Property Search</a></li>
                <li><a href="#new-homes">🆕 New Listings</a></li>
                <li><a href="#insights">📈 Market Reports</a></li>
                <li><a href="#agents">👨‍💼 Find Agents</a></li>
              </ul>
            </div>
            <div className="footer-section">
              <h3>Popular Locations</h3>
              <ul className="footer-links">
                <li><a href="#">🏢 San José</a></li>
                <li><a href="#">🏖️ Guanacaste</a></li>
                <li><a href="#">🌊 Puntarenas</a></li>
                <li><a href="#">🌴 Limón</a></li>
              </ul>
            </div>
            <div className="footer-section">
              <h3>Contact & Support</h3>
              <p>
                Professional real estate services throughout Costa Rica. Connecting buyers, sellers, and investors with their perfect properties since 2024.
              </p>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; 2024 Costa Rica MLS. All rights reserved. 🇨🇷 Pura Vida!</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;