import { json } from '@sveltejs/kit';
import { pool } from '$lib/server/db';

export async function GET({ params }) {

    console.log('test');

  const { id } = params;

  // differentiate the case where id is a number or a string

  const cardResult = await pool.query(
    `SELECT uc.*, ct.name as template_name 
     FROM user_cards uc 
     JOIN card_templates ct ON uc.template_id = ct.id 
     WHERE uc.id = $1`,
    [id]
  );
  
  const card = cardResult.rows[0];

  console.log(card);

  return json({...card});

  const valuesResult = await pool.query(
    `SELECT setting_name, value 
     FROM card_values 
     WHERE card_id = $1`,
    [id]
  );

  const settingsResult = await pool.query(
    `SELECT cts.* 
     FROM card_template_settings cts
     JOIN user_cards uc ON cts.template_id = uc.template_id
     WHERE uc.id = $1`,
    [id]
  );

  const values = valuesResult.rows.reduce((acc, row) => {
    acc[row.setting_name] = row.value;
    return acc;
  }, {});
  const settings = settingsResult.rows.reduce((acc, row) => {
    acc[row.setting_name] = {
      type: row.setting_type,
      default: row.default_value,
      required: row.required
    };
    return acc;
  }, {});

  return json({ ...card, values, settings });
}