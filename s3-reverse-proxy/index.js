const express = require('express');
const httpProxy = require('http-proxy');

const app = express();
const PORT = 8000;

const BASE_PATH= 'https://vercel-clone-mine.s3.ap-south-1.amazonaws.com/__outputs'

const proxy = httpProxy.createProxy();



app.use((req,res) => {
    const hostname = req.hostname;
    const subdomain = hostname.split('.')[0];

    // we can also add custom domain here in it
    // custom domain - DB Query



    const resolvesTo = `${BASE_PATH}/${subdomain}`

   return proxy.web(req, res, { target: resolvesTo, changeOrigin: true})

})

proxy.on('proxyReq', (proxyReq, req, res) => {
    const url = req.url;
    if (url === '/')
        proxyReq.path += 'index.html'

    // return proxyReq
})





app.listen(PORT, ()=> {
    console.log(`Reverse Proxy is running ... ${PORT}`);
})