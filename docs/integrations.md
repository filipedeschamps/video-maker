# External Services and Integrations

[← Index](README.md) · Related: [pipeline.md](pipeline.md) · [security.md](security.md) · [development.md](development.md#credentials)

The program exposes **no API** of its own. Its only listening socket is the
temporary OAuth callback (`GET /oauth2callback` on port 5000) described below.
Everything else is an outbound client integration.

## Summary

| Service | Client library (locked version) | Used by | Auth | Credential file | Status (2026-10-23) |
| --------- | ---------------------------------- | --------- | ------ | ----------------- | --------------------- |
| Algorithmia `web/WikipediaParser/0.1.2` | `algorithmia@0.3.10` | text | API key | `algorithmia.json` | **Unreachable** — `api.algorithmia.com` does not resolve (verified). Algorithmia was acquired by DataRobot in 2021. |
| IBM Watson Natural Language Understanding | `watson-developer-cloud@3.18.2` (npm-deprecated → `ibm-watson`) | text | IAM API key | `watson-nlu.json` | **Unreachable at the hard-coded URL** — `gateway.watsonplatform.net` retired by IBM 2021-05-26 and does not resolve (verified DNS). Whether NLU is reachable at a current regional URL with a valid key was **not verified**. |
| Google Custom Search JSON API (image search) | `googleapis@38.0.0` (`customsearch v1`) | image | API key + engine id | `google-search.json` | Reported closed to new customers, with shutdown on 2027-01-01 (secondary sources; **not verified**). |
| Arbitrary image hosts | `image-downloader@3.4.2` (→ `request`) | image | none | — | Whatever URLs Google returns. |
| Google OAuth 2.0 | `googleapis@38.0.0` (`google-auth-library@3.1.1`) | youtube | OAuth web client | `google-youtube.json` | Not exercised. |
| YouTube Data API v3 | `googleapis@38.0.0` | youtube | OAuth access token | (same) | Not exercised. |
| ImageMagick (local binary) | `gm@1.23.1` (imageMagick mode → `convert`) | video | — | — | Works with ImageMagick 7.1.2 (verified; prints deprecation warning). |
| Adobe After Effects `aerender` (local binary) | `child_process.spawn` | video | — | — | Call site broken at HEAD ([pipeline.md § 4.5](pipeline.md#45-rendervideowithaftereffects-l146-178--broken)). |

## Credentials

All four files live in `credentials/` and are git-ignored (`credentials/*.json`).
They are loaded with `require()`, so they must be valid JSON. The key names
below are what the **code** reads. The rest of each file is ignored.

| File | Keys read by code | Loaded | Source |
| ------ | ------------------- | -------- | -------- |
| `algorithmia.json` | `apiKey` | at startup | [`text.js:2`](../robots/text.js#L2) |
| `watson-nlu.json` | `apikey` (lower-case **k**) | at startup | [`text.js:5`](../robots/text.js#L5) |
| `google-search.json` | `apiKey`, `searchEngineId` | at startup | [`image.js:6,36-37`](../robots/image.js#L6) |
| `google-youtube.json` | `web.client_id`, `web.client_secret`, `web.redirect_uris[0]` | lazily, at youtube stage | [`youtube.js:42-48`](../robots/youtube.js#L42-L48) |

Discrepancies with existing docs:

- `credentials/README.md` documents only Algorithmia and Watson. The two
  Google files are documented only in the root `README.md`.
- The `url` in `watson-nlu.json` (shown in both READMEs) is **not used**; the
  code hard-codes the endpoint ([`text.js:11`](../robots/text.js#L11)).
- `google-youtube.json` must be the "Web application" OAuth client JSON (top
  level key `web`). A "Desktop" client JSON uses the key `installed` and would
  throw `TypeError` at [`youtube.js:45`](../robots/youtube.js#L45) (*inferred*).

## Algorithmia

- Call: `algorithmia(apiKey).algo('web/WikipediaParser/0.1.2').pipe(searchTerm)`,
  then `.get().content` ([`text.js:30-35`](../robots/text.js#L30-L35)).
- Contract assumed: the response object has a string `content` field holding
  plain article text with MediaWiki `==` headings on their own lines (inferred
  from the sanitizer).
- Failure observed today: `getaddrinfo ENOTFOUND api.algorithmia.com`, raised
  as an unhandled rejection.
- Replacement guidance (recommendation, not implemented): the public Wikipedia
  REST/Action API (e.g. `action=query&prop=extracts&explaintext`) returns
  plain-text extracts without a key. `sanitizeContent` would need re-validation
  against its format.

## IBM Watson NLU

- Client: `new NaturalLanguageUnderstandingV1({ iam_apikey, version: '2018-04-05', url: 'https://gateway.watsonplatform.net/natural-language-understanding/api/' })`
  ([`text.js:8-12`](../robots/text.js#L8-L12)).
- Request: `analyze({ text: sentence, features: { keywords: {} } })`.
  No `language` is set, so Watson auto-detects it.
- Response: `{ keywords: [{ text, relevance, … }] }` → `text[]`
  (callback shape verified in `ibm-cloud-sdk-core@0.0.1` source:
  `cb(error, parsedBody, response)`).
- Errors: 401/403 are rewritten by the SDK to
  `Unauthorized: Access is denied due to invalid credentials.`

## Google Custom Search

- Request: `customsearch.cse.list({ auth: apiKey, cx: searchEngineId, q, searchType: 'image', num: 2 })`
  ([`image.js:35-41`](../robots/image.js#L35-L41)).
- Uses only `items[].link`. No paging and no rights/safe-search parameters.
- Setup (from root README, not code): the engine is a Programmable Search
  Engine with image search enabled.

## Google OAuth2 and YouTube Data API v3

- Local server: `express()` listening on hard-coded port **5000**
  ([`youtube.js:27-30`](../robots/youtube.js#L27-L30)), host unspecified
  (Node binds to all interfaces).
- Route: `GET /oauth2callback` reads `req.query.code`, replies with an HTML
  thank-you page, and resolves the consent promise ([L66-72](../robots/youtube.js#L66-L72)).
  The route does not validate the request (no `state`, no error parameter
  handling). If the user denies consent, Google redirects with `?error=…`, the
  `code` is `undefined`, and `getToken` fails (*inferred*).
- `redirect_uris[0]` in the credential file **must be**
  `http://localhost:5000/oauth2callback` (root README instructs adding exactly
  this), because the server path and port are hard-coded.
- Consent URL: `generateAuthUrl({ access_type: 'offline', scope: ['https://www.googleapis.com/auth/youtube'] })`
  is **printed**, not opened. The user must copy it into a browser on the same
  machine (or one that can reach `localhost:5000`).
- Tokens: kept in memory only, installed process-wide with
  `google.options({ auth })`. The refresh token requested by
  `access_type: 'offline'` is never stored, so consent is required on every run.
- Upload: `youtube.videos.insert({ part: 'snippet, status', requestBody, media })`
  with an `onUploadProgress` callback, followed by `youtube.thumbnails.set({ videoId, media: { mimeType: 'image/jpeg', body } })`.
  See [pipeline.md § 5](pipeline.md#5-youtube-robot--robotsyoutubejs) for the payload.
- Scope `https://www.googleapis.com/auth/youtube` grants full account management,
  broader than the `youtube.upload` scope that upload alone needs (see
  [security.md](security.md#least-privilege)).
