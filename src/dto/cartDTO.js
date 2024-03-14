export default class CartDTO {
  constructor(cart) {
    this._id = cart._id || '';
    this.products = cart.products.map(product => ({
      productId: product.productId._id,
      title: product.title,
      price: product.price,
      quantity: product.quantity
    }));
    this.totalPrice = cart.totalPrice;
  }
}
