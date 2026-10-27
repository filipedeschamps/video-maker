# Development, Running, Testing and Operations

[← Index](README.md) · Related: [integrations.md](integrations.md) · [technical-debt.md](technical-debt.md)

> **Expectation setting:** following these steps exactly will still fail at
> the text stage (Algorithmia is gone) and at the render stage (code and
> template defects). See the [status table](README.md#current-status-read-this-first).
> This page documents what is required and what actually happens.

## Prerequisites

| Requirement | Why | Evidence / notes |
| ------------- | ----- | ------------------ |
| **Node.js — an older major; 22 works, 26 does not** | `googleapis@38` pulls `buffer-equal-constant-time@1.0.1`, which reads `SlowBuffer.prototype` at load. That crashes on Node 26 with `TypeError: Cannot read properties of undefined (reading 'prototype')`. | **Verified:** crash on 26.12.0; loads on 22.23.4. Node 23–25 not tested. No `engines` field in `package.json`. |
| npm | Install dependencies | `npm install` worked with npm 12.2.1; `npm ci` does **not** (see below). |
| Interactive terminal (TTY) | `readline-sync` reads `/dev/tty` directly | **Verified:** fails without a controlling terminal; piped stdin is ignored. Under automation, wrap with `script -qec "node index.js" /dev/null`. |
| ImageMagick with a `convert` binary on `PATH` | `gm` in imageMagick mode spawns `convert` | **Verified** with ImageMagick 7.1.2 (prints deprecation warning, works). GraphicsMagick alone is not enough. |
| Adobe After Effects with `aerender` | Video render | macOS path expected: `/Applications/Adobe After Effects CC 2019/aerender` ([`video.js:151`](../robots/video.js#L151)). Currently unreachable due to a code defect. |
| Free TCP port 5000 on localhost | OAuth callback | Hard-coded ([`youtube.js:27`](../robots/youtube.js#L27)). On macOS 12+, the AirPlay Receiver commonly occupies port 5000 (known platform behaviour, not tested here). |
| Accounts / keys | Five external services | [integrations.md](integrations.md#credentials) |
| Git | Clone | — |

## Installation

```bash
git clone https://github.com/filipedeschamps/video-maker.git
cd video-maker
npm install            # not `npm ci`
```

`npm ci` fails on current npm with
`npm ci can only install packages when your package.json and package-lock.json are in sync … Missing: readable-stream@2.3.8 … pify@3.0.0`
(**verified**, npm 12.2.1). The lockfile is `lockfileVersion: 1`.
`npm install` also reports a blocked install script for `websocket@1.0.28`
(a transitive dependency); the app does not need it to load (**verified**).

## Credentials

Create the four JSON files in `credentials/`. The exact keys the code reads
are in [integrations.md § Credentials](integrations.md#credentials). The root
[`README.md`](../README.md) has a screenshot walkthrough (Portuguese) for
obtaining each one. Do **not** copy the sample values from
`credentials/README.md` (see [security.md § Secrets](security.md#secrets)).

## Configuration

There are **no environment variables, CLI flags or config files.** The code
does not read `process.env` or `process.argv` anywhere (verified by reading
every source file). `.env` appears in `.gitignore` only as boilerplate. All
tunables are source constants:

| Setting | Value | Location |
| --------- | ------- | ---------- |
| Max sentences | `7` | [`input.js:6`](../robots/input.js#L6) (coupled to [`video.js:77-107`](../robots/video.js#L77-L107) and the AE template) |
| Title prefixes | `Who is`, `What is`, `The history of` | [`input.js:18`](../robots/input.js#L18) |
| Wikipedia algorithm | `web/WikipediaParser/0.1.2` | [`text.js:31`](../robots/text.js#L31) |
| Watson URL / version | `gateway.watsonplatform.net…`, `2018-04-05` | [`text.js:9-11`](../robots/text.js#L9-L11) |
| Images per query | `2` | [`image.js:40`](../robots/image.js#L40) |
| Output resolution | `1920×1080` | [`video.js:32-33`](../robots/video.js#L32-L33) |
| aerender path | per-OS literals | [`video.js:151-153`](../robots/video.js#L151-L153) |
| AE comp / template | `main`, `templates/1/template.aep` | [`video.js:158-165`](../robots/video.js#L158-L165) |
| OAuth port | `5000` | [`youtube.js:27`](../robots/youtube.js#L27) |
| OAuth scope | `https://www.googleapis.com/auth/youtube` | [`youtube.js:56`](../robots/youtube.js#L56) |
| Privacy | `unlisted` | [`youtube.js:124`](../robots/youtube.js#L124) |

## Running

From the **repository root** (paths are cwd-relative):

```bash
npm start        # = node .  (index.js)
# or
node index.js
```

Expected console flow (abridged; per-sentence, consent, token and progress
lines are omitted):

```
Type a Wikipedia search term: <term>
[1] Who is
[2] What is
[3] The history of
[0] CANCEL
> [text-robot] Starting...
> [text-robot] Fetching content from Wikipedia
> [text-robot] Starting to fetch keywords from Watson
> [image-robot] Querying Google Images with: "<query>"
> [image-robot] [i][j] Image successfully downloaded: <url>
> [video-robot] Image converted / Sentence created / YouTube thumbnail created
> [video-robot] Starting After Effects
> [youtube-robot] Listening on http://localhost:5000
> [youtube-robot] Please give your consent: <url>
> [youtube-robot] Video available at: https://youtu.be/<id>
> [youtube-robot] Thumbnail uploaded!
```

**What actually happens today** (verified on Node 22, 2026-10-23, with
placeholder credentials): both prompts work, then the run aborts with
`UnhandledPromiseRejection … getaddrinfo ENOTFOUND api.algorithmia.com`,
exit code 1. `content.json` then contains only
`{"maximumSentences":7,"searchTerm":"…","prefix":"…"}`.

### Running a single stage

`index.js` has no stage selection. Each robot reloads `content.json`, so a
developer can temporarily comment out earlier calls in `index.js` to re-run
later stages against an existing `content.json`. This is a local workflow,
not a feature. For example, the video robot's ImageMagick steps were verified
this way with a synthetic `content.json` and sample images:
`node -e "require('./robots/video.js')()"`.

## npm scripts

| Script | Command | What it really does |
| -------- | --------- | --------------------- |
| `start` | `node .` | Runs the pipeline. |
| `test` | `nodemon .` | **Not a test.** It would run the app under file-watch, but `nodemon` is not a dependency, so it fails with `nodemon: command not found` unless installed globally (**verified**). |
| `build-win` | `pkg -t node8-win index.js` | Packs a Windows executable with Node 8 (`pkg@4.3.7`, devDependency). **Not verified.** |
| `build-mac` | `pkg -t node8-macos-x64 index.js` | Same for macOS x64. **Not verified.** |

Notes on the `pkg` builds (*inferred*, not executed):

- `pkg` snapshots statically `require`d files, so the credential JSON files
  present at build time are embedded in the binary (see
  [security.md](security.md#secrets)).
- Paths would split. `state.js`, `image.js` and `youtube.js` use the working
  directory, but `video.js` resolves `content/` and `templates/` from
  `__dirname`, which inside a pkg binary is the read-only `/snapshot/…` tree.
  `template.aep` is not `require`d, so it would not be bundled, and the
  external `aerender` process could not read the snapshot anyway. **The video
  stage would fail in a pkg binary** unless those paths change.
- The binary still needs ImageMagick and After Effects installed.
- The `node8` targets predate many fixes. Whether the dependency tree and the
  `os.platform` comparison behave the same on Node 8 is unknown.

## Testing

- **There are no automated tests**, no test framework, no linter, no
  formatter configuration, no type checking, and no CI pipeline (no
  `.github/`, `.travis.yml` or similar tracked).
- Quality gates: none. Dependabot PRs (seen in git history, e.g. `#368`,
  `#341`) are the only automated maintenance. Their configuration is not in
  this repository (it is on GitHub's side).
- Manual verification is the only strategy. It requires live accounts for
  all five services.

Gaps that matter most, with the smallest useful check for each
(recommendations):

| Gap | Smallest check |
| ----- | ---------------- |
| Sanitizer regex and sentence split | Pure function test over a fixed article string (needs the helpers moved out of the `robot()` closure). |
| 7-sentence contract between text, video and the template | Assert `Object.keys(templateSettings).length === maximumSentences`. |
| Platform/aerender path resolution | Unit test the path selection for `darwin`/`win32`/`linux`. |
| Image fallback/dedup loop | Test with a stubbed downloader that fails the first URL. |
| YouTube payload building | Pure function from `content` → `requestParameters`. |

## Deployment and operations

There is **no deployment.** This is a developer-run CLI. There is no server
to host, no container image (the Gitpod Dockerfile only extends
`gitpod/workspace-full` and adds nothing), no release process, no versioning
beyond `"version": "1.0.0"`, and no monitoring. "Release" for a user means a
YouTube upload, which is irreversible from the tool's side (it has no delete
or update logic).

### Gitpod

[`.gitpod.yml`](../.gitpod.yml) runs `npm install` then `npm run start` in
`gitpod/workspace-full`. Credentials are not provisioned there, so startup
fails with `Cannot find module '../credentials/algorithmia.json'` until the
files are added (*inferred* from the verified local behaviour). Even with
credentials, Gitpod is Linux, so the render stage rejects with
`System not Supported`. Whether that image ships ImageMagick is **unknown**.

### Observability

- stdout logging only, prefixed `> [robot]`. `aerender` stdout is forwarded,
  but its stderr is discarded.
- The uploaded video URL is printed and not persisted. Copy it from the
  terminal.
- `content.json` and `content/` are the only post-mortem artifacts.

### Recovery

- Failed run: inspect `content.json` to see the last completed stage (field
  lifecycle in [data.md](data.md#field-lifecycle)), fix the cause, and re-run.
  A normal run always restarts from the input prompt.
- Before re-running with a new term, **delete `content/*.png`, `content/*.jpg`,
  `content/*.js`, `content/output.mov`**. Stale images can otherwise be reused
  silently.
- Interrupted upload: nothing is resumable. Re-running uploads a new video,
  and earlier partial or complete uploads must be removed in YouTube Studio by
  hand.

## Troubleshooting

| Symptom | Cause | Fix / workaround |
| --------- | ------- | ------------------ |
| `TypeError: Cannot read properties of undefined (reading 'prototype')` in `buffer-equal-constant-time/index.js` | Node too new (verified on 26) | Use Node 22 (verified). See [technical-debt.md D5](technical-debt.md#d5-incompatible-with-current-nodejs) for why a dependency upgrade alone is not a known fix. |
| `npm ci … not in sync … Missing: readable-stream@2.3.8` | Stale v1 lockfile | Use `npm install`. |
| `Cannot find module '../credentials/algorithmia.json'` (or `watson-nlu.json`, `google-search.json`) before any prompt | Credential file missing; loaded at module load | Create the file ([integrations.md](integrations.md#credentials)). |
| `The current environment doesn't support interactive reading from TTY` | Not run in a terminal | Run in a real terminal, or use `script -qec "node index.js" /dev/null`. |
| `getaddrinfo ENOTFOUND api.algorithmia.com` | Service gone | Code change required ([technical-debt.md D1](technical-debt.md#d1-text-stage-depends-on-a-defunct-service)). |
| `getaddrinfo ENOTFOUND gateway.watsonplatform.net` | Retired IBM URL hard-coded | Use the regional URL from your IBM credentials (code change at [`text.js:11`](../robots/text.js#L11)). |
| `Unauthorized: Access is denied due to invalid credentials.` | Bad Watson `apikey` | Check the key name is lower-case `apikey`. |
| `TypeError: Cannot read properties of undefined (reading 'map')` in `fetchGoogleAndReturnImagesLinks` | Custom Search returned no `items` (no results, or engine not set to image search) | Enable image search on the engine, or use a different term. |
| `[image-robot] … Error (…): Image loading error - 403` | Host blocks hot-linking | Expected; the second candidate is tried. If both fail, the sentence has no image. |
| `Command failed: … convert: improper image header 'content/{i}-original.png'` | Downloaded body was not an image (e.g. an HTML page). Real images with the wrong extension decode fine (both **verified**). | Delete the file and re-run; see [pipeline.md § 3.3](pipeline.md#33-download-with-fallback-and-de-duplication-l50-80). |
| `Could not execute GraphicsMagick/ImageMagick: convert … this most likely means the gm/convert binaries can't be found` (**verified** message) | ImageMagick (`convert`) not on `PATH` | Install ImageMagick with the `convert` command. |
| Error text starting `Command failed: WARNING: The convert command is deprecated in IMv7` | Only the first line; ImageMagick 7 prints this on every call. The real cause follows it. | Read the following lines. |
| `Cannot read properties of undefined (reading 'size')` in `createSentenceImage` | More than 7 sentences | Keep `maximumSentences` ≤ 7. |
| `Error: System not Supported` | Running on any OS other than darwin/win32 (e.g. Linux) | Rendering requires macOS/Windows After Effects. |
| `ReferenceError: aerenderFilePath is not defined` | Block-scoping bug ([technical-debt.md D3](technical-debt.md#d3-aerender-call-is-unreachable-on-every-platform)) | Code change required. |
| An old video gets uploaded | A render failed silently, and a stale `content/output.mov` from an earlier run was uploaded | Delete `content/output.mov` before each run. |
| Render finishes instantly / `output.mov` missing → `ENOENT … output.mov` in youtube stage (after OAuth consent) | aerender failed. Exit code and stderr are ignored, or the template could not evaluate its absolute `$.evalFile` path | Open the template in AE and fix the script path; check the AE log. |
| `listen EADDRINUSE: address already in use :::5000` (crash; no `'error'` listener on the server) | Port 5000 occupied | Free the port (macOS: disable AirPlay Receiver). |
| `redirect_uri_mismatch` in browser | OAuth client lacks `http://localhost:5000/oauth2callback` | Add it to the OAuth client in Google Cloud Console. |
| `TypeError … reading 'client_id'` | Downloaded a Desktop-type OAuth client (`installed` key) | Create a "Web application" client. |
| Title shows `undefined …` | Prefix prompt cancelled | Choose 1–3. |
| Thumbnail upload error after a successful video upload | Channel not eligible for custom thumbnails, or other API rule (not verified) | Verify the channel. The video is already uploaded. |
