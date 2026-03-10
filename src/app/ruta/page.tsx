'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';

const MapaRuta = dynamic(() => import('./MapaRuta'), {
    ssr: false,
    loading: () => <div className="h-64 w-full bg-slate-100 animate-pulse rounded-3xl" />
});

export default function RutaPage() {
    const [coords, setCoords] = useState<{ latitude: number; longitude: number } | null>(null);
    const [nearestPlace, setNearestPlace] = useState<any>(null);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [isTracking, setIsTracking] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [hasWelcomed, setHasWelcomed] = useState(false);
    const [routeData, setRouteData] = useState<{ originStation: any; waypoints: any[] } | null>(null);
    const [loadingRoute, setLoadingRoute] = useState(false);

    const speak = useCallback((text: string) => {
        if (typeof window !== 'undefined' && window.speechSynthesis) {
            window.speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(text);
            const voices = window.speechSynthesis.getVoices();

            const preferredVoice = voices.find(v =>
                v.name.includes('Andrea') || v.name.includes('Google español'));
            if (preferredVoice) utterance.voice = preferredVoice;

            utterance.lang = 'es-ES';
            utterance.rate = 0.9;
            utterance.onstart = () => setIsSpeaking(true);
            utterance.onend = () => setIsSpeaking(false);
            window.speechSynthesis.speak(utterance);
        }
    }, []);

    const startTracking = () => {
        if (!navigator.geolocation) {
            setError("Tu navegador no soporta geolocalización.");
            return;
        }
        setIsTracking(true);
        navigator.geolocation.watchPosition(
            (position) => {
                setCoords({ latitude: position.coords.latitude, longitude: position.coords.longitude });
                setError(null);
            },
            (err) => {
                setError("Permiso denegado o GPS apagado.");
                setIsTracking(false);
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
    };

    const handleStartRoute = () => {
        speak("Buscando ruta...");
        startTracking();
    };

    useEffect(() => {
        if (!coords || loadingRoute || routeData) return;
        const getInitialRoute = async () => {
            setLoadingRoute(true);
            try {
                // Paso 1: Buscar el monumento más cercano
                const resNearby = await fetch(`/api/nearby?lat=${coords.latitude}&lng=${coords.longitude}`);
                const place = await resNearby.json();

                if (place && place.id) {
                    setNearestPlace(place);

                    const resRoute = await fetch(
                        `/api/route?lat=${coords.latitude}&lng=${coords.longitude}&estilo=${place.estilo}&currentId=${place.id}`
                    );
                    const route = await resRoute.json();
                    setRouteData(route);
                }
            } catch (err) {
                console.error("Error cargando ruta inicial:", err);
            } finally {
                setLoadingRoute(false);
            }
        };

        getInitialRoute();
    }, [coords, routeData, loadingRoute]);

    useEffect(() => {
        if (!isTracking) return;

        if (routeData && !hasWelcomed) {
            const txt = `Ruta lista. Coge tu bici en ${routeData.originStation.name}. Tienes ${routeData.originStation.bikes} disponibles. Tu primera parada es ${nearestPlace?.title}.`;
            speak(txt);
            setHasWelcomed(true);
            return;
        }

        if (hasWelcomed && nearestPlace) {
            speak(`Estás en ${nearestPlace.title}. ${nearestPlace.resumen || ''}`);
        }
    }, [routeData, nearestPlace, isTracking, hasWelcomed, speak]);


    useEffect(() => {
        let wakeLock: any = null;
        const requestWakeLock = async () => {
            try { if ('wakeLock' in navigator) wakeLock = await (navigator as any).wakeLock.request('screen'); }
            catch (err) { console.log("Wake Lock fail"); }
        };
        if (isTracking) requestWakeLock();
        return () => { if (wakeLock) wakeLock.release(); };
    }, [isTracking]);

    return (
        <div className="min-h-screen bg-slate-50 p-6 flex flex-col items-center font-sans text-slate-900">
            <div className="w-full max-w-md">
                <Link href="/" className="text-blue-600 font-medium mb-8 inline-block">← Inicio</Link>
                <h1 className="text-3xl font-extrabold mb-2">Tu ruta</h1>

                {!isTracking ? (
                    <div className="bg-white p-8 rounded-3xl shadow-xl text-center border border-slate-100">
                        <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 text-3xl">🚲</div>
                        <h2 className="text-xl font-bold mb-3">Activar Seguimiento</h2>
                        <button onClick={handleStartRoute} className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold text-lg shadow-lg">
                            Empezar ahora
                        </button>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {/* Status Bar */}
                        <div className="flex items-center justify-between bg-white px-5 py-3 rounded-2xl shadow-sm border border-slate-100">
                            <div className="flex items-center gap-2">
                                <span className="relative flex h-3 w-3">
                                    <span className="animate-ping absolute h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                    <span className="relative rounded-full h-3 w-3 bg-green-500"></span>
                                </span>
                                <span className="text-sm font-semibold">En ruta</span>
                            </div>
                            {isSpeaking && (
                                <div className="flex gap-1 items-end h-4">
                                    {[1,2,3,4].map(i => <div key={i} className="w-1 bg-blue-500 animate-bounce" style={{height: '100%', animationDelay: `${i*0.1}s`}} />)}
                                </div>
                            )}
                        </div>

                        {/* Monumento actual */}
                        {nearestPlace && (
                            <div className="bg-blue-600 text-white p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden">
                                <h2 className="text-2xl font-bold mb-2">{nearestPlace.title}</h2>
                                <p className="text-blue-100 text-sm">{nearestPlace.resumen}</p>
                            </div>
                        )}

                        {/* Mapa y Siguientes paradas */}
                        {coords && routeData && (
                            <div className="space-y-4">
                                <h3 className="text-lg font-bold px-2 italic text-slate-500">
                                    Ruta {nearestPlace?.estilo || 'personalizada'}
                                </h3>
                                <MapaRuta userCoords={coords} waypoints={routeData.waypoints} originStation={routeData.originStation} />

                                <div className="space-y-3">
                                    {routeData.waypoints.map((wp, i) => (
                                        <div key={wp.id} className="bg-white p-4 rounded-2xl border flex gap-4 items-center">
                                            <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center text-xs font-bold">{i+1}</div>
                                            <div className="flex-1">
                                                <p className="text-sm font-bold">{wp.title}</p>
                                                {wp.bicimad && (
                                                    <div className="text-[10px] mt-1 text-green-600 font-bold uppercase tracking-tight">
                                                        🚲 {wp.bicimad.bikes} bicis en {wp.bicimad.stationName}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
                {error && <div className="mt-6 p-4 bg-red-50 text-red-600 rounded-2xl text-center text-sm">{error}</div>}
            </div>
        </div>
    );
}