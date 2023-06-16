type CheckinCheckout = {
  checkin: Date | null;
  checkout: Date | null;
  price: Decimal | 0;
};
type GuestFromChat = {
  name: string;
  document: string;
};

export { CheckinCheckout, GuestFromChat };
