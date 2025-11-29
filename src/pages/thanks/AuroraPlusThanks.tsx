import TopBar from "@/pages/TopBar";
import Footer from "@/pages/Footer";
import "@/pages/home/HomePage.css";
import "@/pages/support/InvestPage.css";

export default function AuroraPlusThanks() {
  return (
    <div className="landing support-page home-v2">
      <TopBar />
      <header className="hp-hero">
        <div className="hp-shell" style={{ textAlign: "center" }}>
          <div className="hp-hero-copy" style={{ margin: "0 auto", maxWidth: 720 }}>
            <div className="hp-eyebrow">Aurora Plus</div>
            <h1 className="hp-title">Thank you for upgrading</h1>
            <p className="hp-subtitle">
              Your Aurora Plus plan is now active. A receipt has been emailed to you with the transaction details.
            </p>
          </div>
        </div>
      </header>

      <section className="hp-block hp-final">
        <div className="hp-shell support-form-shell">
          <div className="support-form-card" style={{ textAlign: "left" }}>
            <h2>What you get with Aurora Plus</h2>
            <ul className="hp-list" style={{ marginTop: "1.5rem" }}>
              <li>
                <strong>Always-on premium compute</strong> — Aurora’s fastest brain stays available even during traffic spikes.
              </li>
              <li>
                <strong>Multiple focused modes</strong> — pick dedicated helpers for writing, coding, research, or creativity.
              </li>
              <li>
                <strong>Custom persona mode</strong> — teach Aurora to speak like a mentor, friend, or colleague with in-depth profiles.
              </li>
              <li>
                <strong>Document understanding</strong> — upload TXT, PDF, and other formats for summaries, notes, or walkthroughs.
              </li>
              <li>
                <strong>Book-length summarizing</strong> — break down long manuscripts or study materials into clear chapters.
              </li>
              <li>
                <strong>Workspace writing space</strong> — collaborate with Aurora on outlines, drafts, or deep subject rehearsals.
              </li>
              <li>
                <strong>Early feature previews & dedicated email support</strong> — try upcoming experiments first and get priority help.
              </li>
            </ul>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
