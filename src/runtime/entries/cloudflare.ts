import '#internal/nitro/virtual/polyfill'
import { getAssetFromKV, mapRequestToAsset } from '@cloudflare/kv-asset-handler'
import { withoutBase } from 'ufo'
import { requestHasBody, useRequestBody } from '../utils'
import { nitroApp } from '../app'
import { useRuntimeConfig } from '#internal/nitro'

async function handleEvent (request, env, ctx) {
  try {
    return await getAssetFromKV({
      request,
      waitUntil (promise) {
        return ctx.waitUntil(promise)
      }
    },
    {
      cacheControl: assetsCacheControl,
      mapRequestToAsset: baseURLModifier
    })
    // return await getAssetFromKV(event, { cacheControl: assetsCacheControl, mapRequestToAsset: baseURLModifier })
  } catch (_err) {
    // Ignore
  }
  const url = new URL(request.url)
  let body
  if (requestHasBody(request)) {
    body = await useRequestBody(request)
  }

  const r = await nitroApp.localCall({
    event: request,
    url: url.pathname + url.search,
    host: url.hostname,
    protocol: url.protocol,
    headers: request.headers,
    method: request.method,
    redirect: request.redirect,
    body
  })

  return new Response(r.body, {
    // @ts-ignore
    headers: r.headers,
    status: r.status,
    statusText: r.statusText
  })
}

function assetsCacheControl (_request) {
  // TODO: Detect public asset bases
  // if (request.url.startsWith(buildAssetsURL())) {
  //   return {
  //     browserTTL: 31536000,
  //     edgeTTL: 31536000
  //   }
  // }
  return {}
}

const baseURLModifier = (request: Request) => {
  const url = withoutBase(request.url, useRuntimeConfig().app.baseURL)
  return mapRequestToAsset(new Request(url, request))
}

export default {
  fetch (
    request: Request,
    env: any,
    ctx: any
  ) {
    return handleEvent(request, env, ctx)
  }
}
