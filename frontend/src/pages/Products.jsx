import { SlidersHorizontal } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { api } from "../api.js";
import ProductCard from "../components/ProductCard.jsx";

export default function Products() {
  const { categoryId } = useParams();
  const [params, setParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [sort, setSort] = useState("rating");
  const q = params.get("q") || "";

  useEffect(() => {
    api.get("/categories").then((res) => setCategories(res.data));
  }, []);

  useEffect(() => {
    api.get("/products", { params: { category: categoryId, q } }).then((res) => setProducts(res.data));
  }, [categoryId, q]);

  const sorted = useMemo(() => {
    return [...products].sort((a, b) => {
      if (sort === "price-low") return a.price - b.price;
      if (sort === "price-high") return b.price - a.price;
      return b.rating - a.rating;
    });
  }, [products, sort]);

  return (
    <main className="page">
      <div className="catalog-head">
        <div>
          <span className="eyebrow">Catalog</span>
          <h1>{categoryId || (q ? `Search: ${q}` : "Explore WiseMart")}</h1>
        </div>
        <div className="filter-panel">
          <SlidersHorizontal size={18} />
          <input placeholder="Search catalog" value={q} onChange={(e) => setParams(e.target.value ? { q: e.target.value } : {})} />
          <select value={sort} onChange={(e) => setSort(e.target.value)}>
            <option value="rating">Top rated</option>
            <option value="price-low">Price low to high</option>
            <option value="price-high">Price high to low</option>
          </select>
        </div>
      </div>
      <div className="catalog-layout">
        <aside className="side-panel">
          <strong>Categories</strong>
          <a href="/products">All products</a>
          {categories.map((category) => <a href={`/category/${category.id}`} key={category.id}>{category.name}</a>)}
        </aside>
        <div className="product-grid">
          {sorted.map((product) => <ProductCard product={product} key={product.product_id} />)}
        </div>
      </div>
    </main>
  );
}
