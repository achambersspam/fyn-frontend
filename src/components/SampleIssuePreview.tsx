// A faithful sample of a real issue: the same banner header, section cards, price table,
// weather tables, bold subtopic labels and navy footer the real email and in-app reader use
// (see the-final-fyn-backend/lib/rendering). The text and numbers are from a real issue
// generated on October 14 2026 for the picks listed below. The card is always light because
// real emails are light, whatever theme the visitor uses.

const FONT = "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif";

const card: React.CSSProperties = {
  background: "#ffffff",
  border: "1px solid #e6ebf4",
  borderRadius: 14,
  padding: "20px 22px",
  margin: "0 0 14px 0",
};

const h2: React.CSSProperties = {
  fontSize: 18,
  fontWeight: 700,
  lineHeight: 1.3,
  letterSpacing: "-0.01em",
  margin: "0 0 6px 0",
  color: "#0f172a",
};

const accent: React.CSSProperties = { width: 36, height: 3, background: "#1CB0F6", borderRadius: 2, margin: "0 0 14px 0" };
const body: React.CSSProperties = { fontSize: 14.5, lineHeight: 1.65, color: "#334155", margin: 0 };
const label: React.CSSProperties = { fontSize: 14.5, fontWeight: 700, color: "#0f172a", margin: "14px 0 3px 0" };
const th: React.CSSProperties = { padding: "8px 8px", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em", color: "#6b7280", textAlign: "left", borderBottom: "1px solid #e5e7eb" };
const td: React.CSSProperties = { padding: "9px 8px", fontSize: 14, color: "#111827" };

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section style={card}>
      <h2 style={h2}>{title}</h2>
      <div style={accent} />
      {children}
    </section>
  );
}

function Pill({ value }: { value: string }) {
  const up = value.startsWith("+");
  return (
    <span
      style={{
        display: "inline-block",
        borderRadius: 999,
        padding: "3px 10px",
        fontSize: 12.5,
        fontWeight: 700,
        color: "#fff",
        background: up ? "#16a34a" : "#dc2626",
      }}
    >
      {value}
    </span>
  );
}

export function SampleIssueBody() {
  return (
    <div style={{ fontFamily: FONT, background: "#eef2f8", padding: "14px 12px" }}>
      <div style={{ background: "#fff", border: "1px solid #e2e8f2", borderRadius: 16, overflow: "hidden" }}>
        {/* Header banner (the real newsletter header) */}
        <div style={{ padding: "14px 24px 0 24px" }}>
          <img
            src="/newsletter-header.png"
            alt="For You Newsletter — your personalized briefing"
            style={{ display: "block", width: "100%", maxWidth: 340, height: "auto", margin: "0 auto" }}
          />
          <p style={{ textAlign: "center", fontSize: 13, fontWeight: 600, color: "#64748b", margin: "10px 0 12px 0" }}>
            Thursday, October 15, 2026
          </p>
        </div>

        <div style={{ padding: "0 24px 8px 24px" }}>
          <Section title="Stock Market Update">
            <p style={{ ...body, fontStyle: "italic", color: "#6b7280", fontSize: 13, margin: "0 0 10px 0" }}>
              U.S. markets are currently closed. Prices reflect the most recent close (Wednesday, October 14).
            </p>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th style={th}>Ticker</th>
                  <th style={th}>Name</th>
                  <th style={th}>Price</th>
                  <th style={th}>1D % change</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["NVDA", "NVIDIA", "$221.30", "-3.16%"],
                  ["AAPL", "Apple", "$342.96", "+0.50%"],
                  ["SPY", "S&P 500", "$769.60", "-1.08%"],
                ].map(([t, n, p, c]) => (
                  <tr key={t}>
                    <td style={{ ...td, fontWeight: 700 }}>{t}</td>
                    <td style={td}>{n}</td>
                    <td style={td}>{p}</td>
                    <td style={td}>
                      <Pill value={c} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p style={label}>Your stocks</p>
            <p style={body}>
              Nvidia shares fell as inflation fears weighed on tech stocks, while Apple managed a slight gain.
            </p>
            <p style={label}>American Tech Stock News</p>
            <p style={body}>
              The Nasdaq dropped 1.88%, its largest decline since late July, as inflation data surprised markets.
              Oracle and CoreWeave were among the hardest hit.
            </p>
            <p style={label}>Japanese Stock Market News</p>
            <p style={body}>
              Japan&apos;s Nikkei 225 fell 2.64% as a selloff in AI and semiconductor stocks continued. Kioxia
              Holdings plunged 13.02%.
            </p>
          </Section>

          <Section title="Weather Forecasts">
            <p style={{ ...body, color: "#6b7280", margin: "0 0 6px 0" }}>San Francisco, California</p>
            <table style={{ width: "100%", borderCollapse: "collapse", background: "#f8fafc", borderRadius: 10 }}>
              <thead>
                <tr>
                  <th style={th}>Day</th>
                  <th style={{ ...th, textAlign: "right" }}>Current</th>
                  <th style={{ ...th, textAlign: "right" }}>High</th>
                  <th style={{ ...th, textAlign: "right" }}>Low</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ ...td, fontWeight: 700 }}>☀️ Today</td>
                  <td style={{ ...td, textAlign: "right" }}>61°F</td>
                  <td style={{ ...td, textAlign: "right" }}>65°F</td>
                  <td style={{ ...td, textAlign: "right" }}>58°F</td>
                </tr>
                <tr>
                  <td style={{ ...td, fontWeight: 700 }}>☀️ Tomorrow</td>
                  <td style={{ ...td, textAlign: "right" }}>—</td>
                  <td style={{ ...td, textAlign: "right" }}>75°F</td>
                  <td style={{ ...td, textAlign: "right" }}>59°F</td>
                </tr>
              </tbody>
            </table>
            <p style={{ fontSize: 11.5, color: "#9ca3af", margin: "8px 0 0 0" }}>Weather data by WeatherAPI.com</p>
          </Section>

          <Section title="Sports">
            <p style={{ ...label, marginTop: 0 }}>San Francisco 49ers</p>
            <p style={body}>
              The 49ers are undefeated at 5-0 after a road win over the defending Super Bowl champion Seahawks.
              With the NFL trade deadline on November 10, they have been linked to Buccaneers receiver Chris
              Godwin after Deebo Samuel&apos;s hamstring injury.
            </p>
            <p style={label}>Golden State Warriors</p>
            <p style={body}>
              The Warriors came back from 20 down to beat the Lakers 101-89 in the preseason, though Austin Reaves
              scored 28 and exposed their point-of-attack defense. Brandin Podziemski signed a five-year,
              $110 million extension.
            </p>
          </Section>

          <Section title="Health & Wellness">
            <p style={{ ...label, marginTop: 0 }}>Sleep and Energy</p>
            <p style={body}>
              A sleep specialist says cognitive behavioral therapy for insomnia works better than medication for
              chronic insomnia.
            </p>
            <p style={label}>Nutrition and Healthy Eating</p>
            <p style={body}>
              A dietitian suggests adding a handful of almonds or walnuts to meals for healthy fats and protein.
            </p>
          </Section>

          <Section title="Fun Facts">
            <p style={{ ...label, marginTop: 0 }}>Space Fun Fact</p>
            <ul style={{ ...body, paddingLeft: 20, margin: 0 }}>
              <li>Sunlight takes about eight minutes and twenty seconds to reach Earth.</li>
              <li>Saturn&apos;s rings are mostly ice and rock, from tiny grains to chunks the size of houses.</li>
            </ul>
          </Section>
        </div>

        {/* Footer (matches the real navy footer) */}
        <div style={{ background: "#0b2c6b", padding: "16px 22px 18px 22px", textAlign: "center" }}>
          <p style={{ margin: "0 0 8px 0", fontSize: 12, fontWeight: 600, color: "#fff" }}>
            <img src="/pigeon-filled.svg" alt="" style={{ width: 28, height: 28, verticalAlign: "middle", marginRight: 8 }} />
            Manage your newsletter anytime
          </p>
          <p style={{ margin: "0 0 10px 0", fontSize: 13, color: "#fff" }}>
            <u>Edit Newsletter</u> &nbsp;|&nbsp; <u>Feedback Board</u> &nbsp;|&nbsp; <u>Unsubscribe</u> &nbsp;|&nbsp;{" "}
            <u>Instagram</u>
          </p>
          <p style={{ margin: 0, fontSize: 11, lineHeight: 1.6, color: "#9fb6dd" }}>
            This newsletter is written by artificial intelligence from public sources and may contain mistakes. It
            is not financial, medical, legal or betting advice.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function SampleIssuePreview() {
  return (
    <div className="relative mx-auto w-full max-w-xl">
      <div
        aria-hidden
        className="animate-glow-pulse absolute inset-0 mx-auto h-64 w-64 rounded-full bg-primary/20 blur-3xl"
      />
      <div className="relative overflow-hidden rounded-3xl border border-slate-200 shadow-2xl shadow-primary/10 dark:border-slate-700">
        <div className="flex items-center gap-2 border-b border-slate-100 bg-white px-5 py-3">
          <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
          <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
          <span className="ml-3 flex-1 truncate rounded-md bg-slate-100 px-3 py-1 text-xs font-medium text-slate-400">
            Inbox — Your personalized briefing
          </span>
        </div>
        <div className="max-h-[640px] overflow-hidden">
          <SampleIssueBody />
        </div>
        <div className="border-t border-slate-100 bg-slate-50 px-6 py-3 text-center text-xs font-semibold text-slate-500">
          A real issue (October 15, 2026) for stocks, weather, sports, health and fun facts. Yours is built from your
          own picks.
        </div>
      </div>
    </div>
  );
}
