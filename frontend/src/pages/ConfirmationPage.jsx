import { CheckCircle2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext.jsx";

export default function ConfirmationPage() {
  const { clearCart } = useCart();

  return (
    <main className="page narrow">
      <section className="confirmation">
        <CheckCircle2 size={56} />
        <h1>Payments are currently disabled while WiseMart completes payment integration.</h1>
        <p>No money has been charged.</p>
        <p>Thank you for exploring WiseMart.</p>
        <Link className="primary-button" to="/" onClick={clearCart}>Return home</Link>
      </section>
    </main>
  );
}
