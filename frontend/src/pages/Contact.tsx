import { useState, useEffect } from 'react';
import { MapPin, Phone, Mail, ArrowRight, Facebook, Instagram, MessageCircle } from 'lucide-react';

const API_BASE = 'http://localhost:8000/api';

const Contact = () => {
    const [socialLinks, setSocialLinks] = useState({
        facebook_url: '',
        whatsapp_url: '',
        instagram_url: ''
    });

    useEffect(() => {
        const fetchSocialLinks = async () => {
            try {
                const res = await fetch('http://localhost:8000/api/settings/social-links');
                const data = await res.json();
                setSocialLinks(data);
            } catch (err) {
                console.error('Failed to load social links:', err);
            }
        };
        fetchSocialLinks();
    }, []);

    const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const data = Object.fromEntries(new FormData(e.currentTarget));
        try {
            const res = await fetch(`${API_BASE}/contact`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data)
            });
            const result = await res.json();
            alert(result.message || "Success!");
            e.currentTarget.reset();
        } catch (err) {
            console.error(err);
            alert("Request failed.");
        }
    };

    return (
        <div className="min-h-screen py-32" style={{ backgroundColor: '#f2f0ea' }}>
            <div className="max-w-7xl mx-auto px-6">
                <div className="grid lg:grid-cols-2 gap-20">

                    {/* Contact Info */}
                    <div className="space-y-16">
                        <div>
                            <h2 className="text-luxury-gold text-sm tracking-[0.4em] uppercase mb-4 font-semibold">Concierge</h2>
                            <h1 className="text-5xl md:text-6xl font-serif text-luxury-text mb-8">At Your Service</h1>
                            <p className="text-gray-600 text-lg font-light leading-relaxed">
                                Whether you wish to arrange a private viewing, discuss consignment, or simply share our passion for automobiles, our dedicated team awaits your correspondence.
                            </p>
                        </div>

                        <div className="space-y-12">
                            <div className="group flex items-start space-x-6">
                                <div className="p-4 rounded-full border border-luxury-gold/20 group-hover:border-luxury-gold transition duration-500 bg-white/50">
                                    <MapPin className="w-6 h-6 text-luxury-gold" />
                                </div>
                                <div>
                                    <h3 className="font-serif text-xl text-luxury-text mb-2">The Showroom</h3>
                                    <p className="text-gray-600 font-light leading-relaxed">
                                        Sy No 80/2 Kapnoor Industrial Area<br />
                                        Humnabad Road, Kalaburagi 585104
                                    </p>
                                    <a href="#" className="inline-flex items-center gap-2 text-luxury-gold text-xs uppercase tracking-widest mt-4 hover:text-luxury-text transition">
                                        Get Directions <ArrowRight className="w-3 h-3" />
                                    </a>
                                </div>
                            </div>

                            <div className="group flex items-start space-x-6">
                                <div className="p-4 rounded-full border border-luxury-gold/20 group-hover:border-luxury-gold transition duration-500 bg-white/50">
                                    <Phone className="w-6 h-6 text-luxury-gold" />
                                </div>
                                <div>
                                    <h3 className="font-serif text-xl text-luxury-text mb-2">Direct Line</h3>
                                    <p className="text-gray-600 font-light">+91 97423 71777</p>
                                    <p className="text-gray-500 text-sm mt-1">Mon - Sat, 10:00 AM - 7:00 PM</p>
                                </div>
                            </div>

                            <div className="group flex items-start space-x-6">
                                <div className="p-4 rounded-full border border-luxury-gold/20 group-hover:border-luxury-gold transition duration-500 bg-white/50">
                                    <Mail className="w-6 h-6 text-luxury-gold" />
                                </div>
                                <div>
                                    <h3 className="font-serif text-xl text-luxury-text mb-2">Digital Correspondence</h3>
                                    <p className="text-gray-600 font-light">sharanu.ratkal@sbmotors.in</p>
                                </div>
                            </div>

                            {/* Social Media Links */}
                            {(socialLinks.facebook_url || socialLinks.whatsapp_url || socialLinks.instagram_url) && (
                                <div className="pt-8 border-t border-luxury-gold/10">
                                    <h3 className="font-serif text-xl text-luxury-text mb-6">Connect With Us</h3>
                                    <div className="flex gap-4">
                                        {socialLinks.facebook_url && (
                                            <a
                                                href={socialLinks.facebook_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="p-4 rounded-full border border-luxury-gold/20 hover:border-luxury-gold hover:bg-luxury-gold/10 transition duration-500 group bg-white/50"
                                            >
                                                <Facebook className="w-6 h-6 text-luxury-gold group-hover:scale-110 transition" />
                                            </a>
                                        )}
                                        {socialLinks.whatsapp_url && (
                                            <a
                                                href={`https://wa.me/${socialLinks.whatsapp_url}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="p-4 rounded-full border border-luxury-gold/20 hover:border-luxury-gold hover:bg-luxury-gold/10 transition duration-500 group bg-white/50"
                                            >
                                                <MessageCircle className="w-6 h-6 text-luxury-gold group-hover:scale-110 transition" />
                                            </a>
                                        )}
                                        {socialLinks.instagram_url && (
                                            <a
                                                href={socialLinks.instagram_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="p-4 rounded-full border border-luxury-gold/20 hover:border-luxury-gold hover:bg-luxury-gold/10 transition duration-500 group bg-white/50"
                                            >
                                                <Instagram className="w-6 h-6 text-luxury-gold group-hover:scale-110 transition" />
                                            </a>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Contact Form */}
                    <div className="bg-[#56453E] p-10 rounded-xl shadow-2xl border border-white/10">
                        <h3 className="text-2xl font-serif text-white mb-8">Send a Message</h3>
                        <form onSubmit={handleFormSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-xs uppercase tracking-widest text-white/80 font-medium">Full Name</label>
                                <input name="name" placeholder="John Doe" required className="input-luxury-dark rounded-lg" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs uppercase tracking-widest text-white/80 font-medium">Email Address</label>
                                <input name="email" type="email" placeholder="john@example.com" required className="input-luxury-dark rounded-lg" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs uppercase tracking-widest text-white/80 font-medium">Message</label>
                                <textarea name="message" placeholder="How can we assist you?" required className="input-luxury-dark rounded-lg" rows={6}></textarea>
                            </div>
                            <button type="submit" className="w-full btn-gold py-4 text-sm mt-4 rounded-lg shadow-lg shadow-luxury-gold/20 hover:shadow-luxury-gold/40">
                                Send Message
                            </button>
                        </form>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default Contact;
