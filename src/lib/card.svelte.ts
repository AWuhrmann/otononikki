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
  name = $state<string>('');
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

export async function saveCard(card: CardState, value: number) {

  const response = await fetch(`/api/cards/${card.id}/values`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ user_id: card.userId, card_id: card.id, value: value })
  });
  return response.json();
}

export async function updateCardProps(card_id: number, user_id: number, name: string, value: any){

  if(name === 'name') {

    cards.update((l) => {
      const cardIndex = l.findIndex(card => card.id === card_id);
      if (cardIndex !== -1) {
        l[cardIndex].name = value;
      }
      return l;
    });

  } else {

    cards.update((l) => {
      const cardIndex = l.findIndex(card => card.id === card_id);
      if (cardIndex !== -1) {
      l[cardIndex].settings[name] = value;
      }
      return l;
    });

  }

  const response = await fetch(`/api/cards/${card_id}/settings/update`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ user_id: user_id, card_id: card_id, setting_name: name, setting_value: value })
  });
  return response.json();

}

export async function deleteCard(id: number) {

  console.log(id);

  cards.update((l) => l.filter(card => card.id !== id));

  return;

  const response = await fetch(`/api/cards/${card.id}/delete`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ user_id: card.userId, card_id: card.id })
  });
  return response.json();

}

export let cards = writable<CardState[]>([]);

export async function load(name: string) {
  const response = await fetch(`/api/users/${name}`);
  const data = await response.json();
  // Update the nested cards array
  cards.set(data.cards);
}