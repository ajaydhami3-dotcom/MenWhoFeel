"use server";

import { eq } from "drizzle-orm";
import { db } from "@/db";
import { socialDrafts } from "@/db/schema";

// ─── Reddit ──────────────────────────────────────────────────────────────────

async function publishToReddit(
  title: string,
  text: string,
  subreddit: string
): Promise<{ url: string }> {
  const clientId = process.env.REDDIT_CLIENT_ID;
  const clientSecret = process.env.REDDIT_CLIENT_SECRET;
  const username = process.env.REDDIT_USERNAME;
  const password = process.env.REDDIT_PASSWORD;

  if (!clientId || !clientSecret || !username || !password) {
    throw new Error("Reddit credentials are not configured (REDDIT_CLIENT_ID, REDDIT_CLIENT_SECRET, REDDIT_USERNAME, REDDIT_PASSWORD)");
  }

  // Get access token
  const tokenRes = await fetch("https://www.reddit.com/api/v1/access_token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
      "User-Agent": "MenWhoFeel/1.0 by u/MenWhoFeel",
    },
    body: new URLSearchParams({
      grant_type: "password",
      username,
      password,
    }),
  });

  if (!tokenRes.ok) throw new Error(`Reddit auth failed: ${tokenRes.status}`);
  const tokenData = await tokenRes.json();
  const accessToken: string = tokenData.access_token;

  // Submit post
  const submitRes = await fetch("https://oauth.reddit.com/api/submit", {
    method: "POST",
    headers: {
      Authorization: `bearer ${accessToken}`,
      "Content-Type": "application/x-www-form-urlencoded",
      "User-Agent": "MenWhoFeel/1.0 by u/MenWhoFeel",
    },
    body: new URLSearchParams({
      sr: subreddit,
      kind: "self",
      title,
      text,
      nsfw: "false",
      spoiler: "false",
      sendreplies: "true",
    }),
  });

  if (!submitRes.ok) {
    const err = await submitRes.text().catch(() => submitRes.statusText);
    throw new Error(`Reddit submit failed: ${submitRes.status}: ${err}`);
  }

  const submitData = await submitRes.json();
  const postUrl: string = submitData?.jquery
    ?.flat()
    ?.find((v: unknown) => typeof v === "string" && v.includes("reddit.com/r/")) as string;

  return { url: postUrl ?? `https://www.reddit.com/r/${subreddit}` };
}

// ─── X (Twitter) ─────────────────────────────────────────────────────────────

async function publishToX(text: string): Promise<{ id: string; url: string }> {
  const bearerToken = process.env.X_BEARER_TOKEN;
  const apiKey = process.env.X_API_KEY;
  const apiSecret = process.env.X_API_SECRET;
  const accessToken = process.env.X_ACCESS_TOKEN;
  const accessSecret = process.env.X_ACCESS_SECRET;

  if (!apiKey || !apiSecret || !accessToken || !accessSecret) {
    throw new Error("X (Twitter) credentials not configured (X_API_KEY, X_API_SECRET, X_ACCESS_TOKEN, X_ACCESS_SECRET)");
  }

  // Use OAuth 1.0a for posting (v2 API)
  // Generate OAuth signature — simplified implementation
  const url = "https://api.twitter.com/2/tweets";
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const nonce = crypto.randomUUID().replace(/-/g, "");

  const oauthParams: Record<string, string> = {
    oauth_consumer_key: apiKey,
    oauth_nonce: nonce,
    oauth_signature_method: "HMAC-SHA1",
    oauth_timestamp: timestamp,
    oauth_token: accessToken,
    oauth_version: "1.0",
  };

  // Build signature base string
  const paramString = Object.entries(oauthParams)
    .sort()
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
    .join("&");

  const signatureBase = `POST&${encodeURIComponent(url)}&${encodeURIComponent(paramString)}`;
  const signingKey = `${encodeURIComponent(apiSecret)}&${encodeURIComponent(accessSecret)}`;

  // HMAC-SHA1 via Web Crypto
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(signingKey),
    { name: "HMAC", hash: "SHA-1" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(signatureBase)
  );
  const sig = Buffer.from(signature).toString("base64");

  oauthParams.oauth_signature = sig;

  const authHeader =
    "OAuth " +
    Object.entries(oauthParams)
      .map(([k, v]) => `${encodeURIComponent(k)}="${encodeURIComponent(v)}"`)
      .join(", ");

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: authHeader,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ text }),
  });

  if (!res.ok) {
    const err = await res.text().catch(() => res.statusText);
    throw new Error(`X API ${res.status}: ${err}`);
  }

  const data = await res.json();
  const tweetId: string = data?.data?.id;
  const xUsername = process.env.X_USERNAME ?? "menwhofeel";
  return { id: tweetId, url: `https://x.com/${xUsername}/status/${tweetId}` };
}

// ─── Public publish action ────────────────────────────────────────────────────

export async function publishSocialDraftAction(
  draftId: number
): Promise<{ success: boolean; error?: string; url?: string }> {
  const [draft] = await db
    .select()
    .from(socialDrafts)
    .where(eq(socialDrafts.id, draftId));

  if (!draft) return { success: false, error: "Draft not found" };
  if (draft.status === "published") return { success: false, error: "Already published" };

  const content = draft.content as Record<string, unknown>;

  try {
    let responseData: Record<string, unknown> = {};
    let publishedUrl: string | undefined;

    if (draft.platform === "reddit") {
      const subreddits = (content.suggestedSubreddits as string[]) ?? ["malementalhealth"];
      const subreddit = subreddits[0]; // post to first in the list
      const result = await publishToReddit(
        content.title as string,
        content.body as string,
        subreddit
      );
      responseData = result;
      publishedUrl = result.url;

    } else if (draft.platform === "x") {
      const result = await publishToX(content.post as string);
      responseData = result;
      publishedUrl = result.url;

    } else {
      // Instagram and YouTube are never auto-published per spec
      return { success: false, error: `${draft.platform} publishing is not supported — save drafts only.` };
    }

    await db
      .update(socialDrafts)
      .set({
        status: "published",
        response: responseData as Record<string, unknown>,
        publishedAt: new Date(),
      })
      .where(eq(socialDrafts.id, draftId));

    return { success: true, url: publishedUrl };

  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    await db
      .update(socialDrafts)
      .set({ status: "failed", error: message })
      .where(eq(socialDrafts.id, draftId));
    return { success: false, error: message };
  }
}
