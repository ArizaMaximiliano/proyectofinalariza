import CartService from '../services/cartService.js';
import ProductService from '../services/productService.js';
import TicketService from '../services/ticketService.js';

import { CustomError } from '../services/errors/customError.js';
import { generateCartError } from '../services/errors/causesMessageErrors.js';
import EnumsError from '../services/errors/enumErrors.js';
import { logger } from '../config/logger.js';

export default class CartController {
  constructor() {
    this.cartService = new CartService();
    this.productService = new ProductService();
    this.ticketService = new TicketService();
  }

  async createCart(req, res) {
    try {
      const newCart = await this.cartService.createCart();
      res.status(201).json(newCart);
    } catch (error) {
      logger.error(error);
      res.status(error.statusCode || 500).json({ message: error.message });
    }
  }

  async getCart(req, res) {
    try {
      const { params: { cid } } = req;
      const cart = await this.cartService.getCart(cid);
      res.render('cart', { cart, user: req.session.user });
    } catch (error) {
      logger.error(error);
      res.status(error.statusCode || 500).json({ message: error.message });
    }
  }

  async addProductToCart(req, res) {
    try {
      const { params: { cid, pid } } = req;
      const { quantity } = req.body;

      if (!cid || !pid || !quantity) {
        CustomError.createError({
          name: 'Error al agregar producto al carrito',
          cause: 'Faltan parametros requeridos para agregar el producto al carrito',
          message: 'Faltan parametros requeridos para agregar el producto al carrito',
          code: EnumsError.BAD_REQUEST_ERROR,
        });
      }

      const product = await this.productService.findById(pid);
      if (!product) {
        CustomError.createError({
          name: 'Error al agregar producto al carrito',
          cause: generateCartError(pid),
          message: 'El producto no existe',
          code: EnumsError.BAD_REQUEST_ERROR,
        });
      }

      if ( product.owner === req.session.user._id) {
        CustomError.createError({
          name: 'Error al agregar producto al carrito',
          cause: 'El usuario no puede agregar su propio producto al carrito',
          message: 'No se puede agregar el producto al carrito',
          code: EnumsError.FORBIDDEN_ERROR,
        });
      }

      await this.cartService.addProductToCart(cid, pid, quantity);
      res.status(200).send('Producto agregado al carrito correctamente');
    } catch (error) {
      logger.error(error);
      res.status(error.statusCode || 500).json({ message: error.message });
    }
  }


  async updateCart(req, res) {
    try {
      const { params: { cid }, body } = req;
      await this.cartService.updateCart(cid, body);
      res.status(204).end();
    } catch (error) {
      logger.error(error);
      res.status(error.statusCode || 500).json({ message: error.message });
    }
  }

  async updateProductInCart(req, res) {
    try {
      const { params: { cid, pid }, body } = req;
      const { quantity } = body;

      if (quantity <= 0) {
        throw { statusCode: 400, message: 'La cantidad debe ser un numero entero positivo' };
      }

      await this.cartService.updateProductInCart(cid, pid, quantity);
      res.status(204).end();
    } catch (error) {
      logger.error(error);
      res.status(error.statusCode || 500).json({ message: error.message });
    }
  }

  async deleteProductFromCart(req, res) {
    try {
      const { params: { cid, pid } } = req;
      await this.cartService.deleteProductFromCart(cid, pid);
      res.status(204).end();
    } catch (error) {
      logger.error(error);
      res.status(error.statusCode || 500).json({ message: error.message });
    }
  }

  async deleteCart(req, res) {
    try {
      const { params: { cid } } = req;
      await this.cartService.deleteCart(cid);
      res.status(204).end();
    } catch (error) {
      logger.error(error);
      res.status(error.statusCode || 500).json({ message: error.message });
    }
  }

  async purchaseCart(req, res) {
    try {
      const { params: { cid } } = req;
      const result = await this.cartService.purchaseCart(cid, req.session.user);

      res.status(200).json(result);
    } catch (error) {
      logger.error(error);
      res.status(500).json({ message: 'Error al procesar la compra del carrito' });
    }
  }
}
