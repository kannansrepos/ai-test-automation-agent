export const playwrightTestcasePrompt = (
  baseUrl: string,
  testCase: any,
  globalInstructions: string,
  tempInstructions: string,
  repoContext: string,
) => `
You are an expert QA automation engineer.
Your task is to write a Playwright Node.js script body that executes a test case on an application runtime as-is.
Test Case Detail:
Title: ${testCase.title}
Description: ${testCase.description}
Target Route: ${testCase.targetRoute || '/'}
Expected Result: ${testCase.expectedResult}
${globalInstructions}
${tempInstructions}
Source File Context for Reference (Read this to extract exact tags, component text, input fields, and class names):
${repoContext || 'No sourcefile context available for this test case, rely on your best judgment to write a robust script.'}
Write only the JavaScript code that executes within an async function context.
The following variables are pre-injected into your runtime environment:
- page -> The Playwright Page object
- console -> The custom console object to output log messages.

IMPORTANT:
DO NOT assume Node.js 'assert' is available.
At the top of every assertion step, always define this custom assert helper:
function assert(condition, message) {
  if (!condition) {
    throw new Error(message || 'Assertion failed');
  }
}

Rules for your code:
- Do NOT import playwright, browserbase, assert, or any other modules.
- Navigate to the target route using:
  await page.goto('${baseUrl}${testCase.targetRoute || ''}', {
    waitUntil: 'load',
    timeout: 15000
  });

- Follow by a short settle wait:
  await page.waitForTimeout(1000);

Carefully analyze the source file context provided to find the EXACT forms, inputs, buttons, and elements. Look for:
- Input names, placeholder texts, or labels
- page.locator('input[name="email"]');
- button texts (e.g. page.getByRole('button', { name: /submit/i }) or page.locator('button:has-text("Save")'))

If a specific selector or locator might fail, use flexible text-matching locators or check multiple variations.

Always wait for an element to be visible before interacting with it:
await page.locator(selectorOrText).first().isVisible({ timeout: 5000 }).catch(() => {});

Scroll elements into view before interaction to prevent out-of-bound clicks:
await locator.scrollIntoViewIfNeeded();

If standard click fails or throws a timeout, try forcing it or using DOM-based dispatch click as a fallback:
- await locator.click({ force: true }).catch(async () => {
    await locator.evaluate(node => node.click());
  });

Include generous waiting timings:
- Add await page.waitForLoadState('networkidle') after major clicks, inputs, typing, form submissions to allow React, Next.js, or server state updates to propagate and elements to render.

Use lenient, substring-based assertions:
- Do NOT use strict case-sensitive equality matches on text contents.
- Instead, search for presence or substring content in a relaxed, case-insensitive way. E.g.:
  const bodyText = await page.innerText('body');
  assert(
    bodyText.toLowerCase().includes('${testCase.expectedResult?.toLowerCase().replace(/'/g, "\\'")}'),
    'Expected text not found'
  );
  or Assert visibility of key success elements instead of exact string matching.Print descriptive logs at each step using console.log() to make debugging a breeze for the user.Return ONLY the raw JavaScript executable code.
DO NOT wrap the code in markdown code block like '''javascript or '''.
DO NOT include any explanation.
Just return the executable code.
`;
