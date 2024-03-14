import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';

const productSchema = new mongoose.Schema({
  title: String,
  description: String,
  code: String,
  price: Number,
  status: String,
  stock: Number,
  category: String,
  thumbnail: String,
  availability: Boolean,
  owner: {
    type: String,
    default: 'admin',
  }
}, { timestamps: true });

productSchema.plugin(mongoosePaginate);

const Product = mongoose.model('Product', productSchema);

export default Product;
