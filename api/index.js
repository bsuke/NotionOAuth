const path = require('path');
const express = require('express');
const fetch = require('node-fetch');  // 追加: Notion APIへのリクエストに使用
const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../views'));

// 基本的なルートハンドラの追加
app.get('/', (req, res) => {
    res.send('Hello, this is my Notion OAuth server!');
});

app.get('/oauth-callback', async (req, res) => {
    const { code } = req.query;
    
    // ここで認証コードをログとして出力
    console.log("Received authorization code:", code);
    
    // 一時的な認証コードを使用してaccess_tokenを取得
    const clientId = process.env.OAUTH_CLIENT_ID;
    const clientSecret = process.env.OAUTH_CLIENT_SECRET;
    const redirectUri = process.env.OAUTH_REDIRECT_URI;
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

    // Notion APIからのレスポンスをログに出力
    console.log(data);  // この行を追加
    
    // access_tokenとworkspace_idをWebページに表示
    res.render('display', { accessToken: data.access_token, databaseId: data.workspace_id });
});

module.exports = app;