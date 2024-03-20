import ProductRepository from './productRepository.js';
import { ProductDao } from '../dao/productFactory.js';

import CartRepository from './cartRepository.js';
import { CartDao } from '../dao/cartFactory.js';  

export const productRepository = new ProductRepository(new ProductDao());
export const cartRepository = new CartRepository(new CartDao());