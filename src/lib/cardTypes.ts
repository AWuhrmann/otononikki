import Counter from "$components/stats/BasicCounter.svelte";
import CardTimer from "$components/stats/CardTimer.svelte";

import type { Component } from "svelte";

export type CardType = "Counter" | "Timer" | "default"; // Name of the different card categories we can have

export const cardComponents: Record<CardType, Component<any>> = { // Dictionnary of name / class for each card category.
  Counter: Counter,
  Timer: CardTimer,
  default: Counter,
};

