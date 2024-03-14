import express from 'express';
import CartController from '../../controller/cartController.js';
import { isAuthenticated, isUser } from '../../middlewares/auth.js'; 

const router = express.Router();
const cartController = new CartController(); 

router.post('/carts', isAuthenticated, isUser, async (req, res) => {
  await cartController.createCart(req, res);
});

router.get('/carts/:cid', isAuthenticated, async (req, res) => {
  await cartController.getCart(req, res);
});

router.post('/carts/:cid/products/:pid', async (req, res) => {
  await cartController.addProductToCart(req, res);
});

router.put('/carts/:cid', async (req, res) => {
  await cartController.updateCart(req, res);
});

router.put('/carts/:cid/products/:pid', async (req, res) => {
  await cartController.updateProductInCart(req, res);
});

router.delete('/carts/:cid/products/:pid', async (req, res) => {
  await cartController.deleteProductFromCart(req, res);
});

router.delete('/carts/:cid', async (req, res) => {
  await cartController.deleteCart(req, res);
});

router.post('/carts/:cid/purchase', async (req, res) => {
  await cartController.purchaseCart(req, res);
});

export default router;
