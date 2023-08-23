type CheckinCheckout = {
  checkin: Date | null;
  checkout: Date | null;
  price: Decimal | 0;
};
type GuestFromChat = {
  name: string;
  document: string;
};
type Car = {
  plate: string;
  car: boolean;
};
export { CheckinCheckout, GuestFromChat, Car };
