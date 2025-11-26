import { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Car, ShoppingCart, User, LogOut, Menu, X, ChevronDown } from 'lucide-react';

interface NavbarProps {
    user: any;
    cartCount: number;
    logout: () => void;
    openLogin: () => void;
    openCart: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ user, cartCount, logout, openLogin, openCart }) => {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
    const location = useLocation();
    const dropdownRef = useRef<HTMLDivElement>(null);

    const isActive = (path: string) => location.pathname === path
        ? "text-luxury-gold"
        : "text-gray-400 hover:text-white";

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setProfileDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <header className="fixed w-full top-0 z-50 bg-luxury-black/80 backdrop-blur-xl border-b border-white/5">
            <div className="max-w-7xl mx-auto px-6 flex justify-between items-center h-20">

                {/* Logo */}
                <Link to="/" className="flex items-center gap-3">
                    <span className="text-2xl font-serif tracking-wide">SB Motors</span>
                </Link>

                {/* Desktop Nav */}
                <nav className="hidden lg:flex items-center space-x-10 text-sm">
                    <Link to="/" className={isActive("/")}>Home</Link>
                    <Link to="/buy" className={isActive("/buy")}>Buy</Link>
                    <Link to="/sell" className={isActive("/sell")}>Sell</Link>
                    <Link to="/service" className={isActive("/service")}>Service</Link>
                    <Link to="/about" className={isActive("/about")}>About</Link>
                    <Link to="/contact" className={isActive("/contact")}>Contact</Link>
                </nav>

                {/* Right Actions */}
                <div className="hidden lg:flex items-center space-x-6">
                    <button onClick={openCart} className="relative text-gray-400 hover:text-white transition">
                        <ShoppingCart className="w-5 h-5" strokeWidth={1.5} />
                        {cartCount > 0 && (
                            <span className="absolute -top-2 -right-2 bg-luxury-gold text-black text-xs w-5 h-5 flex items-center justify-center rounded-full font-medium">
                                {cartCount}
                            </span>
                        )}
                    </button>

                    {user ? (
                        <div className="relative" ref={dropdownRef}>
                            <button
                                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                                className="flex items-center space-x-2 text-sm text-gray-400 hover:text-white transition"
                            >
                                <span>{user.name}</span>
                                <ChevronDown className={`w-4 h-4 transition-transform ${profileDropdownOpen ? 'rotate-180' : ''}`} />
                            </button>

                            {profileDropdownOpen && (
                                <div className="absolute right-0 mt-4 w-48 bg-luxury-charcoal border border-white/10 py-2">
                                    <Link
                                        to="/profile"
                                        onClick={() => setProfileDropdownOpen(false)}
                                        className="block px-6 py-3 text-sm text-gray-400 hover:text-white hover:bg-white/5 transition"
                                    >
                                        Profile
                                    </Link>
                                    <button
                                        onClick={() => { logout(); setProfileDropdownOpen(false); }}
                                        className="w-full text-left px-6 py-3 text-sm text-gray-400 hover:text-white hover:bg-white/5 transition"
                                    >
                                        Logout
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <button onClick={openLogin} className="text-sm text-gray-400 hover:text-white transition">
                            Login
                        </button>
                    )}
                </div>

                {/* Mobile Menu Button */}
                <button className="lg:hidden text-white" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                    {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
            </div>

            {/* Mobile Menu */}
            {mobileMenuOpen && (
                <div className="lg:hidden bg-luxury-black border-t border-white/5 p-6 space-y-4">
                    <Link to="/" className="block text-white" onClick={() => setMobileMenuOpen(false)}>Home</Link>
                    <Link to="/buy" className="block text-white" onClick={() => setMobileMenuOpen(false)}>Buy</Link>
                    <Link to="/sell" className="block text-white" onClick={() => setMobileMenuOpen(false)}>Sell</Link>
                    <Link to="/service" className="block text-white" onClick={() => setMobileMenuOpen(false)}>Service</Link>
                    <Link to="/about" className="block text-white" onClick={() => setMobileMenuOpen(false)}>About</Link>
                    <Link to="/contact" className="block text-white" onClick={() => setMobileMenuOpen(false)}>Contact</Link>

                    <div className="pt-4 border-t border-white/10 flex flex-col gap-4">
                        <button onClick={() => { openCart(); setMobileMenuOpen(false); }} className="text-left text-white">
                            Cart ({cartCount})
                        </button>
                        {user ? (
                            <>
                                <Link to="/profile" onClick={() => setMobileMenuOpen(false)} className="text-white">Profile</Link>
                                <button onClick={logout} className="text-left text-white">Logout</button>
                            </>
                        ) : (
                            <button onClick={() => { openLogin(); setMobileMenuOpen(false); }} className="text-left text-white">Login</button>
                        )}
                    </div>
                </div>
            )}
        </header>
    );
};

export default Navbar;
