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

  fixedUrl(url) {
    // ensures the url starts with "https://"
    if (!url.startsWith("https")) {
      url = `https://${url}`;
    }
    // add "/site.json" if necessary
    if (!url.endsWith("/site.json")) {
      url = `${url}/site.json`;
    }
    return url;
  }

  async fetchSiteData() {
    if (!this.url) {
      console.warn("Please enter a valid URL");
      return;
    }
  
    // 'fix' the entered URL (add https:// and /site.json if missing)
    const apiUrl = this.fixedUrl(this.url);
    this.url = apiUrl;

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
    console.log(this.siteData.items);

    const baseUrl = this.url.replace('/site.json', '');
    
    return html`
    <div class="card-container">
      ${this.siteData.items && this.siteData.items.length > 0
        ? this.siteData.items.map(item => {
            // Construct the full URL for the item's page
            const fullUrl = item.location.startsWith("http")
              ? item.location
              : `${baseUrl}/${item.location}`;

            // Handle optional fields like description or icon
            const description = item.description || "No description available";
            const title = item.title || "No title available";
            const icon = item.icon || "icons:info"; // Default icon if none provided

            return html`
              <div class="card">
                
                <h3>${title}</h3>

                <p>${description}</p>

                
                ${item.image
                  ? html`<img src="${item.image}" alt="${item.title}" class="card-thumbnail" />`
                  : html`<simple-icon
                      icon="${icon}" 
                      style="--simple-icon-width: 48px; --simple-icon-height: 48px; color: var(--ddd-theme-primary, #4caf50);"
                    ></simple-icon>`}

                <a href="${fullUrl}" target="_blank">Open page source</a>
              </div>
            `;
          })
        : html`<p>No items available</p>`}
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
          gap: var(--ddd-spacing-4); 
          margin-top: var(--ddd-spacing-4);
        }
      .card {
          background-color: var(--ddd-theme-background, #fff); 
          color: var(--ddd-text-color, #000); 
          padding: var(--ddd-spacing-4);
          border-radius: var(--ddd-border-radius, 8px); 
          box-shadow: var(--ddd-box-shadow, 0 4px 8px rgba(0, 0, 0, 0.2)); 
          text-align: center;
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        .card:hover {
          transform: scale(1.02); 
          box-shadow: var(--ddd-box-shadow-hover, 0 6px 12px rgba(0, 0, 0, 0.3)); 
        }
        .card h3 {
          margin: var(--ddd-spacing-2) 0;
          font-size: var(--ddd-font-size-s);
          color: var(--ddd-theme-primary, #000000)
        } 
        .card p {
          margin: var(--ddd-spacing-2) 0;
          font-size: var(--ddd-font-size-xs); 
          color: var(--ddd-text-secondary, #666); 
        }
        .card a {
          display: inline-block;
          margin-top: var(--ddd-spacing-3);
          color: var(--ddd-theme-link, navy); 
          font-weight: var(--ddd-font-weight-bold, 700); 
          text-decoration: none;
          transition: color 0.3s ease;
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