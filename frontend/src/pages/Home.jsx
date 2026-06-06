import { ArrowRight, BadgeCheck, ShieldCheck, Sparkles, BrainCircuit } from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { api } from "../api.js";
import ProductCard from "../components/ProductCard.jsx";

export default function Home() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    api.get("/products?limit=8").then((res) => setProducts(res.data));
    api.get("/categories").then((res) => setCategories(res.data));
  }, []);

  return (
    <main>
      {/* HERO */}
      <section className="hero">
        <div className="hero-copy centered">
          <span className="hero-kicker">
            <Sparkles size={16} />
            AI-Powered Shopping Experience
          </span>

          <h1>WiseMart</h1>

          <p className="hero-subtitle">
            Discover smarter shopping with AI-powered recommendations,
            intelligent product discovery, personalized suggestions, and a
            seamless modern shopping experience.
          </p>

          <div className="hero-actions">
            <Link className="primary-button" to="/products">
              Start Shopping <ArrowRight size={18} />
            </Link>

            <Link className="secondary-button" to="/recommendations">
              Explore AI Recommendations
            </Link>
          </div>

          <div className="hero-metrics">
            <span>
              <strong>300+</strong>
              <small>Products</small>
            </span>

            <span>
              <strong>2</strong>
              <small>AI Models</small>
            </span>

            <span>
              <strong>100%</strong>
              <small>Personalized</small>
            </span>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="section">
        <div className="section-heading">
          <span className="eyebrow">Why WiseMart</span>
          <h2>Designed for intelligent shopping.</h2>
        </div>

        <div className="feature-grid">
          {[
            [
              "AI Recommendations",
              "Get smart product suggestions based on shopping behavior and machine learning insights.",
              BrainCircuit,
            ],
            [
              "Premium Shopping Experience",
              "Modern design, responsive layouts, and a smooth user experience across all devices.",
              BadgeCheck,
            ],
            [
              "Secure Authentication",
              "Protected accounts, secure login, and reliable user management.",
              ShieldCheck,
            ],
          ].map(([title, text, Icon]) => (
            <article className="feature-card" key={title}>
              <Icon size={24} />
              <h3>{title}</h3>
              <p>{text}</p>
            </article>
          ))}
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="section">
        <div className="section-heading inline">
          <div>
            <span className="eyebrow">Departments</span>
            <h2>Shop by Category</h2>
          </div>

          <Link to="/products">View All</Link>
        </div>

        <div className="category-grid">
          {categories.map((category) => (
            <Link
              className="category-card"
              to={`/category/${category.id}`}
              key={category.id}
            >
              <span>{category.name}</span>
              <strong>{category.count} Products</strong>
              <small>{category.average_rating} Average Rating</small>
            </Link>
          ))}
        </div>
      </section>

      {/* PRODUCTS */}
      <section className="section">
        <div className="section-heading inline">
          <div>
            <span className="eyebrow">Trending Products</span>
            <h2>Top Rated Products</h2>
          </div>

          <Link to="/products">Browse Catalog</Link>
        </div>

        <div className="product-grid">
          {products.map((product) => (
            <ProductCard
              product={product}
              key={product.product_id}
            />
          ))}
        </div>
      </section>

      {/* STATS */}
      <section className="stats-band">
        <div>
          <strong>500+</strong>
          <span>Happy Users</span>
        </div>

        <div>
          <strong>300+</strong>
          <span>Products Available</span>
        </div>

        <div>
          <strong>24/7</strong>
          <span>AI Recommendations</span>
        </div>

        <div>
          <strong>100%</strong>
          <span>Smart Shopping</span>
        </div>
      </section>

      {/* INFO CARDS */}
      <section className="section testimonials">
        <article>
          <h3>Smart Recommendations</h3>
          <p>
            Discover products tailored to your interests using advanced machine
            learning algorithms.
          </p>
        </article>

        <article>
          <h3>Seamless Shopping</h3>
          <p>
            Browse, add to cart, and checkout through a fast and intuitive user
            experience.
          </p>
        </article>

        <article>
          <h3>Secure Platform</h3>
          <p>
            Built with secure authentication and modern web technologies for a
            reliable shopping environment.
          </p>
        </article>
      </section>
    </main>
  );
}