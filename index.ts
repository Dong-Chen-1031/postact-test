import { html, select, state, type VirtualItem } from "./src";

function createApp(): VirtualItem {
  const $count = state(0);
  const $text = state("Hello");

  $count.subscribe(function su(change) {
    if ($count.value > 2) $count.unsubscribe(su);
    $text.update(change.toString());
  });

  return html`<div>
    <button onclick=${() => $count.update((v) => v + 1)}>${$count}</button>
    <div>${$text}</div>
  </div>`;
}

select("#app").render(createApp());
