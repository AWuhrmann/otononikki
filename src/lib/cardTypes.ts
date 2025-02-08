import Counter from '../components/cards/BasicCounter.svelte';
import CardTimer from '../components/cards/CardTimer.svelte';

import type { Component } from 'svelte';
  
export type CardType = 'Counter' | 'Timer' | 'default';

export const cardComponents: Record<CardType, Component<any>> = {
  'Counter': Counter,
  'Timer': CardTimer,
  'default': Counter
};