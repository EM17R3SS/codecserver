const express = require('express');
const router = express.Router();
const { generateCsrfToken } = require('../api/middlewares/csrf');
const {
    ensureAuthenticated,
    ensureGuest,
    ensureRole,
} = require('../api/middlewares/ensureAuthenticated');

router.use(generateCsrfToken);

router.get('/', (req, res) => {
    res.render('home', {
        title: 'Главная страница',
        content: 'Добро пожаловать на наш сайт',
        user: req.user || null,
    });
});

router.get('/about', (req, res) => {
    res.render('about', {
        title: 'О нас',
        companyName: 'NodeJS Server',
        experience: '3 года',
        projects: '25+',
        user: req.user || null,
    });
});

router.get('/contact', (req, res) => {
    res.render('contact', {
        title: 'Контакты',
        email: 'info@example.com',
        phone: '+7 (999) 123-45-67',
        user: req.user || null,
    });
});

router.get('/login', ensureGuest, (req, res) => {
    res.render('login', {
        title: 'Вход в систему',
        csrfToken: res.locals.csrfToken,
        user: null,
    });
});

router.get('/register', ensureGuest, (req, res) => {
    res.render('register', {
        title: 'Регистрация',
        csrfToken: res.locals.csrfToken,
        user: null,
    });
});

router.get('/users', ensureAuthenticated, ensureRole('admin'), (req, res) => {
    res.render('userList', {
        title: 'Управление пользователями',
        userCount: 0,
        user: req.user,
    });
});

module.exports = router;
