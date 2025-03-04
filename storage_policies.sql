-- Allow authenticated users to upload files to their own folder
create policy "Allow uploads to own folder"
on storage.objects for insert
to authenticated
with check (
    bucket_id = 'magnet-images' 
    and position(auth.uid()::text in name) = 1
);

-- Allow authenticated users to read files from their own folder
create policy "Allow downloads from own folder"
on storage.objects for select
to authenticated
using (
    bucket_id = 'magnet-images' 
    and position(auth.uid()::text in name) = 1
);

-- Allow authenticated users to delete files from their own folder
create policy "Allow deletions from own folder"
on storage.objects for delete
to authenticated
using (
    bucket_id = 'magnet-images' 
    and position(auth.uid()::text in name) = 1
);

-- Allow authenticated users to update files in their own folder
create policy "Allow updates to own folder"
on storage.objects for update
to authenticated
using (
    bucket_id = 'magnet-images' 
    and position(auth.uid()::text in name) = 1
); 