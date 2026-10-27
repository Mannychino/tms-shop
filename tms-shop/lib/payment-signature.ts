import {createHmac,timingSafeEqual} from 'node:crypto';
export function validSignature(body:string,signature:string,secret:string){if(!/^[a-f0-9]{128}$/i.test(signature))return false;return timingSafeEqual(Buffer.from(signature,'hex'),createHmac('sha512',secret).update(body).digest());}
