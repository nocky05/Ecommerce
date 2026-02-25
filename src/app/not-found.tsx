"use client";

import Link from "next/link";

export default function NotFound() {
    return (
        <div className="min-h-screen bg-white d-flex items-center justify-center p-4 text-center">
            <div style={{ maxWidth: '600px' }}>
                {/* Animated Musical Icon */}
                <div className="mb-8 relative d-flex justify-center">
                    <div style={{
                        width: '120px',
                        height: '120px',
                        background: 'linear-gradient(135deg, #007BFF, #00C6FF)',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 20px 40px rgba(0, 123, 255, 0.2)',
                        animation: 'float 3s ease-in-out infinite'
                    }}>
                        <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                            <path d="M9 18V5l12-2v13" />
                            <circle cx="6" cy="18" r="3" />
                            <circle cx="18" cy="16" r="3" />
                            <line x1="1" y1="1" x2="23" y2="23" stroke="white" strokeWidth="3" style={{ opacity: 0.8 }} />
                        </svg>
                    </div>
                    <span style={{
                        position: 'absolute',
                        top: '-20px',
                        right: '0',
                        fontSize: '80px',
                        fontWeight: '900',
                        color: 'rgba(0,0,0,0.05)',
                        zIndex: -1
                    }}>404</span>
                </div>

                <h1 className="text-4xl font-black mb-4" style={{ color: '#111' }}>Oups ! Fausse Note.</h1>
                <p className="text-gray-500 mb-10" style={{ fontSize: '1.1rem', lineHeight: '1.6' }}>
                    La page que vous recherchez semble être partie en tournée. <br />
                    Ne vous inquiétez pas, le reste de l'orchestre est toujours là.
                </p>

                <div className="d-flex flex-column gap-3 items-center">
                    <Link href="/" className="btn btn-primary px-10 py-4 font-black uppercase tracking-widest" style={{ borderRadius: '12px', minWidth: '280px', textDecoration: 'none' }}>
                        RETOUR À L'ACCUEIL
                    </Link>
                    <Link href="/shop" className="text-primary font-bold hover:underline transition" style={{ textDecoration: 'none', fontSize: '14px' }}>
                        PARCOURIR LE CATALOGUE →
                    </Link>
                </div>

                {/* Support Link */}
                <div className="mt-16 pt-8 border-top border-gray-100">
                    <p className="text-xs text-gray-400">Besoin d'aide ? <Link href="/contact" className="text-gray-600 font-bold underline">Contactez notre support</Link></p>
                </div>
            </div>

            <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-20px); }
        }
      `}</style>
        </div>
    );
}
