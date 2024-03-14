import { Router } from 'express';
import { generateProducts } from '../../utils.js';
import ProductService from '../../services/productService.js';
import { logger } from '../../config/logger.js';

const router = Router();
const productService = new ProductService();

//Render products-cart
router.get('/products', (req, res) => {
  //res.render('products', { title: 'Productos', products: req.session.test.response, user: req.session.user });
});

router.get('/cart', (req, res) => {
  //res.render('cart', { title: 'Carrito' });
});

//Render login-register
router.get('/login', (req, res) => {
  res.render('login', { title: 'Login' });
});

router.get('/register', (req, res) => {
  res.render('register', { title: 'Register' });
});

//mocking
router.get('/mockingproducts', (req, res) => {
  const products = [];
  for (let i = 0; i < 50; i++) {
    products.push(generateProducts());
  }
  res.status(200).json(products);
});

router.get('/loggerTest', async (req, res) => {
  try {
    logger.debug('Este es un mensaje de depuración');
    logger.info('Esta es una información relevante');
    logger.warn('Este es un mensaje de advertencia');
    logger.error('Este es un mensaje de error');

    const products = await productService.findAll();
    logger.info('Productos encontrados:', products);

    res.status(200).json({ message: 'Logs testeados exitosamente' });
  } catch (error) {
    logger.error('Error al testear logs:', error);
    res.status(500).json({ message: 'Error al testear logs' });
  }
});

export default router;
