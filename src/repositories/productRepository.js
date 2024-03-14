import ProductDTO from '../dto/productDTO.js';

export default class ProductRepository {
  constructor(dao) {
    this.dao = dao;
  }

  async getAll(criteria = {}) {
    const products = await this.dao.getAll(criteria);
    const productDTOs = products.map(product => new ProductDTO(product));
    return productDTOs;
  }

  async getById(id) {
    const product = await this.dao.getById(id);
    return new ProductDTO(product);
  }

  async create(data) {
    const newProduct = await this.dao.create(data);
    return new ProductDTO(newProduct);
  }

  async updateById(id, data) {
    const updatedProduct = await this.dao.updateById(id, data);
    return new ProductDTO(updatedProduct);
  }

  async deleteById(id) {
    const deletedProduct = await this.dao.deleteById(id);
    return new ProductDTO(deletedProduct);
  }
}
