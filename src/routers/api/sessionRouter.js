import { Router } from 'express';
import passport from 'passport';

import { logger } from '../../config/logger.js';
import PasswordResetService from '../../services/sessionService.js';
import { isAuthenticated , isUser } from '../../middlewares/auth.js';
import CartService from '../../services/cartService.js';

const router = Router();
const passwordResetService = PasswordResetService.getInstance();
const cartService = new CartService();

router.post('/sessions/register', passport.authenticate('register', { failureRedirect: '/register' }), (req, res) => {
  res.redirect('/login');
})

router.post('/sessions/login', passport.authenticate('login', { failureRedirect: '/login' }), async (req, res) => {
  try {
    if(req.user.role == 'usuario'){
      const newCart = await cartService.createCart();
      req.user.cartID = newCart._id;
    }

    req.user.last_connection = new Date();
    await req.user.save();

    logger.debug('req.user', req.user);
    req.session.user = req.user;
    res.redirect('/api/products');
  } catch (error) {
    logger.error(error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

router.get('/sessions/github', passport.authenticate('github', { scope: ['user:email'] }), async (req, res) => { });

router.get('/sessions/githubcallback', passport.authenticate('github', { failureRedirect: '/login' }), (req, res) => {
  req.session.user = req.user;
  res.redirect('/api/products');
})

router.get('/sessions/logout', isAuthenticated, async (req, res) => {
  req.user.last_connection = new Date();
  await req.user.save();

  req.session.destroy((error) => {
    if (error) {
      logger.error(error);
      return res.status(500).send('Error interno del servidor');
    }
    res.redirect('/login');
  });
});

router.get('/current', isAuthenticated, (req, res) => {
  try {
    const userDTO = {
      email: req.user.email,
      role: req.user.role,
      user: req.user._id,
    };

    logger.info('Informacion del usuario:', userDTO);
    res.status(200).json(userDTO);
  } catch (error) {
    logger.error(error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

router.post('/request-reset', async (req, res) => {
  const { email } = req.body;
  try {
    await passwordResetService.sendPasswordResetEmail(email);
    res.status(200).json({ message: 'Correo de restablecimiento enviado con exito' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/reset-password/:token', async (req, res) => {
  const { token } = req.params;
  res.render('reset', { token });
});

router.post('/reset-password/:token', async (req, res) => {
  const { token } = req.params;
  const { newPassword } = req.body;
  try {
    await passwordResetService.resetPassword(token, newPassword);
    res.status(200).json({ message: 'Contraseña restablecida con exito' });
  } catch (error) {
    if (error.message.includes('enlace de restablecimiento expirado')) {
      res.redirect('/api/expired-token');
    } else {
      res.status(400).json({ error: error.message });
    }
  }
});

router.get('/expired-token', (req, res) => {
  res.render('expired');
});

export default router;