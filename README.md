# Sham Aqar Research & Tools

Arabic-first, bilingual static research website prepared for `https://mangowc.vercel.app`.
24 crawlable pages: overview, report directory, three governorate reports, three calculators, governorate comparison, methodology, about and privacy — each in Arabic and English.

## Preview and run

Run `python3 package_preview.py`, then open `Sham-Aqar-Research-Preview.html` in a browser for the portable interactive preview. It includes every page, images, calculators and internal navigation. Google Fonts needs internet; system fonts remain available offline. The preview is not the production deployment.

To serve the actual production files:

```sh
python3 -m http.server 8080 --directory site
```

Open `http://localhost:8080`. `site/` is the authoring output and `public/` is the deployment mirror. Both contain the same static pages. No Node runtime or database credentials are required to serve it.

## Build

Requires Python 3.12 or later (no third-party Python packages):

```sh
python3 build.py --offline  # exact included snapshot
python3 build.py            # read latest published Supabase snapshot; dated local fallback
python3 package_preview.py  # rebuild the portable preview
```

`SITE_URL=https://your-confirmed-domain.example python3 build.py` overrides canonical, hreflang, social and sitemap URLs. Do not publish the current canonical URLs on a different domain without rebuilding.

The publishable Supabase key in `config.json` is a public read key, not a service-role secret. It is used only at build time. The static pages make no Supabase request, and calculator inputs never leave the browser. Do not add service-role or database passwords to this repository.

## Data and database

The 2026-10-11 snapshot is sourced from https://shamaqar.net/market/indicators. It covers 608 active listings (438 sale / 170 rental); price-per-m² reports cover priced apartments in Damascus, Rural Damascus and Latakia. Figures are asking prices, not completed transactions. Homs and Aleppo lack enough observations for price reports. No invented historical growth, valuation estimates or neighbourhood prices are presented.

Supabase project: `torufqlfnvpdczsjhecj`. Migration `create_research_snapshots` has already been applied, and the dated aggregate snapshot is published. `schema.sql` documents the applied migration; do not rerun it against the same project. RLS permits `anon` and `authenticated` to SELECT published rows only; neither role has INSERT, UPDATE or DELETE privileges. Verified against the database on 2026-10-11. The build successfully read the published record through the public REST endpoint.

To update: validate new aggregate data against its source; use trusted Supabase administration to insert a dated `research_snapshots` row with `source_url`, `payload`, and `status='published'`; rebuild, review all report interpretations and sample sizes, then redeploy. The report prose is editorial and must be reviewed when the data changes. Rebuilding is manual; this version does not claim to be live data.

The project security advisor also identified an existing `public.rls_auto_enable()` function with broad execute privileges. It was not created or modified by this build. Review it separately before expanding the database's use.

## Deploy on Vercel

This repository is prepared for the connected Vercel project `mangowc` (`prj_88DHNT2KcVLBG1zlkNPUuKeUFQiJ`). Keep the project Root Directory at the repository root. The root `vercel.json` sets framework to Other and deploys the prebuilt `public/` directory without a build step. Vercel's Git integration can deploy a commit to the repository's `main` branch. The deployment URL and domain assignment need verification after the first build; a 404 on a hostname does not establish that it is claimable.

Once a production domain is assigned, verify the Arabic and English pages, navigation, JSON/CSV data, canonicals, real 404s and production headers. If the assigned address differs from `mangowc.vercel.app`, rebuild with `SITE_URL` set to the confirmed address, commit the generated pages and submit the corresponding sitemap to Search Console. Do not redirect unrelated historical URLs to property pages.

## SEO implementation

The Search Console URL-prefix verification tag is configured in `config.json` and emitted into every generated HTML page by `build.py`. Keep the tag in the served HTML after verification; Search Console checks it again periodically.


Each page has a unique title and description, self-canonical, reciprocal Arabic/English hreflang, social metadata and appropriate Organization/WebSite/WebPage schema. Reports include Article metadata and source attribution. Sitemap and robots.txt are included. Relevant report and tool links lead directly to Sham Aqar property searches, listing creation and the app. Publisher affiliation is explicit. The site earns usefulness through original reports and tools; inherited links and ranking improvements are not guaranteed.

## Verification

```sh
node test-math.cjs
# Requires Playwright and a Chromium installation:
node test-site.cjs
# Or use an existing browser:
CHROMIUM_PATH=/path/to/chromium node test-site.cjs
```

Calculation and browser checks passed on 2026-10-11, including visual review of Arabic desktop/mobile pages and the portable preview calculator.

Tests cover rental yield, vacancy/loss cases, price/m², buying cash outlay, invalid inputs, page availability, internal targets, canonical/hreflang/schema, calculator interactions, comparison controls, mobile overflow and the portable preview. The browser test starts its own local server on port 8765.

## Files

- `build.py`: data fetch and static page generation.
- `site/`: generated site and source styles, browser scripts, images, CSV/JSON data exports.
- `public/`: generated deployment mirror with the same static site.
- `snapshot.json`: reproducible dated public aggregate snapshot.
- `config.json`: Supabase public build configuration and target site URL.
- `schema.sql`: applied database schema and RLS.
- `package_preview.py`: self-contained preview generator.
- `test-math.cjs`, `test-site.cjs`: calculation and browser checks.
- `Sham-Aqar-Research-Preview.html`: generated, portable interactive review copy (also supplied separately as a download).

Brand logo and villa artwork were taken from the user's existing Sham Aqar website for this Sham Aqar project. Source images are not included under a separate third-party license grant.
