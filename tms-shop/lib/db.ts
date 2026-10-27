import 'server-only';
export async function db(table:string,init:RequestInit={}) {
 const url=process.env.NEXT_PUBLIC_SUPABASE_URL,key=process.env.SUPABASE_SERVICE_ROLE_KEY;
 if(!url||!key)throw new Error('Database is not configured');
 const res=await fetch(`${url}/rest/v1/${table}`,{...init,cache:'no-store',headers:{apikey:key,Authorization:`Bearer ${key}`,'Content-Type':'application/json',Prefer:'return=representation',...init.headers}});
 if(!res.ok)throw new Error('Database request failed');
 return res.status===204?null:res.json();
}
