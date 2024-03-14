import mongoose, { Schema } from 'mongoose';

const ticketSchema = new Schema({
    code: {
        type: String,
        default: () => Date.now().toString(20),
    },
    amount: {
        type: Number,
        required: true,
    },
    purchaser: {
        type: String,
        required: true,
    },
}, { timestamps: true });

const TicketModel = mongoose.model('Ticket', ticketSchema);

export default TicketModel;
