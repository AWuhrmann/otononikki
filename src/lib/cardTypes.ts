import Counter from '../components/cards/BasicCounter.svelte';
import CardTimer from '../components/cards/CardTimer.svelte';

import type { Component } from 'svelte';
  
export type CardType = 'number' | 'timer' | 'default';

export const cardComponents: Record<CardType, Component> = {
  'number': Counter,
  'timer': CardTimer,
  'default': Counter
};