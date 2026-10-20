"use client";

import {
  Bell,
  Box,
  ChevronRight,
  CircleDotDashed,
  Command,
  History,
  Home,
  LayoutDashboard,
  LineChart,
  Menu,
  PackagePlus,
  Plus,
  Search,
  Settings,
  Sparkles,
  Store,
  Users,
  X
} from "lucide-react";
import { FormEvent, useState } from "react";

const navigation = [
  { label: "Home", icon: Home, active: true },
  { label: "Business", icon: Store },
  { label: "Products", icon: Box },
  { label: "Customers", icon: Users },
  { label: "Grow", icon: LineChart },
  { label: "Analytics", icon: LayoutDashboard }
];

const setupSteps = [
  ["Add your first product", "Show customers what you sell.", "Add product"],
  ["Add a customer", "Start building your customer book.", "Add customer"],
  ["Record your first order", "Track payments, status and delivery.", "Create order"],
  ["Set a monthly goal", "Give Trisellr something to help you work toward.", "Set goal"],
  ["Create your first marketing post", "Use AI to turn one of your products into promotional content.", "Create post"]
];

const nextActions = [
  ["Complete your business profile", "Add your logo, contact information and business description so your storefront is ready.", "Continue Setup"],
  ["Add the products you sell most", "Start with your top 3 products. You can always add more later.", "Add Products"],
  ["Bring in your existing customers", "Add customers you already sell to so Trisellr can help with follow-ups and repeat sales.", "Add Customers"]
];

const growthActions = [
  ["Create your storefront", "Give customers a link where they can see what you sell.", "Set up storefront"],
  ["Create your first promotion", "Generate a post for Instagram or WhatsApp.", "Create campaign"],
  ["Set your first business goal", "Choose what you want to improve this month.", "Set goal"]
];

type ChatMessage = {
  role: "assistant" | "user";
  content: string;
};

const initialChatMessage: ChatMessage = {
  role: "assistant",
  content: "Hi! I’ll help you get your business set up in Trisellr. What does your business do?"
};

export default function HomePage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [notice, setNotice] = useState("");
  const [chatOpen, setChatOpen] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([initialChatMessage]);

  const sendMessage = async (message: string) => {
    const content = message.trim();
    if (!content || isSending) return;

    const nextMessages = [...chatMessages, { role: "user" as const, content }];
    setChatMessages(nextMessages);
    setChatOpen(true);
    setIsSending(true);
    setQuery("");

    try {
      const response = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: content, messages: nextMessages })
      });
      const data = (await response.json()) as { message?: string };
      const reply = data.message;
      if (!response.ok || typeof reply !== "string") throw new Error("Unable to get a response.");
      setChatMessages((messages) => [...messages, { role: "assistant", content: reply }]);
    } catch {
      setChatMessages((messages) => [...messages, { role: "assistant", content: "I couldn’t send that just now. Please try again." }]);
    } finally {
      setIsSending(false);
    }
  };

  const submitPrompt = (event: FormEvent) => {
    event.preventDefault();
    void sendMessage(query);
  };

  const startNewConversation = () => {
    setChatMessages([initialChatMessage]);
    setChatOpen(true);
    setQuery("");
  };

  return (
    <main className="app-shell">
      <button className="mobile-menu" aria-label="Open navigation" onClick={() => setSidebarOpen(true)}><Menu size={20} /></button>
      <aside className={`sidebar ${sidebarOpen ? "is-open" : ""}`}>
        <div className="brand">Trisell<span>lr</span></div>
        <button className="close-menu" aria-label="Close navigation" onClick={() => setSidebarOpen(false)}><X size={18} /></button>
        <nav aria-label="Primary navigation">
          {navigation.map(({ label, icon: Icon, active }) => (
            <button key={label} className={`nav-item ${active ? "active" : ""}`} onClick={() => setNotice(`${label} is coming next.`)}>
              <Icon size={16} strokeWidth={1.8} />{label}
            </button>
          ))}
          <p className="nav-heading">Tools <ChevronRight size={14} /></p>
          <button className="nav-item" onClick={() => setNotice("New business item menu opened.")}><Plus size={17} />Add</button>
        </nav>
        <div className="sidebar-bottom">
          <button className="nav-item" onClick={() => setNotice("Settings is coming next.")}><Settings size={16} />Settings</button>
          <button className="store-switch" onClick={() => setNotice("Store switcher opened.")}><b>M</b>My Store</button>
        </div>
      </aside>
      {sidebarOpen && <button className="scrim" aria-label="Close navigation" onClick={() => setSidebarOpen(false)} />}

      <section className="mobile-home">
        <header className="mobile-header">
          <div className="mobile-brand-row">
            <div className="brand">Trisell<span>lr</span></div>
            <div className="mobile-header-actions">
              <button className="icon-button notification" aria-label="Notifications" onClick={() => setNotice("You have 1 notification.")}><Bell size={17} /><i /></button>
              <button className="profile profile-image" aria-label="Open profile" onClick={() => setNotice("Profile menu opened.")} />
            </div>
          </div>
          <nav className="mobile-tabs" aria-label="Mobile navigation">
            {navigation.slice(0, 5).map(({ label, active }) => <button key={label} className={active ? "active" : ""} onClick={() => setNotice(`${label} is coming next.`)}>{label}</button>)}
          </nav>
          <div className="mobile-store-bar">
            <button onClick={() => setNotice("Store switcher opened.")}>My Store <ChevronRight size={14} /></button>
            <span><i />Trial ends in 3 days</span>
          </div>
        </header>

        <div className="mobile-content">
          <section className="mobile-greeting" aria-labelledby="mobile-welcome-heading">
            <div><h1 id="mobile-welcome-heading">Good morning, Amaka</h1><p>Let’s get your business ready to sell and grow.</p></div>
            <form className="mobile-composer" onSubmit={submitPrompt}>
              <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Help me get started" aria-label="Ask Trisellr" />
              <div><button type="submit" className="ai-orb" aria-label="Send prompt"><Sparkles size={16} /></button><span><button type="button" className="recents" onClick={() => setChatOpen(true)}><History size={18} />Recents</button><b /><button type="button" className="composer-plus" aria-label="Start new conversation" onClick={startNewConversation}><Plus size={20} /></button></span></div>
            </form>
            <div className="mobile-suggestions">
              {["How should I set up my business?", "What should I add first?", "How can Trisellr help me grow?"].map((suggestion) => <button key={suggestion} onClick={() => void sendMessage(suggestion)}>{suggestion}</button>)}
            </div>
            {notice && <p className="mobile-notice" role="status">{notice}</p>}
          </section>

          <section className="mobile-setup" aria-labelledby="mobile-setup-heading">
            <h2 id="mobile-setup-heading">Set up your business</h2>
            <div className="progress-copy"><span>2 of 5 completed</span><span>40%</span></div><div className="progress"><span /></div>
            <div className="mobile-task-list">
              {setupSteps.map(([title, description, action]) => <article key={title} className="mobile-task"><CircleDotDashed size={24} strokeWidth={1.35} /><div><h3>{title}</h3><p>{description}</p><button onClick={() => setNotice(`${action} flow opened.`)}>{action}</button></div></article>)}
            </div>
          </section>

          <section className="mobile-recommendations" aria-labelledby="mobile-next-heading">
            <div><p className="eyebrow">Recommended for you</p><h2 id="mobile-next-heading">What to do next</h2></div>
            {nextActions.map(([title, description, action]) => <article className="mobile-recommendation" key={title}>
              <div className="mobile-feature-image figma-feature-crop" role="img" aria-label="Trisellr mobile experience" />
              <div><h3>{title}</h3><p>{description}</p><button onClick={() => setNotice(`${action} flow opened.`)}>{action}<ChevronRight size={15} /></button></div>
            </article>)}
          </section>

          <section className="mobile-grow" aria-labelledby="mobile-grow-heading">
            <h2 id="mobile-grow-heading">Grow your business</h2>
            {growthActions.map(([title, description, action]) => <article key={title}><h3>{title}</h3><p>{description}</p><button onClick={() => setNotice(`${action} flow opened.`)}>{action} <span>→</span></button></article>)}
            <div className="mobile-tools"><p>Tools</p><div><button onClick={() => setNotice("Analytics is coming next.")}>Analytics</button><button onClick={() => setNotice("Settings is coming next.")}>Settings</button><button onClick={() => setNotice("New business item menu opened.")}>Add</button></div></div>
          </section>
        </div>
      </section>

      <section className="workspace">
        <header className="topbar">
          <div className="crumb"><Menu size={17} /> <span>Home</span></div>
          <label className="search-box"><Search size={17} /><input placeholder="Search everything..." aria-label="Search everything" /><kbd><Command size={10} /> K</kbd></label>
          <div className="top-actions">
            <button className="outline-button" onClick={() => setNotice("Ask Trisellr is ready.")}><span className="ask-mark">◢</span>Ask</button>
            <button className="icon-button notification" aria-label="Notifications" onClick={() => setNotice("You have 1 notification.")}><Bell size={17} /><i /></button>
            <button className="profile profile-image" aria-label="Open profile" onClick={() => setNotice("Profile menu opened.")} />
          </div>
        </header>

        <div className="home-content">
          <section className="hero" aria-labelledby="welcome-heading">
            <h1 id="welcome-heading">Good morning, Amaka</h1>
            <p>Let’s get your business ready to sell and grow.</p>
            <form className="ai-composer" onSubmit={submitPrompt}>
              <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Help me get started" aria-label="Ask Trisellr" />
              <div className="composer-footer">
                <button type="submit" className="ai-orb" aria-label="Send prompt"><img src="/figma-assets/chat-orb.svg" alt="" /></button>
                <div><button type="button" className="recents" onClick={() => setChatOpen(true)}><img src="/figma-assets/history.svg" alt="" />Recents</button><span className="divider" /><button type="button" className="composer-plus" aria-label="Start new conversation" onClick={startNewConversation}><img src="/figma-assets/new-conversation.svg" alt="" /></button></div>
              </div>
            </form>
            <div className="suggestions">
              {["How should I set up my business?", "What should I add first?", "How can Trisellr help me grow?"].map((suggestion) => <button key={suggestion} onClick={() => void sendMessage(suggestion)}>{suggestion}</button>)}
            </div>
            {notice && <p className="notice" role="status">{notice}</p>}
          </section>

          <section className="setup-card" aria-labelledby="setup-heading">
            <h2 id="setup-heading">Set up your business</h2>
            <div className="progress-copy"><span>2 of 5 completed</span><span>40%</span></div>
            <div className="progress"><span /></div>
            <div className="setup-list">
              {setupSteps.map(([title, description, action]) => <div className="setup-row" key={title}>
                <CircleDotDashed size={23} strokeWidth={1.35} />
                <div><h3>{title}</h3><p>{description}</p></div>
                <button onClick={() => setNotice(`${action} flow opened.`)}>{action}</button>
              </div>)}
            </div>
          </section>

          <section className="recommendations" aria-labelledby="next-heading">
            <p className="eyebrow">Recommended for you</p>
            <h2 id="next-heading">What to do next</h2>
            <div className="recommendation-grid">
              {nextActions.map(([title, description, action], index) => <article className="recommendation-card" key={title}>
                <div className="feature-image figma-feature-crop" role="img" aria-label="Trisellr mobile experience" />
                <div className="recommendation-copy"><h3>{title}</h3><p>{description}</p><button onClick={() => setNotice(`${action} flow opened.`)}>{action}<ChevronRight size={16} /></button></div>
              </article>)}
            </div>
          </section>
          <section className="desktop-grow" aria-labelledby="desktop-grow-heading">
            <h2 id="desktop-grow-heading">Grow your business</h2>
            <div className="desktop-grow-grid">
              {growthActions.map(([title, description, action]) => <article key={title}>
                <div><h3>{title}</h3><p>{description}</p></div>
                <button onClick={() => setNotice(`${action} flow opened.`)}>{action} <span>→</span></button>
              </article>)}
            </div>
          </section>
        </div>
      </section>
      {chatOpen && <aside className="assistant-chat" aria-label="Ask Trisellr conversation">
        <header>
          <div><span className="assistant-chat-orb"><img src="/figma-assets/chat-orb.svg" alt="" /></span><div><strong>Ask Trisellr</strong><p>Business setup assistant</p></div></div>
          <button type="button" aria-label="Close chat" onClick={() => setChatOpen(false)}><X size={18} /></button>
        </header>
        <div className="assistant-chat-messages" aria-live="polite">
          {chatMessages.map((message, index) => <p key={`${message.role}-${index}`} className={message.role}>{message.content}</p>)}
          {isSending && <p className="assistant typing">Thinking…</p>}
        </div>
        <form className="assistant-chat-input" onSubmit={submitPrompt}>
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Tell me about your business" aria-label="Message Ask Trisellr" disabled={isSending} />
          <button type="submit" aria-label="Send message" disabled={!query.trim() || isSending}><img src="/figma-assets/chat-orb.svg" alt="" /></button>
        </form>
        <p className="assistant-chat-note">Details stay as drafts until you confirm them.</p>
      </aside>}
    </main>
  );
}
