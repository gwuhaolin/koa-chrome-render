[![Npm Package](https://img.shields.io/npm/v/koa-chrome-render.svg?style=flat-square)](https://www.npmjs.com/package/koa-chrome-render)
[![Npm Downloads](http://img.shields.io/npm/dm/koa-chrome-render.svg?style=flat-square)](https://www.npmjs.com/package/koa-chrome-render)
[![Dependency Status](https://david-dm.org/gwuhaolin/koa-chrome-render.svg?style=flat-square)](https://npmjs.org/package/koa-chrome-render)

# koa-chrome-render
[chrome-render](https://github.com/gwuhaolin/chrome-render) middleware for koa.

Modern web app use technique like react.js vue.js which render html in browser, this cause some problem like search engine can't crawl your page content or first screen slow on low performance device.

This project want to solve this kind of problem in a general-purpose way which use headless chrome to render page result then return to client.

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
        // use `window.isPageReady=1` to notify chrome-render page has ready
        useReady: true,
    }
}));

app.listen(3000);
```
you can download and run this [complete demo](./demo/main.js) which will use chrome-render for mobile device else return html direct.

## Options

### `enable` options
should enable this middleware for every single request ? it's type can be boolean or function.
if type is function, result = enable(request);
this can be used to control whether use chrome to render in some case, e.g [koa-seo](https://github.com/gwuhaolin/koa-seo).

### `render` options
options come form [chrome-render](https://github.com/gwuhaolin/chrome-render#chromerendernew-method-support-options)
- `maxTab`: `number` max tab chrome will open to render pages, default is no limit, `maxTab` used to avoid open to many tab lead to chrome crash. `ChromeRender` will create a tab poll to reuse tab for performance improve and resource reduce as open and close tab in chrome require time, like database connection poll. 
- `renderTimeout`: `number` in ms, `chromeRender.render()` will throw error if html string can't be resolved after `renderTimeout`, default is 5000ms.
- `useReady`: `boolean` whether use `window.isPageReady=1` to notify chrome-render page has ready. default is false chrome-render use `domContentEventFired` as page has ready.
- `script`: `string` is an option param. inject script source to evaluate when page on load

also koa-chrome-render will read:
- `headers` from request HTTP headers and attach to chrome-render's request
- `cookies` from request HTTP headers and attach to chrome-render's request

## Friends
- koa-chrome-render dependent on [chrome-render](https://github.com/gwuhaolin/chrome-render) general server render base on chrome.
- [koa-seo](https://github.com/gwuhaolin/koa-seo) koa SEO middleware
- [chrome-pool](https://github.com/gwuhaolin/chrome-pool) Headless chrome tabs manage pool.
