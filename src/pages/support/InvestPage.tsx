import React from "react";
import TopBar from "@/pages/TopBar";
import Footer from "@/pages/Footer";
import "@/pages/home/HomePage.css";
import "./InvestPage.css";

export default function InvestPage() {
  return (
    <div className="landing support-page">
      <TopBar />

      <section className="support-hero contact-hero">
        <div className="page-shell">
          <h1>Invest in Human-First Intelligence</h1>
          <p>
            Aurora Lumen builds privacy-first, language-intelligent systems that serve classrooms, research, and everyday
            creators. Your investment accelerates the world’s transition to transparent, ethical AI—one that stays
            accessible while scaling responsibly.
          </p>
        </div>
      </section>

      <section className="support-body">
        <div className="page-shell">
          <h2>Where Your Investment Drives Impact</h2>

          <ul className="support-list">
            <li>
              ⚡ <strong>Infrastructure growth</strong> — Expands Aurora Light’s distributed compute network to meet
              enterprise-grade demand without user throttling.
            </li>
            <li>
              🛡️ <strong>Privacy innovation</strong> — Funds continuous security audits and compliance frameworks that
              differentiate Aurora in a data-hungry industry.
            </li>
            <li>
              🌍 <strong>Global access</strong> — Localizes models for 20+ languages, positioning Aurora as the ethical AI
              layer for emerging markets.
            </li>
          </ul>

          <div className="support-aftertext">
            <p>
              Each investment fuels both financial growth and social return: an open, scalable AI ecosystem built around
              trust—not surveillance.
            </p>
            <p>
              Interested in partnership or venture opportunities? Contact our team:{" "}
              <a href="mailto:invest@aurora-lumen.com">invest@aurora-lumen.com</a>
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
