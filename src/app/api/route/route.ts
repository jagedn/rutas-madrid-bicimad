import {NextResponse} from 'next/server';
import {drizzle} from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import {places} from '@/db/schema';
import {sql, and, ne, eq} from 'drizzle-orm';

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

    return NextResponse.json(waypointList);
}
