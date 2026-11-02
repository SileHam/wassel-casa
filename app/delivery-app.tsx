"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowRight, ArrowUpRight, ArrowLeft, Bike, Check, CheckCircle2, ChevronDown, Clock, Coffee, Cookie, Flame, Heart, Leaf, LoaderCircle, MapPin, MessageCircle, Minus, Package, Pizza, Plus, Search, ShieldCheck, ShoppingBag, ShoppingBasket, SlidersHorizontal, Star, Store, Tag, Utensils, X } from "lucide-react";
import { apiResponseSchema, districts, money, quote, restaurants, statuses, type CartLine, type Order, type Restaurant, type Status } from "../lib/catalog";

type View = "discover" | "favorites" | "orders" | "merchant" | "courier";
type Panel = "menu" | "cart" | "address" | "order" | "about" | null;
const statusLabels: Record<Status, string> = { pending: "À confirmer", preparing: "En préparation", ready: "Prête à partir", delivering: "En livraison", delivered: "Livrée", cancelled: "Annulée" };
const categories = [{ name: "Tout", icon: Utensils }, { name: "Marocain", icon: Flame }, { name: "Burgers", icon: ShoppingBag }, { name: "Pizza", icon: Pizza }, { name: "Healthy", icon: Leaf }, { name: "Sucré", icon: Cookie }, { name: "Courses", icon: ShoppingBasket }];

export default function DeliveryApp() {
  const [ready, setReady] = useState(false);
  const [view, setView] = useState<View>("discover");
  const [panel, setPanel] = useState<Panel>(null);
  const [selected, setSelected] = useState<Restaurant>(restaurants[0]);
  const [cartRestaurant, setCartRestaurant] = useState<Restaurant | null>(null);
  const [cart, setCart] = useState<CartLine[]>([]);
  const [category, setCategory] = useState("Tout");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("recommended");
  const [filter, setFilter] = useState("");
  const [favorites, setFavorites] = useState<string[]>([]);
  const [district, setDistrict] = useState("Maârif");
  const [address, setAddress] = useState("");
  const [note, setNote] = useState("");
  const [slot, setSlot] = useState("soon");
  const [promo, setPromo] = useState("");
  const [promoInput, setPromoInput] = useState("");
  const [darija, setDarija] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeOrderId, setActiveOrderId] = useState("");
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(false);
  const [authNeeded, setAuthNeeded] = useState(false);
  const [apiError, setApiError] = useState("");
  const [toast, setToast] = useState("");
  const [issue, setIssue] = useState("");
  const requestKey = useRef("");
  const dialogRef = useRef<HTMLDivElement>(null);
  const modalReturnFocus = useRef<HTMLElement | null>(null);
  const tr = (fr: string, da: string) => darija ? da : fr;
  const notify = (message: string) => setToast(message);
  const pricing = cartRestaurant && cart.length ? quote(cartRestaurant, cart, promo) : null;
  const count = cart.reduce((sum, line) => sum + line.quantity, 0);
  const activeOrder = orders.find(order => order.id === activeOrderId);

  const loadOrders = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/orders", { cache: "no-store" });
      const data = apiResponseSchema.parse(await response.json());
      if (response.status === 401) { setAuthNeeded(true); setApiError(""); return; }
      if (!response.ok) throw new Error(data.error);
      setOrders(data.orders); setAuthNeeded(false); setApiError("");
    } catch (error) { setApiError(error instanceof Error ? error.message : "Connexion indisponible."); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    setReady(true);
    try {
      const saved = JSON.parse(localStorage.getItem("wassel-preferences") || "null");
      if (saved) {
        if (Array.isArray(saved.favorites)) setFavorites(saved.favorites.filter((id: unknown) => typeof id === "string"));
        if (districts.includes(saved.district)) setDistrict(saved.district);
        if (typeof saved.darija === "boolean") setDarija(saved.darija);
      }
    } catch { /* Invalid device preferences fall back to defaults. */ }
    void loadOrders();
  }, [loadOrders]);
  useEffect(() => { if (!toast) return; const timer = setTimeout(() => setToast(""), 3800); return () => clearTimeout(timer); }, [toast]);
  useEffect(() => {
    if (!panel) return;
    modalReturnFocus.current = document.activeElement as HTMLElement;
    document.body.style.overflow = "hidden";
    const timer = setTimeout(() => dialogRef.current?.focus(), 0);
    const handler = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !busy) setPanel(null);
      if (event.key === "Tab") {
        const elements = dialogRef.current?.querySelectorAll<HTMLElement>('button:not([disabled]),a[href],input,select,textarea,[tabindex="0"]');
        if (!elements?.length) return;
        const first = elements[0], last = elements[elements.length - 1];
        if (event.shiftKey && (document.activeElement === first || document.activeElement === dialogRef.current)) { event.preventDefault(); last.focus(); }
        else if (!event.shiftKey && (document.activeElement === last || document.activeElement === dialogRef.current)) { event.preventDefault(); first.focus(); }
      }
    };
    document.addEventListener("keydown", handler);
    return () => { clearTimeout(timer); document.body.style.overflow = ""; document.removeEventListener("keydown", handler); modalReturnFocus.current?.focus(); };
  }, [panel, busy]);
  useEffect(() => {
    if (view !== "orders" && view !== "merchant" && view !== "courier" && panel !== "order") return;
    const timer = setInterval(() => { void loadOrders(); }, 12000);
    return () => clearInterval(timer);
  }, [view, panel, loadOrders]);

  function savePreferences(next: { favorites?: string[]; district?: string; darija?: boolean }) {
    try { localStorage.setItem("wassel-preferences", JSON.stringify({ favorites, district, darija, ...next })); } catch { /* Preferences are optional. */ }
  }
  function toggleFavorite(id: string) { const next = favorites.includes(id) ? favorites.filter(item => item !== id) : [...favorites, id]; setFavorites(next); savePreferences({ favorites: next }); }
  function switchView(next: View) { setView(next); setPanel(null); if (["orders", "merchant", "courier"].includes(next)) void loadOrders(); window.scrollTo({ top: 0, behavior: "smooth" }); }
  function addItem(restaurant: Restaurant, id: string) {
    if (cartRestaurant && restaurant.id !== cartRestaurant.id && cart.length) {
      if (!window.confirm("Votre panier contient des articles d’une autre adresse. Le remplacer ?")) return;
      setCart([{ id, quantity: 1 }]); setPromo(""); setPromoInput("");
    } else setCart(current => {
      const existing = current.find(line => line.id === id);
      if (existing && existing.quantity >= 20) { notify("Maximum 20 unités par article."); return current; }
      return existing ? current.map(line => line.id === id ? { ...line, quantity: line.quantity + 1 } : line) : [...current, { id, quantity: 1 }];
    });
    requestKey.current = ""; setCartRestaurant(restaurant); notify("Ajouté au panier. Bssaha !");
  }
  function changeQuantity(id: string, delta: number) { setCart(current => current.map(line => line.id === id ? { ...line, quantity: Math.min(20, line.quantity + delta) } : line).filter(line => line.quantity > 0)); requestKey.current = ""; }
  async function checkout() {
    if (!cartRestaurant || !cart.length || busy) return;
    if (address.trim().length < 5) { notify("Ajoutez une rue et un numéro pour la livraison."); return; }
    setBusy(true);
    requestKey.current ||= crypto.randomUUID();
    try {
      const response = await fetch("/api/orders", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ requestKey: requestKey.current, restaurantId: cartRestaurant.id, lines: cart, district, address, note, slot, promo }) });
      const data = apiResponseSchema.parse(await response.json());
      if (response.status === 401) setAuthNeeded(true);
      if (!response.ok) throw new Error(data.error);
      await loadOrders(); setActiveOrderId(data.id); setCart([]); setPromo(""); setPromoInput(""); requestKey.current = ""; setPanel("order"); notify("Commande de démonstration enregistrée.");
    } catch (error) { notify(error instanceof Error ? error.message : "Impossible de passer commande."); }
    finally { setBusy(false); }
  }
  async function updateOrder(order: Order, to: Status) {
    if (busy) return; setBusy(true);
    try {
      const response = await fetch(`/api/orders/${order.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "status", from: order.status, to }) });
      const data = apiResponseSchema.parse(await response.json()); if (!response.ok) throw new Error(data.error);
      await loadOrders(); notify(`Commande : ${statusLabels[to].toLowerCase()}.`);
    } catch (error) { notify(error instanceof Error ? error.message : "Action impossible."); }
    finally { setBusy(false); }
  }
  async function sendIssue(order: Order) {
    if (issue.trim().length < 5 || busy) return; setBusy(true);
    try {
      const response = await fetch(`/api/orders/${order.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "support", message: issue }) });
      const data = apiResponseSchema.parse(await response.json()); if (!response.ok) throw new Error(data.error);
      await loadOrders(); setIssue(""); notify("Signalement de test enregistré. Aucun agent réel n’est contacté.");
    } catch (error) { notify(error instanceof Error ? error.message : "Action impossible."); } finally { setBusy(false); }
  }
  const visible = restaurants.filter(restaurant => {
    const search = `${restaurant.name} ${restaurant.cuisine} ${restaurant.menu.map(item => item.name).join(" ")}`.toLocaleLowerCase("fr");
    return (category === "Tout" || restaurant.category === category) && search.includes(query.toLocaleLowerCase("fr")) && (view !== "favorites" || favorites.includes(restaurant.id)) && (filter !== "fast" || restaurant.time <= 20) && (filter !== "free" || restaurant.delivery === 0) && (filter !== "rated" || restaurant.rating >= 4.8);
  }).sort((a, b) => sort === "fastest" ? a.time - b.time : sort === "rating" ? b.rating - a.rating : sort === "delivery" ? a.delivery - b.delivery : 0);
  const title = view === "favorites" ? tr("Vos bonnes adresses", "Les favoris dyalek") : tr("Les pépites du quartier", "Bnin f 7omtek");
  const operations = view === "merchant" || view === "courier";
  const currentOrders = view === "merchant" ? orders.filter(order => ["pending", "preparing", "ready"].includes(order.status)) : view === "courier" ? orders.filter(order => ["ready", "delivering"].includes(order.status)) : orders;

  return <div className="app-shell" data-ready={ready}>
    <div className="demo-strip"><span className="demo-dot" /> Démonstration interactive · enseignes, prix et délais fictifs · aucun paiement réel <button onClick={() => setPanel("about")}>En savoir plus <ArrowUpRight size={12} /></button></div>
    <header className="header"><div className="header-inner">
      <button className="brand" onClick={() => switchView("discover")} aria-label="Wassel accueil">wassel<span className="brand-dot">↗</span><small>CASABLANCA</small></button>
      <button className="location-button" onClick={() => setPanel("address")}><span className="location-icon"><MapPin size={19} /></span><span><small>{tr("Livrer à", "Nwesslou l")}</small><strong>{district}, Casablanca</strong></span><ChevronDown size={15} /></button>
      <nav className="header-nav" aria-label="Navigation principale"><button className={view === "discover" ? "active" : ""} onClick={() => switchView("discover")}>{tr("Découvrir", "Chouf")}</button><button className={view === "orders" ? "active" : ""} onClick={() => switchView("orders")}>{tr("Mes commandes", "Commandes dyali")}</button></nav>
      <div className="header-actions"><button className="language" onClick={() => { setDarija(!darija); savePreferences({ darija: !darija }); }}>{darija ? "FR" : "Darija"}</button><button className="icon-button favorite-header" aria-label="Mes favoris" onClick={() => switchView("favorites")}><Heart size={21} /></button><button className="cart-button" onClick={() => setPanel("cart")}><ShoppingBag size={18} /><span>{tr("Mon panier", "Panier dyali")}</span><b>{count}</b></button></div>
    </div></header>
    <main>
      {(view === "discover" || view === "favorites") && <>
        {view === "discover" && <section className="hero container">
          <div className="hero-copy"><div className="eyebrow"><span /> CASA, ON EST CHEZ NOUS.</div><h1>{darija ? <>Jou3ti ?<br /><em>Wassel lik.</em></> : <>Casa a faim.<br /><em>On s’en occupe.</em></>}</h1><p>{tr("Vos restos préférés, les courses du quotidien et les petits plaisirs. Tout votre quartier, à votre porte.", "Restos li katbghi, courses dyalek, w dakchi li kayfer7ek. Kolchi 7da bab darek.")}</p><div className="hero-search"><Search size={20} /><input aria-label="Rechercher un restaurant ou un plat" placeholder={tr("Un resto, un plat, une envie…", "Ach chhitti lyoum ?")} value={query} onChange={event => setQuery(event.target.value)} /><button aria-label="Afficher les résultats" onClick={() => document.getElementById("restaurants")?.scrollIntoView({ behavior: "smooth" })}><ArrowRight size={21} /></button></div><div className="hero-promises"><span><ShieldCheck size={15} />{tr("Prix clairs, dès le départ", "Prix baynin men lowel")}</span><span><Heart size={15} />{tr("Les adresses d’ici", "Adresses dyal Casa")}</span></div></div>
          <div className="hero-art"><div className="orbit orbit-one"/><div className="orbit orbit-two"/><span className="art-spark spark-one">✳</span><span className="art-spark spark-two">✳</span><div className="food-circle"><img src="/images/burger.jpg" alt="Burger généreux, fromage et légumes frais" fetchPriority="high" /></div><div className="floating-label local-label"><span className="label-icon"><Flame size={22} /></span><div><strong>Du bon. Du local.</strong><small>Et beaucoup de bssaha.</small></div></div><div className="floating-label time-label"><span className="round-check"><Check size={17} /></span><div><strong>Votre envie, livrée.</strong><small>Le quartier vient à vous.</small></div><Bike size={27} /></div><div className="art-caption">MN CASA, B L’7OB. <Heart size={12} /></div></div>
        </section>}
        <section className="category-section container" aria-label="Catégories"><div className="section-kicker">{tr("UNE ENVIE EN PARTICULIER ?", "ACH CHHITTI ?")}</div><div className="categories">{categories.map(({ name, icon: Icon }) => <button key={name} onClick={() => setCategory(name)} className={`category ${category === name ? "selected" : ""}`}><span><Icon size={25} strokeWidth={1.65} /></span><strong>{name === "Tout" ? tr("Pour vous", "Lik nta") : name}</strong></button>)}</div></section>
        <section className="promo-row container"><div className="promo-card"><span className="promo-illustration"><Tag size={33} strokeWidth={1.5} /></span><div><small>UN PETIT COUP DE POUCE</small><h3>10 DH pour se faire plaisir.</h3><p>Dès 80 DH d’achats · offre de démonstration</p></div><button onClick={() => { setPromo("CASA10"); setPromoInput("CASA10"); requestKey.current = ""; notify("CASA10 appliqué : −10 DH dès 80 DH d’articles."); }}>CASA10 <Plus size={14}/></button></div><button className="neighborhood-card" onClick={() => setPanel("address")}><div><small>LIVRAISON À CASABLANCA</small><h3>Votre quartier.<br />Vos bonnes adresses.</h3><span>Changer de quartier <ArrowUpRight size={16} /></span></div><MapPin size={55} strokeWidth={1} /></button></section>
        <section id="restaurants" className="restaurants-section container"><div className="section-heading"><div><div className="section-kicker">{tr("SÉLECTION WÄSSEL", "L’CHOIX DYAL WÄSSEL")}</div><h2>{title}<span className="heading-star">✳</span></h2><p>{visible.length} {tr("adresses de démonstration à découvrir", "adresses démo katsennak")} · {district}</p></div><label className="sort-label"><SlidersHorizontal size={16} /><select aria-label="Trier les restaurants" value={sort} onChange={event => setSort(event.target.value)}><option value="recommended">Recommandés</option><option value="fastest">Les plus rapides</option><option value="rating">Les mieux notés</option><option value="delivery">Frais de livraison</option></select></label></div>
          <div className="filters"><button className={filter === "" ? "chosen" : ""} onClick={() => setFilter("")}>{tr("Toutes les adresses", "Kolchi")}</button><button className={filter === "fast" ? "chosen" : ""} onClick={() => setFilter(filter === "fast" ? "" : "fast")}><Clock size={14} />20 min ou moins</button><button className={filter === "free" ? "chosen" : ""} onClick={() => setFilter(filter === "free" ? "" : "free")}><Bike size={15} />Livraison offerte</button><button className={filter === "rated" ? "chosen" : ""} onClick={() => setFilter(filter === "rated" ? "" : "rated")}><Star size={14} />4,8 et plus</button>{query && <button onClick={() => setQuery("")}><X size={14} />« {query} »</button>}</div>
          {visible.length ? <div className="restaurant-grid">{visible.map(restaurant => <article className="restaurant-card" key={restaurant.id}><div className="restaurant-image" style={{ background: restaurant.color }}><button className="image-open" onClick={() => { setSelected(restaurant); setPanel("menu"); }} aria-label={`Voir le menu de ${restaurant.name}`}><img src={restaurant.image} alt={restaurant.cuisine} loading="lazy" /></button>{restaurant.tag && <span className={`restaurant-tag ${restaurant.delivery === 0 ? "green-tag" : ""}`}>{restaurant.delivery === 0 && <Bike size={13} />}{restaurant.tag}</span>}<button className={`save-button ${favorites.includes(restaurant.id) ? "saved" : ""}`} aria-label={`${favorites.includes(restaurant.id) ? "Retirer" : "Ajouter"} ${restaurant.name} des favoris`} aria-pressed={favorites.includes(restaurant.id)} onClick={() => toggleFavorite(restaurant.id)}><Heart size={18} fill={favorites.includes(restaurant.id) ? "currentColor" : "none"} /></button><span className="time-pill"><Clock size={12} />{restaurant.time}–{restaurant.time + 10} min*</span></div><button className="restaurant-info" onClick={() => { setSelected(restaurant); setPanel("menu"); }}><div className="restaurant-title"><h3>{restaurant.name}</h3><span><Star size={13} fill="currentColor" />{restaurant.rating.toFixed(1)}<small>({restaurant.reviews})*</small></span></div><p>{restaurant.cuisine}</p><div className="restaurant-bottom"><span className={restaurant.delivery === 0 ? "free-delivery" : ""}><Bike size={14} />{restaurant.delivery ? `${money(restaurant.delivery)} de livraison` : "Livraison offerte"}</span><span className="menu-arrow"><ArrowUpRight size={18} /></span></div></button></article>)}</div> : <div className="empty-state"><Search size={30}/><h3>{view === "favorites" ? "Vos favoris vous attendent." : "Pas encore de pépite pour cette recherche."}</h3><p>{view === "favorites" ? "Touchez le cœur d’une adresse pour la retrouver ici." : "Essayez une autre envie ou retirez les filtres."}</p><button className="primary" onClick={() => { setQuery(""); setCategory("Tout"); setFilter(""); setView("discover"); }}>Découvrir les adresses <ArrowRight size={16}/></button></div>}
          <p className="sample-note">* Notes, avis, délais et enseignes sont des exemples fictifs. Les photos illustrent l’ambiance et ne représentent pas nécessairement chaque plat.</p>
        </section><section className="values-banner container"><div className="values-mark">w↗</div><div><h2>Une ville. Mille envies.</h2><p>Une expérience pensée pour les gens d’ici, les commerces d’à côté et celles et ceux qui font le trajet.</p></div><button onClick={() => setPanel("about")}>L’esprit Wassel <ArrowUpRight size={18}/></button></section>
      </>}
      {(view === "orders" || operations) && <section className="container orders-section"><div className="section-heading"><div><div className="eyebrow">VOTRE ESPACE DE DÉMONSTRATION</div><h1>{view === "merchant" ? "Côté cuisine." : view === "courier" ? "En route, Casa." : "Vos commandes."}</h1><p>{operations ? "Pilotez les commandes de votre propre démo. Les rôles ne sont pas des comptes professionnels réels." : "Retrouvez vos envies, de la cuisine à votre porte."}</p></div><button className="secondary" disabled={loading} onClick={() => void loadOrders()}>{loading ? <LoaderCircle size={16} className="spin"/> : <Package size={16}/>} Actualiser</button></div><div className="role-tabs"><button className={view === "orders" ? "selected" : ""} onClick={() => switchView("orders")}><ShoppingBag size={16}/>Client</button><button className={view === "merchant" ? "selected" : ""} onClick={() => switchView("merchant")}><Store size={16}/>Restaurant</button><button className={view === "courier" ? "selected" : ""} onClick={() => switchView("courier")}><Bike size={17}/>Livreur</button></div>
        {authNeeded ? <div className="empty-state"><ShieldCheck size={32}/><h3>Gardez une trace de vos commandes.</h3><p>Connectez-vous pour enregistrer et retrouver vos commandes de démonstration.</p><a className="primary" href="/signin-with-chatgpt?return_to=/" target="_top">Se connecter <ArrowRight size={16}/></a></div> : apiError ? <div className="empty-state"><Package size={32}/><h3>Un petit souci de connexion.</h3><p>{apiError}</p><button className="primary" onClick={() => void loadOrders()}>Réessayer</button></div> : currentOrders.length === 0 ? <div className="empty-state"><ShoppingBag size={36}/><h3>{loading ? "On retrouve vos commandes…" : operations ? "Tout est calme pour le moment." : "Votre première envie vous attend."}</h3><p>{operations ? "Passez une commande côté client, puis revenez ici pour la faire avancer." : "Choisissez une adresse et passez votre première commande de test."}</p><button className="primary" onClick={() => switchView("discover")}>Découvrir les menus <ArrowRight size={16}/></button></div> : <div className="order-list">{currentOrders.map(order => {
          const restaurant = restaurants.find(item => item.id === order.restaurantId)!;
          return <article className="order-card" key={order.id}><img src={restaurant.image} alt=""/><div className="order-card-content"><div className="restaurant-title"><h3>{restaurant.name}</h3><span className={`status-badge status-${order.status}`}>{statusLabels[order.status]}</span></div><p>#{order.id.slice(0, 8).toUpperCase()} · {order.items.reduce((sum, item) => sum + item.quantity, 0)} articles · {money(order.total)}</p><p className="order-address"><MapPin size={13}/>{order.address}</p><small>{new Date(order.createdAt).toLocaleString("fr-MA", { timeZone: "UTC", dateStyle: "short", timeStyle: "short" })} UTC · paiement simulé à la livraison</small><div className="order-actions"><button className="text-button" onClick={() => { setActiveOrderId(order.id); setPanel("order"); }}>Voir le détail <ArrowUpRight size={15}/></button>{view === "merchant" && order.status === "pending" && <button className="primary small" disabled={busy} onClick={() => void updateOrder(order, "preparing")}>Accepter la commande</button>}{view === "merchant" && order.status === "preparing" && <button className="primary small" disabled={busy} onClick={() => void updateOrder(order, "ready")}>Prête à récupérer</button>}{view === "courier" && order.status === "ready" && <button className="primary small" disabled={busy} onClick={() => void updateOrder(order, "delivering")}>Confirmer la récupération</button>}{view === "courier" && order.status === "delivering" && <button className="primary small" disabled={busy} onClick={() => void updateOrder(order, "delivered")}>Confirmer la livraison</button>}</div></div></article>;
        })}</div>}
      </section>}
    </main>
    <footer className="footer container"><button className="brand" onClick={() => switchView("discover")}>wassel<span className="brand-dot">↗</span></button><p>Fait pour Casa. Avec le cœur.</p><div><button onClick={() => switchView("merchant")}>Espace restaurant</button><button onClick={() => switchView("courier")}>Espace livreur</button><button onClick={() => setPanel("about")}>À propos de la démo</button></div><small>© {new Date().getUTCFullYear()} Wassel Casa · prototype indépendant</small></footer>
    <nav className="mobile-nav" aria-label="Navigation mobile"><button className={view === "discover" ? "active" : ""} onClick={() => switchView("discover")}><Utensils size={20}/><span>Découvrir</span></button><button className={view === "favorites" ? "active" : ""} onClick={() => switchView("favorites")}><Heart size={20}/><span>Favoris</span></button><button className={view === "orders" ? "active" : ""} onClick={() => switchView("orders")}><Package size={20}/><span>Commandes</span></button><button onClick={() => setPanel("cart")}><span className="mobile-bag"><ShoppingBag size={20}/>{count > 0 && <b>{count}</b>}</span><span>Panier</span></button></nav>
    {toast && <div className="toast" role="status"><CheckCircle2 size={18}/><span>{toast}</span><button aria-label="Fermer le message" onClick={() => setToast("")}><X size={15}/></button></div>}
    {panel && <div className="modal-backdrop" onMouseDown={event => { if (event.target === event.currentTarget && !busy) setPanel(null); }}><div ref={dialogRef} className={`modal ${panel === "menu" ? "menu-modal" : ""}`} role="dialog" aria-modal="true" aria-labelledby="panel-title" tabIndex={-1}><button className="close-modal" aria-label="Fermer" disabled={busy} onClick={() => setPanel(null)}><X size={21}/></button>
      {panel === "address" && <div className="modal-body"><span className="modal-symbol"><MapPin size={28}/></span><div className="eyebrow">CASABLANCA, BIEN SÛR.</div><h2 id="panel-title">On vous livre où ?</h2><p>Choisissez votre quartier de démonstration. Le catalogue est identique dans les quartiers de test.</p><form onSubmit={event => { event.preventDefault(); savePreferences({ district }); setPanel(null); notify(`Quartier sélectionné : ${district}.`); }}><label>Quartier<select value={district} onChange={event => { setDistrict(event.target.value); requestKey.current = ""; }}>{districts.map(name => <option key={name}>{name}</option>)}</select></label><label>Rue, numéro, immeuble<input value={address} minLength={5} maxLength={250} onChange={event => { setAddress(event.target.value); requestKey.current = ""; }} placeholder="Ex. 24 rue du quartier, immeuble B" /></label><p className="field-hint">Utilisez une adresse fictive pour essayer le prototype.</p><button className="primary full">Confirmer le quartier <ArrowRight size={17}/></button></form></div>}
      {panel === "menu" && <><div className="menu-hero"><img src={selected.image} alt={selected.cuisine}/><span className="restaurant-tag">Adresse de démonstration</span></div><div className="modal-body"><div className="eyebrow">UNE BONNE ADRESSE À {district.toUpperCase()}</div><h2 id="panel-title">{selected.name}</h2><p>{selected.cuisine}</p><div className="menu-meta"><span><Star size={15}/>{selected.rating} (exemple)</span><span><Clock size={15}/>{selected.time}–{selected.time + 10} min estimés*</span><span><Bike size={16}/>{selected.delivery ? money(selected.delivery) : "Offerte"}</span></div><div className="menu-price-note"><ShieldCheck size={17}/><span>2 DH de service · livraison offerte dès 120 DH · total détaillé dans le panier.</span></div><h3 className="menu-section-title">Les envies du moment</h3><div className="menu-items">{selected.menu.map(item => <article className="menu-item" key={item.id}><div><h3>{item.name}{item.vegetarian && <Leaf size={13}/>}</h3><p>{item.description}</p><strong>{money(item.price)}</strong></div><div className="menu-item-image"><img src={item.image} alt="Photo d’illustration"/><button aria-label={`Ajouter ${item.name}`} onClick={() => addItem(selected, item.id)}><Plus size={20}/></button></div></article>)}</div>{count > 0 && <button className="primary full sticky-cart" onClick={() => setPanel("cart")}><ShoppingBag size={18}/>Voir mon panier ({count})<span>{pricing && money(pricing.total)}</span></button>}<p className="field-hint">* Délais et photos d’illustration. Aucune préparation réelle.</p></div></>}
      {panel === "cart" && <div className="modal-body"><div className="eyebrow">LE BONHEUR EST DANS LE PANIER.</div><h2 id="panel-title">{tr("Votre petite sélection.", "Panier dyalek.")}</h2>{!pricing || !cartRestaurant ? <div className="empty-state"><ShoppingBag size={38}/><h3>Il manque juste votre envie.</h3><p>Découvrez les menus et ajoutez ce qui vous fait plaisir.</p><button className="primary" onClick={() => { setPanel(null); switchView("discover"); }}>Explorer les adresses <ArrowRight size={16}/></button></div> : <><p className="cart-restaurant"><Store size={16}/>{cartRestaurant.name}</p><div className="cart-lines">{pricing.items.map(item => <div className="cart-line" key={item.id}><div><strong>{item.name}</strong><small>{money(item.price)} / unité</small></div><div className="quantity-control"><button aria-label={`Retirer une unité de ${item.name}`} onClick={() => changeQuantity(item.id, -1)}><Minus size={13}/></button><span>{item.quantity}</span><button disabled={item.quantity >= 20} aria-label={`Ajouter une unité de ${item.name}`} onClick={() => changeQuantity(item.id, 1)}><Plus size={13}/></button></div><strong>{money(item.price * item.quantity)}</strong></div>)}</div><div className="delivery-progress"><span><Bike size={16}/>{pricing.delivery === 0 ? "La livraison vous est offerte." : `Encore ${money(Math.max(0, 12000 - pricing.subtotal))} pour la livraison offerte.`}</span><div><i style={{ width: `${Math.min(100, pricing.subtotal / 120)}%` }}/></div></div><label>Quartier<select value={district} onChange={event => { setDistrict(event.target.value); savePreferences({ district: event.target.value }); requestKey.current = ""; }}>{districts.map(name => <option key={name}>{name}</option>)}</select></label><label>Adresse de test<input required minLength={5} maxLength={250} value={address} onChange={event => { setAddress(event.target.value); requestKey.current = ""; }} placeholder="Rue, numéro et immeuble fictifs" /></label><label>Quand ?<select value={slot} onChange={event => { setSlot(event.target.value); requestKey.current = ""; }}><option value="soon">Dès que possible (simulation)</option><option value="30">Dans environ 30 minutes (simulation)</option><option value="60">Dans environ une heure (simulation)</option></select></label><label>Une précision pour la livraison ?<textarea value={note} maxLength={350} onChange={event => { setNote(event.target.value); requestKey.current = ""; }} placeholder="Ex. Sonner à l’interphone B. Aucun vrai livreur ne sera contacté." rows={2}/></label><div className="promo-input"><Tag size={17}/><input aria-label="Code promotionnel" placeholder="Un code promo ? Essayez CASA10" value={promoInput} maxLength={20} onChange={event => setPromoInput(event.target.value)}/><button onClick={() => { const code = promoInput.trim().toUpperCase(); setPromo(code); requestKey.current = ""; notify(code === "CASA10" ? pricing.subtotal >= 8000 ? "Réduction de 10 DH appliquée." : "CASA10 sera appliqué dès 80 DH d’articles." : "Code inconnu. Essayez CASA10."); }}>Appliquer</button></div><div className="price-breakdown"><div><span>Articles</span><span>{money(pricing.subtotal)}</span></div><div><span>Livraison</span><span>{pricing.delivery ? money(pricing.delivery) : "Offerte"}</span></div><div><span>Frais de service fixes</span><span>{money(pricing.service)}</span></div>{pricing.discount > 0 && <div className="discount"><span>Code CASA10</span><span>−{money(pricing.discount)}</span></div>}<div className="total"><strong>Total</strong><strong>{money(pricing.total)}</strong></div></div><div className="payment-note"><ShieldCheck size={19}/><div><strong>Paiement à la livraison · simulé</strong><small>Aucune somme ne sera débitée. Aucun commerce ne sera contacté.</small></div></div>{authNeeded && <a className="signin-link" href="/signin-with-chatgpt?return_to=/" target="_top">Se connecter pour enregistrer la commande <ArrowUpRight size={14}/></a>}<button disabled={busy || address.trim().length < 5 || authNeeded} className="primary full checkout-button" onClick={() => void checkout()}>{busy ? <LoaderCircle className="spin" size={19}/> : <ShoppingBag size={18}/>}Créer la commande de test<span>{money(pricing.total)}</span></button><p className="field-hint">Commande enregistrée dans votre espace privé. Changez ensuite de rôle pour tester la préparation et la livraison.</p></>}</div>}
      {panel === "order" && <div className="modal-body">{activeOrder ? <><div className="order-success-icon"><CheckCircle2 size={34}/></div><div className="eyebrow">COMMANDE DE DÉMONSTRATION</div><h2 id="panel-title">{activeOrder.status === "delivered" ? "Bssaha !" : activeOrder.status === "cancelled" ? "Commande annulée." : "Votre envie prend forme."}</h2><p>#{activeOrder.id.slice(0, 8).toUpperCase()} · {restaurants.find(restaurant => restaurant.id === activeOrder.restaurantId)?.name}</p><div className="route-illustration"><div className="map-grid"/><span className="map-neighborhood">CASABLANCA · {district.toUpperCase()}</span><div className="map-path"/><span className="map-store"><Store size={24}/></span><span className="map-bike"><Bike size={28}/></span><span className="map-home"><MapPin size={25}/></span><small>Illustration · aucun suivi GPS réel</small></div><ol className="timeline">{statuses.map((status, index) => <li key={status} className={activeOrder.status !== "cancelled" && index <= statuses.indexOf(activeOrder.status) ? "complete" : ""}><span>{activeOrder.status !== "cancelled" && index <= statuses.indexOf(activeOrder.status) ? <Check size={12}/> : index + 1}</span><div><strong>{statusLabels[status]}</strong>{status === activeOrder.status && <small>État actuel · mis à jour par vos actions dans la démo</small>}</div></li>)}</ol><div className="order-detail"><strong><MapPin size={16}/>{activeOrder.address}</strong>{activeOrder.note && <p>{activeOrder.note}</p>}<p>{activeOrder.slot === "soon" ? "Dès que possible" : `Créneau demandé : dans ${activeOrder.slot} minutes`} · simulation</p></div><div className="price-breakdown">{activeOrder.items.map(item => <div key={item.id}><span>{item.quantity} × {item.name}</span><span>{money(item.price * item.quantity)}</span></div>)}<div><span>Livraison + service</span><span>{money(activeOrder.delivery + activeOrder.service)}</span></div>{activeOrder.discount > 0 && <div className="discount"><span>Réduction</span><span>−{money(activeOrder.discount)}</span></div>}<div className="total"><strong>Total simulé</strong><strong>{money(activeOrder.total)}</strong></div></div>{activeOrder.status === "pending" && <button className="secondary full" disabled={busy} onClick={() => void updateOrder(activeOrder, "cancelled")}>Annuler cette commande de test</button>}<div className="next-step"><h3>Faites avancer votre commande</h3><p>Ouvrez l’espace restaurant pour accepter et préparer, puis l’espace livreur pour simuler le trajet.</p><div><button className="text-button" onClick={() => switchView("merchant")}><Store size={16}/>Restaurant <ArrowUpRight size={14}/></button><button className="text-button" onClick={() => switchView("courier")}><Bike size={17}/>Livreur <ArrowUpRight size={14}/></button></div></div><details className="support-box"><summary><MessageCircle size={17}/>Un souci ? Tester un signalement</summary>{activeOrder.issue && <p className="saved-issue">Signalement enregistré : {activeOrder.issue}</p>}<textarea aria-label="Décrire un problème de test" maxLength={500} rows={3} value={issue} onChange={event => setIssue(event.target.value)} placeholder="Décrivez un problème fictif…"/><button className="secondary full" disabled={busy || issue.trim().length < 5} onClick={() => void sendIssue(activeOrder)}>Enregistrer le signalement de test</button><p className="field-hint">Stocké avec votre commande. Aucun support réel n’est contacté.</p></details></> : <><h2 id="panel-title">Retrouver la commande</h2><p>Actualisez vos commandes pour retrouver le détail.</p><button className="primary" onClick={() => void loadOrders()}>Actualiser</button></>}</div>}
      {panel === "about" && <div className="modal-body"><div className="eyebrow">MN CASA, B L’7OB.</div><h2 id="panel-title">Une autre idée de la livraison.</h2><p>Wassel Casa est un prototype indépendant conçu pour explorer une expérience de livraison locale, simple et transparente.</p><div className="about-points"><div><ShieldCheck/><span><strong>Le total, sans devinette.</strong>Les articles, la livraison, le service et les réductions sont affichés séparément avant la commande.</span></div><div><Store/><span><strong>Les trois côtés de l’expérience.</strong>Testez le parcours client, la préparation restaurant et la livraison avec vos propres commandes.</span></div><div><Heart/><span><strong>Un peu plus de Casa.</strong>Navigation française ou darija en caractères latins, prix en dirhams et quartiers de Casablanca. Les menus restent en français.</span></div></div><div className="demo-explainer"><strong>Ce que vous essayez</strong><p>Les enseignes, menus, avis, prix et délais sont fictifs. Les commandes sont enregistrées dans votre espace privé. Les changements d’état sont manuels. Il n’y a ni paiement, ni vrai livreur, ni intégration Glovo.</p></div><button className="primary full" onClick={() => setPanel(null)}>C’est parti <ArrowRight size={18}/></button></div>}
    </div></div>}
  </div>;
}
