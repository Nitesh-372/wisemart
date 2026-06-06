import { BrainCircuit, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { api } from "../api.js";
import ProductCard from "../components/ProductCard.jsx";

export default function Recommendations() {
  const [products, setProducts] = useState([]);
  const [seed, setSeed] = useState("");
  const [similar, setSimilar] = useState([]);
  const [frequent, setFrequent] = useState([]);
  const [personalized, setPersonalized] = useState([]);

  useEffect(() => {
    api.get("/products?limit=30").then((res) => {
      setProducts(res.data);
      setSeed(res.data[0]?.product_name || "");
    });
    api.get("/recommend/personalized").then((res) => setPersonalized(res.data));
  }, []);

  useEffect(() => {
    if (!seed) return;
    api.post("/recommend/similar", { product_name: seed }).then((res) => setSimilar(res.data));
    api.post("/recommend/frequent", { product_name: seed }).then((res) => setFrequent(res.data));
  }, [seed]);

  return (
    <main className="page">
      <section className="dashboard-hero">
        <div>
          <span className="eyebrow"><BrainCircuit size={15} /> AI Recommendation Dashboard</span>
          <h1>Model-powered discovery, explained.</h1>
          <p>Choose a seed product and WiseMart will surface similar products, basket companions, and personalized picks.</p>
        </div>
        <select value={seed} onChange={(e) => setSeed(e.target.value)}>
          {products.map((product) => <option key={product.product_id}>{product.product_name}</option>)}
        </select>
      </section>

      <InsightSection title="Personalized recommendations" items={personalized} />
      <InsightSection title="Similar products" items={similar} />
      <InsightSection title="Frequently bought together" items={frequent} />
    </main>
  );
}

function InsightSection({ title, items }) {
  return (
    <section className="section flush">
      <div className="section-heading"><span className="eyebrow"><Sparkles size={14} /> WiseMart AI</span><h2>{title}</h2></div>
      <div className="insight-grid">
        {items.slice(0, 6).map((item) => (
          <div className="insight-card" key={item.product_id}>
            <ProductCard product={item} compact />
            <p>{item.explanation}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
