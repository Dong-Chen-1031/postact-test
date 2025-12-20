import { route, html, select } from "./src";

route("/", (ctx) => {
  select("#app").render(html`
    <h1>Hello!</h1>
    <p>Now go to /name/&lt;your name&gt;</p>
  `);
});

route("/name/:username", (ctx) => {
  const { username } = ctx.params;
  select("#app").render(html`<h1>Hello ${username}</h1>`);
});
