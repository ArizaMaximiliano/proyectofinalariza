import express from 'express';
import ProductController from '../../controller/productController.js';
import { isAuthenticated } from '../../middlewares/auth.js';

const router = express.Router();
const productController = new ProductController();

router.get('/products', isAuthenticated, async (req, res) => {
  await productController.getProductsPaginated(req, res);
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
  await productController.deleteProduct(req, res);
});

router.post('/products/delete/:pid', async (req, res) => {
  await productController.deleteProduct(req, res);
});


export default router;
