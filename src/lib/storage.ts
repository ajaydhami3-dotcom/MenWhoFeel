import { createSupabaseServerClient } from "@/lib/supabase/server";

const BUCKET = "article-images";

/** Uploads a featured image and returns its public URL. */
export async function uploadArticleImage(file: File): Promise<string> {
  const supabase = await createSupabaseServerClient();
  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const path = `${crypto.randomUUID()}.${ext}`;

  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    contentType: file.type || "image/jpeg",
    cacheControl: "31536000",
  });

  if (error) {
    throw new Error(`Image upload failed: ${error.message}`);
  }

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

/** Removes a previously-uploaded featured image, given its public URL. */
export async function deleteArticleImage(publicUrl: string): Promise<void> {
  const marker = `/${BUCKET}/`;
  const index = publicUrl.indexOf(marker);
  // Not one of ours (e.g. an old external URL from before this CMS existed)
  // — nothing to clean up in Storage.
  if (index === -1) return;

  const path = publicUrl.slice(index + marker.length);
  const supabase = await createSupabaseServerClient();
  await supabase.storage.from(BUCKET).remove([path]);
}
