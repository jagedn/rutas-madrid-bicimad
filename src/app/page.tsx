import Link from 'next/link';

export default function LandingPage() {
    return (
        <div className="flex flex-col items-center justify-center px-4 py-12 text-center">
            {/* Hero Section */}
            <header className="max-w-3xl mb-16">
                <h1 className="text-5xl font-extrabold tracking-tight text-slate-900 sm:text-6xl mb-6">
                    Rutas por <span className="text-blue-600">Madrid</span>
                </h1>
                <p className="text-lg text-slate-600 mb-10 leading-relaxed">
                    Explora los edificios y monumentos más singulares de la capital usando la red de BiciMAD.
                    Una experiencia de navegación por voz impulsada por Open Data.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link href="/ruta"
                          className="px-8 py-4 bg-blue-600 text-white rounded-full font-bold shadow-lg hover:bg-blue-700 transition-all transform hover:scale-105">
                        Empezar Ruta con BiciMad
                    </Link>
                    <Link href="/docs"
                          className="px-8 py-4 bg-white text-slate-700 border border-slate-200 rounded-full font-bold hover:bg-slate-50 transition-all">
                        Ver Documentación
                    </Link>
                </div>
            </header>

            {/* Feature Section */}
            <section className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl w-full mt-10">
                <div className="p-6 bg-white rounded-2xl shadow-sm border border-slate-100">
                    <div className="text-blue-500 text-3xl mb-4">📍</div>
                    <h3 className="font-bold text-xl mb-2 text-slate-800">2.100+ Puntos</h3>
                    <p className="text-slate-500 text-sm">Monumentos y edificios históricos extraídos directamente del
                        catálogo oficial.</p>
                </div>
                <div className="p-6 bg-white rounded-2xl shadow-sm border border-slate-100">
                    <div className="text-blue-500 text-3xl mb-4">🚲</div>
                    <h3 className="font-bold text-xl mb-2 text-slate-800">BiciMAD Live</h3>
                    <p className="text-slate-500 text-sm">Disponibilidad de bicicletas y anclajes en tiempo real para tu
                        ruta.</p>
                </div>
                <div className="p-6 bg-white rounded-2xl shadow-sm border border-slate-100">
                    <div className="text-blue-500 text-3xl mb-4">🗣️</div>
                    <h3 className="font-bold text-xl mb-2 text-slate-800">Guiado por Voz</h3>
                    <p className="text-slate-500 text-sm">No mires el móvil. Nuestra IA te narrará la historia de Madrid
                        mientras pedaleas.</p>
                </div>
            </section>

            <footer className="mt-24 text-slate-400 text-sm">
                Proyecto desarrollado para el Concurso Open Data Madrid 2026
            </footer>
        </div>
    );
}
