import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { X, ShoppingCart, Trash2 } from 'lucide-react';

import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import BuyCar from './pages/BuyCar';
import SellCar from './pages/SellCar';
import Service from './pages/Service';
import Contact from './pages/Contact';
import About from './pages/About';
import Profile from './pages/Profile';
import EmployeeLogin from './pages/EmployeeLogin';
import AdminDashboard from './pages/AdminDashboard';

import type { CarData, UserData } from './types';

const API_BASE = 'http://localhost:8000/api';

const App = () => {
  // Auth & Cart State
  const [user, setUser] = useState<UserData | null>(null);
  const [cart, setCart] = useState<CarData[]>([]);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  // Fetch User on Mount
  useEffect(() => {
    checkUser();
  }, []);

  // Fetch Cart when user changes
  useEffect(() => {
    if (user) fetchCart();
    else setCart([]);
  }, [user]);

  const checkUser = async () => {
    try {
      const res = await fetch(`${API_BASE}/user`);
      if (res.ok) {
        const data = await res.json();
        setUser(data);
      }
    } catch (err) {
      console.log("Not logged in");
    }
  };

  const fetchCart = async () => {
    try {
      const res = await fetch(`${API_BASE}/cart`);
      if (res.ok) {
        const data = await res.json();
        const adaptedCart = data.map((car: any) => ({
          id: car.id,
          name: `${car.make ?? ''} ${car.model ?? ''}`.trim(),
          year: car.year ?? "N/A",
          price: `₹${car.price ?? 0}`,
          image: car.image ?? "🚗",
          status: car.status
        }));
        setCart(adaptedCart);
      }
    } catch (err) {
      console.error("Failed to fetch cart", err);
    }
  };

  const handleAuth = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData);
    const endpoint = authMode === 'login' ? 'login' : 'register';

    try {
      const res = await fetch(`${API_BASE}/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data)
      });
      const result = await res.json();
      if (res.ok) {
        setUser(result.user);
        setIsLoginOpen(false);
        alert(result.message);
      } else {
        alert(result.message);
      }
    } catch (err) {
      alert("Authentication failed");
    }
  };

  const logout = async () => {
    await fetch(`${API_BASE}/logout`, { method: 'POST', credentials: 'include' });
    setUser(null);
    setCart([]);
    alert("Logged out");
  };

  const addToCart = async (carId: string) => {
    if (!user) {
      setIsLoginOpen(true);
      return;
    }
    try {
      const res = await fetch(`${API_BASE}/cart/add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ car_id: carId })
      });
      if (res.ok) {
        fetchCart();
        alert("Added to cart!");
      }
    } catch (err) {
      alert("Failed to add to cart");
    }
  };

  const removeFromCart = async (carId: string) => {
    try {
      const res = await fetch(`${API_BASE}/cart/remove`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ car_id: carId })
      });
      if (res.ok) fetchCart();
    } catch (err) {
      console.error(err);
    }
  };

  const checkout = async () => {
    try {
      const res = await fetch(`${API_BASE}/cart/checkout`, { method: 'POST', credentials: 'include' });
      const result = await res.json();
      if (res.ok) {
        alert(result.message);
        setCart([]);
        setIsCartOpen(false);
        // Ideally refresh cars list if we were on Buy page, but simple reload works for now or just let it be
      } else {
        alert(result.message);
      }
    } catch (err) {
      alert("Checkout failed");
    }
  };

  return (
    <Router>
      <div className="min-h-screen flex flex-col font-sans text-gray-900" style={{ backgroundColor: '#f2f0ea' }}>
        <Navbar
          user={user}
          cartCount={cart.length}
          logout={logout}
          openLogin={() => setIsLoginOpen(true)}
          openCart={() => setIsCartOpen(true)}
        />

        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/buy" element={<BuyCar addToCart={addToCart} />} />
            <Route path="/sell" element={<SellCar user={user} openLogin={() => setIsLoginOpen(true)} />} />
            <Route path="/service" element={<Service user={user} openLogin={() => setIsLoginOpen(true)} />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/about" element={<About />} />
            <Route path="/profile" element={<Profile user={user} openLogin={() => setIsLoginOpen(true)} />} />
            <Route path="/employee-login" element={<EmployeeLogin />} />
            <Route path="/employee-dashboard" element={<AdminDashboard />} />
          </Routes>
        </main>

        <Footer />

        {/* Login/Register Modal */}
        {isLoginOpen && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setIsLoginOpen(false)}>
            <div className="bg-[#56453E] w-full max-w-md p-10 rounded-xl shadow-2xl relative border border-white/10" onClick={e => e.stopPropagation()}>
              <button
                onClick={() => setIsLoginOpen(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-white transition"
              >
                <X className="w-6 h-6" />
              </button>

              <div className="text-center mb-8">
                <h2 className="text-3xl font-serif text-white mb-2">{authMode === 'login' ? 'Welcome Back' : 'Join the Club'}</h2>
                <p className="text-gray-400 text-sm">Access your personalized luxury experience</p>
              </div>

              <form onSubmit={handleAuth} className="space-y-5">
                {authMode === 'register' && (
                  <div>
                    <label className="text-xs uppercase tracking-widest text-gray-400 font-medium mb-2 block">Full Name</label>
                    <input name="name" placeholder="John Doe" required className="input-luxury-dark rounded-lg" />
                  </div>
                )}
                <div>
                  <label className="text-xs uppercase tracking-widest text-gray-400 font-medium mb-2 block">Phone Number</label>
                  <input name="phone" placeholder="+91 98765 43210" required className="input-luxury-dark rounded-lg" />
                </div>
                <div>
                  <label className="text-xs uppercase tracking-widest text-gray-400 font-medium mb-2 block">Password</label>
                  <input name="password" type="password" placeholder="••••••••" required className="input-luxury-dark rounded-lg" />
                </div>

                <button type="submit" className="w-full btn-gold py-3 rounded-lg shadow-lg shadow-luxury-gold/20 hover:shadow-luxury-gold/40 mt-2">
                  {authMode === 'login' ? 'Login' : 'Create Account'}
                </button>
              </form>

              <div className="mt-8 text-center text-sm text-gray-500">
                {authMode === 'login' ? "Not a member yet? " : "Already a member? "}
                <button onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')} className="text-luxury-gold hover:text-white transition font-medium">
                  {authMode === 'login' ? 'Register Now' : 'Login'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Cart Drawer */}
        {isCartOpen && (
          <div className="fixed inset-0 z-50 flex justify-end">
            <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setIsCartOpen(false)}></div>
            <div className="relative bg-white w-full max-w-md h-full shadow-2xl flex flex-col">
              <div className="p-6 border-b flex justify-between items-center bg-gray-50">
                <h2 className="text-xl font-bold flex items-center gap-2"><ShoppingCart className="w-5 h-5" /> Your Cart</h2>
                <button onClick={() => setIsCartOpen(false)}><X className="w-6 h-6 text-gray-500" /></button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {cart.length === 0 ? (
                  <div className="text-center text-gray-500 mt-20">
                    <ShoppingCart className="w-16 h-16 mx-auto mb-4 opacity-20" />
                    <p>Your cart is empty</p>
                  </div>
                ) : (
                  cart.map((item, i) => (
                    <div key={i} className="flex gap-4 bg-white border p-3 rounded-xl shadow-sm">
                      <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center text-2xl">{item.image}</div>
                      <div className="flex-1">
                        <h4 className="font-bold">{item.name}</h4>
                        <p className="text-blue-600 font-bold text-sm">{item.price}</p>
                        <button onClick={() => removeFromCart(item.id)} className="text-red-500 text-xs flex items-center gap-1 mt-2 hover:underline">
                          <Trash2 className="w-3 h-3" /> Remove
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="p-6 border-t bg-gray-50">
                <button onClick={checkout} disabled={cart.length === 0} className="w-full bg-green-600 text-white py-4 rounded-xl font-bold hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed">
                  Checkout Request
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Router>
  );
};

export default App;
