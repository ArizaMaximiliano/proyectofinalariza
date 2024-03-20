import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  email: {
    type: String,
    unique: true
  },
  age: Number,
  password: String,
  role: {
    type: String,
    enum: ['admin', 'usuario', 'premium'],
    default: 'usuario'
  },
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  cartID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Cart'
  },
  documents: [
    {
      name: String,
    }
  ],
  last_connection: Date

}, { timestamps: true });

export default mongoose.model('User', userSchema);