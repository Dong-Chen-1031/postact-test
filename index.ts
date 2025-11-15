import { select, state } from "./src/index.ts";

const $count = state<number>(0);
const btn = select<HTMLButtonElement>("button");

btn.subscribe("click", () => {
  $count.update((i) => i + 1);
  btn.render({
    tag: "h1",
    children: [`${$count.value}`],
  });
});
