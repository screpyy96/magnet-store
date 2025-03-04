-- Drop existing trigger first
drop trigger if exists on_auth_user_created on auth.users;

-- Drop existing function
drop function if exists public.handle_new_user();

-- Create a table for user profiles (extends auth.users)
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  email text,
  full_name text default '',
  phone text default '',
  address text default '',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create a table for magnet orders
create table if not exists public.orders (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  status text default 'pending' check (status in ('pending', 'processing', 'completed', 'cancelled')),
  total_price decimal(10,2),
  shipping_address text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create a table for magnet items in each order
create table if not exists public.order_items (
  id uuid default uuid_generate_v4() primary key,
  order_id uuid references public.orders on delete cascade not null,
  image_url text not null,
  quantity integer not null check (quantity > 0),
  size text not null check (size in ('small', 'medium', 'large')),
  price_per_unit decimal(10,2) not null,
  special_requirements text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create a table for magnet prices and sizes
create table if not exists public.magnet_options (
  id uuid default uuid_generate_v4() primary key,
  size text not null check (size in ('small', 'medium', 'large')),
  dimensions text not null,
  price decimal(10,2) not null,
  description text,
  is_active boolean default true
);

-- Enable Row Level Security (RLS)
alter table public.profiles enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.magnet_options enable row level security;

-- Create policies safely using DO blocks
do $$
begin
    -- Drop existing policies to avoid conflicts
    drop policy if exists "Users can view their own profile" on public.profiles;
    drop policy if exists "Users can update their own profile" on public.profiles;
    drop policy if exists "Users can view their own orders" on public.orders;
    drop policy if exists "Users can insert their own orders" on public.orders;
    drop policy if exists "Users can view their own order items" on public.order_items;
    drop policy if exists "Users can insert their own order items" on public.order_items;
    drop policy if exists "Everyone can view magnet options" on public.magnet_options;

    -- Create policies
    create policy "Users can view their own profile"
        on public.profiles for select
        using ( auth.uid() = id );

    create policy "Users can update their own profile"
        on public.profiles for update
        using ( auth.uid() = id );

    create policy "Users can view their own orders"
        on public.orders for select
        using ( auth.uid() = user_id );

    create policy "Users can insert their own orders"
        on public.orders for insert
        with check ( auth.uid() = user_id );

    create policy "Users can view their own order items"
        on public.order_items for select
        using ( exists (
            select 1 from public.orders
            where orders.id = order_items.order_id
            and orders.user_id = auth.uid()
        ));

    create policy "Users can insert their own order items"
        on public.order_items for insert
        with check ( exists (
            select 1 from public.orders
            where orders.id = order_items.order_id
            and orders.user_id = auth.uid()
        ));

    create policy "Everyone can view magnet options"
        on public.magnet_options for select
        using ( true );
end
$$;

-- Insert some default magnet options if they don't exist
insert into public.magnet_options (size, dimensions, price, description)
select 'small', '5x5 cm', 9.99, 'Perfect for small photos or decorative elements'
where not exists (select 1 from public.magnet_options where size = 'small');

insert into public.magnet_options (size, dimensions, price, description)
select 'medium', '10x10 cm', 14.99, 'Most popular size, great for photos and artwork'
where not exists (select 1 from public.magnet_options where size = 'medium');

insert into public.magnet_options (size, dimensions, price, description)
select 'large', '15x15 cm', 19.99, 'Make a statement with our largest size'
where not exists (select 1 from public.magnet_options where size = 'large');

-- Function to automatically update updated_at
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Add triggers for updated_at if they don't exist
do $$
begin
  if not exists (select 1 from pg_trigger where tgname = 'handle_updated_at' and tgrelid = 'public.profiles'::regclass) then
    create trigger handle_updated_at
      before update on public.profiles
      for each row
      execute procedure public.handle_updated_at();
  end if;
end
$$;

do $$
begin
  if not exists (select 1 from pg_trigger where tgname = 'handle_updated_at' and tgrelid = 'public.orders'::regclass) then
    create trigger handle_updated_at
      before update on public.orders
      for each row
      execute procedure public.handle_updated_at();
  end if;
end
$$;

-- Create a function to handle new user creation
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, phone, address)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    coalesce(new.raw_user_meta_data->>'phone', ''),
    coalesce(new.raw_user_meta_data->>'address', '')
  );
  return new;
end;
$$;

-- Create trigger for new user creation
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user(); 