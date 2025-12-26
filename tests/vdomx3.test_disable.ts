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
    middleValue: any;
    finalValue: any;
    initialExpect: TypeConfig['expect'];
    middleExpect: TypeConfig['expect'];
    finalExpect: TypeConfig['expect'];
}

// Single Test Generator
function createVdomTest(testCase: VdomTestCase) {
    it(testCase.name, async () => {
        const $count = state(0);
        const $element = dependent($count, (count) => {
            if (count === 0) return testCase.initialValue;
            if (count === 1) return testCase.middleValue;
            return testCase.finalValue;
        });

        const app = html`<div id="display">${$element}</div>`;
        select("#app").render(app);

        const display = document.getElementById("display");

        // Helper function to verify state
        const verifyState = (expectation: TypeConfig['expect']) => {
            if (expectation.selector) {
                expect(display?.querySelector(expectation.selector)?.textContent)
                    .toBe(expectation.textContent);
            } else if (expectation.textContent !== undefined) {
                expect(display?.textContent?.trim()).toBe(expectation.textContent);
            } else if (expectation.contains) {
                expect(display?.textContent?.trim()).toContain(expectation.contains);
            } else if (expectation.isEmpty) {
                expect(display?.textContent?.trim() || "").toBe("");
            }
        };

        // Verify initial state (count = 0)
        verifyState(testCase.initialExpect);

        // Update to middle state (count = 1)
        $count.update(1);
        await new Promise(resolve => setTimeout(resolve, 50));
        verifyState(testCase.middleExpect);

        // Update to final state (count = 2)
        $count.update(2);
        await new Promise(resolve => setTimeout(resolve, 50));
        verifyState(testCase.finalExpect);
    });
}

// 🎯 Test Case Generator: Automatically generate all test combinations from type configurations
function generateTestCases(types: TypeConfig[]): VdomTestCase[] {
    const testCases: VdomTestCase[] = [];

    // Generate all possible combinations: initialType => middleType => finalType
    for (const initialType of types) {
        for (const middleType of types) {
            for (const finalType of types) {
                testCases.push({
                    name: `${initialType.name} => ${middleType.name} => ${finalType.name}`,
                    initialValue: initialType.value,
                    middleValue: middleType.value,
                    finalValue: finalType.value,
                    initialExpect: initialType.expect,
                    middleExpect: middleType.expect,
                    finalExpect: finalType.expect
                });
            }
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

    // 🚀 Auto-generate all test cases (6 types = 6×6×6 = 216 tests)
    const testCases = generateTestCases(types);
    
    // Execute tests in batch
    testCases.forEach(testCase => createVdomTest(testCase));
});