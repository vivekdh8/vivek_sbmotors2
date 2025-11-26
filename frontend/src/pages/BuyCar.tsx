import React, { useState, useEffect } from 'react';
import { ShoppingCart, X } from 'lucide-react';
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
                        km: `${car.mileage?.toLocaleString() ?? 0} km`,
                        fuel: car.fuel ?? "Petrol",
                        transmission: car.transmission ?? "Manual",
                        owner: car.owner ?? "1st Owner",
                        type: car.type ?? "sedan",
                        image: car.image ?? "",
                        description: car.description ?? "Great condition vehicle.",
                        features: car.features ?? ['AC', 'Power Steering'],
                        status: car.status ?? "available"
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

    return (
        <div className="bg-luxury-black min-h-screen py-32">
            <div className="max-w-7xl mx-auto px-6">

                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-end mb-16">
                    <div>
                        <h1 className="text-4xl md:text-5xl font-serif text-white mb-4">Our Collection</h1>
                        <p className="text-gray-500">Browse our curated selection of vehicles</p>
                    </div>

                    {/* Filters */}
                    <div className="flex flex-wrap gap-3 mt-8 md:mt-0">
                        {[
                            { id: 'all', label: 'All' },
                            { id: 'sedan', label: 'Sedan' },
                            { id: 'xuv', label: 'SUV' },
                            { id: 'hatchback', label: 'Hatchback' },
                            { id: 'luxury', label: 'Luxury' }
                        ].map((style) => (
                            <button
                                key={style.id}
                                onClick={() => setSelectedBodyStyle(style.id)}
                                className={`px-6 py-2 text-sm transition border ${selectedBodyStyle === style.id
                                    ? 'bg-luxury-gold border-luxury-gold text-black'
                                    : 'bg-transparent text-gray-400 border-white/10 hover:border-luxury-gold hover:text-white'
                                    }`}
                            >
                                {style.label}
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
                    /* Car Grid */
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {cars.filter(c => c.status === "available").map((car) => (
                            <div
                                key={car.id}
                                className="glass-card group cursor-pointer overflow-hidden"
                                onClick={() => handleCarClick(car)}
                            >
                                {/* Car Image */}
                                <div className="aspect-[4/3] overflow-hidden relative bg-luxury-charcoal">
                                    <img
                                        src={getCarImageUrl(car.image)}
                                        alt={car.name}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                        onError={(e) => {
                                            e.currentTarget.src = 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?auto=format&fit=crop&q=80';
                                        }}
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-luxury-black via-transparent to-transparent opacity-60"></div>
                                    <div className="absolute top-4 right-4 bg-luxury-black/80 backdrop-blur px-3 py-1 text-xs text-white border border-white/10">
                                        {car.year}
                                    </div>
                                </div>

                                {/* Car Info */}
                                <div className="p-6">
                                    <h3 className="font-serif text-xl text-white mb-2 group-hover:text-luxury-gold transition">{car.name}</h3>
                                    <div className="flex items-center gap-3 text-xs text-gray-500 mb-6">
                                        <span>{car.km}</span>
                                        <span>•</span>
                                        <span>{car.fuel}</span>
                                        <span>•</span>
                                        <span>{car.transmission}</span>
                                    </div>

                                    <div className="flex items-center justify-between pt-4 border-t border-white/5">
                                        <span className="text-xl font-serif text-luxury-gold">{car.price}</span>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); addToCart(car.id); }}
                                            className="p-2 text-gray-400 hover:text-white hover:bg-white/10 transition"
                                        >
                                            <ShoppingCart className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Car Details Modal */}
            {showCarDetails && selectedCar && (
                <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4" onClick={closeCarDetails}>
                    <div className="bg-luxury-charcoal border border-white/10 max-w-4xl w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
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
                                <button onClick={closeCarDetails} className="absolute top-4 left-4 bg-black/50 p-2 text-white hover:bg-black transition">
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
                                        <p className="text-white">{selectedCar.km}</p>
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
                                            <span key={i} className="px-3 py-1 border border-white/10 text-gray-300 text-xs">
                                                {f}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex flex-col gap-4">
                                    <button onClick={() => { closeCarDetails(); addToCart(selectedCar.id); }} className="btn-gold w-full text-center">
                                        Add to Cart
                                    </button>
                                    <button onClick={closeCarDetails} className="btn-outline w-full text-center">
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
