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
const { globalLimiter } = require('./api/middlewares/rateLimiter');
const {
    helmetMiddleware,
    mongoSanitizeMiddleware,
    hppMiddleware,
    xssSanitize,
} = require('./api/middlewares/security');

const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../templates/pages'));
app.set('trust proxy', 1);

//Security headers
app.use(helmetMiddleware);

//CORS
app.use(
    cors({
        origin: process.env.NODE_ENV === 'production'
            ? process.env.CORS_ORIGIN
            : ['http://localhost:3000'],
        credentials: true,
    }),
);

//Общий rate limiter
app.use(globalLimiter);

//Логирование
app.use(requestLogger);

//Парсинг
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

//Санитайзеры
app.use(mongoSanitizeMiddleware);
app.use(xssSanitize);
app.use(hppMiddleware);

//Cookie
app.use(cookieParser());

//Статика
app.use(express.static(path.join(__dirname, '../public')));

//Сессии + Passport
app.use(
    session({
        secret: config.SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
        store: MongoStore.create({
            mongoUrl: config.MONGO_URI,
            collectionName: 'sessions',
        }),
        cookie: {
            secure: config.NODE_ENV === 'production',
            httpOnly: true,
            sameSite: 'lax',
            maxAge: config.SESSION_MAX_AGE,
        },
    }),
);
app.use(passport.initialize());
app.use(passport.session());

//Роуты
app.use('/api/v1', require('./api/v1')); // REST API JWT, без CSRF
app.use('/', require('./routes/webRouter')); //сессии + CSRF

//404 и обработка ошибок — строго в конце
app.use(notFound);
app.use(errorHandler);

module.exports = app;
