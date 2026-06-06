import { BrainCircuit, LogOut, Search, ShoppingBag, Sparkles, UserRound } from "lucide-react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { useCart } from "../context/CartContext.jsx";

export default function Header() {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { count } = useCart();

  function search(e) {
    e.preventDefault();
    navigate(`/products?q=${encodeURIComponent(query)}`);
  }

  return (
    <header className="site-header">
      <Link to="/" className="brand" aria-label="WiseMart home">
        <span className="brand-mark"><BrainCircuit size={22} /></span>
        <span><strong>WiseMart</strong><small>Shop Smarter with AI</small></span>
      </Link>

      <form className="search-bar" onSubmit={search}>
        <Search size={18} />
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search products, brands, categories" />
      </form>

      <nav className="nav-links">
        <NavLink to="/products">Shop</NavLink>
        <NavLink to="/recommendations"><Sparkles size={16} /> AI Picks</NavLink>
        <NavLink to="/cart" className="cart-pill"><ShoppingBag size={17} /> {count}</NavLink>
        {user ? (
          <>
            <NavLink to="/profile"><UserRound size={16} /> {user.name.split(" ")[0]}</NavLink>
            <button className="icon-button" onClick={logout} title="Logout"><LogOut size={18} /></button>
          </>
        ) : (
          <NavLink to="/login" className="nav-cta">Login</NavLink>
        )}
      </nav>
    </header>
  );
}
