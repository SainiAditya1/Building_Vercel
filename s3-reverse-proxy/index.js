const express = require('express');
const httpProxy = require('http-proxy');

const app = express();
const PORT = 8000;

app.use((req,res) => {
    const hostname = req.hostname;
    const subdomain = hostname.split('.')[0];
})





app.listen(PORT, ()=> {
    console.log(`Reverse Proxy is running ... ${PORT}`);
})