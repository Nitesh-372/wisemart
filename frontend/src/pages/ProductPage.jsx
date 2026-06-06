import { LockKeyhole, ShoppingCart, Sparkles, Star } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { api, imageUrl } from "../api.js";
import { useAuth } from "../context/AuthContext.jsx";
import { useCart } from "../context/CartContext.jsx";
import ProductCard from "../components/ProductCard.jsx";
import { money } from "../utils/format.js";

export default function ProductPage() {
  const { id } = useParams();
  const { isAuthenticated } = useAuth();
  const { addItem } = useCart();
  const [product, setProduct] = useState(null);
  const [similar, setSimilar] = useState([]);
  const [frequent, setFrequent] = useState([]);

  useEffect(() => {
    api.get(`/products/${id}`).then((res) => setProduct(res.data));
  }, [id]);

  useEffect(() => {
    if (!product || !isAuthenticated) return;
    api.post("/recommend/similar", { product_name: product.product_name }).then((res) => setSimilar(res.data));
    api.post("/recommend/frequent", { product_name: product.product_name }).then((res) => setFrequent(res.data));
  }, [product, isAuthenticated]);

  if (!product) return <main className="page narrow"><div className="glass-panel">Loading product...</div></main>;

  return (
    <main className="page">
      <section className="product-detail">
        <div className="detail-image"><img src={imageUrl(product.image)} alt={product.product_name} /></div>
        <div className="detail-copy">
          <span className="eyebrow">{product.category} / {product.brand}</span>
          <h1>{product.product_name}</h1>
          <div className="rating-line"><Star size={18} /> {product.rating} rating from {product.num_reviews} reviews</div>
          <p>{product.description}</p>
          <div className="tag-row">{(product.ai_tags || []).map((tag) => <span key={tag}>{tag}</span>)}</div>
          <div className="detail-price">{money(product.price)}</div>
          <button className="primary-button" onClick={() => addItem(product)}><ShoppingCart size={18} /> Add to cart</button>
        </div>
      </section>

      {!isAuthenticated && (
        <section className="locked-panel">
          <LockKeyhole size={22} />
          <div>
            <strong>Login to unlock AI recommendations</strong>
            <p>WiseMart protects recommendation dashboards so each user gets a personal shopping space.</p>
          </div>
          <Link className="secondary-button" to="/login">Login</Link>
        </section>
      )}

      {isAuthenticated && (
        <>
          <RecommendationStrip title="Similar AI matches" items={similar} />
          <RecommendationStrip title="Frequently bought together" items={frequent} />
        </>
      )}
    </main>
  );
}

function RecommendationStrip({ title, items }) {
  return (
    <section className="section flush">
      <div className="section-heading inline">
        <div><span className="eyebrow"><Sparkles size={14} /> Model insight</span><h2>{title}</h2></div>
      </div>
      {items.length === 0 ? <div className="glass-panel">No model results for this product yet.</div> : (
        <div className="product-grid">
          {items.slice(0, 4).map((item) => <ProductCard product={item} key={item.product_id} compact />)}
        </div>
      )}
    </section>
  );
}
