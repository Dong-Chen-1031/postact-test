import { ensureWindow } from "./utilities";

// [ai-generated content]
type ExtractRouteParams<Path extends string> =
  Path extends `${string}:${infer Param}/${infer Rest}`
    ? { [K in Param | keyof ExtractRouteParams<`/${Rest}`>]: string }
    : Path extends `${string}:${infer Param}`
      ? { [K in Param]: string }
      : {};
// [/ai-generated content]

export interface RouteContext<Path extends string> {
  /**
   * Route parameters.
   * For instance, if your path is `/hello/:name`, then you will
   * have a field called `name` with type of `string`.
   *
   * @example
   * ```ts
   * route("/explore/:username/:project", (ctx) => {
   *   const { username, project } = ctx.params;
   *   console.log(`A project of id ${project}, made by @${username}`);
   * })
   * ```
   */
  params: ExtractRouteParams<Path>;
}

/**
 * Handle a route if matches the current path (`window.location.pathname`).
 * **Client-side only.**
 *
 * @param route The route. (e.g., `/hello`, `/user/:id`, `/any/*`)
 * @param handler The handler.
 */
export function route<Path extends string>(
  route: Path,
  handler: (ctx: RouteContext<Path>) => void,
): void {
  ensureWindow();

  const pathSplits = window.location.pathname.split("/");
  const args = route.split("/");
  const params: Record<string, string> = {};

  for (let i = 0; i < pathSplits.length; i++) {
    if (i >= args.length) return;

    const split = decodeURIComponent(pathSplits[i]);
    const arg = args[i];

    if (arg.startsWith(":")) {
      if (!split) return;
      const name = arg.slice(1);
      params[name] = split;
    } else if (arg == "*") {
      // @ts-ignore
      handler({ params });
      return;
    } else if (arg != split) {
      return;
    }
  }

  if (pathSplits.length !== args.length) return;

  // @ts-ignore no worries mate
  handler({ params });
}
