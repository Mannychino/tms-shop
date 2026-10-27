export type Product = {id:string;name:string;category:string;price_kobo:number;description:string;image:string;active:boolean};
export type Line = {productId:string;quantity:number};
export function priceOrder(products:Product[],lines:Line[],delivery:number) {
 if(!Number.isSafeInteger(delivery)||delivery<0)throw new Error('Invalid delivery fee');
 const seen=new Set<string>();
 const items=lines.map(line=>{const p=products.find(p=>p.id===line.productId&&p.active);if(!p||seen.has(line.productId)||!Number.isInteger(line.quantity)||line.quantity<1||line.quantity>1000)throw new Error('Invalid cart');seen.add(line.productId);return {product_id:p.id,name:p.name,unit_price_kobo:p.price_kobo,quantity:line.quantity};});
 if(!items.length)throw new Error('Cart is empty');
 const subtotal=items.reduce((s,i)=>s+i.unit_price_kobo*i.quantity,0);const total=subtotal+delivery;
 if(!Number.isSafeInteger(total)||total<=0)throw new Error('Invalid total');
 return {items,subtotal_kobo:subtotal,delivery_fee_kobo:delivery,total_kobo:total};
}
export const naira=(kobo:number)=>new Intl.NumberFormat('en-NG',{style:'currency',currency:'NGN',maximumFractionDigits:0}).format(kobo/100);
