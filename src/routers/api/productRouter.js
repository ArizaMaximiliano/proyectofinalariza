import express from 'express';
import ProductController from '../../controller/productController.js';
import { isAuthenticated } from '../../middlewares/auth.js'; 

const router = express.Router();
const productController = new ProductController();

router.get('/products', isAuthenticated, async (req, res) => {
  try {
    await productController.getProductsPaginated(req, res);
  } catch (error) {
    console.error('Error al obtener productos paginados:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

router.get('/products/:pid', isAuthenticated, async (req, res) => {
  await productController.findById(req, res);
});

router.post('/products', async (req, res) => {
  await productController.create(req, res);
});

router.put('/products/:pid', async (req, res) => {
  await productController.updateById(req, res);
});

router.delete('/products/:pid', async (req, res) => {
  await productController.deleteById(req, res);
});

export default router;
