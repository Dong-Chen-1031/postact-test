import { select, html, type VirtualItem, state, dependent } from "./src";

function createApp(): VirtualItem {
  return html` <div>Hello</div> `;
}

select("#app").render(createApp());
