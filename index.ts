import { Server } from "@docsploit/espress";
import modules from "./app/modules";
import cookieParser from 'cookie-parser'
import session from 'express-session'
import { getEnv, sendSuccessResponse } from "@docsploit/espress/lib/utils";
import path from 'path'
import { database } from "./utils/database";


database()
const PostgreSqlStore = require('connect-pg-simple')(session);
const server = new Server({
    limit: "100mb",
    _cors:
    {
        origin: getEnv('CLIENT'),
        credentials: true,
        allowedHeaders: "Content-Type,Content-Length, Authorization, Accept,X-Requested-With",
        methods: ['GET', "POST", 'DELETE', 'PUT', 'OPTIONS', 'HEAD']
    }
}, modules, "Planner");
const app = server.app;
const express = server.express;
app.use(cookieParser())
app.use(session(
    {
        secret: getEnv('ACCESS_SECRET'),
        resave: false,
        saveUninitialized: false,
        cookie: { maxAge: 1000 * 60 * 60 * 24 * 30, },
        store: new PostgreSqlStore({
            conObject: {
                connectionString: getEnv('DB'),
                ssl: true,
            },
            createTableIfMissing: true,

        })
    }
))

const root = path.join(__dirname, 'static')

app.get("/", (req, res) => {
    if ((req.session as any).token) {
        return res.sendFile('/nextApp/index.html', { root })
    } else {
        return res.redirect('/login')
    }
});


app.get('/login', (req, res) => {
    if ((req.session as any).token) {
        return res.redirect('/')
    } else
        return res.sendFile('login.html', { root });
});

app.get('/signup', (req, res) => {
    if ((req.session as any).token) {
        return res.redirect('/')
    } else
        return res.sendFile('new_account.html', { root });
})

app.get('/email-verification', (req, res) => {
    if ((req.session as any).token) {
        return res.redirect('/')
    } else {
        const time = new Date().getTime();
        const expires = Number(req.query.expires);
        if (time > expires || !req.query.expires) {
            return res.redirect('/login')
        }
        return res.sendFile('email_verification.html', { root });
    }
})

app.get('/forgot-password', (req, res) => {
    if ((req.session as any).token) {
        return res.redirect('/')
    } else
        return res.sendFile('forgot-password.html', { root });
})

app.get('/resetPassword/:token', (req, res) => {
    if ((req.session as any).token) {
        return res.redirect('/')
    } else
        res.sendFile('reset_password.html', { root });
})



server.run();