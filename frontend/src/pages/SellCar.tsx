import type { UserData } from '../types';
import { Star, Upload } from 'lucide-react';

const API_BASE = 'http://localhost:8000/api';

interface SellCarProps {
    user: UserData | null;
    openLogin: () => void;
}

const SellCar: React.FC<SellCarProps> = ({ user, openLogin }) => {
    const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!user) {
            openLogin();
            alert("Please login first.");
            return;
        }

        const data = Object.fromEntries(new FormData(e.currentTarget));
        try {
            const res = await fetch(`${API_BASE}/sell`, {
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
            {/* Background Elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
                <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-luxury-gold/5 rounded-full blur-[100px]"></div>
                <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-900/10 rounded-full blur-[100px]"></div>
            </div>

            <div className="max-w-4xl mx-auto px-6 relative z-10">
                <div className="text-center mb-16">
                    <h2 className="text-luxury-gold text-sm tracking-[0.4em] uppercase mb-4">Consignment</h2>
                    <h1 className="text-4xl md:text-5xl font-serif text-white mb-6">Sell Your Masterpiece</h1>
                    <p className="text-gray-400 font-light max-w-2xl mx-auto leading-relaxed">
                        Entrust your vehicle to us. We ensure a seamless transaction, offering the highest market value and immediate payment for pristine examples of automotive engineering.
                    </p>
                </div>

                <div className="glass-panel p-10 rounded-sm animate-in fade-in slide-in-from-bottom-8">
                    <form onSubmit={handleFormSubmit} className="space-y-8">
                        <div className="grid md:grid-cols-2 gap-8">
                            <div className="space-y-2">
                                <label className="text-xs uppercase tracking-widest text-gray-500">Owner Name</label>
                                <input name="owner_name" placeholder="Full Name" required className="w-full p-4 bg-white/5 border border-white/10 text-white focus:border-luxury-gold outline-none transition" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs uppercase tracking-widest text-gray-500">Contact Number</label>
                                <input name="phone" placeholder="+91" required className="w-full p-4 bg-white/5 border border-white/10 text-white focus:border-luxury-gold outline-none transition" />
                            </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-8">
                            <div className="space-y-2">
                                <label className="text-xs uppercase tracking-widest text-gray-500">Vehicle Make</label>
                                <input name="make" placeholder="e.g. Mercedes-Benz" required className="w-full p-4 bg-white/5 border border-white/10 text-white focus:border-luxury-gold outline-none transition" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs uppercase tracking-widest text-gray-500">Vehicle Model</label>
                                <input name="model" placeholder="e.g. S-Class" required className="w-full p-4 bg-white/5 border border-white/10 text-white focus:border-luxury-gold outline-none transition" />
                            </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-8">
                            <div className="space-y-2">
                                <label className="text-xs uppercase tracking-widest text-gray-500">Year of Manufacture</label>
                                <input name="year" type="number" placeholder="YYYY" required className="w-full p-4 bg-white/5 border border-white/10 text-white focus:border-luxury-gold outline-none transition" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs uppercase tracking-widest text-gray-500">Expected Price</label>
                                <input name="asking_price" type="number" placeholder="₹" required className="w-full p-4 bg-white/5 border border-white/10 text-white focus:border-luxury-gold outline-none transition" />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs uppercase tracking-widest text-gray-500">Additional Details</label>
                            <textarea name="notes" placeholder="Condition, Service History, Modifications..." className="w-full p-4 bg-white/5 border border-white/10 text-white focus:border-luxury-gold outline-none transition" rows={4}></textarea>
                        </div>

                        <div className="pt-4">
                            <button type="submit" className="w-full btn-gold py-4 text-sm">
                                Submit for Valuation
                            </button>
                        </div>

                        <p className="text-center text-xs text-gray-600 uppercase tracking-widest mt-6">
                            * Our concierge team will contact you within 24 hours.
                        </p>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default SellCar;
