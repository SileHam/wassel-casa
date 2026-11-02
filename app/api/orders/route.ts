import { and, desc, eq } from "drizzle-orm";
import { z } from "zod";
import { getDb } from "../../../db";
import { orders } from "../../../db/schema";
import { getChatGPTUser } from "../../chatgpt-auth";
import { districts, quote, restaurants } from "../../../lib/catalog";
export const dynamic = "force-dynamic";
const inputSchema = z.object({ requestKey: z.string().uuid(), restaurantId: z.string().max(30), lines: z.array(z.object({ id: z.string().max(40), quantity: z.number().int().min(1).max(20) })).min(1).max(20), district: z.enum(districts as [string, ...string[]]), address: z.string().trim().min(5).max(250), note: z.string().trim().max(350).default(""), slot: z.enum(["soon", "30", "60"]), promo: z.string().max(20).default("") });
const json = (body: unknown, status = 200) => Response.json(body, { status, headers: { "Cache-Control": "no-store" } });
export async function GET() {
  const user = await getChatGPTUser();
  if (!user) return json({ error: "Connectez-vous pour retrouver vos commandes de démonstration." }, 401);
  try {
    const rows = await getDb().select().from(orders).where(eq(orders.owner, user.userId)).orderBy(desc(orders.createdAt)).limit(100);
    return json({ orders: rows.map(({ owner: _owner, requestKey: _key, ...row }) => ({ ...row, items: JSON.parse(row.items) })) });
  } catch { return json({ error: "Les commandes sont indisponibles. Réessayez dans un instant." }, 503); }
}
export async function POST(request: Request) {
  const user = await getChatGPTUser();
  if (!user) return json({ error: "Connectez-vous pour créer une commande de démonstration." }, 401);
  if (request.headers.get("origin") !== new URL(request.url).origin) return json({ error: "Origine non autorisée." }, 403);
  let body;
  try { const text = await request.text(); if (text.length > 8192) return json({ error: "Demande trop volumineuse." }, 413); body = inputSchema.safeParse(JSON.parse(text)); }
  catch { return json({ error: "Demande invalide." }, 400); }
  if (!body.success) return json({ error: "Vérifiez votre adresse et les articles du panier." }, 400);
  const input = body.data;
  const restaurant = restaurants.find(item => item.id === input.restaurantId);
  if (!restaurant || new Set(input.lines.map(line => line.id)).size !== input.lines.length) return json({ error: "Panier invalide." }, 400);
  let pricing;
  try { pricing = quote(restaurant, input.lines, input.promo); } catch { return json({ error: "Un article n’est plus disponible." }, 400); }
  try {
    const db = getDb();
    const existing = await db.select({ id: orders.id }).from(orders).where(and(eq(orders.owner, user.userId), eq(orders.requestKey, input.requestKey))).limit(1);
    if (existing.length) return json({ id: existing[0].id });
    const id = crypto.randomUUID(); const now = Date.now();
    await db.insert(orders).values({ id, owner: user.userId, requestKey: input.requestKey, restaurantId: restaurant.id, ...pricing, items: JSON.stringify(pricing.items), address: `${input.address}, ${input.district}, Casablanca`, note: input.note, slot: input.slot, status: "pending", createdAt: now, updatedAt: now }).onConflictDoNothing();
    const saved = await db.select({ id: orders.id }).from(orders).where(and(eq(orders.owner, user.userId), eq(orders.requestKey, input.requestKey))).limit(1);
    return json({ id: saved[0].id }, 201);
  } catch { return json({ error: "La commande n’a pas pu être enregistrée. Réessayez avec le même panier." }, 503); }
}
