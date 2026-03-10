import {pgTable, serial, text, doublePrecision, varchar, integer} from 'drizzle-orm/pg-core';

export const places = pgTable('places', {
    id: serial('id').primaryKey(),
    externalId: varchar('external_id', {length: 50}).unique(),
    title: text('title').notNull(),
    type: varchar('type', {length: 20}), // 'edificio' o 'monumento'
    district: text('district'),
    area: text('area'),
    streetAddress: text('street_address'),
    postalCode: varchar('postal_code', {length: 10}),
    latitude: doublePrecision('latitude').notNull(),
    longitude: doublePrecision('longitude').notNull(),
    pdfUrl: text('pdf_url'),
    relationUrl: text('relation_url'),

    resumen: text('resumen'),
    estilo: text('estilo'),
    curiosidad: text('curiosidad'),
    epoca: text('epoca'),
});
