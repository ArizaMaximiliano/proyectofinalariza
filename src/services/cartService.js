import { cartRepository } from '../repositories/index.js';
import ProductService from '../services/productService.js';
import TicketService from '../services/ticketService.js';
import { logger } from '../config/logger.js';

export default class CartService {
  constructor() {
    this.productService = new ProductService();
    this.ticketService = new TicketService();
  }

  async createCart() {
    try {
      return await cartRepository.create();
    } catch (error) {
      logger.error(error);
      throw new Error('Error al crear carrito');
    }
  }

  async getCart(cid) {
    try {
      return await cartRepository.getById(cid);
    } catch (error) {
      logger.error(error);
      throw new Error('Error al obtener carrito por ID');
    }
  }

  async addProductToCart(cid, pid, quantity) {
    try {
      const cart = await cartRepository.getById(cid);

      const existingProduct = cart.products.find(product => String(product.productId) === String(pid));
      if (existingProduct) {
        existingProduct.quantity += 1;
      } else {
        const product = await this.productService.findById(pid);
        cart.products.push({
          productId: pid,
          title: product.title,
          price: product.price,
          quantity: quantity
        });
      }

      cart.totalPrice = cart.products.reduce((total, product) => total + (product.price * product.quantity), 0);

      await cartRepository.updateById(cid, cart);

      logger.debug('Producto agregado al carrito:', cart);
      return cart;
    } catch (error) {
      logger.error(error);
      throw new Error('Error al agregar producto al carrito');
    }
  }

  async updateCart(cid, data) {
    try {
      return await cartRepository.updateById(cid, data);
    } catch (error) {
      logger.error(error);
      throw new Error('Error al actualizar carrito por ID');
    }
  }

  async updateProductInCart(cid, pid, quantity) {
    try {
      const updatedCart = await cartRepository.updateProductQuantity(cid, pid, quantity);

      updatedCart.totalPrice = updatedCart.products.reduce((total, product) => total + (product.price * product.quantity), 0);

      await cartRepository.updateById(cid, updatedCart);
      
      logger.debug('Producto actualizado en el carrito:', updatedCart);
      return updatedCart;
    } catch (error) {
      logger.error(error);
      throw new Error('Error al actualizar la cantidad del producto en el carrito');
    }
  }

  async deleteProductFromCart(cid, pid) {
    try {
      const updatedCart = await cartRepository.removeProduct(cid, pid);

      updatedCart.totalPrice = updatedCart.products.reduce((total, product) => total + (product.price * product.quantity), 0);

      await cartRepository.updateById(cid, updatedCart);

      logger.debug('Producto eliminado del carrito:', updatedCart);
      return updatedCart;
    } catch (error) {
      logger.error(error);
      throw new Error('Error al eliminar producto del carrito');
    }
  }

  async deleteCart(cid) {
    try {
      return await cartRepository.deleteById(cid);
    } catch (error) {
      logger.error(error);
      throw new Error('Error al eliminar carrito por ID');
    }
  }

  async purchaseCart(cid, user) {
    try {
      const cart = await cartRepository.getById(cid);

      const succesfulPurchases = [];
      const failedPurchases = [];

      for (const product of cart.products) {
        try {
          const { productId, quantity } = product;
          const productInfo = await this.productService.findById(productId);

          if (productInfo && productInfo.stock >= quantity) {
            succesfulPurchases.push(product);
          } else {
            failedPurchases.push(product.productId);
          }
        } catch (error) {
          logger.error(error);
          failedPurchases.push(product.productId);
        }
      }

      //monto total
      const totalAmount = succesfulPurchases.reduce((total, product) => total + product.price, 0);
      //ticket
      const ticket = await this.ticketService.generateTicket(cid, totalAmount, user.email);
      //actualiza el stock
      for (const product of succesfulPurchases) {
        const productInfo = await this.productService.findById(product.productId);
        await this.productService.updateStock(product.productId, productInfo.stock - product.quantity);

        cart.products = cart.products.filter(p => p.productId !== product.productId);
      }
      //monto total, productos restantes
      const remainingTotalPrice = cart.products.reduce((total, product) => total + (product.price * product.quantity), 0);
      await cartRepository.updateById(cid, { products: cart.products, totalPrice: remainingTotalPrice });

      //resultado
      if (failedPurchases.length > 0) {
        return { message: 'Compra realizada parcialmente', failedPurchases, ticket };
      } else {
        return { message: 'Compra realizada exitosamente', ticket };
      }
    } catch (error) {
      logger.error(error);
      throw new Error('Error al procesar la compra del carrito');
    }
  }

}
