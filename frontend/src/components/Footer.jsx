import { BrainCircuit } from "lucide-react";

export default function Footer() {
  return (
    <footer className="footer">
      <div>
        <div className="footer-brand"><BrainCircuit size={22} /> WiseMart</div>
        <p>AI-powered commerce demo built with Flask, React, SQLAlchemy, JWT, and preserved ML recommendation models.</p>
      </div>
      <div className="footer-grid">
        <span>Render ready</span>
        <span>Railway ready</span>
        <span>Vercel frontend</span>
        <span>SQLite auth</span>
      </div>
    </footer>
  );
}
