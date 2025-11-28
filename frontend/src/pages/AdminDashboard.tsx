import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Car, ShoppingBag, FileText, Wrench, Mail, LogOut, Plus, Trash2, Edit2, Upload, Monitor } from 'lucide-react';

const API_BASE = 'http://localhost:8000';

interface DashboardStats {
    total_cars: number;
    available_cars: number;
    total_sales: number;
    pending_sell_requests: number;
    pending_services: number;
}

const AdminDashboard = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [authenticated, setAuthenticated] = useState(false);
    const [employeeName, setEmployeeName] = useState('');
    const [activeTab, setActiveTab] = useState('cars');
    const [stats, setStats] = useState<DashboardStats | null>(null);

    const [cars, setCars] = useState<any[]>([]);
    const [sales, setSales] = useState<any[]>([]);
    const [sellRequests, setSellRequests] = useState<any[]>([]);
    const [services, setServices] = useState<any[]>([]);
    const [contacts, setContacts] = useState<any[]>([]);

    const [showAddCarForm, setShowAddCarForm] = useState(false);
    const [editingCar, setEditingCar] = useState<any | null>(null);
    const [carForm, setCarForm] = useState({
        make: '', model: '', year: 2024, price: 0, mileage: 0,
        fuel: 'Petrol', transmission: 'Manual', type: 'sedan', image: '', description: ''
    });

    const [socialLinks, setSocialLinks] = useState({
        facebook_url: '',
        whatsapp_url: '',
        instagram_url: ''
    });

    useEffect(() => {
        checkAuth();
    }, []);

    useEffect(() => {
        if (activeTab === 'website') {
            loadSocialLinks();
        }
    }, [activeTab]);

    const checkAuth = async () => {
        try {
            const res = await fetch(`${API_BASE}/api/employee/check`, { credentials: 'include' });
            const data = await res.json();
            if (data.authenticated) {
                setAuthenticated(true);
                setEmployeeName(data.name);
                loadDashboardData();
            } else {
                navigate('/employee-login');
            }
        } catch (err) {
            navigate('/employee-login');
        }
    };

    const loadDashboardData = async () => {
        try {
            const [statsRes, carsRes, salesRes, sellReqRes, servicesRes, contactsRes] = await Promise.all([
                fetch(`${API_BASE}/api/employee/stats`, { credentials: 'include' }),
                fetch(`${API_BASE}/api/employee/cars`, { credentials: 'include' }),
                fetch(`${API_BASE}/api/employee/sales`, { credentials: 'include' }),
                fetch(`${API_BASE}/api/employee/sell-requests`, { credentials: 'include' }),
                fetch(`${API_BASE}/api/employee/services`, { credentials: 'include' }),
                fetch(`${API_BASE}/api/employee/contacts`, { credentials: 'include' })
            ]);

            setStats(await statsRes.json());
            setCars(await carsRes.json());
            setSales(await salesRes.json());
            setSellRequests(await sellReqRes.json());
            setServices(await servicesRes.json());
            setContacts(await contactsRes.json());
        } catch (err) {
            console.error('Failed to load dashboard data:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        await fetch(`${API_BASE}/employee/logout`, { method: 'POST', credentials: 'include' });
        navigate('/employee-login');
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await fetch(`${API_BASE}/api/employee/upload-image`, {
                method: 'POST',
                body: formData,
                credentials: 'include'
            });
            const data = await res.json();
            if (res.ok) {
                setCarForm({ ...carForm, image: data.url });
                alert('Image uploaded successfully!');
            }
        } catch (err) {
            alert('Failed to upload image');
        }
    };

    const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await fetch(`${API_BASE}/api/employee/upload-video`, {
                method: 'POST',
                body: formData,
                credentials: 'include'
            });
            if (res.ok) {
                alert('Hero video uploaded successfully!');
            } else {
                const data = await res.json();
                alert(`Failed to upload video: ${data.message || res.statusText}`);
            }
        } catch (err) {
            alert(`Failed to upload video: ${err}`);
        }
    };

    const loadSocialLinks = async () => {
        try {
            const res = await fetch(`${API_BASE}/api/settings/social-links`);
            const data = await res.json();
            setSocialLinks(data);
        } catch (err) {
            console.error('Failed to load social links:', err);
        }
    };

    const handleSaveSocialLinks = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch(`${API_BASE}/api/employee/social-links`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(socialLinks)
            });
            if (res.ok) {
                alert('Social media links saved successfully!');
            } else {
                alert('Failed to save social links');
            }
        } catch (err) {
            alert('Failed to save social links');
        }
    };

    const handleAddCar = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch(`${API_BASE}/api/employee/cars`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(carForm)
            });

            if (res.ok) {
                alert('Car added successfully!');
                setShowAddCarForm(false);
                resetCarForm();
                loadDashboardData();
            }
        } catch (err) {
            alert('Failed to add car');
        }
    };

    const handleUpdateCar = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingCar) return;

        try {
            const res = await fetch(`${API_BASE}/api/employee/cars/${editingCar.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(carForm)
            });

            if (res.ok) {
                alert('Car updated successfully!');
                setEditingCar(null);
                resetCarForm();
                loadDashboardData();
            }
        } catch (err) {
            alert('Failed to update car');
        }
    };

    const handleEditCar = (car: any) => {
        setEditingCar(car);
        setCarForm({
            make: car.make || '',
            model: car.model || '',
            year: car.year || 2024,
            price: car.price || 0,
            mileage: car.mileage || 0,
            fuel: car.fuel || 'Petrol',
            transmission: car.transmission || 'Manual',
            type: car.type || 'sedan',
            image: car.image || '',
            description: car.description || ''
        });
        setShowAddCarForm(false);
    };

    const resetCarForm = () => {
        setCarForm({
            make: '', model: '', year: 2024, price: 0, mileage: 0,
            fuel: 'Petrol', transmission: 'Manual', type: 'sedan', image: '', description: ''
        });
    };

    const handleDeleteCar = async (carId: string) => {
        if (!confirm('Delete this car?')) return;

        try {
            const res = await fetch(`${API_BASE}/api/employee/cars/${carId}`, {
                method: 'DELETE',
                credentials: 'include'
            });

            if (res.ok) {
                alert('Car deleted!');
                loadDashboardData();
            }
        } catch (err) {
            alert('Failed to delete car');
        }
    };

    const handleUpdateStatus = async (type: 'sell-requests' | 'services', id: string, status: string) => {
        try {
            const res = await fetch(`${API_BASE}/api/employee/${type}/${id}/status`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ status })
            });

            if (res.ok) {
                alert('Status updated!');
                loadDashboardData();
            }
        } catch (err) {
            alert('Failed to update status');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#f2f0ea' }}>
                <div className="text-xl text-luxury-gold">Loading...</div>
            </div>
        );
    }

    if (!authenticated) {
        return null;
    }

    return (
        <div className="min-h-screen text-luxury-text" style={{ backgroundColor: '#f2f0ea' }}>
            {/* Header */}
            <header className="bg-[#4A4743] border-b border-white/10 sticky top-0 z-10 shadow-md">
                <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
                    <div>
                        <h1 className="text-xl font-serif text-white">Admin Dashboard</h1>
                        <p className="text-xs text-white/60">Welcome, {employeeName}</p>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-white/80 hover:text-white transition"
                    >
                        <LogOut className="w-4 h-4" />
                        Logout
                    </button>
                </div>
            </header>

            {/* Stats */}
            {stats && (
                <div className="max-w-7xl mx-auto px-6 py-8">
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                        {[
                            { label: 'Total Cars', value: stats.total_cars, icon: Car },
                            { label: 'Available', value: stats.available_cars, icon: Car },
                            { label: 'Sales', value: stats.total_sales, icon: ShoppingBag },
                            { label: 'Requests', value: stats.pending_sell_requests, icon: FileText },
                            { label: 'Services', value: stats.pending_services, icon: Wrench }
                        ].map((stat, i) => (
                            <div key={i} className="p-6 rounded-xl shadow-lg border border-white/10" style={{ backgroundColor: '#56453E' }}>
                                <stat.icon className="w-5 h-5 text-luxury-gold mb-3" />
                                <div className="text-2xl font-serif text-white mb-1">{stat.value}</div>
                                <div className="text-xs text-white/60">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Tabs */}
            <div className="max-w-7xl mx-auto px-6">
                <div className="border-b border-white/5 mb-8">
                    <div className="flex gap-8">
                        {[
                            { id: 'cars', label: 'Cars', icon: Car },
                            { id: 'sales', label: 'Sales', icon: ShoppingBag },
                            { id: 'sell-requests', label: 'Requests', icon: FileText },
                            { id: 'services', label: 'Services', icon: Wrench },
                            { id: 'contacts', label: 'Messages', icon: Mail },
                            { id: 'website', label: 'Website', icon: Monitor }
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 py-4 text-sm border-b-2 transition ${activeTab === tab.id
                                    ? 'text-luxury-gold border-luxury-gold'
                                    : 'text-gray-500 border-transparent hover:text-white'
                                    }`}
                            >
                                <tab.icon className="w-4 h-4" />
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Content */}
                <div className="p-8 mb-12 min-h-[400px] rounded-xl shadow-xl border border-white/10" style={{ backgroundColor: '#56453E' }}>
                    {activeTab === 'cars' && (
                        <div>
                            <div className="flex justify-between items-center mb-8">
                                <h2 className="text-xl font-serif text-white">Inventory Management</h2>
                                <button
                                    onClick={() => {
                                        setShowAddCarForm(!showAddCarForm);
                                        setEditingCar(null);
                                        resetCarForm();
                                    }}
                                    className="btn-gold flex items-center gap-2"
                                >
                                    <Plus className="w-4 h-4" />
                                    Add Car
                                </button>
                            </div>

                            {/* Add/Edit Car Form */}
                            {(showAddCarForm || editingCar) && (
                                <form onSubmit={editingCar ? handleUpdateCar : handleAddCar} className="mb-8 p-6 bg-white/5 border border-white/10">
                                    <h3 className="text-white mb-4">{editingCar ? 'Edit Car' : 'Add New Car'}</h3>

                                    <div className="grid grid-cols-2 gap-4 mb-4">
                                        <input value={carForm.make} onChange={(e) => setCarForm({ ...carForm, make: e.target.value })} placeholder="Make" required className="bg-luxury-black border border-white/10 p-3 text-white outline-none focus:border-luxury-gold" />
                                        <input value={carForm.model} onChange={(e) => setCarForm({ ...carForm, model: e.target.value })} placeholder="Model" required className="bg-luxury-black border border-white/10 p-3 text-white outline-none focus:border-luxury-gold" />
                                        <input type="number" value={carForm.year} onChange={(e) => setCarForm({ ...carForm, year: parseInt(e.target.value) })} placeholder="Year" required className="bg-luxury-black border border-white/10 p-3 text-white outline-none focus:border-luxury-gold" />
                                        <input type="number" value={carForm.price} onChange={(e) => setCarForm({ ...carForm, price: parseInt(e.target.value) })} placeholder="Price" required className="bg-luxury-black border border-white/10 p-3 text-white outline-none focus:border-luxury-gold" />
                                        <input type="number" value={carForm.mileage} onChange={(e) => setCarForm({ ...carForm, mileage: parseInt(e.target.value) })} placeholder="Mileage (km)" required className="bg-luxury-black border border-white/10 p-3 text-white outline-none focus:border-luxury-gold" />
                                        <select value={carForm.fuel} onChange={(e) => setCarForm({ ...carForm, fuel: e.target.value })} className="bg-luxury-black border border-white/10 p-3 text-white outline-none focus:border-luxury-gold">
                                            <option>Petrol</option>
                                            <option>Diesel</option>
                                            <option>Electric</option>
                                            <option>Hybrid</option>
                                        </select>
                                        <select value={carForm.transmission} onChange={(e) => setCarForm({ ...carForm, transmission: e.target.value })} className="bg-luxury-black border border-white/10 p-3 text-white outline-none focus:border-luxury-gold">
                                            <option>Manual</option>
                                            <option>Automatic</option>
                                        </select>
                                        <select value={carForm.type} onChange={(e) => setCarForm({ ...carForm, type: e.target.value })} className="bg-luxury-black border border-white/10 p-3 text-white outline-none focus:border-luxury-gold">
                                            <option value="sedan">Sedan</option>
                                            <option value="xuv">SUV</option>
                                            <option value="hatchback">Hatchback</option>
                                            <option value="luxury">Luxury</option>
                                        </select>
                                    </div>

                                    {/* Image Upload */}
                                    <div className="mb-4">
                                        <label className="block text-xs text-gray-500 mb-2">Car Image</label>
                                        <div className="flex gap-4 items-center">
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={handleImageUpload}
                                                className="flex-1 p-3 bg-luxury-black border border-white/10 text-white"
                                            />
                                            {carForm.image && (
                                                <div className="flex items-center gap-2 text-green-400 text-sm">
                                                    <Upload className="w-4 h-4" />
                                                    Image uploaded
                                                </div>
                                            )}
                                        </div>
                                        {carForm.image && (
                                            <img
                                                src={carForm.image.startsWith('http') ? carForm.image : `${API_BASE}${carForm.image}`}
                                                alt="Preview"
                                                className="mt-4 w-48 h-32 object-cover border border-white/10"
                                            />
                                        )}
                                    </div>

                                    <textarea value={carForm.description} onChange={(e) => setCarForm({ ...carForm, description: e.target.value })} placeholder="Description" className="w-full bg-luxury-black border border-white/10 p-3 text-white outline-none focus:border-luxury-gold mb-4" rows={3}></textarea>

                                    <div className="flex gap-4">
                                        <button type="submit" className="btn-gold flex-1">
                                            {editingCar ? 'Update Car' : 'Add to Inventory'}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setShowAddCarForm(false);
                                                setEditingCar(null);
                                                resetCarForm();
                                            }}
                                            className="btn-outline flex-1"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </form>
                            )}

                            {/* Cars Table */}
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="border-b border-white/10 text-xs text-white/60">
                                            <th className="px-4 py-3 font-normal">Image</th>
                                            <th className="px-4 py-3 font-normal">Vehicle</th>
                                            <th className="px-4 py-3 font-normal">Year</th>
                                            <th className="px-4 py-3 font-normal">Price</th>
                                            <th className="px-4 py-3 font-normal">Status</th>
                                            <th className="px-4 py-3 font-normal text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {cars.map(car => (
                                            <tr key={car.id} className="hover:bg-white/5 transition">
                                                <td className="px-4 py-4">
                                                    {car.image ? (
                                                        <img
                                                            src={car.image.startsWith('http') ? car.image : `${API_BASE}${car.image}`}
                                                            alt={car.make}
                                                            className="w-16 h-12 object-cover"
                                                        />
                                                    ) : (
                                                        <div className="w-16 h-12 bg-luxury-charcoal flex items-center justify-center text-xs text-gray-600">
                                                            No image
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="px-4 py-4 text-white">{car.make} {car.model}</td>
                                                <td className="px-4 py-4">{car.year}</td>
                                                <td className="px-4 py-4 text-luxury-gold">₹{car.price?.toLocaleString()}</td>
                                                <td className="px-4 py-4">
                                                    <span className={`px-2 py-1 text-xs border ${car.status === 'available' ? 'border-green-500/30 text-green-400' : 'border-gray-500/30 text-gray-500'}`}>
                                                        {car.status}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-4 text-right">
                                                    <div className="flex gap-2 justify-end">
                                                        <button onClick={() => handleEditCar(car)} className="p-2 text-luxury-gold hover:text-white">
                                                            <Edit2 className="w-4 h-4" />
                                                        </button>
                                                        <button onClick={() => handleDeleteCar(car.id)} className="p-2 text-red-400 hover:text-red-300">
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {activeTab === 'sales' && (
                        <div>
                            <h2 className="text-xl font-serif text-white mb-8">Sales History</h2>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="border-b border-white/10 text-xs text-white/60">
                                            <th className="px-4 py-3 font-normal">Order ID</th>
                                            <th className="px-4 py-3 font-normal">Vehicle</th>
                                            <th className="px-4 py-3 font-normal">Price</th>
                                            <th className="px-4 py-3 font-normal">Date</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {sales.map(sale => (
                                            <tr key={sale.order_id} className="hover:bg-white/5">
                                                <td className="px-4 py-4 text-xs">{sale.order_id.substring(0, 8)}...</td>
                                                <td className="px-4 py-4 text-white">{sale.car_name}</td>
                                                <td className="px-4 py-4 text-luxury-gold">₹{sale.price?.toLocaleString()}</td>
                                                <td className="px-4 py-4 text-sm">{new Date(sale.timestamp).toLocaleDateString()}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {activeTab === 'sell-requests' && (
                        <div>
                            <h2 className="text-xl font-serif text-white mb-8">Sell Requests</h2>
                            <div className="space-y-4">
                                {sellRequests.map(req => (
                                    <div key={req.request_id} className="p-6 bg-white/5 border border-white/10 flex justify-between items-center">
                                        <div>
                                            <div className="text-white mb-1">{req.make} {req.model} ({req.year})</div>
                                            <div className="text-xs text-gray-500">{req.owner_name} • {req.phone}</div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-luxury-gold mb-2">₹{req.asking_price?.toLocaleString()}</div>
                                            <select
                                                value={req.status}
                                                onChange={(e) => handleUpdateStatus('sell-requests', req.request_id, e.target.value)}
                                                className="bg-luxury-black border border-white/10 text-xs text-gray-300 p-1 outline-none"
                                            >
                                                <option value="pending">Pending</option>
                                                <option value="approved">Approved</option>
                                                <option value="rejected">Rejected</option>
                                            </select>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === 'website' && (
                        <div>
                            <h2 className="text-xl font-serif text-white mb-8">Website Management</h2>
                            <div className="border border-white/10 rounded-xl p-8 max-w-2xl" style={{ backgroundColor: '#56453E' }}>
                                <h3 className="text-lg text-white mb-4">Home Page Hero Video</h3>
                                <p className="text-sm text-gray-500 mb-6">
                                    Upload a video to play in the background of the home page hero section.
                                    Recommended format: MP4, optimized for web (under 10MB).
                                </p>

                                <div className="border-2 border-dashed border-white/10 rounded-lg p-8 text-center hover:border-luxury-gold transition cursor-pointer relative">
                                    <input
                                        type="file"
                                        accept="video/mp4,video/webm"
                                        onChange={handleVideoUpload}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    />
                                    <Upload className="w-10 h-10 text-gray-500 mx-auto mb-4" />
                                    <p className="text-white font-medium mb-2">Click to upload video</p>
                                    <p className="text-xs text-gray-500">MP4 or WebM</p>
                                </div>
                            </div>

                            <div className="border border-white/10 rounded-xl p-8 max-w-2xl mt-8" style={{ backgroundColor: '#56453E' }}>
                                <h3 className="text-lg text-white mb-4">Company Logo</h3>
                                <p className="text-sm text-gray-500 mb-6">
                                    Upload your company logo to display in the navigation and footer.
                                </p>

                                <div className="border-2 border-dashed border-white/10 rounded-lg p-8 text-center hover:border-luxury-gold transition cursor-pointer relative">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={async (e) => {
                                            const file = e.target.files?.[0];
                                            if (!file) return;
                                            const formData = new FormData();
                                            formData.append('file', file);
                                            try {
                                                const res = await fetch(`${API_BASE}/api/employee/upload-logo`, {
                                                    method: 'POST',
                                                    body: formData,
                                                    credentials: 'include'
                                                });
                                                if (res.ok) {
                                                    alert('Logo uploaded successfully!');
                                                    window.location.reload();
                                                } else {
                                                    alert('Failed to upload logo');
                                                }
                                            } catch (err) {
                                                alert('Failed to upload logo');
                                            }
                                        }}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    />
                                    <Upload className="w-10 h-10 text-gray-500 mx-auto mb-4" />
                                    <p className="text-white font-medium mb-2">Click to upload logo</p>
                                    <p className="text-xs text-gray-500">PNG, JPG, or SVG (recommended: 200x200px)</p>
                                </div>
                            </div>

                            <div className="border border-white/10 rounded-xl p-8 max-w-2xl mt-8" style={{ backgroundColor: '#56453E' }}>

                                <h3 className="text-lg text-white mb-4">Social Media Links</h3>
                                <p className="text-sm text-gray-500 mb-6">
                                    Add your social media links to display on the Contact page.
                                </p>

                                <form onSubmit={handleSaveSocialLinks} className="space-y-4">
                                    <div>
                                        <label className="text-sm text-gray-400 mb-2 block">Facebook URL</label>
                                        <input
                                            type="url"
                                            value={socialLinks.facebook_url}
                                            onChange={(e) => setSocialLinks({ ...socialLinks, facebook_url: e.target.value })}
                                            className="w-full px-4 py-3 bg-white/5 border border-white/10 text-white focus:border-luxury-gold outline-none transition"
                                            placeholder="https://facebook.com/yourpage"
                                        />
                                    </div>

                                    <div>
                                        <label className="text-sm text-gray-400 mb-2 block">WhatsApp Number (with country code)</label>
                                        <input
                                            type="text"
                                            value={socialLinks.whatsapp_url}
                                            onChange={(e) => setSocialLinks({ ...socialLinks, whatsapp_url: e.target.value })}
                                            className="w-full px-4 py-3 bg-white/5 border border-white/10 text-white focus:border-luxury-gold outline-none transition"
                                            placeholder="919876543210"
                                        />
                                    </div>

                                    <div>
                                        <label className="text-sm text-gray-400 mb-2 block">Instagram URL</label>
                                        <input
                                            type="url"
                                            value={socialLinks.instagram_url}
                                            onChange={(e) => setSocialLinks({ ...socialLinks, instagram_url: e.target.value })}
                                            className="w-full px-4 py-3 bg-white/5 border border-white/10 text-white focus:border-luxury-gold outline-none transition"
                                            placeholder="https://instagram.com/yourprofile"
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        className="btn-gold w-full"
                                    >
                                        Save Social Links
                                    </button>
                                </form>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
