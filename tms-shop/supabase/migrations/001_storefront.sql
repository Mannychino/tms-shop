-- Apply in Supabase SQL editor. Server credentials are required for all access.
create table public.products (id text primary key, name text not null, category text not null, price_kobo bigint not null check(price_kobo>0), description text not null default '', image text not null default '', active boolean not null default true);
create table public.settings (id integer primary key check(id=1), delivery_fee_kobo bigint not null check(delivery_fee_kobo>=0));
-- Existing prototype delivery fee. Confirm before launch.
insert into public.settings values (1,350000);
create sequence public.order_number_seq;
create table public.orders (
 id uuid primary key default gen_random_uuid(),
 order_number text unique not null default ('TMS-'||to_char(now(),'YYMM')||'-'||lpad(nextval('public.order_number_seq')::text,6,'0')),
 public_token uuid unique not null,
 idempotency_key uuid unique not null,
 reference text unique not null,
 buyer jsonb not null,
 items jsonb not null,
 subtotal_kobo bigint not null check(subtotal_kobo>0),
 delivery_fee_kobo bigint not null check(delivery_fee_kobo>=0),
 total_kobo bigint not null check(total_kobo=subtotal_kobo+delivery_fee_kobo),
 method text not null check(method in ('card','bank')),
 payment_status text not null default 'pending' check(payment_status in ('pending','paid','failed','refunded')),
 status text not null default 'pending_payment',
 authorization_url text,
 created_at timestamptz not null default now()
);
alter table public.products enable row level security;
alter table public.settings enable row level security;
alter table public.orders enable row level security;
revoke all on public.products,public.settings,public.orders from anon,authenticated;
insert into public.products values ('1','Premium Cotton Tee','Tees',1800000,'Soft everyday cotton, clean finish.','/assets/tee.jpg',true);
insert into public.products values ('2','Acid Wash Tee','Tees',2300000,'Washed texture, one-of-one feel.','/assets/acid-wash.jpg',true);
insert into public.products values ('3','Prime Cotton Tee','Tees',2700000,'Heavyweight cotton, top of the range.','/assets/prime-cotton.jpg',true);
insert into public.products values ('4','Hoodie','Hoodies',2800000,'Heavy fleece, sleeve and hood print options.','/assets/hoodie.jpg',true);
insert into public.products values ('5','Premium Cap','Caps',500000,'Structured cap, embroidery or print.','',true);
