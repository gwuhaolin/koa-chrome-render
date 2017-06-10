'use strict';
const ChromeRender = require('chrome-render');
const Cacher = require('./cacher');

function chromeRenderMiddleware(options = {
    // should enable this middleware ? it's type can be boolean or function
    // if type is function, result = enable(request);
    enable: true,
    render: {
        // number max tab chrome will open to render pages, default is no limit, maxTab used to avoid open to many tab lead to chrome crash.
        maxTab: undefined,
        // number in ms, chromeRender.render() will throw error if html string can't be resolved after renderTimeout, default is 5000ms.
        renderTimeout: undefined,

        // string is an option param. if it's omitted chrome will return page html on dom event domContentEventFired, else will waiting util js in web page call console.log(${ready's value}). et ready=_ready_flag when web page is ready call console.log('_ready_flag')
        ready: undefined,
        // string is an option param. inject script source to evaluate when page on load
        script: undefined,
    },
    // is a object, is support all params in [node redis driver](https://github.com/NodeRedis/node_redis#options-object-properties),
    // is not required, if it's omitted will not use cache.
    cache: undefined,
}) {
    const { enable, render: chromeRenderOptions, cache: cacheOptions } = options;

    let cacher;
    let chromeRender;

    if (enable) {
        if (cacheOptions !== undefined) {
            cacher = new Cacher(cacheOptions);
        }

        (async () => {
            chromeRender = await ChromeRender.new(chromeRenderOptions);
        })();
    }

    // use chrome-render render page to html string
    const render = async function (request) {
        const { href, header } = request;
        const referrer = header['referrer'];
        const cookieString = header['cookies'];
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
        return await chromeRender.render(Object.assign({
            url: href,
            referrer,
            cookies,
        }, chromeRenderOptions));
    }

    return async function (ctx, next) {
        const { request } = ctx;
        const { headers } = request;

        let enableMiddleware = enable;
        if (typeof enable === 'function') {
            enableMiddleware = enable(request);
        } else if (headers.hasOwnProperty('x-chrome-render')) {
            // ignore request from chrome-render avoid loop
            enableMiddleware = false;
        }

        if (enableMiddleware) {
            // is a bot req
            let htmlString
            if (cacher === undefined) {
                // don't use cache
                htmlString = await render(request);
            } else {
                // use cache
                const { href } = request;
                htmlString = await cacher.get(href);
                if (htmlString === null) {
                    htmlString = await render(request);
                    cacher.set(href, htmlString);
                }
            }
            ctx.body = htmlString;
        } else {
            await next();
        }
    }
}

module.exports = chromeRenderMiddleware;

