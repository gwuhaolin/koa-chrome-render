[![Npm Package](https://img.shields.io/npm/v/koa-chrome-render.svg?style=flat-square)](https://www.npmjs.com/package/koa-chrome-render)
[![Npm Downloads](http://img.shields.io/npm/dm/koa-chrome-render.svg?style=flat-square)](https://www.npmjs.com/package/koa-chrome-render)
[![Dependency Status](https://david-dm.org/gwuhaolin/koa-chrome-render.svg?style=flat-square)](https://npmjs.org/package/koa-chrome-render)

# koa-chrome-render
[chrome-render](https://github.com/gwuhaolin/chrome-render) middleware for koa.

Modern web app use technique like react.js vue.js which render html in browser, this cause some problem like search engine can't crawl your page content or first screen slow on low performance device.

This project want to solve this kind of problem in a general-purpose way which use headless chrome to render page result then return to client.
koa-chrome-render also support redis cache to improve performance.

## Use
```bash
npm i koa-chrome-render
```
then use it:
```js
const Koa = require('koa');
const chromeRenderMiddleware = require('koa-chrome-render');
const app = new Koa();

app.use(chromeRenderMiddleware({
    enable: true,
    render: {
        // chrome-render #render() method ready option
        ready: '_page_ready',
    },
    cache: {
        // redis address
        host: '127.0.0.1',
        port: 6379,
        // cache expires time after 10 seconds, if omitted cache forever
        expires: 10,
    },
}));

app.listen(3000);
```
you can download and run this [complete demo](./demo/main.js)

## Options

### `enable` options
should enable this middleware ? it's type can be boolean or function.
if type is function, result = enable(request);

### `render` options
options come form [chrome-render](https://github.com/gwuhaolin/chrome-render#chromerendernew-method-support-options)
- `maxTab`: `number` max tab chrome will open to render pages, default is no limit, `maxTab` used to avoid open to many tab lead to chrome crash. `ChromeRender` will create a tab poll to reuse tab for performance improve and resource reduce as open and close tab in chrome require time, like database connection poll. 
- `renderTimeout`: `number` in ms, `chromeRender.render()` will throw error if html string can't be resolved after `renderTimeout`, default is 5000ms.
- `ready`: `string` is an option param. if it's omitted chrome will return page html on dom event `domContentEventFired`, else will waiting util js in web page call `console.log(${ready's value})`. et `ready=_ready_flag` when web page is ready call `console.log('_ready_flag')`.
- `script`: `string` is an option param. inject script source to evaluate when page on load

### `cache` options
options `cache` is not required, if it's omitted will not use cache.
`cache` is a object, is support all params in [node redis driver](https://github.com/NodeRedis/node_redis#options-object-properties),
and below:
- `expires`: `number` cache expires time in seconds, if omitted cache forever

## Dependencies
1. depend on [Chrome Canary](https://www.google.com/chrome/browser/canary.html) now
2. Nodejs 7+
3. If `cache` options is used, redis is required