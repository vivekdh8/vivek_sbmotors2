import { MapPin, Phone, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
    return (
        <footer className="bg-luxury-black text-gray-500 py-16 border-t border-white/5">
            <div className="max-w-7xl mx-auto px-6">

                {/* Main Footer Content */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">

                    {/* Brand */}
                    <div>
                        <h3 className="text-2xl font-serif text-white mb-4">SB Motors</h3>
                        <p className="text-sm leading-relaxed mb-6">
                            North Karnataka's trusted dealership for pre-owned vehicles.
                        </p>
                        <blockquote className="border-l-2 border-luxury-gold pl-4 italic text-sm text-gray-400">
                            "Loyalty is a two-way street. If I'm asking you for it, then you're getting it back from me."
                        </blockquote>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="text-white text-sm font-medium mb-4">Quick Links</h4>
                        <ul className="space-y-3 text-sm">
                            <li><Link to="/buy" className="hover:text-white transition">Buy Car</Link></li>
                            <li><Link to="/sell" className="hover:text-white transition">Sell Car</Link></li>
                            <li><Link to="/service" className="hover:text-white transition">Service</Link></li>
                            <li><Link to="/about" className="hover:text-white transition">About Us</Link></li>
                            <li><Link to="/contact" className="hover:text-white transition">Contact</Link></li>
                            <li><Link to="/employee-login" className="hover:text-luxury-gold transition">Employee Login</Link></li>
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h4 className="text-white text-sm font-medium mb-4">Contact</h4>
                        <ul className="space-y-3 text-sm">
                            <li className="flex items-start gap-3">
                                <MapPin className="w-4 h-4 text-luxury-gold shrink-0 mt-1" />
                                <span>Sy No 80/2 Kapnoor Industrial Area, Humnabad Road, Kalaburagi 585104</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <Phone className="w-4 h-4 text-luxury-gold shrink-0" />
                                <span>+91 97423 71777</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <Mail className="w-4 h-4 text-luxury-gold shrink-0" />
                                <span>sharanu.ratkal@sbmotors.in</span>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center text-xs">
                    <p>&copy; 2024 SB Motors. All rights reserved.</p>
                    <p className="mt-2 md:mt-0">Authorized Channel Partner of CARS24 | ISUZU Authorized Dealer</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
