import { error, json } from "@sveltejs/kit";
import { pool } from "$lib/server/db";

export async function POST({ locals, request }) {
  const session = await locals.getSession();
  if (!session?.user) {
    throw error(401, "Not authenticated");
  }

  try {
    // Parse the request body
    const { user_id, card_id, setting_name, setting_value } =
      await request.json();
    console.log(
      `Changing settings ${setting_name} of user ${user_id} with ${setting_value}`,
    );

    const existingValue = await pool.query(
      `SELECT id FROM cards WHERE id = $1`,
      [Number(card_id)],
    );

    if (existingValue.rowCount === 0) {
      throw error(404, "Card not found");
    }
    if (setting_name === "name") {
      await pool.query(
        `UPDATE cards
             SET name = $3
             WHERE id = $1 AND user_id = $2
             RETURNING *`,
        [Number(card_id), user_id, setting_value],
      );
    } else {
      await pool.query(
        `INSERT INTO card_settings (card_id, name, value)
                 VALUES ($1, $2, $3)
                 ON CONFLICT (card_id, name) 
                 DO UPDATE SET value = $3
                 RETURNING *`,
        [Number(card_id), setting_name, setting_value],
      );
    }

    return json({ success: true, action: "updated" });
  } catch (error) {
    console.error("Error managing card values:", error);
    return json(
      {
        success: false,
      },
      { status: 500 },
    );
  }
}

