import { z } from "zod";
export type MenuItem = { id: string; name: string; description: string; price: number; image: string; vegetarian?: boolean };
export type Restaurant = { id: string; name: string; category: string; cuisine: string; time: number; rating: number; reviews: number; delivery: number; image: string; color: string; tag?: string; menu: MenuItem[] };
const img = (name: string) => `/images/${name}.jpg`;
export const restaurants: Restaurant[] = [
  { id: "beldi", name: "Beldi & Bon", category: "Marocain", cuisine: "Cuisine marocaine · Fait maison", time: 25, rating: 4.9, reviews: 128, delivery: 1200, image: img("moroccan"), color: "#e9d7bc", tag: "Le goût de chez nous", menu: [
    { id: "tajine", name: "Tajine poulet citron", description: "Poulet mijoté, citron confit, olives et pain beldi.", price: 5900, image: img("moroccan") },
    { id: "couscous", name: "Couscous aux 7 légumes", description: "Semoule légère, légumes de saison et bouillon maison.", price: 4900, image: img("salad"), vegetarian: true },
    { id: "salade", name: "Salade marocaine", description: "Tomates, concombre, oignon rouge et huile d’olive.", price: 1900, image: img("salad"), vegetarian: true },
    { id: "the", name: "Thé à la menthe", description: "Menthe fraîche, préparé à la commande.", price: 1500, image: img("coffee"), vegetarian: true },
  ] },
  { id: "smash", name: "Smash Society", category: "Burgers", cuisine: "Burgers smashés · Street food", time: 20, rating: 4.8, reviews: 214, delivery: 900, image: img("burger"), color: "#f4d68b", tag: "Le favori du quartier", menu: [
    { id: "classic", name: "Le Casa Smash", description: "Double bœuf, cheddar, pickles et sauce signature.", price: 5500, image: img("burger") },
    { id: "chicken", name: "Crispy Chicken", description: "Poulet croustillant, salade et mayonnaise épicée.", price: 4900, image: img("burger") },
    { id: "fries", name: "Frites maison", description: "Pommes de terre dorées, sel et paprika doux.", price: 1800, image: img("fries"), vegetarian: true },
    { id: "drink", name: "Citronnade maison", description: "Citron frais, menthe et une touche de sucre.", price: 1600, image: img("coffee"), vegetarian: true },
  ] },
  { id: "napoli", name: "Ciao Napoli", category: "Pizza", cuisine: "Pizza au feu de bois · Italien", time: 30, rating: 4.7, reviews: 96, delivery: 0, image: img("pizza"), color: "#f4b8a3", tag: "Livraison offerte", menu: [
    { id: "margherita", name: "Margherita", description: "Tomate San Marzano, mozzarella et basilic frais.", price: 6500, image: img("pizza"), vegetarian: true },
    { id: "burrata", name: "La Burrata", description: "Burrata crémeuse, tomates cerises et roquette.", price: 8500, image: img("pizza"), vegetarian: true },
    { id: "tiramisu", name: "Tiramisu maison", description: "Mascarpone, café et cacao.", price: 2900, image: img("dessert"), vegetarian: true },
  ] },
  { id: "green", name: "Green Mood", category: "Healthy", cuisine: "Bowls colorés · Frais & de saison", time: 20, rating: 4.9, reviews: 87, delivery: 900, image: img("salad"), color: "#d5dfba", tag: "Une pause fraîcheur", menu: [
    { id: "bowl", name: "Le Green Bowl", description: "Quinoa, avocat, pois chiches, crudités et sauce tahini.", price: 5800, image: img("salad"), vegetarian: true },
    { id: "wrap", name: "Wrap falafel", description: "Falafels, houmous et légumes croquants.", price: 4200, image: img("salad"), vegetarian: true },
    { id: "smoothie", name: "Smoothie mangue", description: "Mangue, banane et lait d’avoine.", price: 2800, image: img("coffee"), vegetarian: true },
  ] },
  { id: "crumb", name: "Crumb Club", category: "Sucré", cuisine: "Cookies encore chauds · Pâtisserie", time: 25, rating: 4.8, reviews: 65, delivery: 900, image: img("dessert"), color: "#dec9e4", tag: "Petit bonheur, grande envie", menu: [
    { id: "cookie", name: "Cookie chocolat fondant", description: "Chocolat noir, fleur de sel et cœur généreux.", price: 2200, image: img("dessert"), vegetarian: true },
    { id: "box", name: "La boîte à partager", description: "Six cookies, trois parfums.", price: 9900, image: img("dessert"), vegetarian: true },
    { id: "latte", name: "Iced latte", description: "Double espresso et lait frais sur glaçons.", price: 2500, image: img("coffee"), vegetarian: true },
  ] },
  { id: "market", name: "Le Panier du Coin", category: "Courses", cuisine: "Épicerie de quartier · Essentiels", time: 15, rating: 4.6, reviews: 113, delivery: 800, image: img("market"), color: "#dfe8c4", menu: [
    { id: "fruit", name: "Panier de fruits de saison", description: "Un assortiment de fruits frais, environ 1 kg.", price: 3500, image: img("market"), vegetarian: true },
    { id: "breakfast", name: "Le petit-déjeuner beldi", description: "Msemen, pain, miel et fromage frais, pour deux.", price: 4500, image: img("moroccan"), vegetarian: true },
    { id: "water", name: "Eau minérale 1,5 L", description: "Une bouteille d’eau minérale.", price: 700, image: img("market"), vegetarian: true },
  ] },
];
export const districts = ["Maârif", "Gauthier", "Bourgogne", "Racine", "Oasis", "Sidi Maârouf", "Aïn Diab", "Belvédère"];
export const statuses = ["pending", "preparing", "ready", "delivering", "delivered"] as const;
export type Status = typeof statuses[number] | "cancelled";
export type CartLine = { id: string; quantity: number };
export const orderSchema = z.object({ id: z.string(), restaurantId: z.string(), items: z.array(z.object({ id: z.string(), name: z.string(), price: z.number(), quantity: z.number().int() })), subtotal: z.number(), delivery: z.number(), service: z.number(), discount: z.number(), total: z.number(), address: z.string(), note: z.string(), slot: z.string(), status: z.enum(["pending", "preparing", "ready", "delivering", "delivered", "cancelled"]), issue: z.string().nullable(), createdAt: z.number(), updatedAt: z.number() });
export type Order = z.infer<typeof orderSchema>;
export const apiResponseSchema = z.object({ error: z.string().default("Le service est indisponible. Réessayez."), id: z.string().default(""), orders: z.array(orderSchema).default([]) });
export const money = (cents: number) => `${(cents / 100).toLocaleString("fr-MA", { maximumFractionDigits: 2 })} DH`;
export function quote(restaurant: Restaurant, lines: CartLine[], promo = "") {
  const items = lines.map(line => {
    const item = restaurant.menu.find(item => item.id === line.id);
    if (!item || !Number.isInteger(line.quantity) || line.quantity < 1 || line.quantity > 20) throw new Error("Article ou quantité invalide.");
    return { id: item.id, name: item.name, price: item.price, quantity: line.quantity };
  });
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const delivery = subtotal >= 12000 ? 0 : restaurant.delivery;
  const service = items.length ? 200 : 0;
  const discount = promo.toUpperCase() === "CASA10" && subtotal >= 8000 ? 1000 : 0;
  return { items, subtotal, delivery, service, discount, total: subtotal + delivery + service - discount };
}
