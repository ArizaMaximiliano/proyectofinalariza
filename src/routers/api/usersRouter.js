import express from 'express';

import { isAuthenticated } from '../../middlewares/auth.js';
import UsersController from '../../controller/usersController.js';
import { uploader } from '../../utils.js';

const router = express.Router();

router.get('/users/premium/:uid', isAuthenticated, async (req, res) => {
    res.render('premium', { user: req.session.user });
});

router.post('/users/premium/:uid', isAuthenticated, async (req, res) => {
    try {
        const { uid } = req.params;
        const result = await UsersController.updateRoleToPremium(uid);
        res.status(result.statusCode).json(result.response);
    } catch (error) {
        console.error('Error al actualizar el rol a premium: ', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

router.post('/users/premium/:uid/documents', uploader.array('files'), UsersController.uploadDocuments);

router.get('/upload/:uid', (req, res) => {
    const { uid } = req.params;
    res.render('upload', { uid });
});


export default router;
