import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { Strategy as GithubStrategy } from 'passport-github2';

import { createHash, isValidPassword } from '../utils.js';
import UserModel from '../dao/models/userModel.js';
import config from '../config/config.js';

const opts = {
    usernameField: 'email',
    passReqToCallback: true,
};

const githubOpts = {
    clientID: config.githubClientID,
    clientSecret: config.githubClientSecret,
    callbackURL: "http://localhost:8080/api/sessions/githubcallback",
};

export const initializePassport = () => {

    passport.use('register', new LocalStrategy(opts, async (req, email, password, done) => {
        try {
            const user = await UserModel.findOne({ email });
            if (user) {
                return done(new Error('Usuario ya registrado'));
            }
            const newUser = await UserModel.create({
                ...req.body,
                password: createHash(password),
            });
            done(null, newUser);
        } catch (error) {
            done(new Error(`Ocurrio un error en la autenticacion ${error.message}`));
        }
    }));

    passport.use('login', new LocalStrategy(opts, async (req, email, password, done) => {
        try {
            const user = await UserModel.findOne({ email });

            if (email === 'adminCoder@coder.com' && password === 'adminCod3r123') {
                req.session.user = { email, role: 'admin' };
                return done(null, { email, role: 'admin' });
            }

            if (!user) {
                return done(new Error('Correo/contraseña invalidos'));
            }

            const isPassValid = isValidPassword(password, user);
            if (!isPassValid) {
                return done(new Error('Correo/contraseña invalidos'));
            }

            req.session.user = { email, role: 'usuario' };
            done(null, user);

        } catch (error) {
            done(new Error(`Ocurrio un error durante la autenticacion ${error.message}`));
        }
    }));

    passport.use('github', new GithubStrategy(githubOpts, async (accessToken, refreshToken, profile, done) => {
        console.log('profile', profile);
        let email = profile._json.email;
        let user = await UserModel.findOne({ email });

        if (!user) {
            user = {
                firstName: profile._json.name,
                lastName: '',
                age: 22,
                email: email,
                password: '',
                provider: 'Github',
            };

            const newUser = await UserModel.create(user);
            done(null, newUser);
        } else {
            return done(null, user);
        }

    }));

    passport.serializeUser((user, done) => {
        if (user.role === 'admin') {
            const adminId = 'adminUniqueId';
            done(null, adminId);
        } else {
            done(null, user.id);
        }
    });

    passport.deserializeUser(async (id, done) => {
        if (id === 'adminUniqueId') {
            const admin = { email: 'adminCoder@coder.com', role: 'admin' };
            done(null, admin);
        } else {
            try {
                const user = await UserModel.findById(id);
                done(null, user);
            } catch (error) {
                done(error, null);
            }
        }
    });
}

