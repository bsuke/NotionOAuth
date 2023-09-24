const path = require('path');
const express = require('express');
const fetch = require('node-fetch');
const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../views'));

app.get('/', (req, res) => {
    res.send('Hello, this is my Notion OAuth server!');
});

app.get('/oauth-callback', async (req, res) => {
    const { code } = req.query;
    
    // ここで認証コードをログとして出力
    console.log("Received authorization code:", code);
    
    const clientId = process.env.OAUTH_CLIENT_ID;
    const clientSecret = process.env.OAUTH_CLIENT_SECRET;
    const redirectUri = "https://notion-o-auth.vercel.app/oauth-callback";  // 直接URLを書き込み
    const encoded = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
    
    const response = await fetch("https://api.notion.com/v1/oauth/token", {
        method: "POST",
        headers: {
            "Accept": "application/json",
            "Content-Type": "application/json",
            "Authorization": `Basic ${encoded}`
        },
        body: JSON.stringify({
            grant_type: "authorization_code",
            code: code,
            redirect_uri: redirectUri,
        }),
    });
    const data = await response.json();

    console.log(data);
    
    res.render('display', { accessToken: data.access_token});
});

module.exports = app;
