# From source pixels to a frame

## One processing function

`develop()` takes RGBA bytes and a validated recipe. It returns a new buffer; the input and alpha bytes are untouched. For each pixel, it computes a matrix colour mix, contrast around 128, channel offsets, strength interpolation, then deterministic grain and rounded clamping to 0–255. Zero strength with zero grain is exact identity. Full-strength Pearl with zero grain yields equal RGB channels.

Grain is a hash of pixel position with a fixed seed. It is shared across RGB channels and independent of colour strength. Repeated processing of the same decoded pixels and recipe produces the same result. Different browser image decoders or source profiles can still produce different starting pixels.

## Worker lifetime and ordering

The client-only `PhotoPreview` is split with `next/dynamic`. It owns a native module worker bundled by Next/Turbopack. The worker retains one source buffer; developed result buffers are transferred back. The browser keeps the original canvas and a separate source copy for recovery.

Only one development request runs at a time. A newer control change replaces the pending request; monotonically increasing job IDs prevent an older result from painting over a newer choice. Export is disabled while the displayed result does not match the current recipe. The reveal slider only clips canvases and never runs the transform again.

Changing a look preserves the photo and canvas component. Changing the photo aborts an outstanding sample fetch and terminates the old worker. On worker construction or asynchronous runtime failure, the same processor runs through a scheduled main-thread fallback. A fallback can block the UI briefly on large images; it preserves functionality, not worker-level responsiveness.

## File boundary

The input checks the first 12 bytes against JPEG, PNG and WebP signatures and rejects empty or larger-than-12-MiB files. Browser decoding must also succeed before a candidate replaces a valid frame. Unsupported, oversized and corrupt inputs preserve the previous source. Later upload attempts invalidate older asynchronous candidates. This is not a full image-security parser or a decompressed-size limit: the browser decodes an image before processing dimensions are reduced.

The decoded image is resized proportionally to a maximum 1600 px edge, with no upscaling. The original and developed canvases share these dimensions inside a reserved 3:2 comparison frame; other aspect ratios are contained. The decoded bitmap is closed, terminated workers release source buffers, and downloads revoke their temporary object URLs. Source photos are held in memory only.

## Recipe boundary

The server page reads and validates search parameters. Missing fields use defaults; invalid fields or repeated recipe keys reset the whole recipe with a visible explanation. Download endpoints require all three valid fields and return HTTP 400 on malformed input. Unknown unrelated parameters do not become recipe fields.

Controls update locally. The enhanced GET form commits the recipe to the URL; React updates server-provided controls on history navigation while preserving an existing preview instance. Without JavaScript the same GET form does a normal navigation. Server-rendered controls, summaries, JSON and card downloads remain useful; canvas processing and photo upload require JavaScript.

## Three different exports

- **Developed PNG:** browser `canvas.toBlob`, the actual processed image at its displayed pixel dimensions. Original metadata is not copied.
- **Recipe JSON:** a versioned settings document. It is not currently an import format; a recipe URL is the supported way to restore settings.
- **Recipe card PNG:** Next `ImageResponse`, 1200 × 630, recipe name, palette and controls. It contains no photograph and is also used for editor Open Graph metadata.

Every original sample is labelled as such. RGB treatments are original fictional recipes, not measured simulations of commercial film, RAW development or colour-managed output.
