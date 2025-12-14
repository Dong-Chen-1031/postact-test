import { html, select } from "./src";
import { virtualItemToFragment } from "./src/vdom/client";

const fragment = virtualItemToFragment(
  html`<div>
    <h1 style="color: red;">hello, world!!</h1>
    Tomorrow is going to be a great day! Take a look at this number: ${67}.
    <p>Are you happy?</p>
  </div>`,
);
select("#app").appendChild(fragment);
