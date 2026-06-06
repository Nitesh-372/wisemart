import { LogOut, Sparkles, UserRound } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api.js";
import { useAuth } from "../context/AuthContext.jsx";
import ProductCard from "../components/ProductCard.jsx";

export default function Profile() {
  const { user, logout } = useAuth();
  const [summary, setSummary] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    api.get("/profile/summary").then((res) => setSummary(res.data));
  }, []);

  function endSession() {
    logout();
    navigate("/");
  }

  return (
    <main className="page">
      <section className="profile-hero glass-panel">
        <div className="avatar"><UserRound size={34} /></div>
        <div><span className="eyebrow">Profile</span><h1>{user.name}</h1><p>{user.email}</p></div>
        <button className="secondary-button" onClick={endSession}><LogOut size={17} /> Logout</button>
      </section>
      <div className="profile-grid">
        <section className="glass-panel">
          <h2>Order history</h2>
          <p>No orders yet. Payment confirmation is disabled until WiseMart completes payment integration.</p>
        </section>
        <section className="glass-panel">
          <h2>AI insights</h2>
          {(summary?.insights || []).map((item) => <p key={item}><Sparkles size={14} /> {item}</p>)}
        </section>
      </div>
      <section className="section flush">
        <div className="section-heading"><span className="eyebrow">Saved recommendations</span><h2>Your AI shelf</h2></div>
        <div className="product-grid">{(summary?.saved_recommendations || []).map((p) => <ProductCard product={p} key={p.product_id} compact />)}</div>
      </section>
    </main>
  );
}
