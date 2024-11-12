import { html, fixture, expect } from '@open-wc/testing';
import "../project-one.js";

describe("ProjectOne test", () => {
  let element;
  beforeEach(async () => {
    element = await fixture(html`
      <project-one
        title="title"
      ></project-one>
    `);
  });

  it("basic will it blend", async () => {
    expect(element).to.exist;
  });

  it("passes the a11y audit", async () => {
    await expect(element).shadowDom.to.be.accessible();
  });
});
