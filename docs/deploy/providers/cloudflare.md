# Cloudflare

**Preset:** `cloudflare` ([switch to this preset](/deploy/#changing-the-deployment-preset))

Login to your [Cloudflare Workers](https://workers.cloudflare.com) account and obtain your `account_id` from the sidebar.

Create a `wrangler.toml` in your root directory:

```ini
name = "playground"
type = "javascript"
account_id = "<the account_id you obtained>"
workers_dev = true
route = ""
zone_id = ""

[site]
bucket = ".output/public"
entry-point = ".output"

[build]
command = "true"
upload.format = "service-worker"
```

## Testing locally

You can use [miniflare](https://miniflare.dev/), a local Cloudflare Workers development server, to test your app locally:

```bash
NITRO_PRESET=cloudflare yarn build
npx miniflare .output/server/index.mjs --site .output/public
```

## Deploy from your local machine using wrangler

Install [wrangler](https://github.com/cloudflare/wrangler) and login to your Cloudflare account:

```bash
npm i @cloudflare/wrangler -g
wrangler login
```

Generate website with `cloudflare` preset:

```bash
NITRO_PRESET=cloudflare yarn build
```

You can preview locally:

```bash
wrangler dev
```

Publish:

```bash
wrangler publish
```

## Deploy within CI/CD using GitHub Actions

Create a token according to [the wrangler action docs](https://github.com/marketplace/actions/deploy-to-cloudflare-workers-with-wrangler#authentication) and set `CF_API_TOKEN` in your repository config on GitHub.

Create `.github/workflows/cloudflare.yml`:

```yml
name: cloudflare

on:
  push:
    branches:
      - main
  pull_request:
    branches:
      - main

jobs:
  ci:
    runs-on: ${{ matrix.os }}

    strategy:
      matrix:
        os: [ ubuntu-latest ]
        node: [ 14 ]

    steps:
      - uses: actions/setup-node@v1
        with:
          node-version: ${{ matrix.node }}

      - name: Checkout
        uses: actions/checkout@master

      - name: Cache node_modules
        uses: actions/cache@v2
        with:
          path: node_modules
          key: ${{ matrix.os }}-node-v${{ matrix.node }}-deps-${{ hashFiles(format('{0}{1}', github.workspace, '/yarn.lock')) }}

      - name: Install Dependencies
        if: steps.cache.outputs.cache-hit != 'true'
        run: yarn

      - name: Build
        run: yarn build
        env:
          NITRO_PRESET: cloudflare

      - name: Publish to Cloudflare
        uses: cloudflare/wrangler-action@1.3.0
        with:
          apiToken: ${{ secrets.CF_API_TOKEN }}
```


