import userModel from '../dao/models/userModel.js';

export default class UsersController {
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
