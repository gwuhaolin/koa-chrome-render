'use strict';
const ChromeRender = require('chrome-render');

function cookieString2Object(cookieString) {
  let cookies;
  if (typeof cookieString === 'string') {
    cookies = {};
    try {
      cookieString.split('; ').forEach(em => {
        const two = em.split('=');
        cookies[two[0]] = cookies[two[1]];
      })
    } catch (_) {
    }
  }
}

function chromeRenderMiddleware(options = {
  // should enable this middleware ? it's type can be boolean or function
  // if type is function, result = enable(request);
  enable: true,
  render: {
    // number max tab chrome will open to render pages, default is no limit, maxTab used to avoid open to many tab lead to chrome crash.
    maxTab: undefined,
    // number in ms, chromeRender.render() will throw error if html string can't be resolved after renderTimeout, default is 5000ms.
    renderTimeout: undefined,

    // boolean whether use window.chromeRenderReady() to notify chrome-render page has ready. default is false chrome-render use domContentEventFired as page has ready.
    useReady: undefined,
    // string is an option param. inject script source to evaluate when page on load
    script: undefined,
  },
}) {
  const { enable, render: chromeRenderOptions, } = options;

  let chromeRender;

  if (enable) {
    (async () => {
      chromeRender = await ChromeRender.new(chromeRenderOptions);
    })();
  }

  return async function (ctx, next) {
    const { request } = ctx;
    const { href, headers } = request;
    const cookies = cookieString2Object(headers['cookies']);

    let enableMiddleware = enable;
    if (typeof enable === 'function') {
      enableMiddleware = enable(request);
    }

    // ignore request from chrome-render avoid loop
    if (headers['x-chrome-render'] !== undefined) {
      enableMiddleware = false;
    }

    if (enableMiddleware) {
      /**
       * use chrome-render render page to html string
       *
       * {
             *      // from request
             *      url: `string` is required, web page's URL
             *      cookies: `object {cookieName:cookieValue}` set HTTP cookies when request web page
             *      headers: `object {headerName:headerValue}` add HTTP headers when request web page
             *
             *      // from user config
             *      useReady: boolean whether use window.chromeRenderReady() to notify chrome-render page has ready. default is false chrome-render use domContentEventFired as page has ready.
             *      script: inject script to evaluate when page on load,
             * }
       */
      ctx.body = await chromeRender.render(Object.assign({
        url: href,
        headers,
        cookies,
      }, chromeRenderOptions));
    } else {
      await next();
    }
  }
}

module.exports = chromeRenderMiddleware;

