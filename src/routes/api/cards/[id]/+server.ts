import { error, json } from "@sveltejs/kit";
import { pool } from "$lib/server/db";
import { CardState } from "$lib/card.svelte";

export async function GET({ locals, params }: any) {
  const session = await locals.getSession();
  if (!session?.user) {
    throw error(401, "Not authenticated");
  }

  try {
    const { card_id } = params;
    console.log("asking to see id : ");

    const existing = await pool.query(
      `SELECT c.*,
    ARRAY_AGG(
        CASE 
            WHEN cv.id IS NOT NULL 
            THEN json_build_object('value', cv.value, 'timestamp', cv.updated_at)
        END ORDER BY cv.updated_at ASC
    ) FILTER (WHERE cv.id IS NOT NULL) as values,
    ARRAY_AGG(
        CASE 
            WHEN cs.id IS NOT NULL 
            THEN json_build_object('name', cs.name, 'value', cs.value)
        END
    ) FILTER (WHERE cs.id IS NOT NULL) as settings
FROM cards c
LEFT JOIN card_values cv ON cv.card_id = c.id
LEFT JOIN card_settings cs ON cs.card_id = c.id
WHERE c.id = $1 AND c.user_id = $2
GROUP BY c.id, c.user_id;`,
      [card_id, session.user.id],
    );

    const card = existing.rows[0];

    const cardState = new CardState({
      userId: session.user.id,
      id: card_id,
      name: card.name || "",
      settings:
        card.settings?.reduce(
          (acc, item) => {
            acc[item.name] = item.value;
            return acc;
          },
          {} as Record<string, number>,
        ) || {},
      values:
        card.values?.map((v) => ({
          value: v.value,
          timestampe: new Date(v.timestamp),
        })) || [],
    });

    return json({ cardState });
  } catch (error) {
    console.error("Error fetching card by id:", error);
    return json(
      {
        success: false,
      },
      { status: 500 },
    );
  }
}

