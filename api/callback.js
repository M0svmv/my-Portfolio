/**
 * GET /api/callback — step 2 of the CMS login.
 * GitHub sends the editor back here with a one-time code; we swap it for an access token
 * (using the secret, which never reaches the browser) and hand the token to the CMS window
 * with the postMessage handshake Decap CMS expects.
 */

const page = (status, payload, origin) => `<!doctype html>
<html><body>
<p>${status === "success" ? "Logged in — you can close this window." : "Login failed — you can close this window."}</p>
<script>
(function () {
  var origin = ${JSON.stringify(origin)};
  var message = "authorization:github:${status}:" + ${JSON.stringify(JSON.stringify(payload))};
  function receive(e) {
    if (e.origin !== origin) return; // only ever hand the token to our own site
    window.opener.postMessage(message, e.origin);
    window.removeEventListener("message", receive, false);
  }
  window.addEventListener("message", receive, false);
  window.opener && window.opener.postMessage("authorizing:github", origin);
})();
</script>
</body></html>`;

function readCookie(req, name) {
  const match = (req.headers.cookie || "").match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

export default async function handler(req, res) {
  const proto = req.headers["x-forwarded-proto"] || "https";
  const host = req.headers["x-forwarded-host"] || req.headers.host;
  const origin = `${proto}://${host}`;
  const send = (status, payload) => {
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.setHeader("Set-Cookie", "cms_oauth_state=; Path=/api; HttpOnly; Secure; SameSite=Lax; Max-Age=0");
    res.status(200).send(page(status, payload, origin));
  };

  const url = new URL(req.url, origin);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");

  if (!code || !state || state !== readCookie(req, "cms_oauth_state")) {
    send("error", { message: "Invalid or expired login attempt. Please try again." });
    return;
  }

  try {
    const response = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: { Accept: "application/json", "Content-Type": "application/json" },
      body: JSON.stringify({
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
        redirect_uri: `${origin}/api/callback`,
      }),
    });
    const data = await response.json();
    if (!data.access_token) throw new Error(data.error_description || data.error || "No token returned");
    send("success", { token: data.access_token, provider: "github" });
  } catch (err) {
    send("error", { message: String(err.message || err) });
  }
}
