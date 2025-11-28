import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    LayoutDashboard, Car, ShoppingBag, FileText, Wrench,
    Mail, LogOut, Plus, Trash2, Check, X
} from 'lucide-react';

const API_BASE = 'http://localhost:8000';

interface DashboardStats {
    total_cars: number;
    available_cars: number;
    total_sales: number;
    pending_sell_requests: number;
    pending_services: number;
}

interface CarData {
    id: string;
    make: string;
    model: string;
    year: number;
    price: number;
    mileage: number;
    fuel?: string;
    transmission?: string;
    owner?: string;
    type?: string;
    image?: string;
    description?: string;
    status: string;
}

const EmployeeDashboard = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [authenticated, setAuthenticated] = useState(false);
    const [employeeName, setEmployeeName] = useState('');
    const [activeTab, setActiveTab] = useState('cars');
    const [stats, setStats] = useState<DashboardStats | null>(null);

    // Data states
    const [cars, setCars] = useState<CarData[]>([]);
    const [sales, setSales] = useState<any[]>([]);
    const [sellRequests, setSellRequests] = useState<any[]>([]);
    const [services, setServices] = useState<any[]>([]);
    const [contacts, setContacts] = useState<any[]>([]);

    // Form states
    const [showAddCarForm, setShowAddCarForm] = useState(false);

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        try {
            const res = await fetch(`${API_BASE}/api/employee/check`, {
                credentials: 'include'
            });
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
        } finally {
            setLoading(false);
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
        }
    };

    const handleLogout = async () => {
        await fetch(`${API_BASE}/employee/logout`, { method: 'POST', credentials: 'include' });
        navigate('/employee-login');
    };

    const handleAddCar = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const carData = Object.fromEntries(formData);

        try {
            const res = await fetch(`${API_BASE}/api/employee/cars`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(carData)
            });

            if (res.ok) {
                alert('Car added successfully!');
                setShowAddCarForm(false);
                loadDashboardData();
            }
        } catch (err) {
            alert('Failed to add car');
        }
    };

    const handleDeleteCar = async (carId: string) => {
        if (!confirm('Are you sure you want to delete this car?')) return;

        try {
            const res = await fetch(`${API_BASE}/api/employee/cars/${carId}`, {
                method: 'DELETE',
                credentials: 'include'
            });

            if (res.ok) {
                alert('Car deleted successfully!');
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
                <div className="text-xl text-gray-600">Loading...</div>
            </div>
        );
    }

    if (!authenticated) {
        return null;
    }

    return (
        <div className="min-h-screen" style={{ backgroundColor: '#f2f0ea' }}>
            {/* Header */}
            <header className="bg-luxury-puce border-b border-white/10 sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
                    <div className="flex items-center space-x-3">
                        <LayoutDashboard className="w-8 h-8 text-blue-600" />
                        <div>
                            <h1 className="text-2xl font-bold text-gray-100">SB Motors Dashboard</h1>
                            <p className="text-sm text-gray-300">Welcome, {employeeName}</p>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="flex items-center space-x-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
                    >
                        <LogOut className="w-4 h-4" />
                        <span>Logout</span>
                    </button>
                </div>
            </header>

            {/* Stats Cards */}
            {stats && (
                <div className="max-w-7xl mx-auto px-4 py-6">
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                        <div className="p-6 rounded-xl shadow-sm border border-white/10" style={{ backgroundColor: '#56453E' }}>
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-white/80">Total Cars</p>
                                    <p className="text-3xl font-bold text-white">{stats.total_cars}</p>
                                </div>
                                <Car className="w-10 h-10 text-luxury-gold" />
                            </div>
                        </div>
                        <div className="p-6 rounded-xl shadow-sm border border-white/10" style={{ backgroundColor: '#56453E' }}>
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-white/80">Available</p>
                                    <p className="text-3xl font-bold text-white">{stats.available_cars}</p>
                                </div>
                                <Check className="w-10 h-10 text-green-400" />
                            </div>
                        </div>
                        <div className="p-6 rounded-xl shadow-sm border border-white/10" style={{ backgroundColor: '#56453E' }}>
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-white/80">Total Sales</p>
                                    <p className="text-3xl font-bold text-white">{stats.total_sales}</p>
                                </div>
                                <ShoppingBag className="w-10 h-10 text-purple-300" />
                            </div>
                        </div>
                        <div className="p-6 rounded-xl shadow-sm border border-white/10" style={{ backgroundColor: '#56453E' }}>
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-white/80">Sell Requests</p>
                                    <p className="text-3xl font-bold text-white">{stats.pending_sell_requests}</p>
                                </div>
                                <FileText className="w-10 h-10 text-orange-300" />
                            </div>
                        </div>
                        <div className="p-6 rounded-xl shadow-sm border border-white/10" style={{ backgroundColor: '#56453E' }}>
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-white/80">Services</p>
                                    <p className="text-3xl font-bold text-white">{stats.pending_services}</p>
                                </div>
                                <Wrench className="w-10 h-10 text-indigo-300" />
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Tabs */}
            <div className="max-w-7xl mx-auto px-4">
                <div className="rounded-t-xl border-b border-white/10" style={{ backgroundColor: '#56453E' }}>
                    <div className="flex space-x-1 overflow-x-auto">
                        {[
                            { id: 'cars', label: 'Cars', icon: Car },
                            { id: 'sales', label: 'Sales', icon: ShoppingBag },
                            { id: 'sell-requests', label: 'Sell Requests', icon: FileText },
                            { id: 'services', label: 'Services', icon: Wrench },
                            { id: 'contacts', label: 'Contacts', icon: Mail }
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center space-x-2 px-6 py-4 font-medium transition ${activeTab === tab.id
                                    ? 'text-white border-b-2 border-luxury-gold bg-white/10'
                                    : 'text-white/70 hover:text-white hover:bg-white/5'
                                    }`}
                            >
                                <tab.icon className="w-5 h-5" />
                                <span>{tab.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Tab Content */}
                <div className="rounded-b-xl shadow-sm p-6 mb-8" style={{ backgroundColor: '#f2f0ea' }}>
                    {activeTab === 'cars' && (
                        <div>
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-bold">Car Inventory</h2>
                                <button
                                    onClick={() => setShowAddCarForm(true)}
                                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                                >
                                    <Plus className="w-4 h-4" />
                                    <span>Add Car</span>
                                </button>
                            </div>

                            {/* Add Car Form Modal */}
                            {showAddCarForm && (
                                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                                    <div className="rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto" style={{ backgroundColor: '#56453E' }}>
                                        <div className="flex justify-between items-center mb-4">
                                            <h3 className="text-xl font-bold text-white">Add New Car</h3>
                                            <button onClick={() => setShowAddCarForm(false)}>
                                                <X className="w-6 h-6 text-white" />
                                            </button>
                                        </div>
                                        <form onSubmit={handleAddCar} className="space-y-4">
                                            <div className="grid grid-cols-2 gap-4">
                                                <input name="make" placeholder="Make" required className="p-3 border border-white/20 rounded-lg text-white" style={{ backgroundColor: '#3d3530' }} />
                                                <input name="model" placeholder="Model" required className="p-3 border border-white/20 rounded-lg text-white" style={{ backgroundColor: '#3d3530' }} />
                                                <input name="year" type="number" placeholder="Year" required className="p-3 border border-white/20 rounded-lg text-white" style={{ backgroundColor: '#3d3530' }} />
                                                <input name="price" type="number" placeholder="Price" required className="p-3 border border-white/20 rounded-lg text-white" style={{ backgroundColor: '#3d3530' }} />
                                                <input name="mileage" type="number" placeholder="Mileage (km)" required className="p-3 border border-white/20 rounded-lg text-white" style={{ backgroundColor: '#3d3530' }} />
                                                <select name="fuel" className="p-3 border border-white/20 rounded-lg text-white" style={{ backgroundColor: '#3d3530' }}>
                                                    <option value="Petrol">Petrol</option>
                                                    <option value="Diesel">Diesel</option>
                                                    <option value="Electric">Electric</option>
                                                    <option value="Hybrid">Hybrid</option>
                                                </select>
                                                <select name="transmission" className="p-3 border border-white/20 rounded-lg text-white" style={{ backgroundColor: '#3d3530' }}>
                                                    <option value="Manual">Manual</option>
                                                    <option value="Automatic">Automatic</option>
                                                </select>
                                                <select name="type" className="p-3 border border-white/20 rounded-lg text-white" style={{ backgroundColor: '#3d3530' }}>
                                                    <option value="sedan">Sedan</option>
                                                    <option value="suv">SUV</option>
                                                    <option value="hatchback">Hatchback</option>
                                                    <option value="luxury">Luxury</option>
                                                </select>
                                            </div>
                                            <input name="owner" placeholder="Owner (e.g., 1st Owner)" className="w-full p-3 border border-white/20 rounded-lg text-white" style={{ backgroundColor: '#3d3530' }} />
                                            <input name="image" placeholder="Image URL" className="w-full p-3 border border-white/20 rounded-lg text-white" style={{ backgroundColor: '#3d3530' }} />
                                            <textarea name="description" placeholder="Description" rows={3} className="w-full p-3 border border-white/20 rounded-lg text-white" style={{ backgroundColor: '#3d3530' }}></textarea>
                                            <button type="submit" className="w-full bg-luxury-puce text-white py-3 rounded-lg font-semibold hover:opacity-90">
                                                Add Car
                                            </button>
                                        </form>
                                    </div>
                                </div>
                            )}

                            {/* Cars Table */}
                            <div className="rounded-xl shadow-md overflow-hidden border border-white/10" style={{ backgroundColor: '#56453E' }}>
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="border-b border-white/10" style={{ backgroundColor: '#56453E' }}>
                                            <tr>
                                                <th className="px-6 py-4 text-left text-sm font-serif font-semibold text-white">ID</th>
                                                <th className="px-6 py-4 text-left text-sm font-serif font-semibold text-white">Car</th>
                                                <th className="px-6 py-4 text-left text-sm font-serif font-semibold text-white">Year</th>
                                                <th className="px-6 py-4 text-left text-sm font-serif font-semibold text-white">Price</th>
                                                <th className="px-6 py-4 text-left text-sm font-serif font-semibold text-white">Mileage</th>
                                                <th className="px-6 py-4 text-left text-sm font-serif font-semibold text-white">Status</th>
                                                <th className="px-6 py-4 text-left text-sm font-serif font-semibold text-white">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {cars.map(car => (
                                                <tr key={car.id} className="hover:bg-luxury-gold/5 transition-colors">
                                                    <td className="px-6 py-4 text-sm text-gray-300 font-mono">{car.id}</td>
                                                    <td className="px-6 py-4">
                                                        <div className="font-medium text-white">{car.make} {car.model}</div>
                                                        <div className="text-xs text-gray-300 mt-1">{car.fuel} • {car.transmission}</div>
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-gray-300">{car.year}</td>
                                                    <td className="px-6 py-4 text-sm font-semibold text-white">₹{car.price.toLocaleString()}</td>
                                                    <td className="px-6 py-4 text-sm text-gray-300">{car.mileage.toLocaleString()} km</td>
                                                    <td className="px-6 py-4">
                                                        <span className={`px-3 py-1 text-xs font-medium rounded-full ${car.status === 'available' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                                            }`}>
                                                            {car.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex space-x-2">
                                                            <button
                                                                onClick={() => handleDeleteCar(car.id)}
                                                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                                                            >
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
                        </div>
                    )}

                    {activeTab === 'sales' && (
                        <div>
                            <h2 className="text-2xl font-serif font-bold mb-6 text-luxury-text">Sales Orders</h2>
                            <div className="rounded-xl shadow-md overflow-hidden border border-white/10" style={{ backgroundColor: '#56453E' }}>
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="border-b border-white/10" style={{ backgroundColor: '#56453E' }}>
                                            <tr>
                                                <th className="px-6 py-4 text-left text-sm font-serif font-semibold text-white">Order ID</th>
                                                <th className="px-6 py-4 text-left text-sm font-serif font-semibold text-white">Car</th>
                                                <th className="px-6 py-4 text-left text-sm font-serif font-semibold text-white">Price</th>
                                                <th className="px-6 py-4 text-left text-sm font-serif font-semibold text-white">Date</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {sales.map(sale => (
                                                <tr key={sale.order_id} className="hover:bg-luxury-gold/5 transition-colors">
                                                    <td className="px-6 py-4 text-sm font-mono text-gray-300">{sale.order_id}</td>
                                                    <td className="px-6 py-4 text-sm text-white font-medium">{sale.car_name}</td>
                                                    <td className="px-6 py-4 text-sm font-semibold text-white">₹{sale.price.toLocaleString()}</td>
                                                    <td className="px-6 py-4 text-sm text-gray-300">{new Date(sale.timestamp).toLocaleDateString()}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'sell-requests' && (
                        <div>
                            <h2 className="text-2xl font-serif font-bold mb-6 text-luxury-text">Sell Requests</h2>
                            <div className="rounded-xl shadow-md overflow-hidden border border-white/10" style={{ backgroundColor: '#56453E' }}>
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="border-b border-white/10" style={{ backgroundColor: '#56453E' }}>
                                            <tr>
                                                <th className="px-6 py-4 text-left text-sm font-serif font-semibold text-white">Owner</th>
                                                <th className="px-6 py-4 text-left text-sm font-serif font-semibold text-white">Car</th>
                                                <th className="px-6 py-4 text-left text-sm font-serif font-semibold text-white">Year</th>
                                                <th className="px-6 py-4 text-left text-sm font-serif font-semibold text-white">Asking Price</th>
                                                <th className="px-6 py-4 text-left text-sm font-serif font-semibold text-white">Status</th>
                                                <th className="px-6 py-4 text-left text-sm font-serif font-semibold text-white">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {sellRequests.map(req => (
                                                <tr key={req.request_id} className="hover:bg-luxury-gold/5 transition-colors">
                                                    <td className="px-6 py-4">
                                                        <div className="font-medium text-white">{req.owner_name}</div>
                                                        <div className="text-xs text-gray-300 mt-1">{req.phone}</div>
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-white">{req.make} {req.model}</td>
                                                    <td className="px-6 py-4 text-sm text-gray-300">{req.year}</td>
                                                    <td className="px-6 py-4 text-sm font-semibold text-white">₹{req.price.toLocaleString()}</td>
                                                    <td className="px-6 py-4">
                                                        <span className={`px-3 py-1 text-xs font-medium rounded-full ${req.status === 'pending' ? 'bg-orange-100 text-orange-800' :
                                                            req.status === 'approved' ? 'bg-green-100 text-green-800' :
                                                                'bg-red-100 text-red-800'
                                                            }`}>
                                                            {req.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex space-x-2">
                                                            <button onClick={() => handleUpdateStatus('sell-requests', req.request_id, 'approved')} className="p-1 text-green-600 hover:bg-green-50 rounded"><Check className="w-4 h-4" /></button>
                                                            <button onClick={() => handleUpdateStatus('sell-requests', req.request_id, 'rejected')} className="p-1 text-red-600 hover:bg-red-50 rounded"><X className="w-4 h-4" /></button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'services' && (
                        <div>
                            <h2 className="text-2xl font-serif font-bold mb-6 text-luxury-text">Service Bookings</h2>
                            <div className="rounded-xl shadow-md overflow-hidden border border-white/10" style={{ backgroundColor: '#56453E' }}>
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="border-b border-white/10" style={{ backgroundColor: '#56453E' }}>
                                            <tr>
                                                <th className="px-6 py-4 text-left text-sm font-serif font-semibold text-white">Customer</th>
                                                <th className="px-6 py-4 text-left text-sm font-serif font-semibold text-white">Service Type</th>
                                                <th className="px-6 py-4 text-left text-sm font-serif font-semibold text-white">Date</th>
                                                <th className="px-6 py-4 text-left text-sm font-serif font-semibold text-white">Status</th>
                                                <th className="px-6 py-4 text-left text-sm font-serif font-semibold text-white">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {services.map(service => (
                                                <tr key={service.service_id} className="hover:bg-luxury-gold/5 transition-colors">
                                                    <td className="px-6 py-4">
                                                        <div className="font-medium text-white">{service.name}</div>
                                                        <div className="text-xs text-gray-300 mt-1">{service.phone}</div>
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-white">{service.service_type}</td>
                                                    <td className="px-6 py-4 text-sm text-gray-300">{new Date(service.preferred_date).toLocaleDateString()}</td>
                                                    <td className="px-6 py-4">
                                                        <span className={`px-3 py-1 text-xs font-medium rounded-full ${service.status === 'pending' ? 'bg-indigo-100 text-indigo-800' :
                                                            service.status === 'completed' ? 'bg-green-100 text-green-800' :
                                                                'bg-gray-100 text-gray-800'
                                                            }`}>
                                                            {service.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex space-x-2">
                                                            <button onClick={() => handleUpdateStatus('services', service.service_id, 'completed')} className="p-1 text-green-600 hover:bg-green-50 rounded"><Check className="w-4 h-4" /></button>
                                                            <button onClick={() => handleUpdateStatus('services', service.service_id, 'cancelled')} className="p-1 text-red-600 hover:bg-red-50 rounded"><X className="w-4 h-4" /></button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'contacts' && (
                        <div>
                            <h2 className="text-2xl font-bold mb-6">Contact Messages</h2>
                            <div className="space-y-4">
                                {contacts.map(contact => (
                                    <div key={contact.contact_id} className="border border-white/20 rounded-lg p-4" style={{ backgroundColor: '#56453E' }}>
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <div className="font-semibold text-white">{contact.name}</div>
                                                <div className="text-sm text-gray-300">{contact.email}</div>
                                            </div>
                                            <div className="text-sm text-gray-300">
                                                {new Date(contact.timestamp).toLocaleDateString()}
                                            </div>
                                        </div>
                                        <p className="text-gray-200">{contact.message}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default EmployeeDashboard;
