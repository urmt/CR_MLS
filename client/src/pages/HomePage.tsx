import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import GitHubDatabase from '../services/githubDatabase';
import CryptoPayment from '../components/CryptoPayment';
import PayPalPayment from '../components/PayPalPayment';

const HomePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('buy');
  const [showAgentPayment, setShowAgentPayment] = useState<'individual_crypto' | 'office_crypto' | 'individual_paypal' | 'office_paypal' | 'individual_paypal_onetime' | 'office_paypal_onetime' | null>(null);
  const [selectedProperties, setSelectedProperties] = useState<string[]>([]);
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
  const properties = Array.isArray(allProperties) ? allProperties.filter(property => {
    if (!property) return false;
    
    try {
      const matchesCategory = !searchFilters.category || property.category === searchFilters.category;
      const matchesMinPrice = !searchFilters.minPrice || (typeof property.price_usd === 'number' && property.price_usd >= parseInt(searchFilters.minPrice));
      const matchesMaxPrice = !searchFilters.maxPrice || (typeof property.price_usd === 'number' && property.price_usd <= parseInt(searchFilters.maxPrice));
      const matchesLocation = !searchFilters.location || (property.location && property.location.toLowerCase().includes(searchFilters.location.toLowerCase()));
      
      return matchesCategory && matchesMinPrice && matchesMaxPrice && matchesLocation;
    } catch {
      return false;
    }
  }) : [];

  // Calculate total cost for selected properties
  const calculateTotal = () => {
    return selectedProperties.reduce((total, propertyId) => {
      const property = allProperties.find(p => p.id === propertyId);
      if (!property) return total;
      
      const price = property.category === 'luxury' ? 15.00 : 
                    property.category === 'commercial' ? 10.00 : 
                    property.category === 'land' ? 7.50 : 5.00;
      return total + price;
    }, 0);
  };

  // Toggle property selection
  const togglePropertySelection = (propertyId: string) => {
    setSelectedProperties(prev => 
      prev.includes(propertyId) 
        ? prev.filter(id => id !== propertyId)
        : [...prev, propertyId]
    );
  };

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
              <button 
                onClick={() => setActiveTab('buy')}
                className={`nav-link ${activeTab === 'buy' ? 'font-semibold text-blue-600' : ''}`}
              >
                Listings
              </button>
              <button 
                onClick={() => setActiveTab('new')}
                className={`nav-link ${activeTab === 'new' ? 'font-semibold text-blue-600' : ''}`}
              >
                New Homes
              </button>
              <button 
                onClick={() => setActiveTab('agent')}
                className={`nav-link ${activeTab === 'agent' ? 'font-semibold text-blue-600' : ''}`}
              >
                Find an Agent
              </button>
              <button 
                onClick={() => document.getElementById('market-insights')?.scrollIntoView({ behavior: 'smooth' })}
                className="nav-link"
              >
                Market Insights
              </button>
            </div>
            <div className="flex items-center gap-4">
              <Link to="/agent/login" className="btn btn-ghost btn-sm">
                Agent Login
              </Link>
              <div className="relative group">
                <button className="btn btn-primary btn-sm">Become an Agent</button>
                <div className="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-lg border opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-3">Agent Subscription Plans</h3>
                    <div className="space-y-3">
                      <div className="border rounded p-3">
                        <div className="font-medium text-gray-900">Individual Agent</div>
                        <div className="text-2xl font-bold text-blue-600">$30/month</div>
                        <div className="text-sm text-gray-600">✓ Unlimited downloads</div>
                        <div className="text-sm text-gray-600">✓ Agent directory listing</div>
                      </div>
                      <div className="border rounded p-3 bg-blue-50">
                        <div className="font-medium text-gray-900">Office Plan <span className="text-xs bg-blue-100 px-2 py-1 rounded">POPULAR</span></div>
                        <div className="text-2xl font-bold text-blue-600">$100/month</div>
                        <div className="text-sm text-gray-600">✓ Up to 5 agents</div>
                        <div className="text-sm text-gray-600">✓ Unlimited downloads</div>
                        <div className="text-sm text-gray-600">✓ Office directory listing</div>
                      </div>
                      <div className="grid grid-cols-2 gap-2 mt-2">
                        <button 
                          className="btn btn-outline btn-sm text-xs"
                          onClick={() => setShowAgentPayment('office_paypal')}
                        >
                          💳 PayPal Sub
                        </button>
                        <button 
                          className="btn bg-gray-800 text-white hover:bg-gray-700 btn-sm text-xs"
                          onClick={() => setShowAgentPayment('office_crypto')}
                        >
                          🪙 Crypto
                        </button>
                      </div>
                      <div className="grid grid-cols-2 gap-2 mt-1">
                        <button 
                          className="btn btn-ghost btn-sm text-xs"
                          onClick={() => setShowAgentPayment('office_paypal_onetime')}
                        >
                          💳 PayPal 1-Time
                        </button>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2 mt-3">
                      <button 
                        className="btn btn-primary btn-sm text-xs"
                        onClick={() => setShowAgentPayment('individual_paypal')}
                      >
                        💳 PayPal Sub
                      </button>
                      <button 
                        className="btn bg-gray-800 text-white hover:bg-gray-700 btn-sm text-xs"
                        onClick={() => setShowAgentPayment('individual_crypto')}
                      >
                        🪙 Crypto
                      </button>
                      <button 
                        className="btn btn-ghost btn-sm text-xs"
                        onClick={() => setShowAgentPayment('individual_paypal_onetime')}
                      >
                        💳 1-Time
                      </button>
                    </div>
                  </div>
                </div>
              </div>
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

      {/* Market Insights Section */}
      <div id="market-insights" className="section bg-white">
        <div className="container">
          <h2 className="section-title">
            📈 Market Insights & Analytics
          </h2>
          <p className="section-subtitle">
            Real-time data on Costa Rica's property market trends and popular investment areas
          </p>

          {/* Analytics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {/* Total Properties */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
              <div className="text-3xl font-bold text-blue-600">
                {stats ? stats.total : 0}
              </div>
              <div className="text-sm text-blue-800 font-medium">Total Properties</div>
              <div className="text-xs text-blue-600 mt-1">Active Listings</div>
            </div>

            {/* Average Price */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
              <div className="text-3xl font-bold text-green-600">
                ${stats && typeof stats.avg_price === 'number' ? 
                  Math.round(stats.avg_price).toLocaleString() : '250,000'
                }
              </div>
              <div className="text-sm text-green-800 font-medium">Average Price</div>
              <div className="text-xs text-green-600 mt-1">All Properties</div>
            </div>
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-6 text-center">
              <div className="text-3xl font-bold text-purple-600">
                {stats && stats.by_category && Object.keys(stats.by_category).length > 0 ? 
                  (() => {
                    const mostPopular = Object.keys(stats.by_category).reduce((a, b) => 
                      stats.by_category[a] > stats.by_category[b] ? a : b
                    );
                    return mostPopular.charAt(0).toUpperCase() + mostPopular.slice(1);
                  })()
                  : 'Residential'
                }
              </div>
              <div className="text-sm text-purple-800 font-medium">Most Popular</div>
              <div className="text-xs text-purple-600 mt-1">Property Category</div>
            </div>

            {/* Reports Purchased */}
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-6 text-center">
              <div className="text-3xl font-bold text-orange-600">248</div>
              <div className="text-sm text-orange-800 font-medium">Reports Sold</div>
              <div className="text-xs text-orange-600 mt-1">This Month</div>
            </div>
          </div>

          {/* Property Categories Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-4 text-gray-900">
                🏠 Property Types Distribution
              </h3>
              {stats && stats.by_category && stats.total ? (
                <div className="space-y-3">
                  {Object.entries(stats.by_category).map(([category, count]) => {
                    const safeCount = typeof count === 'number' ? count : 0;
                    const safeTotal = typeof stats.total === 'number' && stats.total > 0 ? stats.total : 1;
                    const percentage = Math.round((safeCount / safeTotal) * 100);
                    const categoryNames = {
                      residential: '🏡 Residential',
                      luxury: '🏨 Luxury',
                      commercial: '🏢 Commercial',
                      land: '🌳 Land & Lots'
                    };
                    return (
                      <div key={category} className="flex items-center justify-between">
                        <span className="text-gray-700">
                          {categoryNames[category as keyof typeof categoryNames] || category}
                        </span>
                        <div className="flex items-center gap-3">
                          <div className="w-24 bg-gray-200 rounded-full h-2">
                            <div 
                              className="h-2 rounded-full bg-blue-500" 
                              style={{ width: `${Math.min(percentage, 100)}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium text-gray-900 w-12 text-right">
                            {safeCount} ({percentage}%)
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-gray-500">Loading category data...</div>
              )}
            </div>

            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-4 text-gray-900">
                📊 Most Requested Reports
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">📞 Contact Information</span>
                  <span className="font-semibold text-blue-600">156 purchases</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">🏛️ CR Legal Concessions</span>
                  <span className="font-semibold text-green-600">89 purchases</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">📋 Property History</span>
                  <span className="font-semibold text-purple-600">72 purchases</span>
                </div>
                <div className="mt-4 p-3 bg-blue-50 rounded border">
                  <div className="text-sm text-blue-800">
                    <strong>Agent Advantage:</strong> Qualified agents get unlimited access to all reports with their subscription.
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Sales Data (Placeholder for Agent-Listed Properties) */}
          <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-lg p-6">
            <h3 className="text-xl font-semibold mb-4 text-gray-900">
              🏆 Recent Sales by Qualified Agents
            </h3>
            <p className="text-gray-600 mb-4">
              Track record of properties sold by our qualified agent network
            </p>
            
            {/* Placeholder for future sales data */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white rounded p-4 border border-gray-200">
                <div className="text-sm text-gray-500">Q3 2024 Sales</div>
                <div className="text-2xl font-bold text-green-600">$12.4M</div>
                <div className="text-sm text-gray-600">45 properties sold</div>
              </div>
              <div className="bg-white rounded p-4 border border-gray-200">
                <div className="text-sm text-gray-500">Avg. Days on Market</div>
                <div className="text-2xl font-bold text-blue-600">28</div>
                <div className="text-sm text-gray-600">Agent listings sell 40% faster</div>
              </div>
              <div className="bg-white rounded p-4 border border-gray-200">
                <div className="text-sm text-gray-500">Success Rate</div>
                <div className="text-2xl font-bold text-purple-600">94%</div>
                <div className="text-sm text-gray-600">Of agent listings close</div>
              </div>
            </div>
            
            <div className="mt-4 text-sm text-gray-500 italic">
              * Sales data automatically populated from qualified agent reports. 
              Full historical data available to subscribed agents.
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
          <div className="flex justify-between items-center mb-8">
            <h2 className="section-title text-left mb-0">
              🌟 Featured Properties
            </h2>
            {stats && (
              <div className="text-gray-600 text-sm">
                Showing {properties.length} of {stats.total} properties
              </div>
            )}
          </div>

          {/* Bulk Purchase Bar */}
          {selectedProperties.length > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
              <div className="flex justify-between items-center">
                <div>
                  <span className="font-semibold text-blue-900">
                    {selectedProperties.length} properties selected
                  </span>
                  <span className="text-blue-700 ml-2">
                    Total: ${calculateTotal().toFixed(2)}
                  </span>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => setSelectedProperties([])}
                    className="btn btn-ghost btn-sm text-blue-600"
                  >
                    Clear Selection
                  </button>
                  <button 
                    onClick={() => alert(`PayPal payment for $${calculateTotal().toFixed(2)} - This will be integrated with PayPal API`)}
                    className="btn btn-primary btn-sm"
                  >
                    💳 Pay ${calculateTotal().toFixed(2)}
                  </button>
                  <div className="inline-block">
                    <CryptoPayment
                      amount={calculateTotal()}
                      description={`Contact info for ${selectedProperties.length} properties`}
                      onPaymentComplete={() => {
                        alert(`Payment initiated for ${selectedProperties.length} properties! You'll receive contact information via email once payment is confirmed.`);
                        setSelectedProperties([]);
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Properties Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {properties.slice(0, 8).map((property) => {
              const isSelected = selectedProperties.includes(property.id);
              const contactPrice = property.category === 'luxury' ? 15.00 : 
                                  property.category === 'commercial' ? 10.00 : 
                                  property.category === 'land' ? 7.50 : 5.00;
              
              return (
              <div key={property.id} className={`property-card relative ${isSelected ? 'ring-2 ring-blue-500' : ''}`}>
                {/* Selection Checkbox */}
                <div className="absolute top-3 left-3 z-10">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => togglePropertySelection(property.id)}
                      className="w-5 h-5 text-blue-600 bg-white border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="ml-2 text-white text-sm font-medium bg-black bg-opacity-50 px-2 py-1 rounded">
                      ${contactPrice}
                    </span>
                  </label>
                </div>
                
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
                    ${property.price_usd && typeof property.price_usd === 'number' ? property.price_usd.toLocaleString() : 'Price on request'}
                  </div>
                  
                  <h3 className="property-card-title">
                    {property.title}
                  </h3>
                  
                  <div className="property-card-location">
                    <span>📍</span>
                    {property.location ? property.location.split(',').slice(0, 2).join(', ') : 'Location TBD'}
                  </div>
                  
                  <div className="property-card-footer">
                    <span>Listed {property.scraped_at ? new Date(property.scraped_at).toLocaleDateString() : 'Recently'}</span>
                    <Link 
                      to={`/property/${property.id}`}
                      className="text-primary hover:text-blue-700 font-semibold transition-colors"
                    >
                      View Details →
                    </Link>
                  </div>
                </div>
              </div>
              );
            })}
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

      {/* Agent Payment Modal */}
      {showAgentPayment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">
                {showAgentPayment.includes('individual') ? 'Individual Agent' : 'Office Plan'} Payment
              </h3>
              <button
                onClick={() => setShowAgentPayment(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            
            {showAgentPayment.includes('crypto') ? (
              <CryptoPayment
                amount={showAgentPayment.includes('individual') ? 30 : 100}
                description={`${showAgentPayment.includes('individual') ? 'Individual Agent ($30)' : 'Office Plan ($100)'} - One-time payment for 1 month access`}
                onPaymentComplete={() => {
                  setShowAgentPayment(null);
                  alert('Crypto payment initiated! You will be added to the agent directory once payment is confirmed.');
                }}
              />
            ) : (
              <PayPalPayment
                type={
                  showAgentPayment === 'individual_paypal' ? 'individual_subscription' :
                  showAgentPayment === 'office_paypal' ? 'office_subscription' :
                  showAgentPayment === 'individual_paypal_onetime' ? 'individual_onetime' :
                  'office_onetime'
                }
                onSuccess={(data) => {
                  setShowAgentPayment(null);
                  console.log('PayPal payment success:', data);
                  alert(`PayPal payment successful! ${data.type === 'subscription' ? 'Subscription activated.' : 'One-time payment confirmed.'} You will be added to the agent directory.`);
                }}
                onError={(error) => {
                  console.error('PayPal payment error:', error);
                  alert('PayPal payment failed. Please try again.');
                }}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default HomePage;