import ProductService from '../services/productService.js';

import { CustomError } from '../services/errors/customError.js';
import { generateProductError } from '../services/errors/causesMessageErrors.js';
import EnumsError from '../services/errors/enumErrors.js';

import { logger } from '../config/logger.js';
import userModel from '../dao/models/userModel.js';
import MailService from '../services/mailService.js';

export default class ProductController {
  constructor() {
    this.productService = new ProductService();
    this.mailService = new MailService();
    
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

      const response = result;

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

      if (req.user.role == 'admin' || req.user.role == 'premium') {
        if (!body.owner) {
          body.owner = (req.user.role == 'admin') ? 'admin' : req.session.user._id;
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

  async deleteProduct(req, res) {
    try {
      const product = await this.productService.findById(req.params.pid);
  
      if (!product) {
        CustomError.createError({
          name: 'Error al eliminar producto',
          cause: generateProductError(pid),
          message: 'El producto no existe',
          code: EnumsError.NOT_FOUND_ERROR,
        });
      }
  
      if(req.user.role !== 'admin'){
        const owner = await userModel.findById(product.owner);
  
        if (!owner) {
          CustomError.createError({
            name: 'Error al eliminar producto',
            cause: 'No se encontro al propietario',
            message: 'No se encontro al propietario',
            code: EnumsError.FORBIDDEN_ERROR,
          });
        }
    
        if (owner.role === 'premium') {
          await this.mailService.sendProductDeletedEmail(owner.email, product.title);
        }
      }
  
      await this.productService.deleteById(product._id);
      
      logger.info("Producto eliminado");
      res.status(204).end();
    } catch (error) {
      console.error('Error al eliminar producto:', error);
      res.status(500).json({ message: 'Error interno del servidor' });
    }
  }
  
}