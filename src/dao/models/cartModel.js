import mongoose from 'mongoose';

const CartSchema = new mongoose.Schema({
  products: [{
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    title: String,
    price: Number,
    quantity: {
      type: Number,
      default: 1
    },
  }],
  totalPrice: Number
});

const Cart = mongoose.model('Cart', CartSchema);

export default Cart;
