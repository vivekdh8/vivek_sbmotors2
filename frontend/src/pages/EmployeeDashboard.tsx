import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    LayoutDashboard, Car, ShoppingBag, FileText, Wrench,
    Mail, Users, LogOut, Plus, Edit2, Trash2, Check, X,
    Upload, Image as ImageIcon
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
    const [activeTab, setActiveTab] = useState('overview');
    const [stats, setStats] = useState<DashboardStats | null>(null);

    // Data states
    const [cars, setCars] = useState<CarData[]>([]);
    const [sales, setSales] = useState<any[]>([]);
    const [sellRequests, setSellRequests] = useState<any[]>([]);
    const [services, setServices] = useState<any[]>([]);
    const [contacts, setContacts] = useState<any[]>([]);

    // Form states
    const [showAddCarForm, setShowAddCarForm] = useState(false);
    const [editingCar, setEditingCar] = useState<CarData | null>(null);
    const [uploadingImage, setUploadingImage] = useState(false);

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

    const handleImageUpload = async (file: File): Promise<string> => {
        const formData = new FormData();
        formData.append('file', file);

        setUploadingImage(true);
        try {
            const res = await fetch(`${API_BASE}/api/employee/upload-image`, {
                method: 'POST',
                credentials: 'include',
                body: formData
            });
            const data = await res.json();
            return data.url;
        } catch (err) {
            alert('Image upload failed');
            return '';
        } finally {
            setUploadingImage(false);
        }
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

    const handleUpdateCar = async (carId: string, updates: Partial<CarData>) => {
        try {
            const res = await fetch(`${API_BASE}/api/employee/cars/${carId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(updates)
            });

            if (res.ok) {
                alert('Car updated successfully!');
                setEditingCar(null);
                loadDashboardData();
            }
        } catch (err) {
            alert('Failed to update car');
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
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-xl text-gray-600">Loading...</div>
            </div>
        );
    }

    if (!authenticated) {
        return null;
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
                    <div className="flex items-center space-x-3">
                        <LayoutDashboard className="w-8 h-8 text-blue-600" />
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">SB Motors Dashboard</h1>
                            <p className="text-sm text-gray-500">Welcome, {employeeName}</p>
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
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-500">Total Cars</p>
                                    <p className="text-3xl font-bold text-gray-900">{stats.total_cars}</p>
                                </div>
                                <Car className="w-10 h-10 text-blue-500" />
                            </div>
                        </div>
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-500">Available</p>
                                    <p className="text-3xl font-bold text-green-600">{stats.available_cars}</p>
                                </div>
                                <Check className="w-10 h-10 text-green-500" />
                            </div>
                        </div>
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-500">Total Sales</p>
                                    <p className="text-3xl font-bold text-purple-600">{stats.total_sales}</p>
                                </div>
                                <ShoppingBag className="w-10 h-10 text-purple-500" />
                            </div>
                        </div>
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-500">Sell Requests</p>
                                    <p className="text-3xl font-bold text-orange-600">{stats.pending_sell_requests}</p>
                                </div>
                                <FileText className="w-10 h-10 text-orange-500" />
                            </div>
                        </div>
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-500">Services</p>
                                    <p className="text-3xl font-bold text-indigo-600">{stats.pending_services}</p>
                                </div>
                                <Wrench className="w-10 h-10 text-indigo-500" />
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Tabs */}
            <div className="max-w-7xl mx-auto px-4">
                <div className="bg-white rounded-t-xl border-b border-gray-200">
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
                                        ? 'text-blue-600 border-b-2 border-blue-600'
                                        : 'text-gray-500 hover:text-gray-700'
                                    }`}
                            >
                                <tab.icon className="w-5 h-5" />
                                <span>{tab.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Tab Content */}
                <div className="bg-white rounded-b-xl shadow-sm p-6 mb-8">
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
                                    <div className="bg-white rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                                        <div className="flex justify-between items-center mb-4">
                                            <h3 className="text-xl font-bold">Add New Car</h3>
                                            <button onClick={() => setShowAddCarForm(false)}>
                                                <X className="w-6 h-6" />
                                            </button>
                                        </div>
                                        <form onSubmit={handleAddCar} className="space-y-4">
                                            <div className="grid grid-cols-2 gap-4">
                                                <input name="make" placeholder="Make" required className="p-3 border rounded-lg" />
                                                <input name="model" placeholder="Model" required className="p-3 border rounded-lg" />
                                                <input name="year" type="number" placeholder="Year" required className="p-3 border rounded-lg" />
                                                <input name="price" type="number" placeholder="Price" required className="p-3 border rounded-lg" />
                                                <input name="mileage" type="number" placeholder="Mileage (km)" required className="p-3 border rounded-lg" />
                                                <select name="fuel" className="p-3 border rounded-lg">
                                                    <option value="Petrol">Petrol</option>
                                                    <option value="Diesel">Diesel</option>
                                                    <option value="Electric">Electric</option>
                                                    <option value="Hybrid">Hybrid</option>
                                                </select>
                                                <select name="transmission" className="p-3 border rounded-lg">
                                                    <option value="Manual">Manual</option>
                                                    <option value="Automatic">Automatic</option>
                                                </select>
                                                <select name="type" className="p-3 border rounded-lg">
                                                    <option value="sedan">Sedan</option>
                                                    <option value="suv">SUV</option>
                                                    <option value="hatchback">Hatchback</option>
                                                    <option value="luxury">Luxury</option>
                                                </select>
                                            </div>
                                            <input name="owner" placeholder="Owner (e.g., 1st Owner)" className="w-full p-3 border rounded-lg" />
                                            <input name="image" placeholder="Image URL" className="w-full p-3 border rounded-lg" />
                                            <textarea name="description" placeholder="Description" rows={3} className="w-full p-3 border rounded-lg"></textarea>
                                            <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700">
                                                Add Car
                                            </button>
                                        </form>
                                    </div>
                                </div>
                            )}

                            {/* Cars Table */}
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">ID</th>
                                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Car</th>
                                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Year</th>
                                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Price</th>
                                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Mileage</th>
                                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {cars.map(car => (
                                            <tr key={car.id} className="hover:bg-gray-50">
                                                <td className="px-4 py-3 text-sm text-gray-600">{car.id}</td>
                                                <td className="px-4 py-3">
                                                    <div className="font-medium">{car.make} {car.model}</div>
                                                    <div className="text-sm text-gray-500">{car.fuel} • {car.transmission}</div>
                                                </td>
                                                <td className="px-4 py-3 text-sm">{car.year}</td>
                                                <td className="px-4 py-3 text-sm font-semibold">₹{car.price.toLocaleString()}</td>
                                                <td className="px-4 py-3 text-sm">{car.mileage.toLocaleString()} km</td>
                                                <td className="px-4 py-3">
                                                    <span className={`px-2 py-1 text-xs rounded-full ${car.status === 'available' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                                                        }`}>
                                                        {car.status}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex space-x-2">
                                                        <button
                                                            onClick={() => setEditingCar(car)}
                                                            className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                                                        >
                                                            <Edit2 className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteCar(car.id)}
                                                            className="p-2 text-red-600 hover:bg-red-50 rounded"
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
                    )}

                    {activeTab === 'sales' && (
                        <div>
                            <h2 className="text-2xl font-bold mb-6">Sales Orders</h2>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Order ID</th>
                                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Car</th>
                                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Price</th>
                                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Date</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {sales.map(sale => (
                                            <tr key={sale.order_id} className="hover:bg-gray-50">
                                                <td className="px-4 py-3 text-sm font-mono">{sale.order_id}</td>
                                                <td className="px-4 py-3 text-sm">{sale.car_name}</td>
                                                <td className="px-4 py-3 text-sm font-semibold">₹{sale.price.toLocaleString()}</td>
                                                <td className="px-4 py-3 text-sm text-gray-600">{new Date(sale.timestamp).toLocaleDateString()}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {activeTab === 'sell-requests' && (
                        <div>
                            <h2 className="text-2xl font-bold mb-6">Sell Requests</h2>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Owner</th>
                                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Car</th>
                                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Year</th>
                                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Asking Price</th>
                                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {sellRequests.map(req => (
                                            <tr key={req.request_id} className="hover:bg-gray-50">
                                                <td className="px-4 py-3">
                                                    <div className="font-medium">{req.owner_name}</div>
                                                    <div className="text-sm text-gray-500">{req.phone}</div>
                                                </td>
                                                <td className="px-4 py-3 text-sm">{req.make} {req.model}</td>
                                                <td className="px-4 py-3 text-sm">{req.year}</td>
                                                <td className="px-4 py-3 text-sm font-semibold">₹{req.asking_price.toLocaleString()}</td>
                                                <td className="px-4 py-3">
                                                    <span className={`px-2 py-1 text-xs rounded-full ${req.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                                            req.status === 'approved' ? 'bg-green-100 text-green-700' :
                                                                'bg-red-100 text-red-700'
                                                        }`}>
                                                        {req.status}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <select
                                                        value={req.status}
                                                        onChange={(e) => handleUpdateStatus('sell-requests', req.request_id, e.target.value)}
                                                        className="text-sm border rounded px-2 py-1"
                                                    >
                                                        <option value="pending">Pending</option>
                                                        <option value="approved">Approved</option>
                                                        <option value="rejected">Rejected</option>
                                                    </select>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {activeTab === 'services' && (
                        <div>
                            <h2 className="text-2xl font-bold mb-6">Service Bookings</h2>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Customer</th>
                                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Car ID</th>
                                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Service Date</th>
                                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Notes</th>
                                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {services.map(svc => (
                                            <tr key={svc.service_id} className="hover:bg-gray-50">
                                                <td className="px-4 py-3">
                                                    <div className="font-medium">{svc.owner_name}</div>
                                                    <div className="text-sm text-gray-500">{svc.phone}</div>
                                                </td>
                                                <td className="px-4 py-3 text-sm">{svc.car_id || 'N/A'}</td>
                                                <td className="px-4 py-3 text-sm">{svc.service_date || 'Not specified'}</td>
                                                <td className="px-4 py-3 text-sm text-gray-600">{svc.notes}</td>
                                                <td className="px-4 py-3">
                                                    <span className={`px-2 py-1 text-xs rounded-full ${svc.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                                            svc.status === 'scheduled' ? 'bg-blue-100 text-blue-700' :
                                                                'bg-green-100 text-green-700'
                                                        }`}>
                                                        {svc.status}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <select
                                                        value={svc.status}
                                                        onChange={(e) => handleUpdateStatus('services', svc.service_id, e.target.value)}
                                                        className="text-sm border rounded px-2 py-1"
                                                    >
                                                        <option value="pending">Pending</option>
                                                        <option value="scheduled">Scheduled</option>
                                                        <option value="completed">Completed</option>
                                                    </select>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {activeTab === 'contacts' && (
                        <div>
                            <h2 className="text-2xl font-bold mb-6">Contact Messages</h2>
                            <div className="space-y-4">
                                {contacts.map(contact => (
                                    <div key={contact.contact_id} className="border rounded-lg p-4 hover:bg-gray-50">
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <div className="font-semibold">{contact.name}</div>
                                                <div className="text-sm text-gray-500">{contact.email}</div>
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                {new Date(contact.timestamp).toLocaleDateString()}
                                            </div>
                                        </div>
                                        <p className="text-gray-700">{contact.message}</p>
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
