import Ticket from "../models/Ticket.js";

export const generateUniqueTicketCode = async () => {
    const characters = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

    while (true) {
        let ticketCode = "ONAM-";

        for (let i = 0; i < 6; i++) {
            ticketCode += characters.charAt(
                Math.floor(Math.random() * characters.length)
            );
        }

        const existingTicket = await Ticket.findOne({ ticketCode });

        if (!existingTicket) {
            return ticketCode;
        }
    }
};