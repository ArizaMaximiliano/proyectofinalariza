import { productRepository } from '../repositories/index.js';
import ProductModel from '../dao/models/productModel.js';
import { logger } from '../config/logger.js';

export default class ProductService {
  constructor() {
  }

  async findAll(criteria = {}) {
    try {
      return await productRepository.getAll(criteria);
    } catch (error) {
      logger.error(error);
      throw new Error('Error al buscar productos');
    }
  }

  async findById(productId) {
    try {
      const product = await ProductModel.findById(productId);
      return product;
    } catch (error) {
      logger.error(error);
      throw error;
    }
  }

  async create(data) {
    try {
      return await productRepository.create(data);
    } catch (error) {
      logger.error(error);
      throw new Error('Error al crear producto');
    }
  }

  async updateById(id, data) {
    try {
      return await productRepository.updateById(id, data);
    } catch (error) {
      logger.error(error);
      throw new Error('Error al actualizar producto por ID');
    }
  }

  async deleteById(id) {
    try {
      return await productRepository.deleteById(id);
    } catch (error) {
      logger.error(error);
      throw new Error('Error al eliminar producto por ID');
    }
  }

  async getProductsPaginated(criteria = {}, options = { page: 1, limit: 10 }) {
    try {
      const paginatedResult = await ProductModel.paginate(criteria, options);
      //logger.debug('Resultado paginado:', paginatedResult);
      return paginatedResult;
    } catch (error) {
      logger.error(error);
      throw error;
    }
  }

  async updateStock(productId, newStock) {
    try {
      const product = await ProductModel.findById(productId);

      if (!product) {
        throw new Error('Producto no encontrado');
      }

      product.stock = newStock;
      await product.save();

      return product;
    } catch (error) {
      logger.error(error);
      throw new Error('Error al actualizar el stock del producto');
    }
  }
}
