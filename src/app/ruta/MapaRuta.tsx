'use client';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useEffect } from 'react';
import React from "react";


const icon = L.icon({
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
});

const biciIcon = L.icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/3198/3198336.png',
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
});

function RecenterMap({ coords }: { coords: { latitude: number; longitude: number } }) {
    const map = useMap();
    useEffect(() => {
        map.setView([coords.latitude, coords.longitude], 16);
    }, [coords, map]);
    return null;
}

export default function MapaRuta({ userCoords, waypoints, originStation }: any) {

    const polylinePoints: [number, number][] = [
        [userCoords.latitude, userCoords.longitude],
    ];
    if (originStation) {
        polylinePoints.push([originStation.latitude, originStation.longitude]);
    }
    waypoints.forEach((wp: any) => {
        polylinePoints.push([wp.latitude, wp.longitude]);
    });
    console.log(polylinePoints);
    return (
        <div className="h-64 w-full rounded-3xl overflow-hidden shadow-inner border border-slate-200 my-4">
            <MapContainer
                center={[userCoords.latitude, userCoords.longitude]}
                zoom={16}
                style={{ height: '100%', width: '100%' }}
                zoomControl={false}
            >
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

                {/* RecenterMap coords={userCoords} */}

                {/* Marcador del Usuario */}
                <Marker position={[userCoords.latitude, userCoords.longitude]} icon={icon}>
                    <Popup>Tú estás aquí</Popup>
                </Marker>

                {/* Marcadores de los monumentos de la ruta */}
                {waypoints.map((wp: any) => (

                    <React.Fragment key={wp.id}>
                        {/* 1. Marcador del Monumento */}
                        <Marker position={[wp.latitude, wp.longitude]} icon={icon}>
                            <Popup>
                                <div className="font-bold">{wp.title}</div>
                                <div className="text-xs text-slate-500">{wp.estilo}</div>
                            </Popup>
                        </Marker>

                        {originStation && (
                            <Marker position={[originStation.latitude, originStation.longitude]} icon={biciIcon}>
                                <Popup>
                                    <div className="font-bold text-orange-600">🚲 Estación Recomendada Inicio</div>
                                    <p>Tienes {originStation.bikes} bicis disponibles aquí para empezar tu ruta.</p>
                                </Popup>
                            </Marker>
                        )}

                        {/* 2. Marcador de la Estación BiciMAD (si existe en los datos) */}
                        {wp.bicimad && wp.bicimad.latitude && (
                            <Marker
                                position={[wp.bicimad.latitude, wp.bicimad.longitude]}
                                icon={biciIcon}
                            >
                                <Popup>
                                    <div className="font-bold text-blue-600">Estación BiciMAD</div>
                                    <div className="text-sm">{wp.bicimad.stationName}</div>
                                    <div className="mt-1 font-bold">🚲 {wp.bicimad.bikes} bicis disponibles</div>
                                </Popup>
                            </Marker>
                        )}

                        {/* 3. Opcional: Una línea fina que una el monumento con SU estación */}
                        {wp.bicimad && wp.bicimad.latitude && (
                            <Polyline
                                positions={[[wp.latitude, wp.longitude], [wp.bicimad.latitude, wp.bicimad.longitude]]}
                                color="#10b981"
                                weight={2}
                                dashArray="5, 5"
                            />
                        )}
                    </React.Fragment>

                ))}

                {/* Línea de ruta */}
                <Polyline positions={polylinePoints} color="#2563eb" weight={4} opacity={0.6} dashArray="10, 10" />
            </MapContainer>
        </div>
    );
}