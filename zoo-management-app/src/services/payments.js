// Payment gateway layer (SIMULATED).
//
// Real integration must run on the backend — gateway secrets can never live in a browser app:
//   1. Frontend calls POST /api/payments/ { ticket_id, method }.
//   2. Backend creates the payment with bKash Tokenized Checkout / Nagad / SSLCommerz (cards, Rocket)
//      and returns the gateway's redirect URL.
//   3. The visitor pays on the gateway's page; the gateway calls the backend callback / IPN,
//      the backend verifies the transaction and marks the ticket paid.
//   4. The gateway redirects back to /ticket/:id, which reloads the ticket status.
// This module mimics those steps so the full flow can be designed and tested now.
import { delay } from './db';
import { updateTicket } from './tickets';
import { now } from '../lib/clock';

export const DEMO_OTP = '123456';
export const DEMO_PIN = '12345';

export async function startPayment(ticket, method) {
  await delay(500);
  updateTicket(ticket.id, { payment: { method, status: 'pending', trxId: '', startedAt: now().toISOString() } });
  return { paymentId: 'PAY' + Date.now().toString(36).toUpperCase(), amount: ticket.amount, method };
}

export async function sendOtp(walletNumber) {
  await delay(700);
  if (!/^01[3-9]\d{8}$/.test(walletNumber)) throw new Error('Enter a valid 11-digit mobile wallet number.');
  return { sentTo: walletNumber.replace(/^(\d{3})\d{5}/, '$1*****') };
}

export async function confirmWallet(ticket, method, { otp, pin }) {
  await delay(900);
  if (otp !== DEMO_OTP) throw new Error('Wrong verification code.');
  if (pin !== DEMO_PIN) throw new Error('Wrong PIN.');
  return markPaid(ticket, method);
}

export async function payByCard(ticket, { number, expiry, cvc, name }) {
  await delay(1200);
  const digits = number.replace(/\s/g, '');
  if (!/^\d{15,16}$/.test(digits)) throw new Error('Card number is not valid.');
  if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(expiry)) throw new Error('Expiry must be MM/YY.');
  if (!/^\d{3,4}$/.test(cvc)) throw new Error('CVC is not valid.');
  if (!name.trim()) throw new Error('Enter the name on the card.');
  if (digits.endsWith('0002')) throw new Error('Card declined by the bank. Try another card.');
  return markPaid(ticket, 'card', `**** ${digits.slice(-4)}`);
}

export function cancelPayment(ticket) {
  updateTicket(ticket.id, { payment: { ...ticket.payment, status: 'failed' } });
}

function markPaid(ticket, method, card) {
  const trxId = (method === 'card' ? 'SSL' : method.slice(0, 2).toUpperCase()) + Date.now().toString(36).toUpperCase();
  return updateTicket(ticket.id, { payment: { method, status: 'paid', trxId, paidAt: now().toISOString(), card } });
}
