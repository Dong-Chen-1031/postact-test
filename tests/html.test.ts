/**
 * Application Integration Tests
 * Testing various VDOM element types and their dynamic updates
 */

import { describe, it, expect, beforeEach } from "vitest";
import { html, state, dependent, select } from "../src";

beforeEach(() => {
    document.body.innerHTML = '<div id="app"></div>';
});

describe("html test", () => {
    it("ez h1", async () => {
        const app = html`<h1>h1</h1>`;
        select("#app").render(app);
        expect(document?.querySelector("h1")?.textContent).toBe("h1");
    });

    it("with id", async () => {
        const app = html`<h1 id="123"></h1>`;
        select("#app").render(app);
        expect(document?.querySelector("h1")?.textContent).toBe("");
    });

    it("\"\"", async () => {
        const app = html`<h1 onclick="alert(123)" data1="123">""</h1>`;
        select("#app").render(app);
        expect(document?.querySelector("h1")?.textContent).toBe('""');
    });

    it("\"", async () => {
        const app = html`<h1 onclick="alert(123)" data1="123">"</h1>`;
        select("#app").render(app);
        expect(document?.querySelector("h1")?.textContent).toBe('"');
    });

    it("use id=\'\'", async () => {
        const app = html`<h1 id='123' data1="123"></h1>`;
        select("#app").render(app);
        expect(document?.querySelector("h1")?.textContent).toBe("'");
    });
});