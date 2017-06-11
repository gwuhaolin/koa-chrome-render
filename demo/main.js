'use strict';
const Koa = require('koa');
const serve = require('koa-static');
const isMobile = require('is-mobile');
const chromeRenderMiddleware = require('../index');
const app = new Koa();

app.use(chromeRenderMiddleware({
    enable: (request) => {
        return isMobile(request);
    },
    render: {
        // chrome-render #render() method ready option
        ready: '_page_ready',
    }
}));

app.use(serve(__dirname));

app.listen(3000);
