'use strict';
const ChromeRender = require('chrome-render');

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
}) {
    const { enable, render: chromeRenderOptions, } = options;

    let chromeRender;

    if (enable) {
        (async () => {
            chromeRender = await ChromeRender.new(chromeRenderOptions);
        })();
    }

    // use chrome-render render page to html string
    const render = async function (options) {
        const { href, referrer, cookie } = options;
        let cookies;
        if (typeof cookie === 'string') {
            cookies = {};
            try {
                cookie.split('; ').forEach(em => {
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
        const { href, headers } = request;
        const referrer = headers['referrer'];
        const cookie = headers['cookies'];

        let enableMiddleware = enable;
        if (typeof enable === 'function') {
            enableMiddleware = enable(request);
        }

        // ignore request from chrome-render avoid loop
        if (headers.hasOwnProperty('x-chrome-render')) {
            enableMiddleware = false;
        }

        if (enableMiddleware) {
            ctx.body = await render({ href, referrer, cookie });
        } else {
            await next();
        }
    }
}

module.exports = chromeRenderMiddleware;

