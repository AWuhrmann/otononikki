import { writable } from "svelte/store";

export type CardSettings = Record<string, string | number | boolean>;

// List of interesting setting to have
// Starting value, Min, max values
// When to save (daily, each change)
// auto Reset ?
// Goal settings ?
// increment (decrement) only
// Average per day / all values
// Show every x days ?
// display of the card (for counter, etc.)
// "Progress Stories" letting you attach notes to significant changes
// Unit
// Display size (small, etc.)

interface CardValue {
  value: number;
  date: Date;
}

export class CardState {
  userId = $state<number>(0);
  id = $state<number>(0);
  name = $state<string>("");
  settings = $state<Record<string, any>>({});
  values = $state<CardValue[]>([]);

  constructor(data?: any) {
    if (data) {
      this.id = data.id;
      this.userId = data.userId;
      this.name = data.name;
      this.settings = data.settings || {};
      this.values = data.values || {};
    }
  }
}

export class Cards {
 cards = $state<{value: CardState[]}>({ value: []});
 
 async saveCard(card: CardState, value: number) {
  const response = await fetch(`/api/cards/${card.id}/values`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      user_id: card.userId,
      card_id: card.id,
      value: value,
    }),
  });
  return response.json();
}

async updateCardProps(
  card_id: number,
  user_id: number,
  name: string,
  value: any,
) {
  if (name === "name") {
    this.cards.value = this.cards.value.map(c => {
      if (c.id === card_id)
        {
          c.name = value;
        }
      return c
      }
    );
  } else {
    this.cards.value = this.cards.value.map(c => {
      if (c.id === card_id)
        {
          c.settings[name] = value;
        }
      return c
      }
    );
  }

  const response = await fetch(`/api/cards/${card_id}/settings/update`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      user_id: user_id,
      card_id: card_id,
      setting_name: name,
      setting_value: value,
    }),
  });
  return response.json();
}

async deleteCard(id: number) {

  this.cards.value = this.cards.value.filter((card) => card.id !== id);
  
  const response = await fetch(`/api/cards/${id}/delete`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ card_id: id }),
  });
  return response.json();
}

async createCard(
  name: string,
  color: string,
  type: string,
  settings: CardSettings[],
) {
  let response = await fetch(`/api/cards/new`, {
    method: "POST",
    body: JSON.stringify({
      name: name,
      color: color,
      type: type,
      settings: settings,
    }),
    headers: {
      "Content-type": "application/json; charset=UTF-8",
    },
  });

  const data_id = await response.json();
  const card_id = data_id.card_id;
  const user_id = data_id.user_id;

  settings.push({'color': color})
  settings.push({'type': type})

  let card = new CardState({
    name: name,
    userId: user_id,
    id: card_id,
    settings: settings,
    values: [],
  });

  console.log(card);

  this.cards.value.push(card);
}

 async load(name: string) {
  console.log('loading')
   const response = await fetch(`/api/users/${name}`);
   const data = await response.json();
   // Update the nested cards array
   this.cards.value = data.cards;

   console.log(this.cards.value)
 }

}

export const cardStore = new Cards();



