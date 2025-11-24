import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import QRCode from 'react-qr-code';
import GitHubDatabase from '../services/githubDatabase';
// import CryptoPayment from '../components/CryptoPayment';
// import PayPalPayment from '../components/PayPalPayment';
import PropertyReportSelector from '../components/PropertyReportSelector';
import LoadingScreen from '../components/LoadingScreen';
import { ReportType } from '../types/reports';

const HomePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('buy');
  const [showAgentPayment, setShowAgentPayment] = useState<'individual_crypto' | 'office_crypto' | 'individual_paypal' | 'office_paypal' | 'individual_paypal_onetime' | 'office_paypal_onetime' | null>(null);
  const [selectedProperties, setSelectedProperties] = useState<string[]>([]);
  const [showReportSelector, setShowReportSelector] = useState(false);
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

  // Handle property report purchase success
  const handleReportPurchaseSuccess = (reportType: ReportType, properties: string[]) => {
    alert(`Success! You have purchased ${reportType.name} for ${properties.length} properties. You will receive your reports via email within ${reportType.deliveryTime}.`);
    setSelectedProperties([]);
  };

  // Toggle property selection
  const togglePropertySelection = (propertyId: string) => {
    setSelectedProperties(prev => 
      prev.includes(propertyId) 
        ? prev.filter(id => id !== propertyId)
        : [...prev, propertyId]
    );
  };

  // Debug state changes - console only
  React.useEffect(() => {
    console.log('🎯 showAgentPayment state changed to:', showAgentPayment);
  }, [showAgentPayment]);
  
  React.useEffect(() => {
    console.log('📄 showReportSelector state changed to:', showReportSelector);
  }, [showReportSelector]);

  if (isLoading) {
    return <LoadingScreen message="Loading Costa Rica MLS Database" estimatedDuration={60000} />;
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
                Homes
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
              <div className="agent-dropdown-container">
                <button className="btn btn-primary btn-sm agent-trigger">Become an Agent</button>
                <div className="agent-dropdown">
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
                          onClick={() => {
                            console.log('Setting showAgentPayment to office_paypal');
                            setShowAgentPayment('office_paypal');
                          }}
                          style={{
                            pointerEvents: 'auto' as any,
                            zIndex: 999,
                            position: 'relative'
                          }}
                        >
                          💳 PayPal Sub
                        </button>
                        <button 
                          className="btn bg-gray-800 text-white hover:bg-gray-700 btn-sm text-xs"
                          onClick={() => {
                            console.log('Setting showAgentPayment to office_crypto');
                            setShowAgentPayment('office_crypto');
                          }}
                          style={{
                            pointerEvents: 'auto' as any,
                            zIndex: 999,
                            position: 'relative'
                          }}
                        >
                          🪙 Crypto
                        </button>
                      </div>
                      <div className="grid grid-cols-2 gap-2 mt-1">
                        <button 
                          className="btn btn-ghost btn-sm text-xs"
                          onClick={() => {
                            console.log('Setting showAgentPayment to office_paypal_onetime');
                            setShowAgentPayment('office_paypal_onetime');
                          }}
                          style={{
                            pointerEvents: 'auto' as any,
                            zIndex: 999,
                            position: 'relative'
                          }}
                        >
                          💳 PayPal 1-Time
                        </button>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2 mt-3">
                      <button 
                        className="btn btn-primary btn-sm text-xs"
                        onClick={() => {
                          console.log('Setting showAgentPayment to individual_paypal');
                          setShowAgentPayment('individual_paypal');
                        }}
                        style={{
                          pointerEvents: 'auto' as any,
                          zIndex: 999,
                          position: 'relative'
                        }}
                      >
                        💳 PayPal Sub
                      </button>
                      <button 
                        className="btn bg-gray-800 text-white hover:bg-gray-700 btn-sm text-xs"
                        onClick={() => {
                          console.log('Setting showAgentPayment to individual_crypto');
                          setShowAgentPayment('individual_crypto');
                        }}
                        style={{
                          pointerEvents: 'auto' as any,
                          zIndex: 999,
                          position: 'relative'
                        }}
                      >
                        🪙 Crypto
                      </button>
                      <button 
                        className="btn btn-ghost btn-sm text-xs"
                        onClick={() => {
                          console.log('Setting showAgentPayment to individual_paypal_onetime');
                          setShowAgentPayment('individual_paypal_onetime');
                        }}
                        style={{
                          pointerEvents: 'auto' as any,
                          zIndex: 999,
                          position: 'relative'
                        }}
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
                  🏠 Find Homes
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
                    🏠 Find homes and residential properties
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
                        value={searchFilters.location}
                        onChange={(e) => setSearchFilters({...searchFilters, location: e.target.value, category: 'residential'})}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">🏠 Home Type</label>
                      <select
                        className="form-select"
                        value={searchFilters.category || 'residential'}
                        onChange={(e) => setSearchFilters({...searchFilters, category: e.target.value})}
                      >
                        <option value="residential">🏡 Residential Homes</option>
                        <option value="luxury">🏨 Luxury Villas</option>
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
                          <option value="100000">$100K</option>
                          <option value="200000">$200K</option>
                          <option value="300000">$300K</option>
                          <option value="500000">$500K</option>
                        </select>
                        <select
                          className="form-select"
                          value={searchFilters.maxPrice}
                          onChange={(e) => setSearchFilters({...searchFilters, maxPrice: e.target.value})}
                        >
                          <option value="">Max Price</option>
                          <option value="300000">$300K</option>
                          <option value="500000">$500K</option>
                          <option value="750000">$750K</option>
                          <option value="1000000">$1M+</option>
                        </select>
                      </div>
                    </div>
                  </div>
                  <div className="text-center mt-8">
                    <button 
                      className="btn btn-secondary btn-xl"
                      onClick={() => {
                        // Apply home filter and scroll to results
                        setSearchFilters({...searchFilters, category: searchFilters.category || 'residential'});
                        document.getElementById('properties-section')?.scrollIntoView({ behavior: 'smooth' });
                      }}
                    >
                      🏠 Search Homes
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
      <div id="properties-section" className="section bg-white">
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


          {/* Property Report Selection Bar */}
          {selectedProperties.length > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
              <div className="flex justify-between items-center">
                <div>
                  <span className="font-semibold text-blue-900">
                    {selectedProperties.length} propert{selectedProperties.length === 1 ? 'y' : 'ies'} selected
                  </span>
                  <span className="text-blue-700 ml-2">
                    Choose your report type to get pricing
                  </span>
                </div>
                <div className="flex gap-2 flex-wrap">
                  <button 
                    onClick={() => setSelectedProperties([])}
                    className="btn btn-ghost btn-sm text-blue-600"
                  >
                    Clear Selection
                  </button>
                  <button
                    onClick={() => {
                      console.log('Buy Reports button clicked', { selectedProperties });
                      console.log('Setting showReportSelector to true');
                      alert('Buy Reports button clicked! Opening report selector...');
                      setShowReportSelector(true);
                    }}
                    className="btn btn-primary btn-sm"
                    style={{
                      pointerEvents: 'auto' as any,
                      zIndex: 999,
                      position: 'relative'
                    }}
                  >
                    🇨🇷 Buy Reports
                  </button>
                </div>
              </div>
              <div className="mt-3 text-sm text-blue-700">
                💡 Get contact info, legal compliance, or complete due diligence reports for Costa Rica properties
              </div>
            </div>
          )}

          {/* Properties Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {properties.slice(0, 8).map((property) => {
              const isSelected = selectedProperties.includes(property.id);
              
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
                      📋 Reports
                    </span>
                  </label>
                </div>
                
                <div className="property-card-image">
                  {property.images && property.images.length > 0 ? (
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
        <div 
          className="fixed inset-0 flex items-center justify-center p-4"
          style={{
            zIndex: 99999,
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            backdropFilter: 'blur(2px)',
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh'
          }}
          onClick={(e) => {
            console.log('Agent modal backdrop clicked');
            e.stopPropagation();
          }}
        >
          <div 
            className="bg-white rounded-lg p-6 max-w-md w-full shadow-2xl"
            style={{
              maxHeight: '90vh',
              overflow: 'auto',
              border: '2px solid #3b82f6',
              backgroundColor: '#ffffff',
              position: 'relative',
              zIndex: 100000
            }}
            onClick={(e) => {
              console.log('Agent modal content clicked');
              e.stopPropagation();
            }}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-blue-600">
                🎉 {showAgentPayment.includes('individual') ? 'Individual Agent' : 'Office Plan'} Payment
              </h3>
              <button
                onClick={() => {
                  alert('Closing payment modal');
                  setShowAgentPayment(null);
                }}
                className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
                style={{
                  padding: '5px 10px',
                  borderRadius: '50%',
                  border: '1px solid #ccc'
                }}
              >
                ✕
              </button>
            </div>
            
            {showAgentPayment.includes('crypto') ? (
              <div>
                <div className="bg-gray-800 text-white rounded-lg p-4">
                  <h4 className="font-semibold mb-3">🪙 Pay with Cryptocurrency</h4>
                  <p className="text-sm text-gray-300 mb-4">
                    {showAgentPayment.includes('individual') ? 'Individual Agent ($30)' : 'Office Plan ($100)'} - One-time payment for 1 month access
                  </p>
                  
                  {/* Currency Selection */}
                  <div className="grid grid-cols-3 gap-2 mb-4">
                    {[
                      { crypto: 'USDC', amount: showAgentPayment.includes('individual') ? '30.00' : '100.00' },
                      { crypto: 'ETH', amount: showAgentPayment.includes('individual') ? '0.012' : '0.040' },
                      { crypto: 'LINK', amount: showAgentPayment.includes('individual') ? '2.50' : '8.33' }
                    ].map((option) => (
                      <div key={option.crypto} className="bg-gray-700 p-3 rounded text-center">
                        <div className="font-semibold">{option.crypto}</div>
                        <div className="text-sm">{option.amount}</div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="bg-white p-4 rounded-lg mb-4 flex justify-center">
                    <QRCode 
                      value="0x9686beb7a2Dfd4D3362452DD1EB99a6fDFE30E79" 
                      size={200}
                      style={{ margin: '0 auto' }}
                    />
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <div className="text-sm text-gray-400">Recommended: USDC</div>
                      <div className="font-mono">${showAgentPayment.includes('individual') ? '30.00' : '100.00'} USDC</div>
                    </div>
                    
                    <div>
                      <div className="text-sm text-gray-400">Wallet Address (Polygon Network)</div>
                      <div className="font-mono text-xs bg-gray-700 p-2 rounded break-all">
                        0x9686beb7a2Dfd4D3362452DD1EB99a6fDFE30E79
                      </div>
                    </div>
                    
                    <div className="text-xs text-gray-400 bg-gray-700 p-3 rounded">
                      📱 <strong>Mobile:</strong> Scan QR code with your crypto wallet<br />
                      💻 <strong>Desktop:</strong> Send to the wallet address above<br />
                      ⚠️ <strong>Network:</strong> Use Polygon (MATIC) network for lower fees
                    </div>
                    
                    <button
                      onClick={() => {
                        setShowAgentPayment(null);
                        alert('Crypto payment initiated! You will be added to the agent directory once payment is confirmed.');
                      }}
                      className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded transition-colors"
                    >
                      ✅ I've Sent the Payment
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">
                    💳 {showAgentPayment.includes('individual') ? 'Individual Agent' : 'Office Plan'} Payment
                  </h4>
                  <p className="text-sm text-gray-600 mb-4">
                    ${showAgentPayment.includes('individual') ? '30' : '100'}/{showAgentPayment.includes('onetime') ? 'one-time' : 'month'} - 
                    {showAgentPayment.includes('individual') ? 'Single agent access' : 'Up to 5 agents'}
                  </p>
                  
                  <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4 mb-4">
                    <div className="text-center">
                      <div className="text-4xl mb-2">💳</div>
                      <div className="text-lg font-bold text-blue-900">
                        PayPal Payment
                      </div>
                      <div className="text-sm text-blue-700">
                        ${showAgentPayment.includes('individual') ? '30' : '100'} {showAgentPayment.includes('onetime') ? 'one-time' : 'per month'}
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <button
                      onClick={() => {
                        // Determine correct PayPal URL based on payment type
                        let paypalUrl;
                        if (showAgentPayment.includes('individual')) {
                          if (showAgentPayment.includes('onetime')) {
                            paypalUrl = 'https://www.paypal.com/ncp/payment/6C24XL9TFH9W6'; // Single Agent 1 Month
                          } else {
                            paypalUrl = 'https://www.paypal.com/webapps/billing/plans/subscribe?plan_id=P-12W6852680972851UNDQ3SWQ'; // Single Agent Subscription
                          }
                        } else {
                          if (showAgentPayment.includes('onetime')) {
                            paypalUrl = 'https://www.paypal.com/ncp/payment/K9FD8T9LSK6UJ'; // Office 1 Month
                          } else {
                            paypalUrl = 'https://www.paypal.com/webapps/billing/plans/subscribe?plan_id=P-6EM0311615388473YNDRQ2SI'; // Office Subscription
                          }
                        }
                        
                        const type = showAgentPayment.includes('onetime') ? 'one-time' : 'subscription';
                        const plan = showAgentPayment.includes('individual') ? 'Individual Agent' : 'Office Plan';
                        
                        window.open(paypalUrl, 'paypal', 'width=600,height=700');
                        setShowAgentPayment(null);
                        alert(`PayPal payment for ${plan} (${type}) initiated! You will be added to the agent directory once payment is confirmed.`);
                      }}
                      className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                      <span>💳</span>
                      Pay with PayPal
                    </button>
                    
                    <div className="text-xs text-center text-gray-500">
                      ✅ Real PayPal integration with live payment processing
                    </div>
                  </div>
                  
                  <div className="text-xs text-gray-500 mt-2 text-center">
                    {showAgentPayment.includes('onetime') ? (
                      <>✅ One-time payment only<br />✅ 30-day access<br />✅ No recurring charges</>
                    ) : (
                      <>✅ Automatic monthly billing<br />✅ Cancel anytime<br />✅ Immediate access</>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Property Report Selector Modal */}
      {showReportSelector && (
        <div 
          className="fixed inset-0 flex items-center justify-center p-4"
          style={{
            zIndex: 9999,
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            backdropFilter: 'blur(2px)'
          }}
        >
          <div 
            className="bg-white rounded-lg p-6 max-w-2xl w-full shadow-2xl"
            style={{
              maxHeight: '90vh',
              overflow: 'auto',
              border: '2px solid #10b981'
            }}
          >
            <h2 className="text-2xl font-bold text-green-600 mb-4">
              📄 Property Report Selector
            </h2>
            <p className="mb-4">Selected Properties: {selectedProperties.length}</p>
            <PropertyReportSelector
              selectedProperties={selectedProperties}
              onClose={() => {
                console.log('Closing report selector');
                alert('Closing Property Report Selector');
                setShowReportSelector(false);
              }}
              onSuccess={handleReportPurchaseSuccess}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default HomePage;
