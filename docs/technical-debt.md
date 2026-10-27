# Technical Debt, Defects and Recommended Improvements

[← Index](README.md)

Each item states **what** (with evidence) and, separately, **recommendation**.
Recommendations are not implemented; no application code was changed while
producing these docs.

## Blocking defects (the pipeline cannot complete)

### D1. Text stage depends on a defunct service

- **What:** Article retrieval uses Algorithmia `web/WikipediaParser/0.1.2`
  ([`text.js:30-33`](../robots/text.js#L30-L33)). `api.algorithmia.com` does not
  resolve. **Verified:** a run aborts with `getaddrinfo ENOTFOUND api.algorithmia.com`.
- **Recommendation:** fetch plain-text extracts directly from the Wikipedia
  API (no key needed) and re-test `sanitizeContent` against that format.
  This also removes one credential file.

### D2. Watson endpoint retired and hard-coded

- **What:** `url: 'https://gateway.watsonplatform.net/…'` at
  [`text.js:11`](../robots/text.js#L11). IBM retired these URLs on 2021-05-26,
  and the host does not resolve (verified DNS). The `url` field from the
  credentials file is ignored. The SDK `watson-developer-cloud` is deprecated.
- **Recommendation:** read the `url` from `watson-nlu.json` (the IBM credential
  JSON already contains the regional URL) and migrate to `ibm-watson`. Note
  that `ibm-watson` responses use `response.result.keywords`. Or replace the
  keyword step with something local; it only feeds image queries and tags.

### D3. aerender call is unreachable on every platform

- **What:** [`video.js:148-163`](../robots/video.js#L148-L163). On
  darwin/win32, `const aerenderFilePath` is block-scoped, so
  `spawn(aerenderFilePath…)` throws `ReferenceError`. On any other OS the
  function rejects with `System not Supported`. Both **verified**. Introduced
  2019-05-08 (`ea6bc4b`…`aeceb88`), when a working single-path version
  (`1296ff7`) was generalised.
- Secondary issues: the Windows literal loses its backslashes (verified),
  `%programfiles%` is not expanded, the path is localized ("Arquivos de
  suporte"), the macOS version is pinned to CC 2019, there is no `'error'`
  listener, and the exit code and stderr are ignored.
- **Recommendation:** declare one `let aerenderFilePath` before the branch,
  use `path.join(process.env.ProgramFiles, …)` on Windows, allow an override
  (an env var such as `AERENDER_PATH`; does not exist today), reject on
  non-zero exit and on `'error'`, and forward stderr.

### D4. Template bound to the author's filesystem

- **What:** `templates/1/template.aep` contains
  `$.evalFile('/Users/filipedeschamps/video-maker/content/after-effects-script.js')`
  and absolute footage paths (verified via `strings`).
- **Recommendation:** in After Effects, switch the expression to a path
  relative to the project file (e.g. via `thisProject.fullPath`; not
  verified), or pass the script path through `aerender`'s environment. Then
  re-save the template.

### D5. Incompatible with current Node.js

- **What:** loading `googleapis@38` crashes on Node 26 (`SlowBuffer` removed,
  in `buffer-equal-constant-time@1.0.1`). It works on Node 22. Both verified.
  There is no `engines` field to warn users.
- **Recommendation:** pin a working runtime (e.g. an `engines` field and an
  `.nvmrc` for Node 22) as a stop-gap. Simply upgrading `googleapis` is **not
  known to fix this**. The newest `jwa` (2.0.1) still depends on
  `buffer-equal-constant-time@^1.0.1`, and 1.0.1 (2013) is that package's
  latest release (checked on the npm registry). A real fix needs a dependency
  tree without `jws`/`jwa`, or an npm `overrides` substitute. Neither was
  verified.

## High-priority risks

| ID | Issue | Evidence | Recommendation |
| ---- | ------- | ---------- | ---------------- |
| R1 | Realistic-looking credential values committed in `credentials/README.md` | [security.md § Secrets](security.md#secrets) | Replace with placeholders, and revoke the keys if they were real. |
| R2 | Google Custom Search JSON API reportedly ends 2027-01-01 and is closed to new customers | Secondary sources; not verified | Plan a replacement image source, ideally one with licence metadata (e.g. Wikimedia Commons). |
| R3 | OAuth callback on all interfaces, no `state`, code logged | [security.md](security.md#local-oauth-callback-server) | Bind `127.0.0.1`, add `state`, stop logging the code. |
| R4 | Over-broad OAuth scope `youtube` | [`youtube.js:56`](../robots/youtube.js#L56) | Use `youtube.upload`. |
| R5 | 37 `npm audit` advisories (5 critical) | [security.md § Dependencies](security.md#dependencies) | Upgrade the tree. Replace `image-downloader`/`request` with `fetch` (Node ≥ 18). |
| R6 | No usage-rights filter on images; no Wikipedia attribution | [security.md](security.md#content-and-licensing-exposure) | Add a rights filter and attribution in the description. |

## Correctness issues (non-blocking)

| ID | Issue | Location | Effect |
| ---- | ------- | ---------- | -------- |
| C1 | `start()` has no `catch` | [`index.js:18`](../index.js#L18) | Raw `UnhandledPromiseRejection` dumps; no friendly message. |
| C2 | Prefix cancel → `undefined` title | [`input.js:19-22`](../robots/input.js#L19-L22) | Video titled `undefined <term>`. |
| C3 | Empty Custom Search result crashes | [`image.js:43`](../robots/image.js#L43) | `TypeError` on `items.map`. |
| C4 | Missing keywords → `"<term> undefined"` query | [`image.js:24`](../robots/image.js#L24) | Poor image matches. |
| C5 | Sentence with no downloadable image is silently skipped | [`image.js:53-72`](../robots/image.js#L53-L72) | Later failure, or a stale image reused. |
| C6 | `content/` never cleaned | — | Cross-run contamination, including uploading a stale `output.mov` or thumbnail after a failed render. |
| C7 | `templateSettings` only covers indices 0–6 | [`video.js:77-107`](../robots/video.js#L77-L107) | Changing `maximumSentences` crashes. Hidden coupling with the template. |
| C8 | `removeDatesInParentheses` removes all parentheses, handles only one nesting level, and collapses double spaces once | [`text.js:60-62`](../robots/text.js#L60-L62) | Misleading name. Deeper nesting is left partly in the text (verified). |
| C9 | Mixed cwd-relative and root-relative paths | [`state.js:2-3`](../robots/state.js#L2-L3) vs [`video.js:8`](../robots/video.js#L8) | Running from another directory splits outputs. |
| C10 | `google-youtube.json` loaded lazily | [`youtube.js:42`](../robots/youtube.js#L42) | Config errors surface only after the expensive stages. |
| C11 | The video URL and id are not persisted | [`youtube.js:137`](../robots/youtube.js#L137) | Only the terminal scrollback records the upload. |
| C12 | Upload then thumbnail is not atomic | [`youtube.js:13-14`](../robots/youtube.js#L13-L14) | A thumbnail failure leaves the uploaded video without its thumbnail; re-running uploads a duplicate. |

## Tooling and maintenance debt

| ID | Issue | Recommendation |
| ---- | ------- | ---------------- |
| T1 | No tests at all; `npm test` runs an undeclared `nodemon` (verified failure) | Point `test` at `node --test` and add the checks listed in [development.md § Testing](development.md#testing). |
| T2 | No CI, lint or format config | A minimal CI job: `npm install && node --check` plus tests. |
| T3 | `package-lock.json` v1 out of sync; `npm ci` fails (verified) | Regenerate the lockfile with current npm. |
| T4 | `pkg` build targets `node8` and would embed credentials (inferred) | Drop the scripts, or load credentials at runtime from a path outside the snapshot. |
| T5 | Helpers are closures inside `robot()`, so they cannot be unit-tested | Hoist pure helpers to module level and export them. |
| T6 | All configuration hard-coded | Introduce a small config only where needed (aerender path, Watson URL, port). |
| T7 | Docs drift: the root README says to run `node index.js` and implies it works; `credentials/README.md` omits the Google files | Link the root README to `docs/` and to the status table. |

## Suggested order of work

1. **R1**: remove committed credential values (minutes; security).
2. **D5 + T3**: make the project install and load on a supported Node.
3. **D1, D2**: restore the text stage (Wikipedia API, configurable Watson).
4. **D3**: fix aerender invocation and error propagation.
5. **D4**: make the template path-independent (needs After Effects).
6. **R3, R4**: harden OAuth.
7. **T1, T5**: add the smallest tests around sanitizer, layout contract and payload.
8. **R2, R6**: replace the image source before 2027-01-01.
