import { Minus, Plus, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import { imageUrl } from "../api.js";
import { useCart } from "../context/CartContext.jsx";
import { money } from "../utils/format.js";

export default function CartPage() {
  const { items, updateQuantity, removeItem, subtotal, tax, shipping, total } = useCart();

  return (
    <main className="page">
      <div className="catalog-head"><div><span className="eyebrow">Cart</span><h1>Your smart basket</h1></div></div>
      {items.length === 0 ? (
        <div className="empty-state">
          <h2>Your cart is waiting.</h2>
          <p>Add products and WiseMart will keep totals, tax, and checkout ready.</p>
          <Link className="primary-button" to="/products">Browse products</Link>
        </div>
      ) : (
        <div className="cart-layout">
          <section className="cart-list">
            {items.map((item) => (
              <article className="cart-item" key={item.product_id}>
                <img src={imageUrl(item.image)} alt={item.product_name} />
                <div>
                  <strong>{item.product_name}</strong>
                  <span>{item.brand}</span>
                  <small>{money(item.price)}</small>
                </div>
                <div className="quantity-control">
                  <button onClick={() => updateQuantity(item.product_id, item.quantity - 1)}><Minus size={15} /></button>
                  <span>{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.product_id, item.quantity + 1)}><Plus size={15} /></button>
                </div>
                <button className="icon-button soft" onClick={() => removeItem(item.product_id)}><Trash2 size={18} /></button>
              </article>
            ))}
          </section>
          <Summary subtotal={subtotal} tax={tax} shipping={shipping} total={total} cta="/checkout" label="Checkout" />
        </div>
      )}
    </main>
  );
}

export function Summary({ subtotal, tax, shipping, total, cta, label }) {
  return (
    <aside className="summary-card">
      <h3>Order summary</h3>
      <div><span>Subtotal</span><strong>{money(subtotal)}</strong></div>
      <div><span>GST estimate</span><strong>{money(tax)}</strong></div>
      <div><span>Shipping</span><strong>{shipping ? money(shipping) : "Free"}</strong></div>
      <hr />
      <div className="summary-total"><span>Grand total</span><strong>{money(total)}</strong></div>
      {cta && <Link className="primary-button full" to={cta}>{label}</Link>}
    </aside>
  );
}
