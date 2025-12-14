type Argument = null | undefined | boolean | number | string;

function html(tsa: TemplateStringsArray, ...values: Argument[]): HTMLParser {
  return new HTMLParser(tsa, values);
}

enum ParserStatus {
  TagName,
  Children,
  TagClose,
}

class ParseError extends Error {
  constructor(reason: string) {
    super(reason);
  }

  static noInsertInTagNames(): ParseError {
    return new ParseError("`${...}` is not allowed in tag names");
  }

  static noInsertInAttrNames(): ParseError {
    return new ParseError("`${...}` is not allowed in attribute names");
  }

  static invalidCharacterInTagName(chr: string): ParseError {
    return new ParseError(`${chr} is not a valid html tag character`);
  }

  static expectedQuote(): ParseError {
    return new ParseError('expected double quote (")');
  }

  static expectedAttrName(): ParseError {
    return new ParseError("expected attribute name, got empty");
  }

  static expectedTagClosing(): ParseError {
    return new ParseError("expected tag to be closing (with a slash: /)");
  }
}

class HTMLParser {
  #strings: TemplateStringsArray;
  #values: Argument[];
  #tsaIdx: number;
  #idx: number;
  #status: ParserStatus;

  constructor(strings: TemplateStringsArray, values: Argument[]) {
    this.#strings = strings;
    this.#values = values;
    this.#tsaIdx = 0;
    this.#idx = 0;
    this.#status = ParserStatus.TagName;
  }

  /**
   *
   * @returns `[(whether to insert a template value after / end of source), string]`
   */
  next(): [boolean, string] | null {
    if (this.#tsaIdx >= this.#strings.length) return null;
    if (this.#idx >= this.#strings[this.#tsaIdx]!.length) return null;

    const templateStr = this.#strings[this.#tsaIdx]!;
    const value = templateStr[this.#idx]!;

    this.#idx = (this.#idx + 1) % templateStr.length;
    this.#tsaIdx += this.#idx == 0 ? 1 : 0;

    return [this.#idx == 0, value];
  }

  getInsertion(): Argument | null {
    return this.#values[this.#tsaIdx - 1] || null;
  }

  consume(): any {
    while (true) {
      const n = this.next();
      if (!n) break;

      const [shouldInsert, chr] = n;
      if (chr == "<") {
        if (shouldInsert) throw ParseError.noInsertInTagNames();

        const [tagName, attributes] = this.consumeTag();
        console.log(tagName, attributes);
        console.log(this.next());
        const endTag = this.consumeEndTag();
        console.log("end tag:", endTag);
      }
    }
  }

  consumeTag(): [string, Record<string, string>, boolean] {
    let tag = "";
    while (true) {
      const [shouldInsert, chr] = this.next()!;
      if (shouldInsert) throw ParseError.noInsertInTagNames();

      if (/\s/.test(chr)) {
        const [attrs, selfClosing] = this.consumeAttributes();
        return [tag, attrs, selfClosing];
      }

      if (chr == ">") return [tag, {}, false];

      if (!/[a-zA-Z-]/.test(chr))
        throw ParseError.invalidCharacterInTagName(chr);

      tag += chr;
    }
  }

  consumeAttributes(): [Record<string, string>, boolean] {
    const attrs: Record<string, string> = {};
    let name = "";

    /**
     * - `0`: Consuming attribute **name**.
     * - `1`: Waiting for `=` (equal) sign.
     */
    let state: 0 | 1 = 0;

    while (true) {
      const [shouldInsert, chr] = this.consumeWhitespace();

      if (chr == ">") return [attrs, false];
      if (chr == "/") {
        const [_, c] = this.consumeWhitespace();
        if (c !== ">") throw ParseError.expectedTagClosing();
        return [attrs, true];
      }

      if (state === 0) {
        // attr name
        if (/\s|=/.test(chr)) {
          if (!name) throw ParseError.expectedAttrName();
          // we can now go collect the value
          state = 1;
        } else {
          if (shouldInsert) throw ParseError.noInsertInAttrNames();
          name += chr;
          continue;
        }
      }

      // finally not equal, process attr value
      if (chr == "=") {
        const value = shouldInsert
          ? this.getInsertion()!.toString()
          : this.consumeStringQuote();
        attrs[name] = value;

        name = "";
        state = 0;
        continue;
      }
      // otherwise, there's something else, perhaps a new attr
      // we'll keep this one as "true"
      attrs[name] = "true";
      name = "";
      state = 0;
    }
  }

  consumeEndTag(): string {
    const [shouldInsertAfterTagName, chr] = this.consumeWhitespace();
    if (chr !== "/") throw ParseError.expectedTagClosing();
    if (shouldInsertAfterTagName) throw ParseError.noInsertInTagNames();

    let name = "";

    while (true) {
      const [shouldInsert, chr] = this.next()!;

      if (chr === ">") return name.trimEnd();
      if (shouldInsert) throw ParseError.noInsertInTagNames();

      if (!/[a-zA-Z-]/.test(chr))
        throw ParseError.invalidCharacterInTagName(chr);

      name += chr;
    }
  }

  consumeWhitespace(): [boolean, string] {
    const [shouldInsert, chr] = this.next()!;
    if (/\s/.test(chr)) return this.consumeWhitespace();
    return [shouldInsert, chr];
  }

  consumeStringQuote(): string {
    let text = "";
    const [shouldInsert, chr] = this.consumeWhitespace()!;
    if (chr !== '"') throw ParseError.expectedQuote();

    text += '"';
    if (shouldInsert) text += this.getInsertion()!.toString();

    while (true) {
      const [shouldInsert, chr] = this.next()!;
      if (!text.endsWith("\\") && chr == '"') break;

      text += chr;
      if (shouldInsert) text += this.getInsertion()!.toString();
    }

    return JSON.parse(text + '"');
  }
}

const parser = html`<div src=${100}></div>`;
parser.consume();
