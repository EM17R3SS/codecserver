const express = require('express');
const router = express.Router();
const { generateCsrfToken } = require('../api/middlewares/csrf');
const {
    ensureAuthenticated,
    ensureGuest,
    ensureRole,
} = require('../api/middlewares/ensureAuthenticated');

const googleEnabled = process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET;

router.use(generateCsrfToken);

router.get('/', (req, res) => {
    res.render('home', {
        title: 'Home',
        content: 'Welcome to our website',
        user: req.user || null,
        googleEnabled: googleEnabled,
    });
});

router.get('/about', (req, res) => {
    res.render('about', {
        title: 'About Us',
        companyName: 'NodeJS Server',
        experience: '3 years',
        projects: '25+',
        user: req.user || null,
        googleEnabled: googleEnabled,
    });
});

router.get('/contact', (req, res) => {
    res.render('contact', {
        title: 'Contact Us',
        email: 'info@example.com',
        phone: '+7 (999) 123-45-67',
        user: req.user || null,
        googleEnabled: googleEnabled,
    });
});

router.get('/login', (req, res) => {
    res.render('login', {
        title: 'Login',
        csrfToken: res.locals.csrfToken,
        user: null,
        googleEnabled: googleEnabled,
    });
});

router.get('/register', (req, res) => {
    res.render('register', {
        title: 'Register',
        csrfToken: res.locals.csrfToken,
        user: null,
        googleEnabled: googleEnabled,
    });
});

router.get('/users', ensureAuthenticated, ensureRole('admin'), (req, res) => {
    res.render('userList', {
        title: 'Manage Users',
        userCount: 0,
        user: req.user,
        googleEnabled: googleEnabled,
    });
});

module.exports = router;
