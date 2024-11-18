/**
 * Copyright 2024 NicholasLetwin
 * @license Apache-2.0, see LICENSE for full text.
 */
import { LitElement, html, css } from "lit";
import { DDDSuper } from "@haxtheweb/d-d-d/d-d-d.js";
import { I18NMixin } from "@haxtheweb/i18n-manager/lib/I18NMixin.js";

import '@haxtheweb/simple-icon/simple-icon.js';

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
    this.url = ""; 
    this.siteData = null;
    this.selectedTag = null;
  }

  // Lit reactive properties
  static get properties() {
    return {
      ...super.properties,
      title: { type: String },
      url: { type: String },
      siteData: { type: Object },
      selectedTag: { type: String },
    };
  }

  getUniqueTags() {
    const tagsSet = new Set();
    this.siteData.items.forEach(item => {
      const tags = item.metadata?.tags
        ? item.metadata.tags.split(',').map(tag => tag.trim())
        : [];
      tags.forEach(tag => tagsSet.add(tag));
    });
    return Array.from(tagsSet);
  }

  //method that finds unique tags from the site.json for selecting
  renderTagFilters() {
    const uniqueTags = this.getUniqueTags();
  
    return html`
      <div class="tag-filters">
        <span class="filter-label">Filter by Tag:</span>
        <button
          class="tag-filter ${this.selectedTag === null ? 'active' : ''}"
          @click="${() => this.selectedTag = null}"
        >
          All
        </button>
        ${uniqueTags.map(tag => html`
          <button
            class="tag-filter ${this.selectedTag === tag ? 'active' : ''}"
            @click="${() => this.selectedTag = tag}"
          >
            ${tag}
          </button>
        `)}
      </div>
    `;
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


      if (!this.siteData || !this.siteData.items || !this.siteData.metadata) {
        console.error("Invalid site.json schema");
        this.siteData = null;
        return;
      }
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

        ${this.siteData ? this.renderOverview() : html`<p>Enter a URL to analyze</p>`}

        ${this.siteData ? this.renderTagFilters() : ''}

        ${this.siteData ? this.renderSiteData() : ''}
        ${this.siteData === null && this.url
      ? html`<p>Failed to fetch data. Please check the URL and try again.</p>`
      : ''}
      </div>
    `;
  }

  renderOverview() {
    const description = this.siteData?.description || "No Description Available"; 
    const site = this.siteData.metadata?.site || {};
    const theme = this.siteData.metadata?.theme || {};
    
    const backgroundColor = theme.variables?.hexCode || "#ffffff";
    const themeName = theme.name || "No Theme Available";
    const siteLogo = site.logo
      ? this.fixedUrl(this.url).replace("/site.json", `/${site.logo}`)
      : "";
  
    // get the main site URL (without /site.json)
    const mainSiteUrl = this.url.replace('/site.json', '');
  
    return html`
      <div
        class="card site-overview"
        style="background-color: ${backgroundColor};"
      >
      <div class="overview-header">
        <h2 class="overview-title">
          <a href="${mainSiteUrl}" target="_blank">
            ${site.name || "No Name Available"}
          </a>
          <simple-icon
            icon="icons:launch"
            class="launch-icon"
          ></simple-icon>
        </h2>
      </div>


        <img
          src="${siteLogo}"
          alt="Site Logo"
          class="site-logo"
          @error="${() => this.handleImageError(event)}"
        />
        <div class="site-overview-content">
          <div class="details">
            <p><strong>Description:</strong> ${description}</p>
            <p><strong>Date Created:</strong> ${site.created
              ? new Date(site.created * 1000).toLocaleString() : "N/A"}</p>

            <p><strong>Last Updated:</strong> ${site.updated
              ? new Date(site.updated * 1000).toLocaleString()
              : "N/A"}</p>
            <p><strong>Theme:</strong> ${themeName}</p>
          </div>
        </div>
      </div>
    `;
  }
  
  
  renderSiteData() {
    const baseUrl = this.url.replace("/site.json", "");
  
    //  return early if no items/data
    if (!this.siteData || !this.siteData.items) {
      return html`<p>No items available</p>`;
    }
  
    // filter items based on tag selected
    const filteredItems = this.siteData.items.filter(item => {
      if (!this.selectedTag) return true; 
      const tags = item.metadata?.tags
        ? item.metadata.tags.split(',').map(tag => tag.trim())
        : [];
      return tags.includes(this.selectedTag);
    });
  
    return html`
      <div class="item-cards-container">
        ${filteredItems.length > 0
          ? filteredItems.map(item => {
              // construc the URL to the content page
              const contentUrl = item.slug
                ? `${baseUrl}/${item.slug}`
                : `${baseUrl}/${item.location}`;
  
              // construct URL to the source code (index.html)
              const sourceUrl = item.location.startsWith("http")
                ? item.location
                : `${baseUrl}/${item.location}`;
  
              const description = item.description || "";
              const title = item.title || "No title available";
              const imageSrc = item.metadata?.images?.[0]

                ? `${baseUrl}/${item.metadata.images[0]}`
                : null;
  
              const dateUpdated = item.metadata?.updated
                ? new Date(Number(item.metadata.updated) * 1000).toLocaleString()
                : "N/A";
  
              // extracts tags and splits into array
              const tags = item.metadata?.tags
                ? item.metadata.tags.split(',').map(tag => tag.trim())
                : [];
  
  
              return html`
                <div class="item-card">
                  <div class="item-card-content">
                    <h3>
                      <a href="${contentUrl}" target="_blank">
                        ${title}
                        <simple-icon
                          icon="icons:launch"
                          class="launch-icon"
                        ></simple-icon>
                      </a>
                    </h3>
                    <p>${description}</p>
  
                    ${imageSrc
                      ? html`<img
                          src="${imageSrc}"
                          alt="${title}"
                          class="item-card-thumbnail"
                        />`
                      : html`<simple-icon
                          icon="icons:image"
                          style="--simple-icon-width: 48px; --simple-icon-height: 48px; color: var(--ddd-theme-primary, #4caf50);"
                        ></simple-icon>`}
  
                    
                    ${tags.length > 0
                      ? html`
                          <div class="tags-container">
                            ${tags.map(tag => html`
                              <span class="tag">${tag}</span>
                            `)}
                          </div>
                        `
                      : ''}
  
                  </div>
                  <div class="item-card-footer">
                    <p><strong>Last Updated:</strong> ${dateUpdated}</p>
                    <div class="card-links">
                      <a href="${sourceUrl}" target="_blank">View Source</a>
                    </div>
                  </div>
                  
                </div>
              `;
            })
          : html`<p>No items available for the selected tag.</p>`}
      </div>
    `;
  }
  
  
  
  
  
  static get styles() {
    return [super.styles, css`
      :host {
        display: block;
        color: var(--ddd-theme-primary);
        background-color: var(--ddd-theme-accent);
        font-family: var(--ddd-font-navigation);
        background-color: #14213d;
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
        margin-top: var(--ddd-spacing-4);
        padding-bottom: 16px;
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
        border-color: var(--ddd-theme-aqua, #fca311);
      }
      button {
        padding: var(--ddd-spacing-2) var(--ddd-spacing-3);
        font-size: 1.2em;
        background-color: var(--ddd-theme-aqua, #fca311);
        color: var(--ddd-text-color, black);
        border: none;
        border-radius: 0 var(--ddd-border-radius, 8px) var(--ddd-border-radius, 8px) 0;
        cursor: pointer;
        transition: background-color 0.3s ease;
      }
      button:hover {
        background-color: var(--ddd-theme-aqua-hover, aqua); 
      }
      .tag {
        background-color: #007bff;
        color: #fff;
        padding: 4px 8px;
        border-radius: 12px;
        font-size: 0.8em;
      }
      .filter-label {
        font-weight: bold;
        margin-right: 8px;
      }
      .tag-filters {
        margin: 16px 0;
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        justify-content: center;
        align-items: center;
      }
      .tag-filter {
        background-color: #e5e5e5;
        color: #000;
        padding: 6px 12px;
        border: none;
        border-radius: 12px;
        cursor: pointer;
        transition: background-color 0.2s ease;
      }
      .tag-filter.active,
      .tag-filter:hover {
        background-color: #007bff;
        color: #fff;
      }
      .tags-container {
        margin-top: 12px;
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
        gap: 8px;
      }
      .site-overview {
        grid-column: 1 / -1; 
        color: var(--site-overview-text-color, #000); 
        width: 100%;
        max-width: 1200px;
        margin: 0 auto;
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: var(--ddd-spacing-4);
        margin-bottom: var(--ddd-spacing-4);
        border-radius: var(--ddd-border-radius, 8px);
        box-shadow: var(--ddd-box-shadow, 0 4px 8px rgba(0, 0, 0, 0.2));
      }
      .site-description {
        margin: 8px 0;
        font-size: 1em;
        color: var(--ddd-text-secondary, #666);
        text-align: center;
      }
      .overview-title {
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .overview-title a {
        color: var(--ddd-theme-primary, #000);
        text-decoration: none;
      }
      .overview-title a:hover {
        text-decoration: underline;
      }
      .launch-icon {
        --simple-icon-width: 24px;
        --simple-icon-height: 24px;
        display: inline-block;
        vertical-align: middle;
        color: var(--ddd-theme-primary, #007BFF);
        cursor: pointer;
      }
      .site-logo {
        width: 500px; 
        height: 500px; 
        object-fit: contain; 
        margin-right: var(--ddd-spacing-4);
        border-radius: var(--ddd-border-radius, 8px);
      }
      .site-overview-content {
        flex: 1; 
        display: flex;
        flex-direction: column;
        gap: var(--ddd-spacing-2);
      }
      .site-overview h2 {
        margin: 0;
        font-size: 1.5em;
        font-weight: bold;
        color: var(--ddd-theme-primary, #000);
      }
      .site-overview p {
        margin: 0;
        font-size: 1em;
        color: var(--ddd-text-secondary, #000000);
      }
      .overview-header {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px; 
        margin-bottom: 16px;
      }
      .overview-header a {
        text-decoration: none;
        color: var(--ddd-theme-primary);
      }
      .site-overview .details {
        margin-top: var(--ddd-spacing-2);
        font-size: 1.2em;
        color: var(--ddd-text-secondary, #666);
      }
      .site-overview img.site-logo {
        width: 100px;
        height: auto;
        margin: var(--ddd-spacing-2) 0;
      }
      .item-cards-container {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        gap: 24px;
        margin: 24px 0;
        width: 100%;
        padding: 0 24px;
      }
      .item-card {
        background-color: #e5e5e5;
        border: 1px solid #ccc;
        border-radius: 8px;
        padding: 24px;
        text-align: center;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        transition: transform 0.2s ease, box-shadow 0.2s ease;
        height: 500px;
        max-width: 600px;
        margin: 0 auto;
        display: flex;
        flex-direction: column;
      }
      .item-card-content {
        flex: 1 1 auto;
      }
      .item-card:hover {
        transform: scale(1.03);
        box-shadow: 0 6px 12px rgba(0, 0, 0, 0.2);
      }
      .item-card h3 {
        font-size: 1.2em;
        font-weight: bold;
        margin: 0 0 8px;
        color: var(--ddd-theme-primary, #000);
        text-align: center;
      }
      .item-card h3 a {
        color: var(--ddd-theme-primary, #000);
        text-decoration: none;
      }
      .item-card h3 a:hover {
        text-decoration: underline;
      }
      .item-card p {
        font-size: 0.9em;
        color: #666;
        margin: 4px 0;
      }
      .card-links {
        text-align: center;
      }
      .item-card a {
        color: #007bff;
        text-decoration: none;
        font-weight: bold;
        margin-top: 8px;
        display: inline-block;
        transition: color 0.2s ease;
      }
      .item-card a:hover {
        color: #0056b3;
      }
      .item-card-thumbnail {
        width: 100%;
        max-width: 300px;
        height: auto;
        object-fit: cover;
        border-radius: 8px;
        margin: 12px 0;
      }
    `];
  }

  /**
   * haxProperties integration via file reference
   */
  static get haxProperties() {
    return new URL(`./lib/${this.tag}.haxProperties.json`, import.meta.url)
      .href;
  }
}

globalThis.customElements.define(ProjectOne.tag, ProjectOne);
