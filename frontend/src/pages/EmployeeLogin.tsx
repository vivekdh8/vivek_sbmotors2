import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, User } from 'lucide-react';

const API_BASE = 'http://localhost:8000';

const EmployeeLogin = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const res = await fetch(`${API_BASE}/api/employee/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }),
                credentials: 'include'
            });

            if (res.ok) {
                navigate('/employee-dashboard');
            } else {
                setError('Invalid credentials');
            }
        } catch (err) {
            setError('Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-luxury-black flex items-center justify-center py-12 px-4">
            <div className="max-w-md w-full">
                <div className="glass-panel p-10">

                    {/* Header */}
                    <div className="text-center mb-10">
                        <div className="w-16 h-16 border border-white/10 flex items-center justify-center mx-auto mb-6">
                            <Lock className="w-6 h-6 text-luxury-gold" />
                        </div>
                        <h2 className="text-2xl font-serif text-white mb-2">Employee Login</h2>
                        <p className="text-gray-500 text-sm">Access Dashboard</p>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 mb-6 text-sm text-center">
                            {error}
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="text-xs text-gray-500 mb-2 block">Username</label>
                            <div className="relative">
                                <User className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-600" />
                                <input
                                    type="text"
                                    name="employee-username"
                                    autoComplete="off"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    required
                                    className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 text-white focus:border-luxury-gold outline-none transition"
                                    placeholder="Enter username"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="text-xs text-gray-500 mb-2 block">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-600" />
                                <input
                                    type="password"
                                    name="employee-password"
                                    autoComplete="off"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 text-white focus:border-luxury-gold outline-none transition"
                                    placeholder="Enter password"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full btn-gold"
                        >
                            {loading ? 'Logging in...' : 'Login'}
                        </button>
                    </form>

                    {/* Back Link */}
                    <div className="mt-8 text-center">
                        <button
                            onClick={() => navigate('/')}
                            className="text-gray-500 hover:text-white text-sm transition"
                        >
                            ← Back to Home
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EmployeeLogin;
