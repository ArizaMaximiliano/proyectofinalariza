import ProductService from '../services/productService.js';

import { CustomError } from '../services/errors/customError.js';
import { generateProductError } from '../services/errors/causesMessageErrors.js';
import EnumsError from '../services/errors/enumErrors.js';

import { logger } from '../config/logger.js';
import { isAdmin, isPremium, isUser } from '../middlewares/auth.js';

export default class ProductController {
  constructor() {
    this.productService = new ProductService();
  }

  async findAll(req, res) {
    try {
      const { category, availability, sort, query } = req.query;
      const result = await this.productService.findAll({ category, availability, sort, query });

      res.render('products', { title: 'Productos', products: result, user: req.session.user });
    } catch (error) {
      logger.error(error);
      res.status(500).json({ status: 'error', message: 'Error interno del servidor' });
    }
  }

  async getProductsPaginated(req, res) {
    try {
      const { page = 1, limit = 5, category, availability, sort, query } = req.query;
      const criteria = {};

      if (query) {
        criteria.$text = { $search: query };
      } else {
        if (category) {
          criteria.category = category;
        }
        if (availability !== undefined) {
          criteria.availability = availability;
        }
      }

      const options = { page, limit, sort: { price: sort === 'desc' ? -1 : 1 } };
      const result = await this.productService.getProductsPaginated(criteria, options);

      const response = this.buildResponse(result, req);
      res.render('products', {
        title: 'Productos',
        products: response,
        user: req.session.user,
        isAdmin: req.session.user.role === 'admin',
        isPremium: req.session.user.role === 'premium' || req.session.user.role === 'admin',
        isUser: req.session.user.role === 'usuario' || req.session.user.role === 'premium',
      });

    } catch (error) {
      logger.error(error);
      res.status(500).json({ status: 'error', message: 'Error interno del servidor' });
    }
  }

  buildResponse(data, req) {
    return {
      status: 'success',
      payload: data.docs.map(product => product.toJSON()),
      totalPages: data.totalPages,
      prevPage: data.prevPage,
      nextPage: data.nextPage,
      page: data.page,
      hasPrevPage: data.hasPrevPage,
      hasNextPage: data.hasNextPage,
      prevLink: data.hasPrevPage
        ? this.buildPaginationLink(req, data.prevPage)
        : null,
      nextLink: data.hasNextPage
        ? this.buildPaginationLink(req, data.nextPage)
        : null,
    };
  }

  buildPaginationLink(req, page) {
    const { limit = 5, category, availability, sort } = req.query;
    const baseUrl = 'http://localhost:8080/api/products';
    const params = new URLSearchParams({
      limit,
      page,
      ...(category && { category }),
      ...(availability !== undefined && { availability }),
      ...(sort && { sort }),
    });
    return `${baseUrl}?${params.toString()}`;
  }


  async findById(req, res) {
    try {
      const { params: { pid } } = req;
      const product = await this.productService.findById(pid);
      res.status(200).json(product);
    } catch (error) {
      logger.error(error);
      res.status(error.statusCode || 500).json({ message: error.message });
    }
  }

  async create(req, res) {
    try {
      const { body } = req;
      if (!body.title || !body.description || !body.price || !body.code || !body.stock) {
        throw CustomError.createError({
          name: 'Error creando el producto',
          cause: generateProductError(body),
          message: 'Ocurrio un error mientras se creaba un producto',
          code: EnumsError.BAD_REQUEST_ERROR,
        });
      }

      if (isAdmin(req) || isPremium(req)) {
        if (!body.owner) {
          body.owner = isAdmin(req) ? 'admin' : req.session.user._id;
        }

        const addedProduct = await this.productService.create(body);
        res.status(201).json({ message: 'Producto agregado correctamente', product: addedProduct });
      } else {
        res.status(403).json({ message: 'No tienes permisos para realizar esta accion' });
      }
    } catch (error) {
      logger.error(error);
      res.status(error.statusCode || 500).json({ message: error.message });
    }
  }

  async updateById(req, res) {
    try {
      const { params: { pid }, body } = req;
      await this.productService.updateById(pid, body);
      res.status(204).end();
    } catch (error) {
      logger.error(error);
      res.status(error.statusCode || 500).json({ message: error.message });
    }
  }

  async deleteById(req, res) {
    try {
      const { params: { pid } } = req;

      const product = await this.productService.findById(pid);
      if (!product) {
        CustomError.createError({
          name: 'Error al eliminar producto',
          cause: generateProductError(pid),
          message: 'El producto no existe',
          code: EnumsError.NOT_FOUND_ERROR,
        });
      }
  
      if (isPremium(req) && product.owner !== req.session.user._id) {
        CustomError.createError({
          name: 'Error al eliminar producto',
          cause: 'No tienes permisos para eliminar este producto',
          message: 'No tienes permisos para eliminar este producto',
          code: EnumsError.FORBIDDEN_ERROR,
        });
      }
      
      await this.productService.deleteById(pid);
      logger.info("Producto eliminado");
      res.status(204).end();
    } catch (error) {
      logger.error(error);
      res.status(error.statusCode || 500).json({ message: error.message });
    }
  }
}
