import {NextResponse} from 'next/server';
import {drizzle} from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import {places} from '@/db/schema';
import {sql} from 'drizzle-orm';

const client = postgres(process.env.DATABASE_URL!);
const db = drizzle(client);

export async function GET(request: Request) {
    const {searchParams} = new URL(request.url);
    const lat = parseFloat(searchParams.get('lat') || '');
    const lng = parseFloat(searchParams.get('lng') || '');

    if (isNaN(lat) || isNaN(lng)) {
        return NextResponse.json({error: 'Coordenadas inválidas'}, {status: 400});
    }

    // Buscamos el monumento más cercano usando el teorema de Pitágoras (suficiente para distancias cortas)
    // Para algo más pro en el futuro usaríamos PostGIS
    const closestPlace = await db.select()
        .from(places)
        .orderBy(sql`sqrt(pow(${places.latitude} - ${lat}, 2) + pow(${places.longitude} - ${lng}, 2))`)
        .limit(1);

    return NextResponse.json(closestPlace[0]);
}
