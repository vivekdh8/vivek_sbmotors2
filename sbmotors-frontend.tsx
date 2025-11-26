import React, { useState } from 'react';
import { Car, DollarSign, Shield, Wrench, Phone, Mail, MapPin, ChevronRight, Menu, X, ArrowLeft, ChevronDown, Moon, Sun } from 'lucide-react';

const SBMotorsWebsite = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedBodyStyle, setSelectedBodyStyle] = useState('all');
  const [selectedCar, setSelectedCar] = useState(null);
  const [showCarDetails, setShowCarDetails] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);

  const bodyStyles = [
    { id: 'all', name: 'All Vehicles', icon: '🚗' },
    { id: 'sedan', name: 'Sedan', icon: '🚙' },
    { id: 'suv', name: 'SUV', icon: '🚙' },
    { id: 'hatchback', name: 'Hatchback', icon: '🚗' },
    { id: 'luxury', name: 'Luxury', icon: '✨' }
  ];

  const features = [
    {
      icon: <DollarSign className="w-12 h-12 text-blue-600" />,
      title: 'Special Financing Offers',
      description: 'Our stress-free finance department can find financial solutions to save you money.'
    },
    {
      icon: <Shield className="w-12 h-12 text-blue-600" />,
      title: 'Trusted Car Dealership',
      description: 'Transparent pricing and honest dealings with every customer interaction.'
    },
    {
      icon: <Car className="w-12 h-12 text-blue-600" />,
      title: 'Transparent Pricing',
      description: 'Clear and upfront pricing with no hidden fees or surprises.'
    },
    {
      icon: <Wrench className="w-12 h-12 text-blue-600" />,
      title: 'Expert Car Service',
      description: 'Professional maintenance and service for all vehicle types.'
    }
  ];

  const partners = [
    'Bank of India', 'Bank of Baroda', 'Toyota Financial', 'Axis Bank',
    'Kotak Mahindra', 'HDFC Bank', 'ICICI Bank', 'Hero FinCorp',
    'HDB Financial', 'Tata Capital', 'Mahindra Finance', 'TVS Credit', 'Bajaj Finserv'
  ];

  const cars = [
    {
      id: 1,
      name: 'Maruti Swift VXI',
      year: 2021,
      price: '₹5,50,000',
      km: '25,000 km',
      fuel: 'Petrol',
      transmission: 'Manual',
      owner: '1st Owner',
      type: 'hatchback',
      image: '🚗',
      description: 'Well-maintained Maruti Swift in excellent condition. Regular service history available.',
      features: ['ABS', 'Power Steering', 'AC', 'Power Windows', 'Airbags']
    },
    {
      id: 2,
      name: 'Hyundai Creta SX',
      year: 2020,
      price: '₹12,50,000',
      km: '35,000 km',
      fuel: 'Diesel',
      transmission: 'Automatic',
      owner: '1st Owner',
      type: 'suv',
      image: '🚙',
      description: 'Premium SUV with advanced features. Single owner, well maintained.',
      features: ['Sunroof', 'Leather Seats', 'Touchscreen', 'Reverse Camera', 'Cruise Control']
    },
    {
      id: 3,
      name: 'Honda City ZX',
      year: 2022,
      price: '₹11,20,000',
      km: '15,000 km',
      fuel: 'Petrol',
      transmission: 'CVT',
      owner: '1st Owner',
      type: 'sedan',
      image: '🚗',
      description: 'Latest model Honda City with minimal usage. Like new condition.',
      features: ['Sunroof', 'Alloy Wheels', 'LED Headlamps', 'Smart Key', 'Climate Control']
    },
    {
      id: 4,
      name: 'Mahindra Thar LX',
      year: 2021,
      price: '₹13,80,000',
      km: '20,000 km',
      fuel: 'Diesel',
      transmission: 'Manual',
      owner: '1st Owner',
      type: 'suv',
      image: '🚙',
      description: 'Adventure-ready Thar in pristine condition. Perfect for off-road enthusiasts.',
      features: ['4x4', 'Touchscreen', 'Roof Mounted Speakers', 'LED DRLs', 'Off-road Tires']
    },
    {
      id: 5,
      name: 'Tata Nexon XZ+',
      year: 2022,
      price: '₹9,80,000',
      km: '18,000 km',
      fuel: 'Petrol',
      transmission: 'AMT',
      owner: '1st Owner',
      type: 'suv',
      image: '🚙',
      description: 'Feature-packed compact SUV with excellent safety ratings.',
      features: ['Sunroof', 'Touchscreen', 'Connected Car', 'Reverse Camera', 'Digital Cluster']
    },
    {
      id: 6,
      name: 'Hyundai i20 Sportz',
      year: 2021,
      price: '₹7,50,000',
      km: '22,000 km',
      fuel: 'Petrol',
      transmission: 'Manual',
      owner: '1st Owner',
      type: 'hatchback',
      image: '🚗',
      description: 'Stylish hatchback with modern features and great fuel efficiency.',
      features: ['Touchscreen', 'Wireless Charging', 'Projector Headlamps', 'Auto AC', 'Rear AC Vents']
    },
    {
      id: 7,
      name: 'Toyota Fortuner 4x4',
      year: 2019,
      price: '₹28,50,000',
      km: '45,000 km',
      fuel: 'Diesel',
      transmission: 'Automatic',
      owner: '1st Owner',
      type: 'luxury',
      image: '✨',
      description: 'Premium luxury SUV with powerful performance and comfort.',
      features: ['4WD', 'Leather Seats', 'Sunroof', '7 Airbags', 'Hill Assist', 'Cruise Control']
    },
    {
      id: 8,
      name: 'Maruti Baleno Alpha',
      year: 2022,
      price: '₹8,20,000',
      km: '12,000 km',
      fuel: 'Petrol',
      transmission: 'CVT',
      owner: '1st Owner',
      type: 'hatchback',
      image: '🚗',
      description: 'Premium hatchback with automatic transmission and latest features.',
      features: ['Smart Play Studio', 'LED Projector Headlamps', '360 View Camera', 'Heads Up Display']
    }
  ];

  const filteredCars = selectedBodyStyle === 'all' 
    ? cars 
    : cars.filter(car => car.type === selectedBodyStyle);

  const handleCarClick = (car) => {
    setSelectedCar(car);
    setShowCarDetails(true);
  };

  const closeCarDetails = () => {
    setShowCarDetails(false);
    setTimeout(() => setSelectedCar(null), 300);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header with Navigation Menu */}
      <header className="bg-white shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            {/* Logo */}
            <div className="flex items-center space-x-4">
              {showCarDetails && (
                <button
                  onClick={closeCarDetails}
                  className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 transition"
                >
                  <ArrowLeft className="w-5 h-5" />
                  <span className="font-medium hidden sm:inline">Back</span>
                </button>
              )}
              <a href="#home" className="flex items-center space-x-2">
                <Car className="w-8 h-8 text-blue-600" />
                <span className="text-2xl font-bold text-gray-900">SB MOTORS</span>
              </a>
            </div>
            
            {/* Desktop Navigation Menu */}
            <nav className="hidden lg:block">
              <ul className="flex items-center space-x-1">
                {/* Home */}
                <li>
                  <a
                    href="#home"
                    className="px-4 py-2 rounded-lg text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-all font-medium inline-block"
                  >
                    Home
                  </a>
                </li>

                {/* Buy Car Dropdown */}
                <li
                  className="relative group"
                  onMouseEnter={() => setActiveDropdown('buy')}
                  onMouseLeave={() => setActiveDropdown(null)}
                >
                  <button className="flex items-center space-x-1 px-4 py-2 rounded-lg text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-all font-medium">
                    <span>Buy Car</span>
                    <ChevronDown className="w-4 h-4" />
                  </button>
                  {activeDropdown === 'buy' && (
                    <div className="absolute top-full left-0 mt-2 bg-white rounded-lg shadow-2xl border border-gray-100 py-3 w-64 z-50">
                      <a href="#inventory" className="block px-4 py-3 hover:bg-blue-50 transition-colors group/item">
                        <div className="font-semibold text-gray-900 text-sm group-hover/item:text-blue-600">All Vehicles</div>
                        <div className="text-xs text-gray-500 mt-1">Browse our complete inventory</div>
                      </a>
                      <a href="#inventory" onClick={() => setSelectedBodyStyle('sedan')} className="block px-4 py-3 hover:bg-blue-50 transition-colors group/item">
                        <div className="font-semibold text-gray-900 text-sm group-hover/item:text-blue-600">Sedans</div>
                        <div className="text-xs text-gray-500 mt-1">Comfortable family cars</div>
                      </a>
                      <a href="#inventory" onClick={() => setSelectedBodyStyle('suv')} className="block px-4 py-3 hover:bg-blue-50 transition-colors group/item">
                        <div className="font-semibold text-gray-900 text-sm group-hover/item:text-blue-600">SUVs</div>
                        <div className="text-xs text-gray-500 mt-1">Powerful and spacious vehicles</div>
                      </a>
                      <a href="#inventory" onClick={() => setSelectedBodyStyle('hatchback')} className="block px-4 py-3 hover:bg-blue-50 transition-colors group/item">
                        <div className="font-semibold text-gray-900 text-sm group-hover/item:text-blue-600">Hatchbacks</div>
                        <div className="text-xs text-gray-500 mt-1">Compact and efficient</div>
                      </a>
                      <a href="#inventory" onClick={() => setSelectedBodyStyle('luxury')} className="block px-4 py-3 hover:bg-blue-50 transition-colors group/item">
                        <div className="font-semibold text-gray-900 text-sm group-hover/item:text-blue-600">Luxury Cars</div>
                        <div className="text-xs text-gray-500 mt-1">Premium vehicles</div>
                      </a>
                    </div>
                  )}
                </li>

                {/* Sell Car Dropdown */}
                <li
                  className="relative group"
                  onMouseEnter={() => setActiveDropdown('sell')}
                  onMouseLeave={() => setActiveDropdown(null)}
                >
                  <button className="flex items-center space-x-1 px-4 py-2 rounded-lg text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-all font-medium">
                    <span>Sell Car</span>
                    <ChevronDown className="w-4 h-4" />
                  </button>
                  {activeDropdown === 'sell' && (
                    <div className="absolute top-full left-0 mt-2 bg-white rounded-lg shadow-2xl border border-gray-100 py-3 w-64 z-50">
                      <a href="#sell" className="block px-4 py-3 hover:bg-blue-50 transition-colors group/item">
                        <div className="font-semibold text-gray-900 text-sm group-hover/item:text-blue-600">Get Instant Quote</div>
                        <div className="text-xs text-gray-500 mt-1">Quick valuation of your vehicle</div>
                      </a>
                      <a href="#sell" className="block px-4 py-3 hover:bg-blue-50 transition-colors group/item">
                        <div className="font-semibold text-gray-900 text-sm group-hover/item:text-blue-600">Book Inspection</div>
                        <div className="text-xs text-gray-500 mt-1">Schedule a free inspection</div>
                      </a>
                      <a href="#sell" className="block px-4 py-3 hover:bg-blue-50 transition-colors group/item">
                        <div className="font-semibold text-gray-900 text-sm group-hover/item:text-blue-600">Required Documents</div>
                        <div className="text-xs text-gray-500 mt-1">What you need to sell</div>
                      </a>
                    </div>
                  )}
                </li>

                {/* Car Service Dropdown */}
                <li
                  className="relative group"
                  onMouseEnter={() => setActiveDropdown('service')}
                  onMouseLeave={() => setActiveDropdown(null)}
                >
                  <button className="flex items-center space-x-1 px-4 py-2 rounded-lg text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-all font-medium">
                    <span>Car Service</span>
                    <ChevronDown className="w-4 h-4" />
                  </button>
                  {activeDropdown === 'service' && (
                    <div className="absolute top-full left-0 mt-2 bg-white rounded-lg shadow-2xl border border-gray-100 py-3 w-64 z-50">
                      <a href="#services" className="block px-4 py-3 hover:bg-blue-50 transition-colors group/item">
                        <div className="font-semibold text-gray-900 text-sm group-hover/item:text-blue-600">General Service</div>
                        <div className="text-xs text-gray-500 mt-1">Regular maintenance</div>
                      </a>
                      <a href="#services" className="block px-4 py-3 hover:bg-blue-50 transition-colors group/item">
                        <div className="font-semibold text-gray-900 text-sm group-hover/item:text-blue-600">AC Service</div>
                        <div className="text-xs text-gray-500 mt-1">AC repair and servicing</div>
                      </a>
                      <a href="#services" className="block px-4 py-3 hover:bg-blue-50 transition-colors group/item">
                        <div className="font-semibold text-gray-900 text-sm group-hover/item:text-blue-600">Body Work</div>
                        <div className="text-xs text-gray-500 mt-1">Denting and painting</div>
                      </a>
                      <a href="#services" className="block px-4 py-3 hover:bg-blue-50 transition-colors group/item">
                        <div className="font-semibold text-gray-900 text-sm group-hover/item:text-blue-600">Detailing</div>
                        <div className="text-xs text-gray-500 mt-1">Professional car cleaning</div>
                      </a>
                    </div>
                  )}
                </li>

                {/* About */}
                <li>
                  <a
                    href="#about"
                    className="px-4 py-2 rounded-lg text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-all font-medium inline-block"
                  >
                    About
                  </a>
                </li>

                {/* Contact */}
                <li>
                  <a
                    href="#contact"
                    className="px-4 py-2 rounded-lg text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-all font-medium inline-block"
                  >
                    Contact
                  </a>
                </li>
              </ul>
            </nav>

            {/* Mobile Menu Button */}
            <button 
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <nav className="lg:hidden pb-4 border-t border-gray-100 pt-4">
              <ul className="space-y-1">
                <li>
                  <a href="#home" className="block py-3 px-4 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition font-medium" onClick={() => setMobileMenuOpen(false)}>
                    Home
                  </a>
                </li>
                <li>
                  <button
                    onClick={() => setActiveDropdown(activeDropdown === 'buy' ? null : 'buy')}
                    className="w-full flex items-center justify-between py-3 px-4 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition font-medium"
                  >
                    <span>Buy Car</span>
                    <ChevronDown className={`w-4 h-4 transition-transform ${activeDropdown === 'buy' ? 'rotate-180' : ''}`} />
                  </button>
                  {activeDropdown === 'buy' && (
                    <ul className="pl-4 mt-1 space-y-1">
                      <li><a href="#inventory" className="block py-2 px-4 text-sm text-gray-600 hover:bg-blue-50 hover:text-blue-600 rounded-lg" onClick={() => {setMobileMenuOpen(false); setActiveDropdown(null);}}>All Vehicles</a></li>
                      <li><a href="#inventory" className="block py-2 px-4 text-sm text-gray-600 hover:bg-blue-50 hover:text-blue-600 rounded-lg" onClick={() => {setSelectedBodyStyle('sedan'); setMobileMenuOpen(false); setActiveDropdown(null);}}>Sedans</a></li>
                      <li><a href="#inventory" className="block py-2 px-4 text-sm text-gray-600 hover:bg-blue-50 hover:text-blue-600 rounded-lg" onClick={() => {setSelectedBodyStyle('suv'); setMobileMenuOpen(false); setActiveDropdown(null);}}>SUVs</a></li>
                      <li><a href="#inventory" className="block py-2 px-4 text-sm text-gray-600 hover:bg-blue-50 hover:text-blue-600 rounded-lg" onClick={() => {setSelectedBodyStyle('hatchback'); setMobileMenuOpen(false); setActiveDropdown(null);}}>Hatchbacks</a></li>
                      <li><a href="#inventory" className="block py-2 px-4 text-sm text-gray-600 hover:bg-blue-50 hover:text-blue-600 rounded-lg" onClick={() => {setSelectedBodyStyle('luxury'); setMobileMenuOpen(false); setActiveDropdown(null);}}>Luxury Cars</a></li>
                    </ul>
                  )}
                </li>
                <li>
                  <button
                    onClick={() => setActiveDropdown(activeDropdown === 'sell' ? null : 'sell')}
                    className="w-full flex items-center justify-between py-3 px-4 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition font-medium"
                  >
                    <span>Sell Car</span>
                    <ChevronDown className={`w-4 h-4 transition-transform ${activeDropdown === 'sell' ? 'rotate-180' : ''}`} />
                  </button>
                  {activeDropdown === 'sell' && (
                    <ul className="pl-4 mt-1 space-y-1">
                      <li><a href="#sell" className="block py-2 px-4 text-sm text-gray-600 hover:bg-blue-50 hover:text-blue-600 rounded-lg" onClick={() => {setMobileMenuOpen(false); setActiveDropdown(null);}}>Get Instant Quote</a></li>
                      <li><a href="#sell" className="block py-2 px-4 text-sm text-gray-600 hover:bg-blue-50 hover:text-blue-600 rounded-lg" onClick={() => {setMobileMenuOpen(false); setActiveDropdown(null);}}>Book Inspection</a></li>
                      <li><a href="#sell" className="block py-2 px-4 text-sm text-gray-600 hover:bg-blue-50 hover:text-blue-600 rounded-lg" onClick={() => {setMobileMenuOpen(false); setActiveDropdown(null);}}>Required Documents</a></li>
                    </ul>
                  )}
                </li>
                <li>
                  <button
                    onClick={() => setActiveDropdown(activeDropdown === 'service' ? null : 'service')}
                    className="w-full flex items-center justify-between py-3 px-4 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition font-medium"
                  >
                    <span>Car Service</span>
                    <ChevronDown className={`w-4 h-4 transition-transform ${activeDropdown === 'service' ? 'rotate-180' : ''}`} />
                  </button>
                  {activeDropdown === 'service' && (
                    <ul className="pl-4 mt-1 space-y-1">
                      <li><a href="#services" className="block py-2 px-4 text-sm text-gray-600 hover:bg-blue-50 hover:text-blue-600 rounded-lg" onClick={() => {setMobileMenuOpen(false); setActiveDropdown(null);}}>General Service</a></li>
                      <li><a href="#services" className="block py-2 px-4 text-sm text-gray-600 hover:bg-blue-50 hover:text-blue-600 rounded-lg" onClick={() => {setMobileMenuOpen(false); setActiveDropdown(null);}}>AC Service</a></li>
                      <li><a href="#services" className="block py-2 px-4 text-sm text-gray-600 hover:bg-blue-50 hover:text-blue-600 rounded-lg" onClick={() => {setMobileMenuOpen(false); setActiveDropdown(null);}}>Body Work</a></li>
                      <li><a href="#services" className="block py-2 px-4 text-sm text-gray-600 hover:bg-blue-50 hover:text-blue-600 rounded-lg" onClick={() => {setMobileMenuOpen(false); setActiveDropdown(null);}}>Detailing</a></li>
                    </ul>
                  )}
                </li>
                <li>
                  <a href="#about" className="block py-3 px-4 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition font-medium" onClick={() => setMobileMenuOpen(false)}>
                    About
                  </a>
                </li>
                <li>
                  <a href="#contact" className="block py-3 px-4 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition font-medium" onClick={() => setMobileMenuOpen(false)}>
                    Contact
                  </a>
                </li>
              </ul>
            </nav>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20" id="home">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-4">
              North Karnataka's Largest Used Car Dealership
            </h1>
            <p className="text-xl md:text-2xl mb-8">
              Find Your Perfect Vehicle Online
            </p>
            <button className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition transform hover:scale-105">
              Browse Inventory
            </button>
          </div>
        </div>
      </section>

      {/* Body Style Selection */}
      <section className="py-12 bg-gray-50" id="inventory">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-8">Select a Body Style</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {bodyStyles.map((style) => (
              <button
                key={style.id}
                onClick={() => setSelectedBodyStyle(style.id)}
                className={`p-6 rounded-lg transition transform hover:scale-105 ${
                  selectedBodyStyle === style.id
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'bg-white text-gray-800 hover:bg-gray-100 shadow'
                }`}
              >
                <div className="text-4xl mb-2">{style.icon}</div>
                <div className="font-semibold">{style.name}</div>
              </button>
            ))}
          </div>

          {/* Car Listings */}
          <div className="mt-12">
            <h3 className="text-2xl font-bold mb-6">Available Vehicles ({filteredCars.length})</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredCars.map((car) => (
                <div
                  key={car.id}
                  onClick={() => handleCarClick(car)}
                  className="bg-white rounded-lg shadow-lg hover:shadow-xl transition transform hover:-translate-y-2 cursor-pointer overflow-hidden"
                >
                  <div className="bg-gradient-to-br from-blue-50 to-gray-100 h-40 flex items-center justify-center text-6xl">
                    {car.image}
                  </div>
                  <div className="p-4">
                    <h4 className="font-bold text-lg mb-2">{car.name}</h4>
                    <div className="text-sm text-gray-600 space-y-1 mb-3">
                      <p>{car.year} • {car.km}</p>
                      <p>{car.fuel} • {car.transmission}</p>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-blue-600">{car.price}</span>
                      <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition text-sm font-semibold">
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16" id="services">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
            We're BIG On What Matters To You
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mt-12">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition transform hover:-translate-y-2"
              >
                <div className="mb-4">{feature.icon}</div>
                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-16 bg-gray-50" id="sell">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-gradient-to-br from-blue-600 to-blue-700 p-8 rounded-lg text-white shadow-xl transform hover:scale-105 transition">
              <h3 className="text-2xl font-bold mb-4">Are You Looking For a Car?</h3>
              <p className="mb-6">We are committed to providing our customers with exceptional service.</p>
              <button className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition flex items-center">
                Get Started <ChevronRight className="ml-2 w-5 h-5" />
              </button>
            </div>
            <div className="bg-gradient-to-br from-gray-700 to-gray-800 p-8 rounded-lg text-white shadow-xl transform hover:scale-105 transition">
              <h3 className="text-2xl font-bold mb-4">Do You Want to Sell a Car?</h3>
              <p className="mb-6">We are committed to providing our customers with exceptional service.</p>
              <button className="bg-white text-gray-800 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition flex items-center">
                Get Started <ChevronRight className="ml-2 w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Partners Section */}
      <section className="py-16" id="about">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">Our Partners</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {partners.map((partner, index) => (
              <div
                key={index}
                className="bg-white p-4 rounded-lg shadow hover:shadow-lg transition flex items-center justify-center h-24"
              >
                <span className="text-sm font-semibold text-gray-700 text-center">
                  {partner}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 bg-blue-600 text-white" id="contact">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-4">
            Have More Questions? Don't Hesitate To Reach Us
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
            <div className="flex items-start space-x-4">
              <MapPin className="w-6 h-6 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-bold mb-2">Address</h3>
                <p>Sy No 80/2 Kapnoor Industrial area</p>
                <p>Humnabad Road Kalaburagi 585104</p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <Phone className="w-6 h-6 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-bold mb-2">Phone</h3>
                <p>+91 97423 71777</p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <Mail className="w-6 h-6 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-bold mb-2">Email</h3>
                <p>sharanu.ratkal@sbmotors.in</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p>&copy; 2024 SB Motors. All rights reserved.</p>
          <p className="mt-2">Authorized Channel Partner of CARS24 | ISUZU Authorized Dealer</p>
        </div>
      </footer>

      {/* Car Details Modal */}
      {showCarDetails && selectedCar && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
          onClick={closeCarDetails}
        >
          <div 
            className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">{selectedCar.name}</h2>
              <button 
                onClick={closeCarDetails}
                className="text-gray-500 hover:text-gray-700 transition"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6">
              {/* Car Image */}
              <div className="bg-gradient-to-br from-blue-50 to-gray-100 h-64 rounded-lg flex items-center justify-center text-9xl mb-6">
                {selectedCar.image}
              </div>

              {/* Price */}
              <div className="text-center mb-6">
                <span className="text-4xl font-bold text-blue-600">{selectedCar.price}</span>
              </div>

              {/* Quick Info Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-gray-50 p-4 rounded-lg text-center">
                  <p className="text-sm text-gray-600">Year</p>
                  <p className="font-bold text-lg">{selectedCar.year}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg text-center">
                  <p className="text-sm text-gray-600">KM Driven</p>
                  <p className="font-bold text-lg">{selectedCar.km}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg text-center">
                  <p className="text-sm text-gray-600">Fuel Type</p>
                  <p className="font-bold text-lg">{selectedCar.fuel}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg text-center">
                  <p className="text-sm text-gray-600">Transmission</p>
                  <p className="font-bold text-lg">{selectedCar.transmission}</p>
                </div>
              </div>

              {/* Description */}
              <div className="mb-6">
                <h3 className="text-xl font-bold mb-2">Description</h3>
                <p className="text-gray-700">{selectedCar.description}</p>
              </div>

              {/* Features */}
              <div className="mb-6">
                <h3 className="text-xl font-bold mb-3">Key Features</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {selectedCar.features.map((feature, index) => (
                    <div key={index} className="flex items-center space-x-2 bg-blue-50 p-3 rounded-lg">
                      <ChevronRight className="w-5 h-5 text-blue-600" />
                      <span className="text-sm font-medium">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Owner Info */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                <p className="text-green-800 font-semibold">✓ {selectedCar.owner} - Well Maintained</p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <button className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition">
                  Schedule Test Drive
                </button>
                <button className="flex-1 bg-gray-800 text-white py-3 rounded-lg font-semibold hover:bg-gray-700 transition flex items-center justify-center">
                  <Phone className="w-5 h-5 mr-2" />
                  Call Now
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SBMotorsWebsite;