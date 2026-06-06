import { Eye, Plus, Star } from "lucide-react";
import { Link } from "react-router-dom";
import { imageUrl } from "../api.js";
import { useCart } from "../context/CartContext.jsx";
import { money } from "../utils/format.js";

export default function ProductCard({ product, compact = false }) {
  const { addItem } = useCart();

  return (
    <article className={`product-card ${compact ? "compact" : ""}`}>
      <Link to={`/product/${product.product_id}`} className="product-image">
        <img src={imageUrl(product.image)} alt={product.product_name} loading="lazy" />
        <span className="score-badge"><Star size={13} /> {product.rating}</span>
      </Link>
      <div className="product-body">
        <div className="eyebrow">{product.brand}</div>
        <Link to={`/product/${product.product_id}`} className="product-name">{product.product_name}</Link>
        <p>{product.description}</p>
        <div className="tag-row">
          {(product.ai_tags || []).slice(0, 2).map((tag) => <span key={tag}>{tag}</span>)}
        </div>
        <div className="product-actions">
          <strong>{money(product.price)}</strong>
          <div>
            <Link className="icon-button soft" to={`/product/${product.product_id}`} title="View details"><Eye size={17} /></Link>
            <button className="icon-button" onClick={() => addItem(product)} title="Add to cart"><Plus size={18} /></button>
          </div>
        </div>
      </div>
    </article>
  );
}
