import userModel from '../dao/models/userModel.js';
import UserDTO from '../dto/userDTO.js';
import MailService from '../services/mailService.js';

export default class UsersController {
    constructor() {
        this.mailService = new MailService();
    }

    async getAllUsers(req, res) {
        try {
            const users = await userModel.find({}, { _id: 1, firstName: 1, lastName: 1, email: 1, age: 1, role: 1, cartID: 1, last_connection: 1 });
            const userDTOs = users.map(user => new UserDTO(user));
            return userDTOs;
        } catch (error) {
            console.error('Error al obtener usuarios:', error);
            res.status(500).json({ message: 'Error interno del servidor' });
        }
    }

    async updateRole(userId, newRole) {
        try {
            const user = await userModel.findById(userId);
            if (!user) {
                return { statusCode: 404, response: { error: 'Usuario no encontrado' } };
            }

            user.role = newRole;
            await user.save();
            return { statusCode: 200, response: { message: `El rol del usuario ha sido actualizado a: ${newRole}` } };
        } catch (error) {
            console.error('Error al cambiar el rol del usuario: ', error);
            return { statusCode: 500, response: { error: 'Error interno del servidor' } };
        }
    }

    async deleteById(userId) {
        try {
            const user = await userModel.findById(userId);
            if (!user) {
                return { statusCode: 404, response: { error: 'Usuario no encontrado' } };
            }
            await userModel.deleteOne({ _id: userId });
            return { statusCode: 200, response: { message: 'Usuario eliminado correctamente' } };
        } catch (error) {
            console.error('Error al eliminar el usuario: ', error);
            return { statusCode: 500, response: { error: 'Error interno del servidor' } };
        }
    }

    async deleteInactiveUsers(req, res) {
        try {
            const now = new Date();
            const timeLimit = new Date(now.getTime() - (5 * 60000)); //5minutos puesto para testing
            console.log(timeLimit);

            const inactiveUsers = await userModel.find({ last_connection: { $lt: timeLimit } });

            for (const user of inactiveUsers) {
                await userModel.deleteOne({ _id: user._id });
                await this.mailService.sendInactiveAccountEmail(user.email);
            }

            res.status(200).json({ message: 'Usuarios inactivos eliminados correctamente' });
        } catch (error) {
            res.status(500).json({ message: 'Error interno del servidor' });
        }
    }

    static async updateRoleToPremium(userId) {
        try {
            const user = await userModel.findById(userId);
            if (!user) {
                return { statusCode: 404, response: { error: 'Usuario no encontrado' } };
            }

            if (user.role === 'premium') {
                user.role = 'usuario';
                await user.save();
                return { statusCode: 200, response: { message: 'El rol del usuario ha sido actualizado a: usuario' } };
            }

            const requiredDocuments = ['identificacion.txt', 'comprobante_domicilio.txt', 'comprobante_estado_cuenta.txt'];
            const uploadedDocuments = user.documents.map(doc => doc.name.split('_').slice(1).join('_').toLowerCase());
            const missingDocuments = requiredDocuments.filter(doc => !uploadedDocuments.includes(doc));
            if (missingDocuments.length > 0) {
                return { statusCode: 400, response: { error: `Faltan los siguientes documentos: ${missingDocuments.join(', ')}` } };
            }

            user.role = 'premium';
            await user.save();
            return { statusCode: 200, response: { message: 'El rol del usuario ha sido actualizado a: premium' } };
        } catch (error) {
            console.error('Error al cambiar el rol del usuario: ', error);
            return { statusCode: 500, response: { error: 'Error interno del servidor' } };
        }
    }

    static async uploadDocuments(req, res, next) {
        try {
            const { user: { id }, files } = req;
            const user = await userModel.findById(id);
            if (!user) {
                return { statusCode: 404, response: { error: 'Usuario no encontrado' } };
            }

            user.documents = [];
            const newDocuments = files.map(file => ({
                name: file.filename,
            }));
            user.documents.push(...newDocuments);
            await user.save();
            res.status(204).end();
        } catch (error) {
            next(error);
        }
    }

}
