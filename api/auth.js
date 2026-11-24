/**
 * GET /api/auth — step 1 of the CMS login.
 * Sends the editor to GitHub to approve the "Portfolio CMS" OAuth app.
 *
 * Needs the env vars GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET (Vercel → Settings → Environment Variables).
 */
import crypto from "node:crypto";

export default function handler(req, res) {
  const clientId = process.env.GITHUB_CLIENT_ID;
  if (!clientId) {
    res.status(500).send("CMS login is not configured: set GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET in Vercel.");
    return;
  }

  const proto = req.headers["x-forwarded-proto"] || "https";
  const host = req.headers["x-forwarded-host"] || req.headers.host;
  const redirectUri = `${proto}://${host}/api/callback`;

  // CSRF protection: a random state that must come back unchanged
  const state = crypto.randomBytes(16).toString("hex");
  res.setHeader("Set-Cookie", `cms_oauth_state=${state}; Path=/api; HttpOnly; Secure; SameSite=Lax; Max-Age=600`);

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    scope: process.env.GITHUB_OAUTH_SCOPE || "public_repo,user:email",
    state,
  });
  res.writeHead(302, { Location: `https://github.com/login/oauth/authorize?${params}` });
  res.end();
}
