import CartDTO from '../dto/cartDTO.js';

export default class CartRepository {
  constructor(dao) {
    this.dao = dao;
  }

  async getById(cid) {
    const cart = await this.dao.getById(cid);
    return new CartDTO(cart);
  }

  async create() {
    const newCart = await this.dao.create({});
    return new CartDTO(newCart);
  }

  async addProduct(cid, data) {
    const updatedCart = await this.dao.addProduct(cid, data);
    return new CartDTO(updatedCart);
  }

  async updateById(cid, data) {
    const updatedCart = await this.dao.updateById(cid, data);
    return new CartDTO(updatedCart);
  }

  async updateProductQuantity(cid, pid, quantity) {
    const updatedCart = await this.dao.updateProductQuantity(cid, pid, quantity);
    return new CartDTO(updatedCart);
  }

  async removeProduct(cid, pid) {
    const updatedCart = await this.dao.removeProduct(cid, pid);
    return new CartDTO(updatedCart);
  }

  async deleteById(cid) {
    const deletedCart = await this.dao.deleteById(cid);
    return new CartDTO(deletedCart);
  }
}
