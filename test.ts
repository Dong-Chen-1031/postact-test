import { dependent, state } from "./src";

const $count = state(0);
const $dep = dependent.later($count, async () => {
  return "hello";
});

$dep.subscribe((value) => {
  console.log("finally", value);
});
