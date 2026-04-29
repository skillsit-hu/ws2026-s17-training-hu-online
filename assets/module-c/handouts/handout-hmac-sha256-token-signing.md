# Handout: Signing and verifying `header.payload.signature` (Node.js & PHP)

For the SkillShare Academy content token, the **signature** is computed over the two Base64URL segments **before** the final dot, using the **shared secret**. That operation is **HMAC-SHA256** (a keyed hash). Plain SHA-256 without the secret does not prove the token came from the main backend.

**String to sign:** `encodedHeader + "." + encodedPayload`  
**Signature:** HMAC-SHA256(that string, secret), then Base64URL-encode the raw digest.

**Shared secret:** The competition value is fixed in `module-c.md` as `CONTENT_TOKEN_SECRET`. The code samples below read it from the environment (`process.env` / `getenv`).

Payload JSON must include at least `sub` and `exp` (Unix seconds). Do not use external JWT/auth libraries if the task forbids them - use only built-in crypto.

### Example

Header and payload below are illustrative; the **shared secret** is the competition `CONTENT_TOKEN_SECRET` from the project description.

| Part                   | Value                                                              |
| ---------------------- | ------------------------------------------------------------------ |
| Header JSON            | `{"alg":"HS256","typ":"SSA"}`                                      |
| Payload JSON           | `{"sub":"user-42","exp":2000000000}`                               |
| `CONTENT_TOKEN_SECRET` | `38344ac35d91bfd0c8f43963b0ca188d2a039504e825ff968b0366855bdbca5b` |

**Signing input** (header Base64URL + `.` + payload Base64URL):

`eyJhbGciOiJIUzI1NiIsInR5cCI6IlNTQSJ9.eyJzdWIiOiJ1c2VyLTQyIiwiZXhwIjoyMDAwMDAwMDAwfQ`

**Full token** (signing input + `.` + Base64URL of the HMAC digest):

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IlNTQSJ9.eyJzdWIiOiJ1c2VyLTQyIiwiZXhwIjoyMDAwMDAwMDAwfQ.C04Jhf5O3-r4jdMCdTIwtCZhbckDXIW_rqaVyR7t_EY
```

To check: recompute HMAC-SHA256 over the signing input with the same secret, Base64URL-encode the 32-byte digest, and compare it to the third segment.

---

## Base64URL

- Alphabet: `A-Z`, `a-z`, `0-9`, `-`, `_` (no `+`, `/`, padding `=`).

### Node.js

```js
function base64UrlEncode(buffer) {
  return buffer
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function base64UrlDecodeToBuffer(str) {
  let b64 = str.replace(/-/g, "+").replace(/_/g, "/");
  while (b64.length % 4) b64 += "=";
  return Buffer.from(b64, "base64");
}
```

### PHP

```php
function base64url_encode(string $bin): string {
    return rtrim(strtr(base64_encode($bin), '+/', '-_'), '=');
}

function base64url_decode(string $str): string|false {
    $b64 = strtr($str, '-_', '+/');
    $pad = strlen($b64) % 4;
    if ($pad) $b64 .= str_repeat('=', 4 - $pad);
    return base64_decode($b64, true);
}
```

---

## HMAC-SHA256 sign and verify

### Node.js (`crypto`)

```js
const crypto = require("crypto");

function hmacSha256Base64Url(dataUtf8, secretUtf8) {
  const mac = crypto
    .createHmac("sha256", secretUtf8)
    .update(dataUtf8, "utf8")
    .digest();
  return base64UrlEncode(mac);
}

// Build token (example header/payload objects - adjust to your schema)
const header = { alg: "HS256", typ: "SSA" };
const payload = { sub: "user-id", exp: Math.floor(Date.now() / 1000) + 3600 };

const headerPart = base64UrlEncode(Buffer.from(JSON.stringify(header), "utf8"));
const payloadPart = base64UrlEncode(
  Buffer.from(JSON.stringify(payload), "utf8")
);
const signingInput = `${headerPart}.${payloadPart}`;
const signaturePart = hmacSha256Base64Url(
  signingInput,
  process.env.CONTENT_TOKEN_SECRET
);

const token = `${signingInput}.${signaturePart}`;
```

Verify (content service):

```js
function verifyToken(token, secret) {
  const parts = token.split(".");
  if (parts.length !== 3) return false;
  const [h, p, sig] = parts;
  const expected = hmacSha256Base64Url(`${h}.${p}`, secret);
  if (sig !== expected) return false;
  const pl = JSON.parse(base64UrlDecodeToBuffer(p).toString("utf8"));
  if (typeof pl.exp !== "number" || pl.exp < Math.floor(Date.now() / 1000))
    return false;
  return pl;
}
```

**Remark:** In hardened deployments, prefer a constant-time comparison of the signature bytes (e.g. Node.js `crypto.timingSafeEqual`, PHP `hash_equals`) instead of `!==`.

---

### PHP (`hash_hmac`)

```php
function hmac_sha256_base64url(string $signingInput, string $secret): string {
    $raw = hash_hmac('sha256', $signingInput, $secret, true);
    return base64url_encode($raw);
}

// Build token
$header = json_encode(['alg' => 'HS256', 'typ' => 'SSA'], JSON_UNESCAPED_SLASHES);
$payload = json_encode([
    'sub' => 'user-id',
    'exp' => time() + 3600,
], JSON_UNESCAPED_SLASHES);

$headerPart = base64url_encode($header);
$payloadPart = base64url_encode($payload);
$signingInput = $headerPart . '.' . $payloadPart;
$signaturePart = hmac_sha256_base64url($signingInput, getenv('CONTENT_TOKEN_SECRET'));

$token = $signingInput . '.' . $signaturePart;
```

Verify:

```php
function verify_token(string $token, string $secret): ?array {
    $parts = explode('.', $token);
    if (count($parts) !== 3) return null;
    [$h, $p, $sig] = $parts;
    $expected = hmac_sha256_base64url($h . '.' . $p, $secret);
    if (!hash_equals($expected, $sig)) return null;
    $raw = base64url_decode($p);
    if ($raw === false) return null;
    $pl = json_decode($raw, true);
    if (!is_array($pl) || !isset($pl['exp']) || $pl['exp'] < time()) return null;
    return $pl;
}
```

---

## Quick reference

| Step               | Action                                                                            |
| ------------------ | --------------------------------------------------------------------------------- |
| Encode             | `JSON.stringify` → UTF-8 bytes → Base64URL for header and payload                 |
| Sign               | HMAC-SHA256 over ASCII/UTF-8 string `headerPart + "." + payloadPart`              |
| Compare signatures | Match `sig` to recomputed HMAC (constant-time compare recommended for production) |
| Expiry             | Reject if `exp` missing or `exp < now`                                            |

**Note:** "SHA-256 encryption" usually means **hashing** or **HMAC** in this context; use **HMAC-SHA256** for the shared-secret signature, not a bare `sha256()` of the message alone.
