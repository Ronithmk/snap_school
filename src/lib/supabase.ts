import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// Realtime channel helpers
export function subscribeToAlbum(albumId: string, onPhotoAdded: (payload: unknown) => void) {
  return supabase
    .channel(`album:${albumId}`)
    .on("broadcast", { event: "photo_added" }, onPhotoAdded)
    .subscribe();
}

export function broadcastPhotoAdded(albumId: string, photoCount: number) {
  return supabase.channel(`album:${albumId}`).send({
    type: "broadcast",
    event: "photo_added",
    payload: { albumId, photoCount },
  });
}
