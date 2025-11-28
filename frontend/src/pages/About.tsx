const About = () => {
    return (
        <div className="min-h-screen py-32 text-luxury-text" style={{ backgroundColor: '#bb785eff' }}>
            <div className="max-w-7xl mx-auto px-6">

                {/* Header */}
                <div className="text-center mb-24 relative">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-luxury-gold/20 blur-[80px] rounded-full"></div>
                    <h2 className="text-luxury-gold text-sm tracking-[0.4em] uppercase mb-4 relative z-10 font-semibold">Our Heritage</h2>
                    <h1 className="text-5xl md:text-7xl font-serif mb-8 relative z-10">The Art of Automotive</h1>
                    <p className="text-xl text-gray-600 max-w-3xl mx-auto font-light leading-relaxed relative z-10">
                        SB Motors is not merely a dealership; it is a curator of automotive excellence. We bridge the gap between aspiration and reality for the true connoisseur.
                    </p>
                </div>

                {/* Content Grid */}
                <div className="grid md:grid-cols-2 gap-20 items-center mb-32">
                    <div className="relative">
                        <div className="absolute inset-0 border border-luxury-gold/30 transform translate-x-4 translate-y-4"></div>
                        <img
                            src="https://images.unsplash.com/photo-1560179707-f14e90ef3623?auto=format&fit=crop&q=80"
                            alt="Showroom"
                            className="relative z-10 w-full h-[500px] object-cover grayscale hover:grayscale-0 transition duration-700 shadow-xl"
                        />
                    </div>
                    <div className="space-y-8">
                        <h2 className="text-4xl font-serif text-luxury-text">A Legacy of Trust</h2>
                        <div className="w-20 h-[1px] bg-luxury-gold"></div>
                        <p className="text-gray-600 text-lg leading-relaxed font-light">
                            Founded on the principles of integrity and passion, SB Motors has established itself as the premier destination for luxury pre-owned vehicles in North Karnataka.
                        </p>
                        <p className="text-gray-600 text-lg leading-relaxed font-light">
                            Our philosophy is simple: every vehicle we offer must meet an uncompromising standard of quality. We don't just sell cars; we deliver an experience that honors the engineering and artistry of each machine.
                        </p>
                        <div className="grid grid-cols-2 gap-8 pt-8">
                            <div>
                                <h3 className="text-3xl font-serif text-luxury-gold mb-2">500+</h3>
                                <p className="text-xs uppercase tracking-widest text-gray-500">Curated Vehicles Sold</p>
                            </div>
                            <div>
                                <h3 className="text-3xl font-serif text-luxury-gold mb-2">100%</h3>
                                <p className="text-xs uppercase tracking-widest text-gray-500">Client Satisfaction</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Partners Section */}
                <div className="border-t border-luxury-gold/10 pt-24">
                    <div className="text-center mb-16">
                        <h2 className="text-2xl font-serif text-luxury-text mb-4">Financial Partners</h2>
                        <p className="text-gray-500 text-sm uppercase tracking-widest">Trusted by the world's leading institutions</p>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-px bg-luxury-gold/10 border border-luxury-gold/10">
                        {[
                            'Bank of India', 'Bank of Baroda', 'Toyota Financial', 'Axis Bank',
                            'Kotak Mahindra', 'HDFC Bank', 'ICICI Bank', 'Hero FinCorp',
                            'HDB Financial', 'Tata Capital', 'Mahindra Finance', 'Bajaj Finserv'
                        ].map((partner, index) => (
                            <div
                                key={index}
                                className="bg-white p-8 flex items-center justify-center group hover:bg-luxury-gold/5 transition duration-500"
                            >
                                <span className="font-serif text-gray-500 text-center text-sm group-hover:text-luxury-gold transition duration-300">
                                    {partner}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </div>
    );
};

export default About;
