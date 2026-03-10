'use client';

import {useState, useEffect} from 'react';
import Link from 'next/link';

export default function RutaPage() {
    const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
    const [nearestPlace, setNearestPlace] = useState<any>(null);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [isTracking, setIsTracking] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [routeWaypoints, setRouteWaypoints] = useState<any[]>([]);


    const speak = (text: string) => {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();

            const utterance = new SpeechSynthesisUtterance(text);

            const voices = window.speechSynthesis.getVoices();

            const preferredVoice = voices.find(v => v.name == 'Spanish (Spain)+Andrea');

            if (preferredVoice) utterance.voice = preferredVoice;


            utterance.pitch = 1.0;
            utterance.volume = 1.0;
            utterance.lang = 'es-ES';
            utterance.rate = 0.75;

            utterance.onstart = () => setIsSpeaking(true);
            utterance.onend = () => setIsSpeaking(false);
            window.speechSynthesis.speak(utterance);
            console.log("done")
        }
    };

    const startTracking = () => {
        if (!navigator.geolocation) {
            setError("Tu navegador no soporta geolocalización.");
            return;
        }

        setIsTracking(true);

        // watchPosition mantiene el GPS activo
        navigator.geolocation.watchPosition(
            (position) => {
                setCoords({
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                });
                setError(null);
            },
            (err) => {
                alert(err.code)
                setError("Permiso denegado o GPS apagado.");
                setIsTracking(false);
            },
            {enableHighAccuracy: true, timeout: 10000, maximumAge: 0}
        );
    };

    useEffect(() => {
        if (coords && !routeWaypoints.length) {
            fetch(`/api/nearby?lat=${coords.lat}&lng=${coords.lng}`)
                .then(res => res.json())
                .then(data => {
                    if (data && data.id !== nearestPlace?.id) {
                        const intro = `Estás cerca de ${data.title}.`;
                        const description = (data?.resumen || "Un edificio singular de Madrid.") + " " + (data?.epoca ? `De la epoca ${data.epoca}` : '');
                        speak(`${intro} ${description}`);

                        setNearestPlace(data);
                        const estilo = data?.estilo;

                        if (estilo) {
                            // Buscamos la ruta temática basada en el estilo del primer monumento
                            fetch(`/api/route?lat=${coords.lat}&lng=${coords.lng}&estilo=${estilo}&currentId=${data.id}`)
                                .then(res => res.json())
                                .then(waypoints => setRouteWaypoints(waypoints));
                        }

                    }
                })
                .catch(err => console.error("Error buscando cercanía:", err));
        }
    }, [coords]);

    useEffect(() => {
        const loadVoices = () => {
            window.speechSynthesis.getVoices().filter(v => v.lang.startsWith('es')).forEach(function (voice) {
                console.log(voice.name)
            });
        };

        window.speechSynthesis.onvoiceschanged = loadVoices;
        loadVoices();
        setTimeout(loadVoices, 100);
    }, []);

    return (
        <div className="min-h-screen bg-slate-50 p-6 flex flex-col items-center">
            <div className="w-full max-w-md">
                <Link href="/" className="text-blue-600 font-medium mb-8 inline-block hover:underline">
                    ← Inicio
                </Link>

                <h1 className="text-3xl font-extrabold text-slate-900 mb-2">Modo Guía</h1>
                <p className="text-slate-500 mb-8">La app narrará la historia de los edificios según camines o
                    pedalees.</p>

                {/* Panel de Control Central */}
                {!isTracking ? (
                    <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-100 text-center">
                        <div
                            className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                            <span className="text-3xl">📡</span>
                        </div>
                        <h2 className="text-xl font-bold mb-3">Activar Seguimiento</h2>
                        <p className="text-slate-500 text-sm mb-6">
                            Para que la audioguía funcione, necesitamos acceso a tu ubicación en tiempo real.
                        </p>
                        <button
                            onClick={startTracking}
                            className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold text-lg hover:bg-blue-700 transition-all shadow-lg shadow-blue-200"
                        >
                            Empezar ahora
                        </button>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {/* Estado del GPS */}
                        <div
                            className="flex items-center justify-between bg-white px-5 py-3 rounded-2xl shadow-sm border border-slate-100">
                            <div className="flex items-center gap-2">
                <span className="flex h-3 w-3 relative">
                  <span
                      className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                </span>
                                <span className="text-sm font-semibold text-slate-700">Explorando Madrid...</span>
                            </div>

                            {isSpeaking && (
                                <div className="flex items-center gap-1">
                                    {[1, 2, 3, 4].map((i) => (
                                        <div
                                            key={i}
                                            className="w-1 bg-blue-500 rounded-full animate-bounce"
                                            style={{
                                                height: `${Math.random() * 15 + 5}px`,
                                                animationDelay: `${i * 0.1}s`
                                            }}
                                        ></div>
                                    ))}
                                </div>
                            )}

                        </div>

                        {/* Tarjeta del Monumento Cercano */}
                        {nearestPlace ? (
                            <div
                                className="bg-blue-600 text-white p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden">
                                {/* Decoración sutil */}
                                <div
                                    className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-3xl"></div>

                                <span
                                    className="bg-white/20 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                  Detectado
                </span>
                                <h2 className="text-2xl font-bold mt-4 mb-3">{nearestPlace.title}</h2>
                                <p className="text-blue-100 leading-relaxed text-sm">
                                    {nearestPlace?.resumen || "Buscando detalles históricos en la base de datos..."}
                                </p>

                                {nearestPlace?.curiosidad && (
                                    <div className="mt-6 pt-6 border-t border-white/10">
                                        <p className="text-xs italic text-blue-200">
                                            " {nearestPlace.curiosidad} "
                                        </p>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div
                                className="bg-slate-200 animate-pulse h-48 rounded-[2.5rem] flex items-center justify-center text-slate-400 italic">
                                Buscando puntos de interés cercanos...
                            </div>
                        )}


                        {routeWaypoints.length > 0 && (
                            <div className="mt-8 space-y-4">
                                <h3 className="text-lg font-bold text-slate-800 px-2">
                                    Tu ruta <span className="text-blue-600">{nearestPlace?.estilo}</span>
                                </h3>
                                <div className="flex flex-col gap-3">
                                    {routeWaypoints.map((wp, index) => (
                                        <div key={wp.id}
                                             className="flex items-center gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                                            <div
                                                className="flex-none w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center text-xs font-bold text-slate-500">
                                                {index + 1}
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-sm font-bold text-slate-700">{wp.title}</p>
                                                <p className="text-xs text-slate-400">{wp.streetAddress}</p>
                                            </div>
                                            <div className="text-blue-500 text-xs font-bold">
                                                {/* Aquí calcularemos luego la distancia */}
                                                {index === 0 ? "Próxima parada" : ""}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}


                    </div>
                )}

                {error && (
                    <div
                        className="mt-6 p-4 bg-red-50 text-red-600 rounded-2xl text-sm text-center border border-red-100">
                        ⚠️ {error}
                    </div>
                )}
            </div>
        </div>
    );
}
