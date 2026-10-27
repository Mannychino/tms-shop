import 'server-only';
import {db} from './db';
import seed from './seed.json';
import type {Product} from './money';
export async function getProducts():Promise<Product[]> {if(!process.env.NEXT_PUBLIC_SUPABASE_URL||!process.env.SUPABASE_SERVICE_ROLE_KEY)return seed;return db('products?active=eq.true&order=id.asc');}
export async function getDeliveryFee():Promise<number> {const rows=await db('settings?id=eq.1&select=delivery_fee_kobo');if(!rows[0])throw new Error('Store settings missing');return rows[0].delivery_fee_kobo;}
