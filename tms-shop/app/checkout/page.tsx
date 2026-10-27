import {getProducts,getDeliveryFee} from '@/lib/catalog';
import {Checkout} from '@/components/checkout';
export const dynamic='force-dynamic';
export default async function Page(){const products=await getProducts();let delivery=null;try{delivery=await getDeliveryFee();}catch{}return <Checkout products={products} delivery={delivery}/>;}
