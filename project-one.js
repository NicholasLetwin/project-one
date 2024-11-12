/**
 * Copyright 2024 NicholasLetwin
 * @license Apache-2.0, see LICENSE for full text.
 */
import { LitElement, html, css } from "lit";
import { DDDSuper } from "@haxtheweb/d-d-d/d-d-d.js";
import { I18NMixin } from "@haxtheweb/i18n-manager/lib/I18NMixin.js";



/**
 * `project-one`
 * 
 * @demo index.html
 * @element project-one
 */
export class ProjectOne extends DDDSuper(I18NMixin(LitElement)) {

  static get tag() {
    return "project-one";
  }

  constructor() {
    super();
    this.title = "Project One";
    this.url = ""; // URL for the site
    this.siteData = null; // Data fetched from site.json
  }

  // Lit reactive properties
  static get properties() {
    return {
      ...super.properties,
      title: { type: String },
      url: { type: String },
      siteData: { type: Object },
    };
  }

  async fetchSiteData() {
    if (!this.url) {
      console.warn("Please enter a valid URL");
      return;
    }
    
    // Check if the URL already includes 'site.json'
    const apiUrl = this.url.endsWith('/site.json') ? this.url : `${this.url}/site.json`;
  
    try {
      const response = await fetch(apiUrl);
      if (!response.ok) throw new Error("Invalid URL or no site.json found");
      this.siteData = await response.json();
    } catch (error) {
      console.error("Failed to fetch site data:", error);
      this.siteData = null;
    }
  }

  render() {
    return html`
      <div class="wrapper">
        <h3><span>${this.t.title}:</span> ${this.title}</h3>
        
        <!-- Input for URL and Button to Analyze -->
        <input
          type="text"
          .value="${this.url}"
          @input="${e => this.url = e.target.value}"
          placeholder="Enter site URL"
        />
        <button @click="${this.fetchSiteData}">Analyze</button>

        <!-- Display site data if available -->
        ${this.siteData ? this.renderSiteData() : html`<p>Enter a URL to analyze</p>`}
      </div>
    `;
  }

  renderSiteData() {
    const site = this.siteData.metadata?.site || {};
    const theme = this.siteData.metadata?.theme || {};
    
    return html`
      <div class="site-overview">
        <h2>${this.siteData.title || "No title available"}</h2>
        <p>Description: ${this.siteData.description || "No description available"}</p>
        <p>Site Name: ${site.name || "No site name available"}</p>
        
        <!-- Display logo if available -->
        ${site.logo ? html`<img src="${site.logo}" alt="Site Logo" class="site-logo" />` : ""}
  
        <p>Theme: ${theme.name || "No theme available"}</p>
        <p>Created: ${site.created ? new Date(site.created * 1000).toLocaleDateString() : "No creation date available"}</p>
        <p>Last Updated: ${site.updated ? new Date(site.updated * 1000).toLocaleDateString() : "No update date available"}</p>
      </div>
      <div class="card-container">
        ${this.siteData.items && this.siteData.items.length > 0
          ? this.siteData.items.map(
              item => html`
                <div class="card">
                  <h3>${item.title || "No title available"}</h3>
                  <p>${item.description || "No description available"}</p>
                  <a href="${item.url || "#"}" target="_blank">Open Page</a>
                </div>
              `
            )
          : html`<p>No items available</p>`
        }
      </div>
    `;
  }
  


  // Lit scoped styles
  // static get styles() {
  //   return [super.styles,
  //   css`
  //     :host {
  //       display: block;
  //       color: var(--ddd-theme-primary);
  //       background-color: var(--ddd-theme-accent);
  //       font-family: var(--ddd-font-navigation);
  //     }
  //     .wrapper {
  //       margin: var(--ddd-spacing-2);
  //       padding: var(--ddd-spacing-4);
  //     }
  //     h3 span {
  //       font-size: var(--project-one-label-font-size, var(--ddd-font-size-s));
  //     }
  //   `];
  // }

  static get styles() {
    return [super.styles, css`
      :host {
        display: block;
        color: var(--ddd-theme-primary);
        background-color: var(--ddd-theme-accent);
        font-family: var(--ddd-font-navigation);
      }
      .wrapper {
        margin: var(--ddd-spacing-2);
        padding: var(--ddd-spacing-4);
      }
      input[type="text"] {
        padding: 0.5em;
        margin-right: 0.5em;
        font-size: 1em;
      }
      button {
        padding: 0.5em 1em;
        font-size: 1em;
        cursor: pointer;
        background-color: var(--ddd-primary-color);
        color: white;
        border: none;
        border-radius: 5px;
      }
      .site-overview {
        margin-top: 1em;
      }
      .card-container {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 1em;
      }
      .card {
        border: 1px solid #ddd;
        padding: 1em;
        background-color: white;
        border-radius: 5px;
      }
    `];
  }

//   // Lit render the HTML
//   render() {
//     return html`
// <div class="wrapper">
//   <h3><span>${this.t.title}:</span> ${this.title}</h3>
//   <slot></slot>
// </div>`;
//   }

  /**
   * haxProperties integration via file reference
   */
  static get haxProperties() {
    return new URL(`./lib/${this.tag}.haxProperties.json`, import.meta.url)
      .href;
  }
}

globalThis.customElements.define(ProjectOne.tag, ProjectOne);