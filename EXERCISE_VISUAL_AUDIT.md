# START/NOW Exercise Media Audit — v41

## Why the system changed

START/NOW no longer uses generated exercise-machine art or generated start/finish exercise diagrams inside workout guides.

Those approaches were visually inconsistent and could be misleading when equipment or body position was wrong. The new rule is simple: **use an approved pre-made exercise demonstration, or show that the demonstration is unavailable. Never invent one.**

## Media provider

v41 integrates the public wger exercise database through its read-only exercise-info API.

The provider returns exercise translations/aliases plus exercise images and videos. START/NOW does not ask any image-generation model to create exercise visuals.

`exercise-media-provider-v41.js` handles provider lookup and deterministic mapping.

`exercise-media-ui-v41.js` handles the workout/exercise-page presentation.

## Media priority

For a matched exercise START/NOW uses this priority:

1. Pre-made exercise video from the provider.
2. Pre-made provider image that is **not** marked AI-generated.
3. `Exercise demonstration unavailable`.

There is no generated-machine, generated-stick-figure, or random-equipment fallback.

## Matching safety

The provider may use different names than START/NOW. v41 therefore has an alias layer for common exercises such as:

- Triceps Pushdown / Triceps Pressdown / Cable Pushdown
- Seated Row / Seated Cable Row
- Romanian Deadlift / Barbell Romanian Deadlift / RDL
- Leg Press / Machine Leg Press
- Chest Press / Machine Chest Press
- Lat Pulldown / Cable Lat Pulldown

Provider fuzzy search is used only to discover candidates. START/NOW does **not** approve a result just because it is fuzzy-similar. One of the provider's exercise names or aliases must exactly match one of START/NOW's accepted normalized names before its media is shown.

That prevents a similar-but-different exercise from being used as the demonstration.

## Deterministic behavior

Once an exercise is matched, START/NOW stores the selected provider exercise ID and media URL in `localStorage` under `sn_exercise_media_v41`.

That means repeatedly opening the same exercise uses the same pinned media instead of searching again or randomly selecting a different asset.

Unavailable matches are cached for seven days so the app does not repeatedly hammer the provider. They can be retried later if the provider adds media.

## Performance

START/NOW does not download the provider's full exercise catalog.

Only the currently displayed exercise requests media. Previously resolved results are reused from the local cache.

Video uses:

- `autoplay`
- `muted`
- `loop`
- `playsinline`
- `preload="metadata"`

Images use:

- `loading="lazy"`
- `decoding="async"`
- `object-fit: contain`

A subtle skeleton is shown while media is being resolved.

## Failure behavior

If the provider cannot be reached, no safe exact match exists, the exercise has no approved media, or a media file fails to load, the workout displays:

**Exercise demonstration unavailable**

The user can still see the exercise name, sets, reps, rest time, coach cue, instructions, and primary muscles.

Broken-image icons and unrelated exercise images are never substituted.

## Attribution

Provider media metadata includes license and author information. When available, START/NOW displays a small media attribution directly on the media container.

## Exercise page layout

Exercise detail pages are patched to use the same deterministic media resolver and then show:

1. Exercise name
2. Large exercise media container
3. Primary/secondary muscles
4. How to perform it
5. Form tips
6. Existing alternatives/history controls

## Old generated visual code

The previous v40 illustration files remain in the repository for history, but `index.html` no longer loads them. The live app loads only:

- `exercise-media-provider-v41.js`
- `exercise-media-ui-v41.js`

for exercise demonstrations.

The Home muscle-focus artwork remains separate from exercise demonstrations and is not used as an exercise guide.
