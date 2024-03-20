import express from 'express';

import UsersController from '../../controller/usersController.js';
import { isAuthenticated, checkRole } from '../../middlewares/auth.js';

import { uploader } from '../../utils.js';

const router = express.Router();
const userController = new UsersController();


router.get('/users', isAuthenticated, checkRole('admin'), async (req, res) => {
    const users = await userController.getAllUsers(req, res);
    res.render('users', { users });
});

router.post('/users/:userId/update-role', isAuthenticated, checkRole('admin'), async (req, res) => {
    const { userId } = req.params;
    const { newRole } = req.body;
    const result = await userController.updateRole(userId, newRole);
    res.status(result.statusCode).json(result.response);
});

router.post('/users/:userId/delete', isAuthenticated, checkRole('admin'), async (req, res) => {
    const { userId } = req.params;
    const result = await userController.deleteById(userId);
    res.status(result.statusCode).json(result.response);
});

router.delete('/users', async (req, res) => {
    await userController.deleteInactiveUsers(req, res);
});

router.post('/users/delete', isAuthenticated, async (req, res) => {
    await userController.deleteInactiveUsers(req, res);
});

router.get('/users/premium/:uid', isAuthenticated, async (req, res) => {
    res.render('premium', { user: req.session.user });
});

router.post('/users/premium/:uid', isAuthenticated, async (req, res) => {
    const { uid } = req.params;
    const result = await UsersController.updateRoleToPremium(uid);
    res.status(result.statusCode).json(result.response);
});

router.post('/users/premium/:uid/documents', uploader.array('files'), UsersController.uploadDocuments);

router.get('/upload/:uid', isAuthenticated, (req, res) => {
    const { uid } = req.params;
    res.render('upload', { uid });
});


export default router;
