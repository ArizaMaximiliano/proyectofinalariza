import MailService from '../services/mailService.js';
import CartService from '../services/cartService.js';
import { logger } from '../config/logger.js';

const mailService = new MailService();
const cartService = new CartService();

export default class SessionController {

    async login(req, res) {
        try {
            if (req.user.role === 'admin') {
                req.session.user = req.user;
                return;
            }
    
            if (!req.user.cartID) {
                const newCart = await cartService.createCart();
                req.user.cartID = newCart._id;
            }
    
            req.user.last_connection = new Date();
            await req.user.save();
    
            req.session.user = req.user;
            return;
        } catch (error) {
            logger.error(error);
            res.status(500).json({ message: 'Error interno del servidor' });
        }
    }

    async logout(req, res) {
        try {
            if (!req.user.role == 'admin') {
                req.user.last_connection = new Date();
                await req.user.save();
            }

            req.session.destroy((error) => {
                if (error) {
                    logger.error(error);
                    return res.status(500).send('Error interno del servidor');
                }
            });

        } catch (error) {
            logger.error(error);
            res.status(500).json({ message: 'Error interno del servidor' });
        }
    }

    async getCurrentUser(req, res) {
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
    }

    async requestResetPassword(req, res) {
        const { email } = req.body;
        try {
            await mailService.sendPasswordResetEmail(email);
            res.status(200).json({ message: 'Correo de restablecimiento enviado con exito' });
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    async resetPassword(req, res) {
        const { token } = req.params;
        const { newPassword } = req.body;
        try {
            await mailService.resetPassword(token, newPassword);
            res.status(200).json({ message: 'Contraseña restablecida con exito' });
        } catch (error) {
            if (error.message.includes('enlace de restablecimiento expirado')) {
                res.redirect('/api/expired-token');
            } else {
                res.status(400).json({ error: error.message });
            }
        }
    }
    
}
