import CartModel from './models/cartModel.js';

export default class CartDAO {
  getById(cid) {
    return CartModel.findById(cid).populate('products.productId');
  }

  create(data) {
    return CartModel.create(data);
  }

  addProduct(cid, data) {
    const criteria = { _id: cid };
    const operation = { $push: { products: data } };
    return CartModel.findOneAndUpdate(criteria, operation, { new: true }).populate('products.productId');
  }

  updateById(cid, data) {
    const criteria = { _id: cid };
    const operation = { $set: data };
    return CartModel.findOneAndUpdate(criteria, operation, { new: true }).populate('products.productId');
  }

  updateProductQuantity(cid, pid, quantity) {
    const criteria = { _id: cid, 'products.productId': pid };
    const operation = { $set: { 'products.$.quantity': quantity } };
    return CartModel.findOneAndUpdate(criteria, operation, { new: true }).populate('products.productId');
  }

  removeProduct(cid, pid) {
    const criteria = { _id: cid };
    const operation = { $pull: { products: { productId: pid } } };
    return CartModel.findOneAndUpdate(criteria, operation, { new: true }).populate('products.productId');
  }

  deleteById(cid) {
    return CartModel.findByIdAndDelete(cid);
  }
}
