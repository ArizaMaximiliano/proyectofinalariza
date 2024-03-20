import { Router } from 'express';
import passport from 'passport';
import { isAuthenticated } from '../../middlewares/auth.js';
import SessionController from '../../controller/sessionController.js';

const router = Router();
const sessionController = new SessionController();

router.post('/sessions/register', passport.authenticate('register', { failureRedirect: '/register' }), (req, res) => {
    res.redirect('/login');
});

router.post('/sessions/login', passport.authenticate('login', { failureRedirect: '/login' }), async (req, res) => {
    await sessionController.login(req, res);
    res.redirect('/api/products');
});

router.get('/sessions/logout', isAuthenticated, async (req, res) => {
    await sessionController.logout(req, res);
    res.redirect('/login');

});

router.get('/current', isAuthenticated, async (req, res) => {
    await sessionController.getCurrentUser(req, res);

});

router.get('/sessions/github', passport.authenticate('github', { scope: ['user:email'] }), async (req, res) => { });

router.get('/sessions/githubcallback', passport.authenticate('github', { failureRedirect: '/login' }), async (req, res) => {
    req.session.user = req.user;
    res.redirect('/api/products');
});

router.post('/request-reset', async (req, res) => {
    await sessionController.requestResetPassword(req, res);
});

router.get('/reset-password/:token', async (req, res) => {
    const { token } = req.params;
    res.render('reset', { token });
});

router.post('/reset-password/:token', async (req, res) => {
    await sessionController.resetPassword(req, res);
});

router.get('/expired-token', (req, res) => {
    res.render('expired');
});

export default router;
