import { PAYMENT_METHODS } from '../data/master';

export default function PayLogo({ method, size = 34 }) {
  const m = PAYMENT_METHODS.find((x) => x.id === method);
  const text = { bkash: 'b', nagad: 'N', rocket: 'R', card: '💳', cash: '৳' }[method] || '৳';
  return <span className="pay-logo" style={{ background: m?.color ?? '#1f7a3a', width: size, height: size }} aria-hidden>{text}</span>;
}
