import nodemailer from 'nodemailer';
import config from '../config/config.js'
import crypto from 'crypto';
import UserModel from '../dao/models/userModel.js';
import { isValidPassword, createHash } from '../utils.js';

export default class MailService {
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

    async sendInactiveAccountEmail(userEmail) {
        try {
            const mailOptions = {
                from: config.mail.user,
                to: userEmail,
                subject: 'Tu cuenta ha sido eliminada por inactividad',
                text: 'Lamentablemente, tu cuenta ha sido eliminada debido a la inactividad.',
            };

            await this.transporter.sendMail(mailOptions);
        } catch (error) {
            console.error('Error al enviar correo electronico:', error);
            throw new Error('Error al enviar correo electronico');
        }
    }

    async sendProductDeletedEmail(email, productName) {
        const mailOptions = {
            from: config.mail.user,
            to: email,
            subject: 'Producto Eliminado',
            text: `Hola,\n\nTu producto "${productName}" ha sido eliminado.`
        };

        try {
            await this.transporter.sendMail(mailOptions);
            console.log('Correo electronico enviado con exito');
        } catch (error) {
            console.error('Error al enviar el correo electronico:', error);
            throw new Error('Error al enviar el correo electronico');
        }
    }

    async sendPasswordResetEmail(email) {
        const user = await UserModel.findOne({ email });
        if (!user) {
            throw new Error('Usuario no encontrado');
        }

        const resetToken = crypto.randomBytes(20).toString('hex');
        const resetExpires = Date.now() + 3600000;
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

        if (user.resetPasswordExpires < Date.now()) {
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

    async sendPurchaseConfirmationEmail(email, ticket) {
        const mailOptions = {
          from: config.mail.user,
          to: email,
          subject: 'Confirmacion de compra',
          text: `¡Gracias por tu compra! Aqui esta tu ticket de compra: ${ticket}`,
        };
      
        try {
          await this.transporter.sendMail(mailOptions);
          console.log('Correo electronico de confirmacion de compra enviado con exito');
        } catch (error) {
          console.error('Error al enviar el correo electronico de confirmacion de compra:', error);
          throw new Error('Error al enviar el correo electronico de confirmacion de compra');
        }
      }
      
}




