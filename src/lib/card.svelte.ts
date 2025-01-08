
export type CardSettings = Record<string, string | number | boolean>;

interface CardValue {
  value: number;
  date: Date;
}

export class CardState {
  userId = $state<number>(0);
  id = $state<number>(0);
  name = $state<string>('');
  settings = $state<Record<string, any>>({});
  values = $state<CardValue[]>([]);

  constructor(data?: any) {
    if (data) {
      this.id = data.id;
      this.name = data.name;
      this.settings = data.settings || {};
      this.values = data.values || {};
    }
  }
}

export async function saveCard(card: CardState, value: number) {
  console.log('Saving !')

  const response = await fetch(`/api/cards/${card.id}/values`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({user_id: card.userId, card_id: card.id, value: value})
  });
  return response.json();
}