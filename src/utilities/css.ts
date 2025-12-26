export function css(styles: Partial<CSSStyleDeclaration>): string;

export function css(tsa: TemplateStringsArray, ...args: string[]): string;

export function css(
  arg0: Partial<CSSStyleDeclaration> | TemplateStringsArray,
  ...args: string[]
): string {
  if (Array.isArray(arg0)) {
    return arg0
      .reduce((accu, current, idx) => accu + current + args[idx], "")
      .trim();
  } else {
    return Object.entries(arg0).reduce(
      (acc, [k, v]) => acc + `${k}: ${v};`,
      "",
    );
  }
}
