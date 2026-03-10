import {NextResponse} from 'next/server';
import {drizzle} from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import {places} from '@/db/schema';
import {sql, and, ne, eq} from 'drizzle-orm';
import { getLiveStations } from '@/app/lib/bicimad';

const client = postgres(process.env.DATABASE_URL!);
const db = drizzle(client);

export async function GET(request: Request) {
    const {searchParams} = new URL(request.url);
    const lat = parseFloat(searchParams.get('lat') || '');
    const lng = parseFloat(searchParams.get('lng') || '');
    const estilo = searchParams.get('estilo') || '';
    const currentId = parseInt(searchParams.get('currentId') || '0');

    if (!lat || !lng || !estilo) return NextResponse.json({error: 'Faltan datos'}, {status: 400});

    // Buscamos los 5 más cercanos del MISMO estilo, excluyendo el actual
    const waypointList = await db.select()
        .from(places)
        .where(
            and(
                eq(places.estilo, estilo), // Comparación directa de columna
                ne(places.id, currentId)    // No repetir el monumento donde ya está el usuario
            )
        )
        .orderBy(
            // Ordenar por distancia euclidiana simple
            sql`sqrt(pow(${places.latitude} - ${lat}, 2) + pow(${places.longitude} - ${lng}, 2))`
        )
        .limit(5);

    const allStations = await getLiveStations();

    const startStation = allStations.reduce((prev: { geometry: { coordinates: number[]; }; }, curr: { geometry: { coordinates: number[]; }; }) => {
        const distPrev = Math.sqrt(Math.pow(prev.geometry.coordinates[1] - lat, 2) + Math.pow(prev.geometry.coordinates[0] - lng, 2));
        const distCurr = Math.sqrt(Math.pow(curr.geometry.coordinates[1] - lat, 2) + Math.pow(curr.geometry.coordinates[0] - lng, 2));
        return (distCurr < distPrev) ? curr : prev;
    });

    const enrichedWaypoints = waypointList.map(place => {
        const nearestStation = allStations
            .map((s: any) => ({
                ...s,
                dist: Math.sqrt(Math.pow(s.geometry.coordinates[1] - place.latitude, 2) + Math.pow(s.geometry.coordinates[0] - place.longitude, 2))
            }))
            .sort((a: any, b: any) => a.dist - b.dist)[0];

        return {
            ...place,
            bicimad: {
                stationName: nearestStation.name,
                bikes: nearestStation.dock_bikes,
                freeDocks: nearestStation.free_bases,
                isClose: nearestStation.dist < 0.003,
                latitude: nearestStation.geometry?.coordinates[1],
                longitude: nearestStation.geometry?.coordinates[0],
            }
        };
    });

    return NextResponse.json({
        originStation: {
            name: startStation.name,
            bikes: startStation.dock_bikes,
            latitude: startStation.geometry.coordinates[1],
            longitude: startStation.geometry.coordinates[0],
            dist: Math.sqrt(Math.pow(startStation.geometry.coordinates[1] - lat, 2) + Math.pow(startStation.geometry.coordinates[0] - lng, 2))
        },
        waypoints: enrichedWaypoints
    });
}
