import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext.jsx";
import { Summary } from "./CartPage.jsx";

export default function CheckoutPage() {
  const cart = useCart();

  if (cart.items.length === 0) {
    return <main className="page narrow"><div className="empty-state"><h1>No items to checkout.</h1><Link className="primary-button" to="/products">Shop now</Link></div></main>;
  }

  return (
    <main className="page">
      <div className="catalog-head"><div><span className="eyebrow">Checkout</span><h1>Delivery details</h1></div></div>
      <div className="checkout-layout">
        <section className="checkout-form glass-panel">
          <label>Full name<input placeholder="Enter recipient name" /></label>
          <label>Phone number<input placeholder="10-digit mobile number" /></label>
          <label>Address<textarea placeholder="House number, street, city, state, pincode" /></label>
          <div className="form-grid">
            <label>City<input placeholder="City" /></label>
            <label>Pincode<input placeholder="Pincode" /></label>
          </div>
        </section>
        <Summary {...cart} cta="/payment" label="Continue to payment" />
      </div>
    </main>
  );
}
