import { BrainCircuit } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  async function submit(e) {
    e.preventDefault();
    setError("");
    try {
      await login(form.email, form.password);
      navigate(location.state?.from || "/recommendations");
    } catch (err) {
      setError(err.response?.data?.error || "Login failed.");
    }
  }

  return <AuthShell title="Welcome back" subtitle="Login to unlock WiseMart AI recommendations.">
    <form className="auth-form" onSubmit={submit}>
      {error && <div className="error">{error}</div>}
      <label>Email<input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></label>
      <label>Password<input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /></label>
      <button className="primary-button full">Login</button>
      <p>New here? <Link to="/register">Create an account</Link></p>
    </form>
  </AuthShell>;
}

export function AuthShell({ title, subtitle, children }) {
  return (
    <main className="auth-page">
      <section className="auth-brand">
        <Link to="/" className="brand"><span className="brand-mark"><BrainCircuit size={22} /></span><span><strong>WiseMart</strong><small>Shop Smarter with AI</small></span></Link>
        <h1>{title}</h1>
        <p>{subtitle}</p>
      </section>
      <section className="auth-card">{children}</section>
    </main>
  );
}
