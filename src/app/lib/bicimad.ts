// src/lib/bicimad.ts
const accessToken = process.env.BICIMAPI_ACCESS_TOKEN || '';

export async function getLiveStations() {
    const res = await fetch("https://openapi.emtmadrid.es/v3/transport/bicimad/stations/", {
        headers: {
            accessToken: accessToken,
        },
    });
    const data = await res.json();
    return data.data;
}