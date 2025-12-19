import { html, route, select } from "./src";

route("/", () => {
  select("#app").render(
    html`<h1>hey</h1>
      ${"hello"}`,
  );
});
