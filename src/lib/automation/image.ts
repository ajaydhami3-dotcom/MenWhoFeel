import { createSupabaseServerClient } from "@/lib/supabase/server";

const BUCKET = "article-images";
const FAL_API = "https://fal.run/fal-ai/flux/schnell";

/**
 * Generates a 1200×630 featured image via Fal.ai, then stores it in the
 * existing `article-images` Supabase Storage bucket.
 *
 * Returns the public URL of the stored image.
 *
 * Throws if either the generation or the upload fails — the pipeline treats
 * image failure as non-fatal and catches this upstream.
 */
export async function generateArticleImage(prompt: string): Promise<string> {
  const apiKey = process.env.FAL_API_KEY;
  if (!apiKey) throw new Error("FAL_API_KEY is not set");

  // ── Generate image via Fal.ai ──────────────────────────────────────────────
  const res = await fetch(FAL_API, {
    method: "POST",
    headers: {
      Authorization: `Key ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      prompt: `${prompt}. High quality, suitable for editorial web use. No text overlays.`,
      image_size: { width: 1200, height: 630 },
      num_inference_steps: 4, // schnell is optimized for 4 steps
      num_images: 1,
      enable_safety_checker: true,
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => res.statusText);
    throw new Error(`Fal.ai ${res.status}: ${body}`);
  }

  const data = await res.json();
  const imageUrl: string | undefined = data?.images?.[0]?.url;
  if (!imageUrl) throw new Error("Fal.ai returned no image URL");

  // ── Download the generated image ───────────────────────────────────────────
  const imageRes = await fetch(imageUrl);
  if (!imageRes.ok) throw new Error(`Could not download generated image: ${imageRes.status}`);

  const blob = await imageRes.blob();
  const arrayBuffer = await blob.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  // ── Upload to Supabase Storage ─────────────────────────────────────────────
  const supabase = await createSupabaseServerClient();
  const path = `ai-generated/${crypto.randomUUID()}.webp`;

  const { error } = await supabase.storage.from(BUCKET).upload(path, buffer, {
    contentType: "image/webp",
    cacheControl: "31536000",
  });

  if (error) throw new Error(`Storage upload failed: ${error.message}`);

  const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return urlData.publicUrl;
}
