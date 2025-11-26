import type { UserData } from '../types';
import { Wrench, Clock, ShieldCheck } from 'lucide-react';

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
        <div className="bg-luxury-black min-h-screen py-32 relative overflow-hidden">
            {/* Background */}
            <div className="absolute inset-0 z-0">
                <div className="absolute top-0 right-0 w-2/3 h-full bg-gradient-to-l from-luxury-charcoal to-transparent opacity-50"></div>
            </div>

            <div className="max-w-7xl mx-auto px-6 relative z-10 grid lg:grid-cols-2 gap-16 items-center">

                {/* Content Side */}
                <div className="space-y-12">
                    <div>
                        <h2 className="text-luxury-gold text-sm tracking-[0.4em] uppercase mb-4">Aftersales</h2>
                        <h1 className="text-5xl md:text-6xl font-serif text-white mb-6">Uncompromising Care</h1>
                        <p className="text-gray-400 font-light leading-relaxed text-lg">
                            Maintain the peak performance of your vehicle with our certified service center.
                            Our master technicians use only genuine parts and state-of-the-art diagnostic equipment.
                        </p>
                    </div>

                    <div className="space-y-8">
                        {[
                            { icon: Wrench, title: "Master Technicians", desc: "Factory trained experts dedicated to perfection." },
                            { icon: Clock, title: "Priority Scheduling", desc: "Exclusive time slots for our members." },
                            { icon: ShieldCheck, title: "Genuine Parts", desc: "Only original components for lasting performance." }
                        ].map((item, i) => (
                            <div key={i} className="flex gap-6">
                                <div className="w-12 h-12 rounded-full border border-luxury-gold/30 flex items-center justify-center text-luxury-gold shrink-0">
                                    <item.icon className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="text-white font-serif text-xl mb-2">{item.title}</h3>
                                    <p className="text-gray-500 font-light text-sm">{item.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Form Side */}
                <div className="glass-panel p-10 rounded-sm border border-white/10">
                    <h3 className="text-2xl font-serif text-white mb-8 text-center">Schedule Service</h3>
                    <form onSubmit={handleFormSubmit} className="space-y-6">
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-xs uppercase tracking-widest text-gray-500">Name</label>
                                <input name="owner_name" placeholder="Full Name" required className="w-full p-4 bg-white/5 border border-white/10 text-white focus:border-luxury-gold outline-none transition" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs uppercase tracking-widest text-gray-500">Phone</label>
                                <input name="phone" placeholder="Contact Number" required className="w-full p-4 bg-white/5 border border-white/10 text-white focus:border-luxury-gold outline-none transition" />
                            </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-xs uppercase tracking-widest text-gray-500">Vehicle ID</label>
                                <input name="car_id" placeholder="Optional" className="w-full p-4 bg-white/5 border border-white/10 text-white focus:border-luxury-gold outline-none transition" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs uppercase tracking-widest text-gray-500">Preferred Date</label>
                                <input name="service_date" type="date" className="w-full p-4 bg-white/5 border border-white/10 text-white focus:border-luxury-gold outline-none transition [color-scheme:dark]" />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs uppercase tracking-widest text-gray-500">Service Requirements</label>
                            <textarea name="notes" placeholder="Describe issues or required maintenance..." className="w-full p-4 bg-white/5 border border-white/10 text-white focus:border-luxury-gold outline-none transition" rows={4}></textarea>
                        </div>

                        <button type="submit" className="w-full btn-gold py-4 text-sm mt-4">
                            Confirm Appointment
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Service;
