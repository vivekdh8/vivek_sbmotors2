import React from 'react';
import { MapPin, Phone, Mail, ArrowRight } from 'lucide-react';

const API_BASE = 'http://localhost:8000/api';

const Contact = () => {
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
        <div className="bg-luxury-black min-h-screen py-32">
            <div className="max-w-7xl mx-auto px-6">
                <div className="grid lg:grid-cols-2 gap-20">

                    {/* Contact Info */}
                    <div className="space-y-16">
                        <div>
                            <h2 className="text-luxury-gold text-sm tracking-[0.4em] uppercase mb-4">Concierge</h2>
                            <h1 className="text-5xl md:text-6xl font-serif text-white mb-8">At Your Service</h1>
                            <p className="text-gray-400 text-lg font-light leading-relaxed">
                                Whether you wish to arrange a private viewing, discuss consignment, or simply share our passion for automobiles, our dedicated team awaits your correspondence.
                            </p>
                        </div>

                        <div className="space-y-12">
                            <div className="group flex items-start space-x-6">
                                <div className="p-4 rounded-full border border-white/10 group-hover:border-luxury-gold transition duration-500">
                                    <MapPin className="w-6 h-6 text-luxury-gold" />
                                </div>
                                <div>
                                    <h3 className="font-serif text-xl text-white mb-2">The Showroom</h3>
                                    <p className="text-gray-500 font-light leading-relaxed">
                                        Sy No 80/2 Kapnoor Industrial Area<br />
                                        Humnabad Road, Kalaburagi 585104
                                    </p>
                                    <a href="#" className="inline-flex items-center gap-2 text-luxury-gold text-xs uppercase tracking-widest mt-4 hover:text-white transition">
                                        Get Directions <ArrowRight className="w-3 h-3" />
                                    </a>
                                </div>
                            </div>

                            <div className="group flex items-start space-x-6">
                                <div className="p-4 rounded-full border border-white/10 group-hover:border-luxury-gold transition duration-500">
                                    <Phone className="w-6 h-6 text-luxury-gold" />
                                </div>
                                <div>
                                    <h3 className="font-serif text-xl text-white mb-2">Direct Line</h3>
                                    <p className="text-gray-500 font-light">+91 97423 71777</p>
                                    <p className="text-gray-600 text-sm mt-1">Mon - Sat, 10:00 AM - 7:00 PM</p>
                                </div>
                            </div>

                            <div className="group flex items-start space-x-6">
                                <div className="p-4 rounded-full border border-white/10 group-hover:border-luxury-gold transition duration-500">
                                    <Mail className="w-6 h-6 text-luxury-gold" />
                                </div>
                                <div>
                                    <h3 className="font-serif text-xl text-white mb-2">Digital Correspondence</h3>
                                    <p className="text-gray-500 font-light">sharanu.ratkal@sbmotors.in</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Contact Form */}
                    <div className="glass-panel p-10 rounded-sm border border-white/10">
                        <h3 className="text-2xl font-serif text-white mb-8">Send a Message</h3>
                        <form onSubmit={handleFormSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-xs uppercase tracking-widest text-gray-500">Full Name</label>
                                <input name="name" placeholder="John Doe" required className="w-full p-4 bg-white/5 border border-white/10 text-white focus:border-luxury-gold outline-none transition" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs uppercase tracking-widest text-gray-500">Email Address</label>
                                <input name="email" type="email" placeholder="john@example.com" required className="w-full p-4 bg-white/5 border border-white/10 text-white focus:border-luxury-gold outline-none transition" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs uppercase tracking-widest text-gray-500">Message</label>
                                <textarea name="message" placeholder="How can we assist you?" required className="w-full p-4 bg-white/5 border border-white/10 text-white focus:border-luxury-gold outline-none transition" rows={6}></textarea>
                            </div>
                            <button type="submit" className="w-full btn-gold py-4 text-sm mt-4">
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
