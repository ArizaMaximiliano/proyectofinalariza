import Ticket from '../dao/models/ticketModel.js';

export default class TicketService {
  async generateTicket(code, amount, purchaser) {
    const ticket = new Ticket({
      code,
      amount,
      purchaser,
    });
    return await ticket.save();
  }
}
