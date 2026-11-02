import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { getDb } from "../../../../db";
import { orders } from "../../../../db/schema";
import { getChatGPTUser } from "../../../chatgpt-auth";
export const dynamic = "force-dynamic";
const inputSchema = z.discriminatedUnion("action", [z.object({ action: z.literal("status"), from: z.enum(["pending", "preparing", "ready", "delivering"]), to: z.enum(["preparing", "ready", "delivering", "delivered", "cancelled"]) }), z.object({ action: z.literal("support"), message: z.string().trim().min(5).max(500) })]);
const transitions: Record<string, string[]> = { pending: ["preparing", "cancelled"], preparing: ["ready"], ready: ["delivering"], delivering: ["delivered"] };
const json = (body: unknown, status = 200) => Response.json(body, { status, headers: { "Cache-Control": "no-store" } });
export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const user = await getChatGPTUser();
  if (!user) return json({ error: "Connexion nécessaire." }, 401);
  if (request.headers.get("origin") !== new URL(request.url).origin) return json({ error: "Origine non autorisée." }, 403);
  const { id } = await context.params;
  let input;
  try { const raw = await request.text(); if (raw.length > 2048) return json({ error: "Demande trop volumineuse." }, 413); input = inputSchema.safeParse(JSON.parse(raw)); }
  catch { return json({ error: "Demande invalide." }, 400); }
  if (!input.success) return json({ error: "Action invalide." }, 400);
  try {
    const db = getDb(); const ownership = and(eq(orders.id, id), eq(orders.owner, user.userId));
    const [order] = await db.select().from(orders).where(ownership).limit(1);
    if (!order) return json({ error: "Commande introuvable." }, 404);
    if (input.data.action === "support") { await db.update(orders).set({ issue: input.data.message, updatedAt: Date.now() }).where(ownership); return json({ ok: true }); }
    const { from, to } = input.data;
    if (!transitions[from]?.includes(to)) return json({ error: "Ce changement d’état n’est pas autorisé." }, 400);
    const result = await db.update(orders).set({ status: to, updatedAt: Date.now() }).where(and(ownership, eq(orders.status, from))).returning({ id: orders.id });
    return result.length ? json({ ok: true }) : json({ error: "Cette commande a changé. Actualisez pour continuer." }, 409);
  } catch { return json({ error: "Action indisponible. Réessayez." }, 503); }
}
