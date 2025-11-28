import type { UserData } from '../types';

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
        <div className="min-h-screen py-32 relative overflow-hidden" style={{ backgroundColor: '#f2f0ea' }}>
            {/* Background Elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
                <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-luxury-gold/5 rounded-full blur-[100px]"></div>
                <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-900/5 rounded-full blur-[100px]"></div>
            </div>

            <div className="max-w-4xl mx-auto px-6 relative z-10">
                <div className="text-center mb-16">
                    <h2 className="text-luxury-gold text-sm tracking-[0.4em] uppercase mb-4 font-semibold">Consignment</h2>
                    <h1 className="text-4xl md:text-5xl font-serif text-luxury-text mb-6">Sell Your Masterpiece</h1>
                    <p className="text-gray-600 font-light max-w-2xl mx-auto leading-relaxed">
                        Entrust your vehicle to us. We ensure a seamless transaction, offering the highest market value and immediate payment for pristine examples of automotive engineering.
                    </p>
                </div>

                <div className="bg-[#56453E] p-10 rounded-xl shadow-2xl animate-in fade-in slide-in-from-bottom-8">
                    <form onSubmit={handleFormSubmit} className="space-y-8">
                        <div className="grid md:grid-cols-2 gap-8">
                            <div className="space-y-2">
                                <label className="text-xs uppercase tracking-widest text-white/80 font-medium">Owner Name</label>
                                <input name="owner_name" placeholder="Full Name" required className="input-luxury-dark rounded-lg" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs uppercase tracking-widest text-white/80 font-medium">Contact Number</label>
                                <input name="phone" placeholder="+91" required className="input-luxury-dark rounded-lg" />
                            </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-8">
                            <div className="space-y-2">
                                <label className="text-xs uppercase tracking-widest text-white/80 font-medium">Vehicle Make</label>
                                <input name="make" placeholder="e.g. Mercedes-Benz" required className="input-luxury-dark rounded-lg" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs uppercase tracking-widest text-white/80 font-medium">Vehicle Model</label>
                                <input name="model" placeholder="e.g. S-Class" required className="input-luxury-dark rounded-lg" />
                            </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-8">
                            <div className="space-y-2">
                                <label className="text-xs uppercase tracking-widest text-white/80 font-medium">Year of Manufacture</label>
                                <input name="year" type="number" placeholder="YYYY" required className="input-luxury-dark rounded-lg" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs uppercase tracking-widest text-white/80 font-medium">Expected Price</label>
                                <input name="asking_price" type="number" placeholder="₹" required className="input-luxury-dark rounded-lg" />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs uppercase tracking-widest text-white/80 font-medium">Additional Details</label>
                            <textarea name="notes" placeholder="Condition, Service History, Modifications..." className="input-luxury-dark rounded-lg" rows={4}></textarea>
                        </div>

                        <div className="pt-4">
                            <button type="submit" className="w-full btn-gold py-4 text-sm rounded-lg shadow-lg shadow-luxury-gold/20 hover:shadow-luxury-gold/40">
                                Submit for Valuation
                            </button>
                        </div>

                        <p className="text-center text-xs text-white/60 uppercase tracking-widest mt-6">
                            * Our concierge team will contact you within 24 hours.
                        </p>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default SellCar;
