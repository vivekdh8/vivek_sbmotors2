import React from 'react';
import type { UserData } from '../types';

const API_BASE = 'http://localhost:8000/api';

interface ServiceProps {
    user: UserData | null;
    openLogin: () => void;
}

const Service: React.FC<ServiceProps> = ({ user, openLogin }) => {
    const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!user) {
            openLogin();
            alert("Please login first.");
            return;
        }

        const data = Object.fromEntries(new FormData(e.currentTarget));
        try {
            const res = await fetch(`${API_BASE}/service`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: 'include',
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
        <div className="min-h-screen py-32 relative overflow-hidden" style={{ backgroundColor: '#f2f0ea' }}>
            {/* Background Elements */}
            <div className="absolute top-0 right-0 w-full h-full overflow-hidden z-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-luxury-gold/5 rounded-full blur-[100px]"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-900/5 rounded-full blur-[100px]"></div>
            </div>

            <div className="max-w-7xl mx-auto px-6 relative z-10 grid lg:grid-cols-2 gap-16 items-center">
                <div className="space-y-8 animate-in fade-in slide-in-from-left-8">
                    <h2 className="text-luxury-gold text-sm tracking-[0.4em] uppercase font-semibold">Service Center</h2>
                    <h1 className="text-4xl md:text-5xl font-serif text-luxury-text leading-tight">
                        Expert Care for Your <br />
                        <span className="italic text-luxury-gold">Prized Possession</span>
                    </h1>
                    <p className="text-gray-600 font-light text-lg max-w-xl leading-relaxed">
                        Our state-of-the-art facility is staffed by factory-trained technicians dedicated to maintaining the performance and value of your luxury vehicle.
                    </p>

                    <div className="grid grid-cols-2 gap-6 pt-4">
                        {[
                            { title: 'Routine Maintenance', desc: 'Oil changes, filters, and inspections' },
                            { title: 'Diagnostics', desc: 'Advanced computer-aided troubleshooting' },
                            { title: 'Detailing', desc: 'Premium interior and exterior care' },
                            { title: 'Performance', desc: 'Tuning and aftermarket upgrades' }
                        ].map((item, i) => (
                            <div key={i} className="border border-luxury-gold/20 p-6 bg-white/50 backdrop-blur-sm hover:bg-white transition-colors duration-300">
                                <h3 className="text-luxury-text font-serif text-lg mb-2">{item.title}</h3>
                                <p className="text-gray-500 text-sm">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-[#56453E] p-10 rounded-xl shadow-2xl border border-white/10">
                    <h3 className="text-2xl font-serif text-white mb-8 text-center">Schedule Service</h3>
                    <form onSubmit={handleFormSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-xs uppercase tracking-widest text-white/80 font-medium">Name</label>
                            <input name="owner_name" placeholder="Full Name" required className="input-luxury-dark rounded-lg" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs uppercase tracking-widest text-white/80 font-medium">Phone Number</label>
                            <input name="phone" placeholder="+91" required className="input-luxury-dark rounded-lg" />
                        </div>
                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-xs uppercase tracking-widest text-white/80 font-medium">Make</label>
                                <input name="make" placeholder="Make" required className="input-luxury-dark rounded-lg" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs uppercase tracking-widest text-white/80 font-medium">Model</label>
                                <input name="model" placeholder="Model" required className="input-luxury-dark rounded-lg" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs uppercase tracking-widest text-white/80 font-medium">Service Required</label>
                            <textarea name="service_type" placeholder="Describe the issue or service needed..." className="input-luxury-dark rounded-lg" rows={3}></textarea>
                        </div>
                        <div className="pt-4">
                            <button type="submit" className="w-full btn-gold py-4 text-sm rounded-lg shadow-lg shadow-luxury-gold/20 hover:shadow-luxury-gold/40">
                                Request Appointment
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Service;
