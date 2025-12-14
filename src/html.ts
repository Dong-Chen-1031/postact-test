type Argument = null | undefined | boolean | number | string;

function html(tsa: TemplateStringsArray, ...values: Argument[]) {
  let index = 0;
  const container = window.document.createDocumentFragment();

  for (const slice of tsa) {
  }
}

class HtmlParser {
  #strings: TemplateStringsArray;
  #values: Argument[];
  #tsaIdx: number;
  #idx: number;

  constructor(strings: TemplateStringsArray, values: Argument[]) {
    this.#strings = strings;
    this.#values = values;
    this.#tsaIdx = 0;
    this.#idx = 0;
  }

  next(): string | null {
    if (this.#tsaIdx >= this.#strings.length) return null;
    if (this.#idx >= this.#strings[this.#tsaIdx]!.length) return null;

    const templateStr = this.#strings[this.#tsaIdx]!;
    const value = templateStr[this.#idx]!;

    this.#idx = (this.#idx + 1) % templateStr.length;
    this.#tsaIdx += this.#idx == 0 ? 1 : 0;

    return value;
  }
}
