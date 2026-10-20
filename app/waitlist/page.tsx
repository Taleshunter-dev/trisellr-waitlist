"use client";

import { FormEvent, useState } from "react";

const faqs = [
  {
    question: "What is Trisellr?",
    answer:
      "Trisellr brings your orders, products, customers and payments together, with AI to help you take the next useful step."
  },
  { question: "Who is it for?", answer: "For ambitious business owners who want a simpler way to run and grow their business." },
  { question: "When can I get access?", answer: "We are inviting early members in stages. Join the list to be among the first to know." },
  { question: "What happens after I join?", answer: "We will send occasional product updates and an email when your early access is ready." }
];

function Wordmark() {
  return <span className="waitlist-wordmark">Trisell<span>r</span></span>;
}

function Constellation() {
  const cards = [
    ["orders", "↗", "Orders", "Ready for what’s next"],
    ["payments", "₦", "Payments", "Stay on top of balances"],
    ["customers", "◉", "Customers", "Keep every connection"],
    ["growth", "✦", "Growth", "Turn ideas into action"]
  ];

  return (
    <div className="waitlist-constellation" aria-label="One place for every part of your business">
      <div className="waitlist-glow waitlist-glow-purple" />
      <div className="waitlist-glow waitlist-glow-orange" />
      <svg className="waitlist-orbits" viewBox="0 0 1040 340" fill="none" aria-hidden="true">
        <ellipse cx="520" cy="170" rx="412" ry="106" stroke="currentColor" strokeOpacity=".38" strokeWidth="1" />
        <ellipse cx="520" cy="170" rx="330" ry="150" transform="rotate(-23 520 170)" stroke="currentColor" strokeOpacity=".24" strokeWidth="1" />
        <path d="M 168 170 H 872" stroke="currentColor" strokeOpacity=".25" strokeDasharray="4 8" />
      </svg>
      <div className="waitlist-core" aria-hidden="true"><i /><b /><em /><strong /><u /></div>
      {cards.map(([position, icon, title, text]) => (
        <article className={`waitlist-signal waitlist-${position}`} key={title}>
          <span>{icon}</span><div><b>{title}</b><small>{text}</small></div>
        </article>
      ))}
    </div>
  );
}

export default function WaitlistPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [joining, setJoining] = useState(false);
  const [joined, setJoined] = useState(false);
  const [openFaq, setOpenFaq] = useState(0);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setError("Enter a valid email address.");
      return;
    }
    setError("");
    setJoining(true);
    window.setTimeout(() => {
      setJoining(false);
      setJoined(true);
    }, 700);
  }

  if (joined) {
    return <main className="waitlist-page waitlist-confirmation"><div className="waitlist-shell"><header><Wordmark /></header><section><div className="waitlist-mail">✦</div><p className="waitlist-kicker">WELCOME TO WHAT’S NEXT</p><h1>You’re on the list.<br /><i>Here’s to what’s next.</i></h1><p>Your spot is saved. We’ll email you as soon as early access opens.</p><span>{email}</span><button onClick={() => setJoined(false)}>Back to Trisellr <b>↗</b></button></section></div></main>;
  }

  return (
    <main className="waitlist-page">
      <div className="waitlist-shell">
        <div className="waitlist-ambient waitlist-ambient-purple" />
        <div className="waitlist-ambient waitlist-ambient-orange" />
        <header className="waitlist-nav"><Wordmark /><nav><a href="#why">Why Trisellr</a><a href="#faqs">FAQs</a><a className="waitlist-nav-button" href="#join">Join the waitlist <b>↗</b></a></nav></header>
        <section className="waitlist-hero" id="join">
          <p className="waitlist-badge">✦&nbsp; Built for your next chapter</p>
          <h1>Less busywork.<br /><i>More business.</i></h1>
          <p className="waitlist-lede">Your orders, customers, payments and growth.<br />One place to run it all, with AI by your side.</p>
          <form className={`waitlist-form ${error ? "has-error" : ""}`} onSubmit={submit} noValidate>
            <label htmlFor="waitlist-email">Your email address</label><div><input id="waitlist-email" value={email} onChange={(event) => { setEmail(event.target.value); setError(""); }} placeholder="you@example.com" type="email" /><button type="submit" disabled={joining}>{joining ? "Joining..." : <>Join waitlist <b>↗</b></>}</button></div>
            {error && <p className="waitlist-error">{error}</p>}
          </form>
          <div className="waitlist-social-proof" aria-label="180 people have already joined the waitlist"><div className="waitlist-avatars"><i /><i /><i /><i /></div><p><b>180</b> joined already</p></div>
          <p className="waitlist-privacy">Early-access updates only. Unsubscribe anytime.</p>
          <Constellation />
        </section>
        <section className="waitlist-why" id="why"><p>LESS TO JUGGLE. MORE ROOM TO GROW.</p><div>
          <article><span>↗</span><h2>Run the day</h2><p>Keep orders, products, customers and payments connected.</p></article>
          <article><span>✦</span><h2>Find your next move</h2><p>Let Trisellr turn business context into useful next steps.</p></article>
          <article><span>◉</span><h2>Grow with intention</h2><p>Create promotions and prepare follow-ups with AI.</p></article>
        </div></section>
        <section className="waitlist-faq" id="faqs"><h2>A few things you might be wondering.</h2><div>{faqs.map((faq, index) => <article className={openFaq === index ? "open" : ""} key={faq.question}><button onClick={() => setOpenFaq(openFaq === index ? -1 : index)} aria-expanded={openFaq === index}><span>{faq.question}</span><b>{openFaq === index ? "−" : "+"}</b></button>{openFaq === index && <p>{faq.answer}</p>}</article>)}</div></section>
        <footer className="waitlist-footer"><Wordmark /><p>Built for the business you’re building.</p><small>© 2026 Trisellr</small></footer>
      </div>
    </main>
  );
}
