# Data Model and Persistence

[← Index](README.md) · Related: [pipeline.md](pipeline.md) · [architecture.md](architecture.md)

There is no database. All state lives in the working directory:

| Store | Path | Format | Written by | Tracked in git? |
| ------- | ------ | -------- | ----------- | ----------------- |
| Shared state | `./content.json` (cwd) | Minified JSON | input, text, image via `state.save` (video too, once rendering works; youtube never saves) | No (`.gitignore`) |
| AE data script | `./content/after-effects-script.js` | `var content = {…}` (ExtendScript) | video robot via `state.saveScript` | No (`content/*.js`) |
| Images | `./content/*.png`, `./content/*.jpg` | binary | image, video robots | No |
| Video | `./content/output.mov` | QuickTime (from AE) | After Effects | No |
| Credentials | `<repo>/credentials/*.json` (resolved by `require('../credentials/…')` relative to `robots/`, **not** cwd) | JSON | the user, by hand | No (`credentials/*.json`) |

Unless noted, paths in this table are relative to the current working directory.

Paths are cwd-relative in [`state.js:2-3`](../robots/state.js#L2-L3),
[`image.js:78`](../robots/image.js#L78) and [`youtube.js:107,149`](../robots/youtube.js#L107),
but root-relative in `video.js`. **Run from the repository root**, otherwise
stages read and write different directories.

## `content.json`

There is no schema file. The shape below is reconstructed from every
reader and writer.

```ts
// Reconstructed — not a file in the repo
interface Content {
  maximumSentences: number          // always 7                       (input)
  searchTerm: string                // raw user input                 (input)
  prefix?: 'Who is' | 'What is' | 'The history of'
                                    // absent if the user cancels     (input)
  sourceContentOriginal: string     // article text from Algorithmia  (text)
  sourceContentSanitized: string    // single line, parens removed    (text)
  sentences: Sentence[]             // length ≤ maximumSentences      (text)
  downloadedImages: string[]        // URLs successfully downloaded   (image)
}

interface Sentence {
  text: string                      // from sbd                        (text)
  keywords: string[]                // Watson keywords, relevance order(text)
  images: string[]                  // [] (text), then ≤ 2 Google URLs (image)
  googleSearchQuery: string         // query used for this sentence    (image)
}
```

### Field lifecycle

| Field | Created | Read by | Notes |
| ------- | --------- | --------- | ------- |
| `maximumSentences` | input [L6](../robots/input.js#L6) | text [L78](../robots/text.js#L78) | Effective only once, in `slice`. |
| `searchTerm` | input [L9](../robots/input.js#L9) | text [L32](../robots/text.js#L32), image [L22-24](../robots/image.js#L22-L24), youtube [L109-110](../robots/youtube.js#L109-L110), AE template (`content.searchTerm`) | |
| `prefix` | input [L10](../robots/input.js#L10) | youtube [L109](../robots/youtube.js#L109) | |
| `sourceContentOriginal` | text [L35](../robots/text.js#L35) | text [L40](../robots/text.js#L40) | Also ends up in the AE script. |
| `sourceContentSanitized` | text [L43](../robots/text.js#L43) | text [L67](../robots/text.js#L67) | |
| `sentences[].text` | text [L70](../robots/text.js#L70) | text (Watson), video (captions [L69](../robots/video.js#L69)), youtube (description [L111-113](../robots/youtube.js#L111-L113)) | Reaches the video only as rendered `{i}-sentence.png` footage. |
| `sentences[].keywords` | text [L87](../robots/text.js#L87) | image (`keywords[0]` [L24](../robots/image.js#L24)), youtube (`sentences[0].keywords` as tags [L110](../robots/youtube.js#L110)) | |
| `sentences[].images` | text as `[]` [L72](../robots/text.js#L72); filled by image [L29](../robots/image.js#L29) | image [L54](../robots/image.js#L54) | |
| `sentences[].googleSearchQuery` | image [L30](../robots/image.js#L30) | nobody | Diagnostic only. |
| `downloadedImages` | image [L51,65](../robots/image.js#L51) | image [L60](../robots/image.js#L60) | De-duplication set, reset each run. |

### Invariants (implicit, not enforced)

1. `sentences.length ≤ 7`. Video captions ([`video.js:77-107`](../robots/video.js#L77-L107)) and the template's `sentence-1…sentence-7` layers depend on it.
2. Each `sentences[i]` should have a matching `content/{i}-original.png` from
   **this** run. Not guaranteed (see [pipeline.md § 3.3](pipeline.md#33-download-with-fallback-and-de-duplication-l50-80)).
3. `sentences[0].keywords` should be non-empty for useful tags; `sentences[i≥1].keywords[0]` should exist for a useful image query.
4. The file is overwritten wholesale. A crash between `load` and `save` leaves
   the previous stage's output intact. `fs.writeFileSync` is not atomic, so a
   crash *during* a write could truncate it (*inferred*).

### Example (shape only, values illustrative)

```json
{
  "maximumSentences": 7,
  "searchTerm": "Ada Lovelace",
  "prefix": "Who is",
  "sourceContentOriginal": "…",
  "sourceContentSanitized": "…",
  "sentences": [
    { "text": "…", "keywords": ["…"], "images": ["https://…", "https://…"], "googleSearchQuery": "Ada Lovelace" }
  ],
  "downloadedImages": ["https://…"]
}
```

## Files under `content/`

| File | Producer | Consumer | Spec |
| ------ | ---------- | ---------- | ------ |
| `{i}-original.png` (i = 0..6) | image robot | video `convertImage` | Any format, `.png` name |
| `{i}-converted.png` | video `convertImage` | AE template; `0-` also → thumbnail | 1920×1080 |
| `{i}-sentence.png` | video `createSentenceImage` | AE template | Transparent PNG, size per index ([pipeline.md § 4.2](pipeline.md#42-createsentenceimage-l73-125--caption-overlays)) |
| `youtube-thumbnail.jpg` | video `createYouTubeThumbnail` | youtube `uploadThumbnail` | 1920×1080 JPEG |
| `after-effects-script.js` | `state.saveScript` | AE template (`$.evalFile`) | `var content = {…}` |
| `output.mov` | After Effects (`aerender -output`) | youtube `uploadVideo` | Codec set by the AE project's render settings (**unknown**) |

**Caching / cleanup:** none. Files persist across runs, and nothing deletes or
versions them. Stale files can feed into a new run.

**Migrations:** none. There is no versioning of `content.json`.

## After Effects template contract

`templates/1/template.aep` is a binary After Effects project. It could not be
opened in this investigation. The following was extracted with `strings` and
is **verified to be present in the file**, but its exact runtime semantics are
**inferred**:

- A single text-layer expression reads
  `$.evalFile('/Users/filipedeschamps/video-maker/content/after-effects-script.js');`
  followed by `content.searchTerm`. The path is **absolute on the original
  author's macOS machine**. As far as the extracted strings show, the
  evaluated script is used only to display the search term (*inferred*).
- Sentence text reaches the video only through the pre-rendered
  `{i}-sentence.png` footage. Names `sentence-1` … `sentence-7`,
  `sentence-N-text` and `sentences` appear, apparently as layer, comp or
  folder names.
- `JSON.stringify` leaves U+2028/U+2029 unescaped. Older ExtendScript engines
  treat these as line terminators inside string literals, so article text
  containing them could make the evaluated script fail to parse (*inferred*).
- Footage references point to absolute paths for `content/{0..6}-converted.png`,
  `content/{0..6}-sentence.png`, `content.json`, and the template's own audio
  and image files. AE stores relative "ascend count" hints as well, so footage
  may relink when the repo is elsewhere, but the `$.evalFile` string will not
  (*inferred*).
- A comp named `main` exists, matching the `-comp main` argument
  ([`video.js:164`](../robots/video.js#L164)).

Implications for anyone changing the pipeline:

- Changing `maximumSentences`, the file naming scheme (`{i}-converted.png`,
  `{i}-sentence.png`), or the caption canvas sizes requires editing the
  template in After Effects.
- To render on any other machine, the `$.evalFile` path inside the template
  must be edited (or the repository placed at the exact original path).
