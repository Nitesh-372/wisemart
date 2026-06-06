import { CreditCard, Landmark, Smartphone } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext.jsx";
import { Summary } from "./CartPage.jsx";

export default function PaymentPage() {
  const [method, setMethod] = useState("UPI");
  const cart = useCart();
  const navigate = useNavigate();

  function payNow() {
    navigate("/confirmation");
  }

  return (
    <main className="page">
      <div className="catalog-head"><div><span className="eyebrow">Payment</span><h1>Choose payment method</h1></div></div>
      <div className="checkout-layout">
        <section className="payment-panel glass-panel">
          {[
            ["UPI", Smartphone, "Pay using UPI ID or QR-ready flow."],
            ["Card", CreditCard, "Credit and debit card interface."],
            ["Net Banking", Landmark, "Select bank and continue securely."],
          ].map(([name, Icon, text]) => (
            <button className={method === name ? "payment-option active" : "payment-option"} onClick={() => setMethod(name)} key={name}>
              <Icon size={22} />
              <span><strong>{name}</strong><small>{text}</small></span>
            </button>
          ))}
          <div className="mock-payment">
            {method === "UPI" && <input placeholder="name@upi" />}
            {method === "Card" && <><input placeholder="Card number" /><div className="form-grid"><input placeholder="MM/YY" /><input placeholder="CVV" /></div></>}
            {method === "Net Banking" && <select><option>Choose your bank</option><option>HDFC Bank</option><option>SBI</option><option>ICICI Bank</option></select>}
          </div>
          <button className="primary-button full" onClick={payNow}>Pay now</button>
        </section>
        <Summary {...cart} />
      </div>
    </main>
  );
}
