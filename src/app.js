const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const passport = require('./config/passport');
const config = require('./config/env');
const requestLogger = require('./api/middlewares/logger');
const notFound = require('./api/middlewares/notFound');
const errorHandler = require('./api/middlewares/errorHandler');
const { globalLimiter, apiLimiter } = require('./api/middlewares/rateLimiter');
const {
    helmetMiddleware,
    mongoSanitizeMiddleware,
    hppMiddleware,
    xssSanitize,
} = require('./api/middlewares/security');

const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../templates/pages'));
app.set('trust proxy', config.isProduction);

app.use(helmetMiddleware);

app.use(
    cors({
        origin: config.isProduction ? config.CORS_ORIGIN : ['http://localhost:3000', 'http://127.0.0.1:3000'],
        credentials: true,
    }),
);

app.use(globalLimiter);

app.use('/api', apiLimiter);

app.use(requestLogger);

app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

app.use(mongoSanitizeMiddleware);
app.use(xssSanitize);
app.use(hppMiddleware);

app.use(cookieParser());

app.use(express.static(path.join(__dirname, '../public')));

app.use(
    session({
        secret: config.SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
        store: MongoStore.create({
            mongoUrl: config.MONGO_URI,
            collectionName: 'sessions',
            ttl: config.SESSION_MAX_AGE / 1000,
        }),
        cookie: {
            secure: config.isProduction,
            httpOnly: true,
            sameSite: 'lax',
            maxAge: config.SESSION_MAX_AGE,
        },
    }),
);

app.use(passport.initialize());
app.use(passport.session());

app.use('/api/v1', require('./api/v1'));
app.use('/', require('./routes/webRouter'));

app.use(notFound);
app.use(errorHandler);

module.exports = app;
