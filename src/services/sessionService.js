import nodemailer from 'nodemailer';
import crypto from 'crypto';
import UserModel from '../dao/models/userModel.js';
import { createHash, isValidPassword } from '../utils.js'
import config from '../config/config.js'

export default class PasswordResetService {
    static #instance = null;

    constructor() {
        this.transporter = nodemailer.createTransport({
            service: config.mail.service,
            port: config.mail.port,
            auth: {
                user: config.mail.user,
                pass: config.mail.password,
            },
        });
    }

    static getInstance() {
        if (!PasswordResetService.#instance) {
            PasswordResetService.#instance = new PasswordResetService();
        }
        return PasswordResetService.#instance;
    }

    async sendPasswordResetEmail(email) {
        const user = await UserModel.findOne({ email });
        if (!user) {
            throw new Error('Usuario no encontrado');
        }

        const resetToken = crypto.randomBytes(20).toString('hex');
        const resetExpires = (Date.now() - (3 * 60 * 60 * 1000)) + 3600; // corrijo a gmt-3 bsas y le agrego la expiracion del token, esta puesto 1m para test
        user.resetPasswordToken = resetToken;
        user.resetPasswordExpires = resetExpires;
        await user.save();

        const resetLink = `http://localhost:8080/api/reset-password/${resetToken}`;

        const mailOptions = {
            from: config.mail.user,
            to: email,
            subject: 'Recuperar contraseña',
            html: `<p>Haz clic en el siguiente enlace para restablecer tu contraseña:</p><a href="${resetLink}">Restablecer Contraseña</a>`,
        };

        return new Promise((resolve, reject) => {
            this.transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(info);
                }
            });
        });
    }

    async resetPassword(token, newPassword) {
        const user = await UserModel.findOne({ resetPasswordToken: token });
        if (!user) {
            throw new Error('Token no valido o expirado');
        }

        if (user.resetPasswordExpires < (Date.now() - (3 * 60 * 60 * 1000))) {
            throw new Error('Enlace de restablecimiento expirado. Generar uno nuevo');
        }

        const isSamePassword = isValidPassword(newPassword, user);
        if (isSamePassword) {
            throw new Error('La nueva contraseña debe ser diferente de la anterior');
        }

        user.password = createHash(newPassword);
        user.resetPasswordToken = null;
        user.resetPasswordExpires = null;
        await user.save();

    }
}
