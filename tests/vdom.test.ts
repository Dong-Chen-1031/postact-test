/**
 * Application Integration Tests
 * Testing various VDOM element types and their dynamic updates
 */

import { describe, it, expect, beforeEach } from "vitest";
import { html, state, dependent, select } from "../src";
import { virtualItemsToFragment } from "../src/vdom/client";

// Type Configuration
interface TypeConfig {
    name: string;           // Type name (e.g., "Element", "Text", "Number")
    value: any;             // Actual value
    expect: {               // Expected validation
        selector?: string;      // Selector if it's an element
        textContent?: string;   // Expected text content
        contains?: string;      // Contains text
        isEmpty?: boolean;      // Is empty
    };
}

// Test Case Interface
interface VdomTestCase {
    name: string;
    initialValue: any;
    updatedValue: any;
    initialExpect: TypeConfig['expect'];
    updatedExpect: TypeConfig['expect'];
}

// Single Test Generator
function createVdomTest(testCase: VdomTestCase) {
    it(testCase.name, async () => {
        const $count = state(0);
        const $element = dependent($count, (count) => {
            return count === 0 ? testCase.initialValue : testCase.updatedValue;
        });

        const app = html`<div id="display">${$element}</div>`;
        select("#app").render(app);

        const display = document.getElementById("display");

        // Verify initial state
        if (testCase.initialExpect.selector) {
            expect(display?.querySelector(testCase.initialExpect.selector)?.textContent)
                .toBe(testCase.initialExpect.textContent);
        } else if (testCase.initialExpect.textContent !== undefined) {
            expect(display?.textContent?.trim()).toBe(testCase.initialExpect.textContent);
        } else if (testCase.initialExpect.isEmpty) {
            expect(display?.textContent?.trim() || "").toBe("");
        }

        // Update state
        $count.update(1);

        // Wait for DOM update (async)
        await new Promise(resolve => setTimeout(resolve, 50));

        // Verify updated state
        if (testCase.updatedExpect.selector) {
            expect(display?.querySelector(testCase.updatedExpect.selector)?.textContent)
                .toBe(testCase.updatedExpect.textContent);
        } else if (testCase.updatedExpect.textContent !== undefined) {
            expect(display?.textContent?.trim()).toBe(testCase.updatedExpect.textContent);
        } else if (testCase.updatedExpect.contains) {
            expect(display?.textContent?.trim()).toContain(testCase.updatedExpect.contains);
        } else if (testCase.updatedExpect.isEmpty) {
            expect(display?.textContent?.trim() || "").toBe("");
        }
    });
}

// 🎯 Test Case Generator: Automatically generate all test combinations from type configurations
function generateTestCases(types: TypeConfig[]): VdomTestCase[] {
    const testCases: VdomTestCase[] = [];

    // Generate all possible combinations: initialType => updatedType
    for (const initialType of types) {
        for (const updatedType of types) {
            testCases.push({
                name: `${initialType.name} => ${updatedType.name}`,
                initialValue: initialType.value,
                updatedValue: updatedType.value,
                initialExpect: initialType.expect,
                updatedExpect: updatedType.expect
            });
        }
    }

    return testCases;
}

describe("VDOM Related Tests", () => {
    beforeEach(() => {
        document.body.innerHTML = '<div id="app"></div>';
    });

    // 📝 Define all types to test (only modify here!)
    const types: TypeConfig[] = [
        {
            name: "Element(h1)",
            value: html`<h1>h1</h1>`,
            expect: { selector: "h1", textContent: "h1" }
        },
        {
            name: "Element(h2)",
            value: html`<h2>h2</h2>`,
            expect: { selector: "h2", textContent: "h2" }
        },
        {
            name: "Text",
            value: "textContent",
            expect: { textContent: "textContent" }
        },
        {
            name: "Number",
            value: 101,
            expect: { contains: "101" }
        },
        {
            name: "null",
            value: null,
            expect: { isEmpty: true }
        },
        {
            name: "undefined",
            value: undefined,
            expect: { isEmpty: true }
        }
    ];

    // 🚀 Auto-generate all test cases (6 types = 6×6 = 36 tests)
    const testCases = generateTestCases(types);
    
    // Execute tests in batch
    testCases.forEach(testCase => createVdomTest(testCase));
});