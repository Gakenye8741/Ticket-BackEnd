import { sendTicket } from "./sendTicket";

(async () => {
  const result = await sendTicket({
    email: "codingguru8741@gmail.com",
    firstName: "Test",
    lastName: "User",
    nationalId: 123456783,
    eventName: "Color Fest",
    ticketType: "VIP",
    quantity: 2,
    price: 100,
    total: 200,
    paymentStatus: "Completed",
    bookingDate: new Date(),
  });

  console.log(result);
})();
