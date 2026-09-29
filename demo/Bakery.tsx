import { useEffect, useRef, useState } from 'react';
import type { FormEvent, ReactNode } from 'react';
import { SeasonButton, SeasonIcon, SeasonSettings, useSeason } from 'season-ui';
import { HeroArt, Loaf, Wheat } from './art';
import { money, products, specialFor } from './data';
import type { Product } from './data';

interface BasketLine {
  product: Product;
  qty: number;
}

function Modal(props: { title: string; open: boolean; onClose: () => void; children: ReactNode }) {
  const { title, open, onClose, children } = props;
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" role="dialog" aria-modal="true" aria-label={title} onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <h2>{title}</h2>
          <button className="icon-btn" aria-label="Close" onClick={onClose} data-season-ignore>
            <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
              <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function AnnouncementBar() {
  const { season, running } = useSeason();
  const text =
    running.theme && season
      ? `${season.name} specials are here. Pre-order online and skip the queue.`
      : 'Fresh bread every morning from 6:00. Free delivery on orders over $30.';
  return <div className="announcement season-banner">{text}</div>;
}

function Header(props: { basketCount: number; onBasket: () => void; onSettings: () => void }) {
  return (
    <header className="header" data-season-decor="edge">
      <div className="container header-inner">
        <a href="#top" className="logo" data-season-decor="hat">
          <span className="logo-mark">
            <Wheat size={34} />
          </span>
          <span>
            Crumb <span className="season-accent">&amp;</span> Crust
          </span>
        </a>
        <nav className="nav-links">
          <a href="#menu">Menu</a>
          <a href="#specials">Specials</a>
          <a href="#story">Our story</a>
          <a href="#visit">Visit</a>
        </nav>
        <div className="header-actions">
          <span className="hide-sm header-toggle">
            <SeasonButton hideWhenInactive aria-label="Holiday effects" title="Holiday effects" />
          </span>
          <button className="btn btn-ghost season-btn-outline" onClick={props.onSettings} aria-label="Preferences">
            <svg className="gear" viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
              <path
                d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7zm7.4-2.5a7.6 7.6 0 0 0 0-2l2-1.6-2-3.4-2.4 1a7.4 7.4 0 0 0-1.7-1l-.4-2.5h-4l-.4 2.5a7.4 7.4 0 0 0-1.7 1l-2.4-1-2 3.4 2 1.6a7.6 7.6 0 0 0 0 2l-2 1.6 2 3.4 2.4-1c.5.4 1.1.7 1.7 1l.4 2.5h4l.4-2.5c.6-.3 1.2-.6 1.7-1l2.4 1 2-3.4-2-1.6z"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinejoin="round"
              />
            </svg>
            <span className="hide-sm">Preferences</span>
          </button>
          <button className="btn" onClick={props.onBasket} aria-label={`Basket, ${props.basketCount} items`}>
            <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
              <path
                d="M5 8h14l-1.2 11.2a2 2 0 0 1-2 1.8H8.2a2 2 0 0 1-2-1.8zM9 8V6a3 3 0 0 1 6 0v2"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinejoin="round"
              />
            </svg>
            <span className="hide-sm">Basket</span>
            <span className="pill-count">{props.basketCount}</span>
          </button>
        </div>
      </div>
    </header>
  );
}

function Hero() {
  const { season: current, active } = useSeason();
  const season = active ? current : null;
  return (
    <section className="hero" id="top">
      <div className="container hero-inner">
        <div className="hero-copy">
          <span className="eyebrow season-badge">Family bakery since 1998</span>
          <h1>
            Honest bread, <span className="season-text">baked at dawn.</span>
          </h1>
          <p className="lead">
            Slow-fermented sourdough, buttery pastries and seasonal bakes from a small neighborhood oven. No shortcuts,
            no additives, just flour, water, salt and time.
          </p>
          <div className="hero-actions">
            <a href="#menu" className="btn btn-lg season-btn">
              Order for pickup
            </a>
            <a href="#story" className="btn btn-lg btn-ghost season-btn-outline">
              Our story
            </a>
          </div>
          <dl className="stats">
            <div>
              <dt>6:00</dt>
              <dd>Doors open</dd>
            </div>
            <div>
              <dt>48h</dt>
              <dd>Sourdough ferment</dd>
            </div>
            <div>
              <dt>{season ? <SeasonIcon size={26} /> : '40+'}</dt>
              <dd>{season ? `${season.name} menu` : 'Recipes'}</dd>
            </div>
          </dl>
        </div>
        <HeroArt />
      </div>
    </section>
  );
}

function ProductCard(props: { product: Product; onAdd: (p: Product, el: Element) => void; decor?: string }) {
  const { product, onAdd, decor } = props;
  return (
    <article className="product season-card" data-season-decor={decor}>
      <div className="product-art">{product.art}</div>
      <div className="product-body">
        <div className="product-top">
          <h3>{product.name}</h3>
          {product.tag && <span className="tag season-badge">{product.tag}</span>}
        </div>
        <p>{product.description}</p>
        <div className="product-foot">
          <span className="price">{money(product.price)}</span>
          <button className="btn btn-sm" onClick={(e) => onAdd(product, e.currentTarget)}>
            Add to basket
          </button>
        </div>
      </div>
    </article>
  );
}

function Menu(props: { onAdd: (p: Product, el: Element) => void }) {
  return (
    <section className="section" id="menu">
      <div className="container">
        <div className="section-head">
          <span className="eyebrow">Daily menu</span>
          <h2>Out of the oven this morning</h2>
          <p className="muted">Order before 10:00 for same-day pickup. Everything is baked in-house.</p>
        </div>
        <div className="product-grid">
          {products.map((p, i) => (
            <ProductCard key={p.id} product={p} onAdd={props.onAdd} decor={i === 0 ? 'corner' : undefined} />
          ))}
        </div>
      </div>
    </section>
  );
}

function Specials(props: { onAdd: (p: Product, el: Element) => void }) {
  const { season: current, active } = useSeason();
  const season = active ? current : null;
  const special = specialFor(season?.id);
  return (
    <section className="section section-soft" id="specials">
      <div className="container">
        <div className="section-head">
          <span className="eyebrow">{special.seasonal ? 'Seasonal' : 'Specials'}</span>
          <h2>
            {special.seasonal && season && <SeasonIcon size={30} className="title-icon" />}
            {special.title}
          </h2>
          <p className="muted">{special.intro}</p>
        </div>
        <div className="special-grid">
          {special.items.map((p) => (
            <div key={p.id} className="special season-card">
              <div className="special-art">{p.art}</div>
              <div>
                <h3>{p.name}</h3>
                <p className="muted">{p.description}</p>
                <div className="product-foot">
                  <span className="price">{money(p.price)}</span>
                  <button className="btn btn-sm btn-ghost season-btn-soft" onClick={(e) => props.onAdd(p, e.currentTarget)}>
                    Add
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Story() {
  return (
    <section className="section" id="story">
      <div className="container story">
        <div className="story-art">
          <Loaf size={260} tint="#b7773f" />
        </div>
        <div>
          <span className="eyebrow">Our story</span>
          <h2>Three generations, one oven</h2>
          <p className="muted">
            Anna opened Crumb &amp; Crust in 1998 with a single wood-fired oven and her grandmother's starter. Today
            her son runs the bakery, and the starter is still fed twice a day.
          </p>
          <ul className="values">
            <li>
              <strong>Local flour.</strong> Stone-milled wheat and rye from farms within 60 km.
            </li>
            <li>
              <strong>Slow dough.</strong> Every loaf ferments for at least 24 hours.
            </li>
            <li>
              <strong>Zero waste.</strong> Unsold bread goes to the food bank every evening.
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
}

function Visit(props: { onToast: (text: string) => void }) {
  const { celebrate } = useSeason();
  const inputRef = useRef<HTMLInputElement>(null);
  const subscribe = (e: FormEvent) => {
    e.preventDefault();
    if (inputRef.current) celebrate(inputRef.current);
    props.onToast('Thanks! Fresh news will land in your inbox.');
    e.currentTarget instanceof HTMLFormElement && e.currentTarget.reset();
  };
  return (
    <section className="section section-soft" id="visit">
      <div className="container visit">
        <div className="card season-card">
          <h3>Opening hours</h3>
          <dl className="hours">
            <div>
              <dt>Monday - Friday</dt>
              <dd>6:00 - 19:00</dd>
            </div>
            <div>
              <dt>Saturday</dt>
              <dd>7:00 - 16:00</dd>
            </div>
            <div>
              <dt>Sunday</dt>
              <dd>7:00 - 13:00</dd>
            </div>
          </dl>
          <p className="muted">12 Mill Street, Old Town. Two minutes from the market square.</p>
        </div>
        <form className="card newsletter season-card" onSubmit={subscribe}>
          <h3>Warm news, once a month</h3>
          <p className="muted">New bakes, seasonal menus and the occasional recipe. No spam, ever.</p>
          <div className="newsletter-row">
            <input ref={inputRef} type="email" required placeholder="you@example.com" aria-label="Email address" />
            <button className="btn" type="submit">
              Subscribe
            </button>
          </div>
          <label className="check">
            <input type="checkbox" defaultChecked /> Also tell me about seasonal specials
          </label>
        </form>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-inner">
        <div className="logo small">
          <span className="logo-mark">
            <Wheat size={28} />
          </span>
          Crumb &amp; Crust
        </div>
        <p className="muted">Made with flour, water, salt and time. This is a demo site for SeasonUI.</p>
      </div>
    </footer>
  );
}

export function Bakery() {
  const { celebrate } = useSeason();
  const [basket, setBasket] = useState<BasketLine[]>([]);
  const [basketOpen, setBasketOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const placeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3200);
    return () => clearTimeout(t);
  }, [toast]);

  const add = (product: Product) => {
    setBasket((lines) => {
      const found = lines.find((l) => l.product.id === product.id);
      return found
        ? lines.map((l) => (l === found ? { ...l, qty: l.qty + 1 } : l))
        : [...lines, { product, qty: 1 }];
    });
    setToast(`${product.name} added to your basket.`);
  };

  const count = basket.reduce((n, l) => n + l.qty, 0);
  const total = basket.reduce((n, l) => n + l.qty * l.product.price, 0);

  const placeOrder = () => {
    if (placeRef.current) celebrate(placeRef.current);
    setToast('Order placed! See you at the counter.');
    setTimeout(() => {
      setBasket([]);
      setBasketOpen(false);
    }, 900);
  };

  return (
    <>
      <AnnouncementBar />
      <Header basketCount={count} onBasket={() => setBasketOpen(true)} onSettings={() => setSettingsOpen(true)} />
      <main>
        <Hero />
        <Menu onAdd={add} />
        <Specials onAdd={add} />
        <Story />
        <Visit onToast={setToast} />
      </main>
      <Footer />

      <Modal title="Your basket" open={basketOpen} onClose={() => setBasketOpen(false)}>
        {basket.length === 0 ? (
          <p className="muted">Your basket is empty. Add something warm from the menu.</p>
        ) : (
          <>
            <ul className="basket">
              {basket.map((l) => (
                <li key={l.product.id}>
                  <span>
                    {l.qty} x {l.product.name}
                  </span>
                  <span>{money(l.qty * l.product.price)}</span>
                </li>
              ))}
            </ul>
            <div className="basket-total">
              <span>Total</span>
              <strong>{money(total)}</strong>
            </div>
            <button ref={placeRef} className="btn btn-lg btn-block" onClick={placeOrder}>
              Place order
            </button>
          </>
        )}
      </Modal>

      <Modal title="Preferences" open={settingsOpen} onClose={() => setSettingsOpen(false)}>
        <p className="muted">Choose how festive you want the site to be. Your choice is saved on this device.</p>
        <SeasonSettings className="settings-panel" />
      </Modal>

      {toast && (
        <div className="toast" role="status">
          {toast}
        </div>
      )}
    </>
  );
}
