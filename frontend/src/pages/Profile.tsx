import { useState, useEffect } from 'react';
import type { UserData } from '../types';
import { Package, FileText, Wrench, Calendar, DollarSign, User } from 'lucide-react';

const API_BASE = 'http://localhost:8000/api';

interface ProfileProps {
    user: UserData | null;
    openLogin: () => void;
}

interface Order {
    order_id: string;
    car_id: string;
    car_name: string;
    year: number;
    price: number;
    timestamp: string;
}

interface SellRequest {
    request_id: string;
    make: string;
    model: string;
    year: number;
    asking_price: number;
    status: string;
    timestamp: string;
}

interface ServiceBooking {
    service_id: string;
    car_id: string;
    service_date: string;
    notes: string;
    status: string;
    timestamp: string;
}

interface ProfileData {
    user: {
        name: string;
        phone: string;
        created_at: string;
    };
    orders: Order[];
    sell_requests: SellRequest[];
    services: ServiceBooking[];
}

const Profile: React.FC<ProfileProps> = ({ user, openLogin }) => {
    const [profileData, setProfileData] = useState<ProfileData | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'orders' | 'sell' | 'services'>('orders');

    useEffect(() => {
        if (!user) {
            openLogin();
            return;
        }

        const fetchProfile = async () => {
            try {
                const res = await fetch(`${API_BASE}/profile`, {
                    credentials: 'include'
                });
                if (res.ok) {
                    const data = await res.json();
                    setProfileData(data);
                } else {
                    console.error('Failed to fetch profile');
                }
            } catch (err) {
                console.error('Error fetching profile:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [user, openLogin]);

    if (!user) {
        return null;
    }

    if (loading) {
        return (
            <div className="min-h-screen py-32 flex justify-center items-center" style={{ backgroundColor: '#f2f0ea' }}>
                <div className="w-12 h-12 border-2 border-luxury-gold border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!profileData) {
        return (
            <div className="min-h-screen py-32" style={{ backgroundColor: '#f2f0ea' }}>
                <div className="max-w-7xl mx-auto px-6 text-center">
                    <p className="text-gray-500">Failed to load profile data.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen py-32" style={{ backgroundColor: '#f2f0ea' }}>
            <div className="max-w-7xl mx-auto px-6">
                {/* Profile Header */}
                <div className="glass-panel p-8 mb-12 flex items-center space-x-8">
                    <div className="w-24 h-24 rounded-full bg-luxury-gold/10 flex items-center justify-center border border-luxury-gold/30">
                        <User className="w-10 h-10 text-luxury-gold" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-serif text-white mb-2">{profileData.user.name}</h1>
                        <p className="text-luxury-gold font-light tracking-wide">{profileData.user.phone}</p>
                        <p className="text-xs text-gray-500 uppercase tracking-widest mt-2">
                            Member since {new Date(profileData.user.created_at).toLocaleDateString()}
                        </p>
                    </div>
                </div>

                {/* Tabs */}
                <div className="mb-12 border-b border-white/10">
                    <div className="flex space-x-12">
                        <button
                            onClick={() => setActiveTab('orders')}
                            className={`pb-4 text-sm uppercase tracking-widest transition border-b-2 ${activeTab === 'orders'
                                ? 'text-luxury-gold border-luxury-gold'
                                : 'text-gray-500 border-transparent hover:text-white'
                                }`}
                        >
                            <Package className="w-4 h-4 inline mr-2 mb-1" />
                            Acquisitions ({profileData.orders.length})
                        </button>
                        <button
                            onClick={() => setActiveTab('sell')}
                            className={`pb-4 text-sm uppercase tracking-widest transition border-b-2 ${activeTab === 'sell'
                                ? 'text-luxury-gold border-luxury-gold'
                                : 'text-gray-500 border-transparent hover:text-white'
                                }`}
                        >
                            <FileText className="w-4 h-4 inline mr-2 mb-1" />
                            Consignments ({profileData.sell_requests.length})
                        </button>
                        <button
                            onClick={() => setActiveTab('services')}
                            className={`pb-4 text-sm uppercase tracking-widest transition border-b-2 ${activeTab === 'services'
                                ? 'text-luxury-gold border-luxury-gold'
                                : 'text-gray-500 border-transparent hover:text-white'
                                }`}
                        >
                            <Wrench className="w-4 h-4 inline mr-2 mb-1" />
                            Service History ({profileData.services.length})
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="animate-in fade-in slide-in-from-bottom-4">
                    {/* Orders Tab */}
                    {activeTab === 'orders' && (
                        <div>
                            {profileData.orders.length === 0 ? (
                                <p className="text-gray-500 text-center py-12 font-light">Your garage is currently empty.</p>
                            ) : (
                                <div className="grid gap-6">
                                    {profileData.orders.map((order) => (
                                        <div key={order.order_id} className="glass-card p-8 flex justify-between items-center">
                                            <div>
                                                <h3 className="font-serif text-xl text-white mb-1">
                                                    {order.car_name}
                                                </h3>
                                                <p className="text-xs text-gray-500 uppercase tracking-widest mb-4">
                                                    {order.year} Model
                                                </p>
                                                <div className="flex items-center gap-4 text-xs text-gray-500">
                                                    <span>ID: {order.order_id.substring(0, 8)}...</span>
                                                    <span>•</span>
                                                    <span>{new Date(order.timestamp).toLocaleDateString()}</span>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-2xl font-serif text-luxury-gold">
                                                    ₹{order.price.toLocaleString()}
                                                </p>
                                                <span className="inline-block mt-2 px-3 py-1 border border-green-500/30 text-green-400 text-[10px] uppercase tracking-widest rounded-full">
                                                    Delivered
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Sell Requests Tab */}
                    {activeTab === 'sell' && (
                        <div>
                            {profileData.sell_requests.length === 0 ? (
                                <p className="text-gray-500 text-center py-12 font-light">No active consignment requests.</p>
                            ) : (
                                <div className="grid gap-6">
                                    {profileData.sell_requests.map((req) => (
                                        <div key={req.request_id} className="glass-card p-8 flex justify-between items-center">
                                            <div>
                                                <h3 className="font-serif text-xl text-white mb-1">
                                                    {req.make} {req.model}
                                                </h3>
                                                <p className="text-xs text-gray-500 uppercase tracking-widest mb-4">
                                                    {req.year} Model
                                                </p>
                                                <div className="flex items-center gap-4 text-xs text-gray-500">
                                                    <span>ID: {req.request_id.substring(0, 8)}...</span>
                                                    <span>•</span>
                                                    <span>{new Date(req.timestamp).toLocaleDateString()}</span>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-xl font-serif text-luxury-gold mb-2">
                                                    ₹{req.asking_price.toLocaleString()}
                                                </p>
                                                <span className={`inline-block px-3 py-1 border text-[10px] uppercase tracking-widest rounded-full ${req.status === 'approved' ? 'border-green-500/30 text-green-400' :
                                                    req.status === 'pending' ? 'border-yellow-500/30 text-yellow-400' :
                                                        'border-red-500/30 text-red-400'
                                                    }`}>
                                                    {req.status}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Services Tab */}
                    {activeTab === 'services' && (
                        <div>
                            {profileData.services.length === 0 ? (
                                <p className="text-gray-500 text-center py-12 font-light">No service history available.</p>
                            ) : (
                                <div className="grid gap-6">
                                    {profileData.services.map((service) => (
                                        <div key={service.service_id} className="glass-card p-8">
                                            <div className="flex justify-between items-start mb-4">
                                                <div>
                                                    <h3 className="font-serif text-xl text-white mb-1">Service Appointment</h3>
                                                    <p className="text-xs text-gray-500 uppercase tracking-widest">
                                                        {service.service_date || 'Date Pending'}
                                                    </p>
                                                </div>
                                                <span className={`inline-block px-3 py-1 border text-[10px] uppercase tracking-widest rounded-full ${service.status === 'completed' ? 'border-green-500/30 text-green-400' :
                                                    service.status === 'scheduled' ? 'border-blue-500/30 text-blue-400' :
                                                        'border-gray-500/30 text-gray-500'
                                                    }`}>
                                                    {service.status}
                                                </span>
                                            </div>
                                            {service.notes && (
                                                <p className="text-sm text-gray-400 font-light border-t border-white/5 pt-4 mt-4">
                                                    "{service.notes}"
                                                </p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Profile;
