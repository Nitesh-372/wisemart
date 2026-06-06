import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { AuthShell } from "./Login.jsx";

export default function Register() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const { register } = useAuth();
  const navigate = useNavigate();

  async function submit(e) {
    e.preventDefault();
    setError("");
    try {
      await register(form.name, form.email, form.password);
      navigate("/recommendations");
    } catch (err) {
      setError(err.response?.data?.error || "Registration failed.");
    }
  }

  return <AuthShell title="Create your WiseMart account" subtitle="Store your profile and access AI-powered recommendation experiences.">
    <form className="auth-form" onSubmit={submit}>
      {error && <div className="error">{error}</div>}
      <label>Name<input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></label>
      <label>Email<input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></label>
      <label>Password<input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /></label>
      <button className="primary-button full">Register</button>
      <p>Already have an account? <Link to="/login">Login</Link></p>
    </form>
  </AuthShell>;
}
