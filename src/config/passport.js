const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const { Strategy: JwtStrategy, ExtractJwt } = require('passport-jwt');
const GoogleStrategy = require('passport-google-oauth20').Strategy;

const User = require('../core/models/User');
const { comparePassword } = require('../lib/password');
const config = require('./env');
const logger = require('./logger');

passport.use(
    new LocalStrategy(
        { usernameField: 'email', passwordField: 'password' },
        async (email, password, done) => {
            try {
                const normalizedEmail = email.toLowerCase().trim();
                const user = await User.findOne({
                    email: normalizedEmail,
                }).select('+password +failedLoginAttempts +lockUntil');

                if (!user) {
                    return done(null, false, {
                        message: 'Неверный email или пароль',
                    });
                }
                if (!user.isActive) {
                    return done(null, false, {
                        message: 'Аккаунт заблокирован',
                    });
                }
                if (user.lockUntil && user.lockUntil > Date.now()) {
                    const minutes = Math.ceil(
                        (user.lockUntil - Date.now()) / 60000,
                    );
                    return done(null, false, {
                        message: `Аккаунт временно заблокирован. Попробуйте через ${minutes} мин.`,
                    });
                }

                const isMatch = await comparePassword(password, user.password);

                if (!isMatch) {
                    await user.incrementLoginAttempts(config);
                    return done(null, false, {
                        message: 'Неверный email или пароль',
                    });
                }

                if (user.failedLoginAttempts > 0 || user.lockUntil) {
                    await user.resetLoginAttempts();
                }

                return done(null, user);
            } catch (err) {
                return done(err);
            }
        },
    ),
);

passport.use(
    new JwtStrategy(
        {
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: config.JWT_SECRET,
        },
        async (payload, done) => {
            try {
                const user = await User.findById(payload.id);
                if (!user || !user.isActive) {
                    return done(null, false);
                }
                return done(null, user);
            } catch (err) {
                return done(err, false);
            }
        },
    ),
);

if (config.GOOGLE_CLIENT_ID && config.GOOGLE_CLIENT_SECRET) {
    passport.use(
        new GoogleStrategy(
            {
                clientID: config.GOOGLE_CLIENT_ID,
                clientSecret: config.GOOGLE_CLIENT_SECRET,
                callbackURL: config.GOOGLE_CALLBACK_URL,
                passReqToCallback: true,
            },
            async (req, accessToken, refreshToken, profile, done) => {
                try {
                    const email = profile.emails?.[0]?.value?.toLowerCase();
                    const displayName = profile.displayName || 'Google User';

                    if (!email) {
                        logger.warn('Google OAuth: no email provided');
                        return done(null, false, { message: 'Email не получен от Google' });
                    }

                    let user = await User.findOne({ googleId: profile.id });

                    if (user) {
                        if (!user.isActive) {
                            return done(null, false, { message: 'Аккаунт деактивирован' });
                        }
                        logger.info(`Google OAuth: existing user ${user.email}`);
                        return done(null, user);
                    }

                    user = await User.findOne({ email });

                    if (user) {
                        user.googleId = profile.id;
                        await user.save();
                        logger.info(`Google OAuth: linked Google ID to existing user ${user.email}`);
                        return done(null, user);
                    }

                    user = await User.create({
                        name: displayName,
                        email: email,
                        googleId: profile.id,
                        password: null,
                        role: 'user',
                        isActive: true,
                    });

                    logger.info(`Google OAuth: created new user ${user.email}`);
                    return done(null, user);
                } catch (err) {
                    logger.error(`Google OAuth strategy error: ${err.message}`);
                    return done(err, null);
                }
            },
        ),
    );
    logger.info('Google OAuth стратегия подключена');
} else {
    logger.warn('Google OAuth не настроен (нет CLIENT_ID/SECRET в .env)');
}

passport.serializeUser((user, done) => {
    done(null, user._id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (err) {
        done(err, null);
    }
});

module.exports = passport;
