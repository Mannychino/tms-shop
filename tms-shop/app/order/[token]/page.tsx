import {notFound} from 'next/navigation';
import Link from 'next/link';
import {z} from 'zod';
import {db} from '@/lib/db';
import {verifyPayment} from '@/lib/paystack';
import {naira} from '@/lib/money';
export const dynamic='force-dynamic';
export default async function Page({params}:{params:Promise<{token:string}>}){const {token}=await params;if(!z.uuid().safeParse(token).success)notFound();let rows;try{rows=await db(`orders?public_token=eq.${token}&select=reference,payment_status,status,items,total_kobo,order_number`);}catch{return <main className="checkout-page"><h1>Order status unavailable</h1><p>Please try again shortly.</p></main>;}let order=rows[0];if(!order)notFound();if(order.payment_status==='pending'){try{await verifyPayment(order.reference);[order]=await db(`orders?public_token=eq.${token}&select=payment_status,status,items,total_kobo,order_number`);}catch{}}
return <main className="checkout-page"><h1>{order.payment_status==='paid'?'Payment confirmed.':'Awaiting payment.'}</h1><p>Order {order.order_number}</p><p>Payment: {order.payment_status}</p><p>Production status: {order.status}</p><div className="order-list">{order.items.map((i:{product_id:string;name:string;quantity:number;unit_price_kobo:number})=><p key={i.product_id}>{i.quantity} × {i.name} — {naira(i.quantity*i.unit_price_kobo)}</p>)}</div><p>Total: {naira(order.total_kobo)}</p><p className="notice">{order.payment_status==='paid'?'Your order is queued for design review.':'Payment is confirmed by the server. Refresh this page after completing payment.'}</p><a className="btn" href={`/order/${token}`}>Refresh status</a> <Link href="/">Back to shop</Link></main>}
