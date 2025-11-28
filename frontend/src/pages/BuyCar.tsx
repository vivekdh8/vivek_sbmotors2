import React, { useState, useEffect } from 'react';
import { ShoppingCart, X, ArrowRight } from 'lucide-react';
import type { CarData } from '../types';

const API_BASE = 'http://localhost:8000/api';

interface BuyCarProps {
    addToCart: (carId: string) => void;
}

interface RawCarData {
    id: string;
    make?: string;
    model?: string;
    year?: number;
    price?: number;
    mileage?: number;
    fuel?: string;
    transmission?: string;
    owner?: string;
    type?: string;
    image?: string;
    description?: string;
    features?: string[];
    status?: string;
    specs?: { hp: number };
}

const BuyCar: React.FC<BuyCarProps> = ({ addToCart }) => {
    const [selectedBodyStyle, setSelectedBodyStyle] = useState('all');
    const [cars, setCars] = useState<CarData[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedCar, setSelectedCar] = useState<CarData | null>(null);
    const [showCarDetails, setShowCarDetails] = useState(false);

    useEffect(() => {
        const fetchCars = () => {
            setLoading(true);
            const query = selectedBodyStyle === 'all' ? '' : `?type=${selectedBodyStyle}`;
            fetch(`${API_BASE}/cars${query}`)
                .then(res => res.json())
                .then(data => {
                    if (!Array.isArray(data)) data = [];
                    const adaptedCars = data.map((car: RawCarData) => ({
                        id: car.id,
                        name: `${car.make ?? ''} ${car.model ?? ''}`.trim(),
                        year: car.year ?? "N/A",
                        price: `₹${car.price?.toLocaleString() ?? 0}`,
                        mileage: `${car.mileage?.toLocaleString() ?? 0} km`,
                        fuel: car.fuel ?? "Petrol",
                        transmission: car.transmission ?? "Manual",
                        owner: car.owner ?? "1st Owner",
                        type: car.type ?? "sedan",
                        image: car.image ?? "",
                        description: car.description ?? "Great condition vehicle.",
                        features: car.features ?? ['AC', 'Power Steering'],
                        status: car.status ?? "available",
                        specs: car.specs ?? { hp: 0 }
                    }));
                    setCars(adaptedCars);
                    setLoading(false);
                })
                .catch(err => {
                    console.error("Failed to fetch cars:", err);
                    setLoading(false);
                });
        };

        fetchCars();
    }, [selectedBodyStyle]);

    const handleCarClick = (car: CarData) => {
        setSelectedCar(car);
        setShowCarDetails(true);
    };

    const closeCarDetails = () => {
        setShowCarDetails(false);
        setTimeout(() => setSelectedCar(null), 300);
    };

    const getCarImageUrl = (image: string) => {
        if (!image) return 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?auto=format&fit=crop&q=80';
        if (image.startsWith('http')) return image;
        return `http://localhost:8000${image}`;
    };

    const filteredCars = cars.filter(c => c.status === "available");

    return (
        <div className="min-h-screen py-32 px-6" style={{ backgroundColor: '#f2f0ea' }}>
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-16">
                    <h2 className="text-luxury-gold text-sm tracking-[0.4em] uppercase mb-4 font-semibold">Inventory</h2>
                    <h1 className="text-4xl md:text-5xl font-serif text-luxury-text mb-6">Curated Collection</h1>

                    {/* Filter Buttons */}
                    <div className="flex flex-wrap justify-center gap-4 mt-8">
                        {['all', 'sedan', 'suv', 'coupe', 'convertible'].map((type) => (
                            <button
                                key={type}
                                onClick={() => setSelectedBodyStyle(type)}
                                className={`px-8 py-3 rounded-full text-sm tracking-widest uppercase transition-all duration-300 ${selectedBodyStyle === type
                                    ? 'bg-luxury-gold text-luxury-text font-bold shadow-lg shadow-luxury-gold/20'
                                    : 'border border-luxury-text/20 text-luxury-text hover:border-luxury-gold hover:text-luxury-gold bg-transparent'
                                    }`}
                            >
                                {type}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Loading State */}
                {loading ? (
                    <div className="flex justify-center py-32">
                        <div className="w-12 h-12 border-2 border-luxury-gold border-t-transparent rounded-full animate-spin"></div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredCars.map(car => (
                            <div key={car.id} className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 border border-luxury-gold/10 hover:-translate-y-2">
                                <div className="relative h-64 overflow-hidden">
                                    <div className="absolute inset-0 bg-luxury-black/20 group-hover:bg-transparent transition-colors z-10" />
                                    <img
                                        src={getCarImageUrl(car.image)}
                                        alt={car.name}
                                        className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                                        onError={(e) => {
                                            e.currentTarget.src = 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?auto=format&fit=crop&q=80';
                                        }}
                                    />
                                    <div className="absolute top-4 right-4 z-20 bg-white/90 backdrop-blur px-4 py-2 rounded-full">
                                        <span className="text-luxury-text font-serif font-medium">{car.price}</span>
                                    </div>
                                </div>

                                <div className="p-8">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <p className="text-luxury-gold text-xs tracking-widest uppercase mb-2">{car.type}</p>
                                            <h3 className="text-2xl font-serif text-luxury-text">{car.name}</h3>
                                        </div>
                                        <div className="bg-luxury-beige p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-2 group-hover:translate-y-0">
                                            <ArrowRight className="w-5 h-5 text-luxury-text" />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-3 gap-4 py-6 border-t border-gray-100">
                                        <div className="text-center">
                                            <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">Year</p>
                                            <p className="text-luxury-text font-medium">{car.year}</p>
                                        </div>
                                        <div className="text-center border-l border-gray-100">
                                            <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">Mileage</p>
                                            <p className="text-luxury-text font-medium">{car.mileage}</p>
                                        </div>
                                        <div className="text-center border-l border-gray-100">
                                            <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">Power</p>
                                            <p className="text-luxury-text font-medium">{car.specs?.hp || 'N/A'} HP</p>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => handleCarClick(car)}
                                        className="w-full py-4 border border-luxury-text/10 text-luxury-text hover:bg-luxury-text hover:text-white transition-colors uppercase tracking-widest text-xs font-medium rounded-lg"
                                    >
                                        View Details
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Car Details Modal */}
            {showCarDetails && selectedCar && (
                <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4" onClick={closeCarDetails}>
                    <div className="bg-luxury-charcoal border border-white/10 max-w-4xl w-full max-h-[90vh] overflow-y-auto rounded-xl" onClick={e => e.stopPropagation()}>
                        <div className="grid md:grid-cols-2">
                            {/* Image */}
                            <div className="relative h-64 md:h-auto bg-black">
                                <img
                                    src={getCarImageUrl(selectedCar.image)}
                                    alt={selectedCar.name}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                        e.currentTarget.src = 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?auto=format&fit=crop&q=80';
                                    }}
                                />
                                <button onClick={closeCarDetails} className="absolute top-4 left-4 bg-black/50 p-2 text-white hover:bg-black transition rounded-full">
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            {/* Details */}
                            <div className="p-8 md:p-12">
                                <div className="mb-8">
                                    <h2 className="text-3xl md:text-4xl font-serif text-white mb-2">{selectedCar.name}</h2>
                                    <p className="text-luxury-gold text-xl font-serif">{selectedCar.price}</p>
                                </div>

                                <div className="grid grid-cols-2 gap-6 mb-8">
                                    <div>
                                        <p className="text-xs text-gray-500 mb-1">Mileage</p>
                                        <p className="text-white">{selectedCar.mileage}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 mb-1">Year</p>
                                        <p className="text-white">{selectedCar.year}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 mb-1">Fuel</p>
                                        <p className="text-white">{selectedCar.fuel}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 mb-1">Transmission</p>
                                        <p className="text-white">{selectedCar.transmission}</p>
                                    </div>
                                </div>

                                <div className="mb-8">
                                    <h3 className="text-sm text-gray-500 mb-4">Features</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {selectedCar.features?.map((f, i) => (
                                            <span key={i} className="px-3 py-1 border border-white/10 text-gray-300 text-xs rounded-full">
                                                {f}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex flex-col gap-4">
                                    <button onClick={() => { closeCarDetails(); addToCart(selectedCar.id); }} className="btn-gold w-full text-center rounded-lg">
                                        Add to Cart
                                    </button>
                                    <button onClick={closeCarDetails} className="btn-outline w-full text-center rounded-lg text-white border-white/20 hover:bg-white/10">
                                        Close
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BuyCar;
