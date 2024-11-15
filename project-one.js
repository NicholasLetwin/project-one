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
        
        <div class="search-bar">
          <input
            type="text"
            .value="${this.url}"
            @input="${e => this.url = e.target.value}"
            placeholder="https://haxtheweb.org/site.json"
          />
          <button @click="${this.fetchSiteData}">
            <span>Analyze</span>
          </button>
        </div>
  
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
        
        <!-- displays logo if possible -->
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
        display: flex;
        flex-direction: column;
        align-items: center;
      }
      .search-bar {
        display: flex;
        justify-content: center;
        align-items: center;
        margin-top: var(--ddd-spacing-4);
      }
      input[type="text"] {
        padding: var(--ddd-spacing-4);
        font-size: 1.2em;
        width: 350px;
        border: 2px solid var(--ddd-border-color, #ccc);
        border-radius: var(--ddd-border-radius, 8px) 0 0 var(--ddd-border-radius,8px);
        outline: none;
        transition: border-color 0.3s ease;
      }
      input[type="text"]:focus {
      border-color: var(--ddd-theme-aqua, #86f1ff);
    }
      button {
        padding: var(--ddd-spacing-2) var(--ddd-spacing-3);
        font-size: 1.2em;
        cursor: pointer;
        background-color: var(--ddd-theme-aqua, #86f1ff);
        color: var(--ddd-text-color, black);
        border: none;
        border-radius: 0 var(--ddd-border-radius, 8px) var(--ddd-border-radius, 8px) 0;
        transition: background-color 0.3s ease, transform 0.2s ease;
      }
      button:hover {
        background-color: var(--ddd-theme-aqua-hover, aqua); /* Slightly darker aqua for hover effect */
      }
      .site-overview {
        margin-top: var(--ddd-spacing-2);
        text-align: center;
      }
      .card-container {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: var(--ddd-spacing-2);
        margin-top: var(--ddd-spacing-2);
      }
      .card {
        border: 1px solid var(--ddd-border-color, #ddd);
        padding: var(--ddd-spacing-2);
        background-color: var(--ddd-theme-background, white);
        border-radius: var(--ddd-border-radius, 5px);
        text-align: center;
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