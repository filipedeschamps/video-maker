# video-maker — Engineering Documentation

> Reverse-engineered from the source at commit `45e7cf7` (master, 2023-12-17).
> Investigation and runtime checks performed 2026-10-23. Source code is treated
> as the source of truth; the top-level [`README.md`](../README.md) (Portuguese
> setup tutorial) was cross-checked against it, not trusted.

## What this project is

`video-maker` is a single-process, interactive Node.js command-line program
that turns one search term into a short YouTube video. It was built live as a
teaching series (YouTube playlist linked from the root README) and is
organised as five sequential "robots" that hand data to each other through a
JSON file on disk:

1. **input** — asks the user for a Wikipedia term and a title prefix.
2. **text** — fetches the Wikipedia article (via Algorithmia), cleans it,
   splits it into sentences, keeps the first 7, and extracts keywords per
   sentence (via IBM Watson NLU).
3. **image** — searches Google Images (Custom Search API) for each sentence and
   downloads at most one image per sentence.
4. **video** — uses ImageMagick to build 1920×1080 backgrounds, caption images
   and a thumbnail, writes a data script for Adobe After Effects, and renders
   `template.aep` with `aerender`.
5. **youtube** — runs a local OAuth2 callback server, uploads the rendered
   video as *unlisted*, and sets its thumbnail.

## Current status (read this first)

**At HEAD the pipeline cannot complete on any machine.** Each item below was
verified in this investigation (see [technical-debt.md](technical-debt.md) for
evidence and fixes):

| # | Blocker | Stage | Evidence |
| --- | --------- | ------- | ---------- |
| 1 | `api.algorithmia.com` no longer resolves (DNS NXDOMAIN, checked 2026-10-23). | text | Ran the app; failed with `getaddrinfo ENOTFOUND api.algorithmia.com`. |
| 2 | Hard-coded Watson URL `gateway.watsonplatform.net` was retired by IBM on 2021-05-26 and does not resolve. | text | [`robots/text.js:11`](../robots/text.js#L11); DNS check; IBM endpoint-change notice. |
| 3 | `aerenderFilePath` is declared with `const` inside `if` blocks, so the `spawn` call throws `ReferenceError` on macOS/Windows; Linux is rejected outright. | video | [`robots/video.js:150-163`](../robots/video.js#L150-L163); reproduced. |
| 4 | `templates/1/template.aep` loads its data with an absolute path to the original author's Mac (`/Users/filipedeschamps/video-maker/content/after-effects-script.js`). | video | Extracted from the binary with `strings`. |
| 5 | Module loading crashes on Node 26 (`SlowBuffer` removed; via `googleapis → google-auth-library → jws → jwa → buffer-equal-constant-time`). Loads on Node 22. | startup | Reproduced on Node 26.12.0 and 22.23.4. |

Additionally, Google's Custom Search JSON API (used by the image robot) is
reported to be closed to new customers and scheduled for shutdown on
2027-01-01 (secondary sources; not verified against Google's own page).

## Documents

| Document | Covers |
| ---------- | -------- |
| [architecture.md](architecture.md) | Components, responsibilities, module graph, codebase map, Mermaid diagrams. |
| [pipeline.md](pipeline.md) | Robot-by-robot implementation: algorithms, business rules, execution order, error behaviour. |
| [data.md](data.md) | `content.json` schema and field lifecycle, files under `content/`, the After Effects template contract. |
| [integrations.md](integrations.md) | External services, credential file contracts, OAuth flow, YouTube upload payload. |
| [development.md](development.md) | Prerequisites, install, configuration, running, build scripts, testing, Gitpod, troubleshooting. |
| [security.md](security.md) | Trust boundaries, secrets, attack surface, licensing exposure, reliability/failure modes. |
| [technical-debt.md](technical-debt.md) | Verified defects, risks, missing tests, prioritized improvements. |

### Suggested reading paths

- **"I want to run it."** → [development.md](development.md), then the
  *Current status* table above (it will not run end-to-end without code
  changes).
- **"I want to change a stage."** → [architecture.md](architecture.md) →
  the stage's section in [pipeline.md](pipeline.md) → [data.md](data.md) to see
  which later stages read the fields you touch.
- **"I'm reviewing risk."** → [security.md](security.md) →
  [technical-debt.md](technical-debt.md).

## Scope and boundaries

- **In scope of the code:** one interactive run, one search term, English
  prefixes, at most 7 sentences, one video, one upload to the account that
  grants consent.
- **Not present:** no server/daemon mode, no database, no queue, no
  configuration file or environment variables, no CLI flags, no tests, no CI,
  no logging framework, no resume/retry, no multi-language support.
- **Hard platform dependencies:** an interactive TTY (`readline-sync`),
  ImageMagick on `PATH`, Adobe After Effects (`aerender`), and five external
  services (Algorithmia, IBM Watson NLU, Google Custom Search, Google OAuth,
  YouTube Data API v3).

## Conventions used in these docs

- Links like [`robots/video.js:163`](../robots/video.js#L163) point at the line
  that supports a claim.
- **Verified** = read in source and/or executed during this investigation.
  **Inferred** = follows from the code or library behaviour but was not
  executed. **Unknown** = could not be determined from the repository.
  Where a statement is not labelled it is a direct reading of the cited source.
- Nothing in `docs/` reproduces credential values. See
  [security.md § Secrets](security.md#secrets) about values already committed
  in `credentials/README.md`.
