import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Shield, Award, Clock, Wrench } from 'lucide-react';

const API_BASE = 'http://localhost:8000';

const Home = () => {
    const [heroVideo, setHeroVideo] = useState<string | null>(null);

    useEffect(() => {
        const fetchHeroVideo = async () => {
            try {
                const res = await fetch(`${API_BASE}/api/settings/hero-video`);
                const data = await res.json();
                if (data.video_url) {
                    setHeroVideo(data.video_url);
                }
            } catch (err) {
                console.error('Failed to fetch hero video:', err);
            }
        };
        fetchHeroVideo();
    }, []);

    return (
        <div className="bg-luxury-black text-white">

            {/* Hero Section */}
            <section className="relative min-h-screen flex items-center justify-center px-6 overflow-hidden">
                <div className="absolute inset-0 opacity-30">
                    {heroVideo ? (
                        <video
                            autoPlay
                            loop
                            muted
                            playsInline
                            className="w-full h-full object-cover"
                        >
                            <source src={`${API_BASE}${heroVideo}`} type="video/mp4" />
                        </video>
                    ) : (
                        <img
                            src="https://images.unsplash.com/photo-1503376763036-066120622c74?auto=format&fit=crop&q=80"
                            className="w-full h-full object-cover"
                            alt="Luxury Car"
                        />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-b from-luxury-black via-luxury-black/80 to-luxury-black"></div>
                </div>

                <div className="relative z-10 text-center max-w-4xl">
                    <h1 className="text-6xl md:text-8xl font-serif mb-8 tracking-tight">
                        SB Motors
                    </h1>
                    <p className="text-xl md:text-2xl text-gray-400 mb-12 font-light">
                        North Karnataka's largest used car dealership
                    </p>
                    <div className="flex flex-col md:flex-row gap-6 justify-center">
                        <Link to="/buy" className="btn-gold">
                            View Collection
                        </Link>
                        <Link to="/sell" className="btn-outline">
                            Sell Your Car
                        </Link>
                    </div>
                </div>
            </section>

            {/* Features */}
            <section className="py-32 px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
                        {[
                            { icon: Shield, title: 'Certified Quality', desc: '150-point inspection on every vehicle' },
                            { icon: Award, title: 'Best Prices', desc: 'Competitive pricing with instant financing' },
                            { icon: Clock, title: 'Quick Process', desc: 'Buy or sell in under 30 minutes' },
                            { icon: Wrench, title: 'Full Service', desc: 'Comprehensive warranty and maintenance' }
                        ].map((item, i) => (
                            <div key={i} className="text-center">
                                <div className="inline-flex p-4 mb-6 border border-white/10">
                                    <item.icon className="w-8 h-8 text-luxury-gold" strokeWidth={1} />
                                </div>
                                <h3 className="text-xl font-serif mb-3">{item.title}</h3>
                                <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-32 px-6 border-t border-white/5">
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className="text-4xl md:text-5xl font-serif mb-6">
                        Ready to Find Your Next Car?
                    </h2>
                    <p className="text-gray-400 text-lg mb-12 font-light">
                        Browse our curated selection of pre-owned vehicles
                    </p>
                    <Link to="/buy" className="btn-gold">
                        Explore Inventory
                    </Link>
                </div>
            </section>
        </div>
    );
};

export default Home;
