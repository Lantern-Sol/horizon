/**
 * Cart drawer "You May Also Like" card.
 *
 * Figma: Sana_nav_dropdown_cart 2001:1039 (desktop) / 2001:2160 (mobile).
 *
 * Fetches sections/cart-recommendations.liquid through the Section Rendering
 * API so the `recommendations` object is populated, then drives the one-slide
 * carousel. Kept deliberately small — the page-level <product-recommendations>
 * component morphs whole sections, which is more machinery than a drawer card
 * needs.
 */
class CartRecommendations extends HTMLElement {
  /** @type {Map<string, string>} */
  static #cache = new Map();

  /** @type {AbortController | null} */
  #activeFetch = null;

  /** @type {HTMLElement | null} */
  #track = null;

  /** The request URL whose markup is currently rendered, so a re-render is only done when it changes. */
  #renderedKey = '';

  /**
   * Every cart mutation morphs the drawer section, which strips this element
   * back to its empty server-rendered state without ever disconnecting it.
   * Watching for that (and for a new `data-product-id`) is what keeps the card
   * on screen and pointed at the right product.
   * @type {MutationObserver}
   */
  #observer = new MutationObserver(() => this.#load());

  connectedCallback() {
    this.#load();
    this.#observer.observe(this, { attributes: true, attributeFilter: ['data-product-id'], childList: true });
  }

  disconnectedCallback() {
    this.#observer.disconnect();
    this.#activeFetch?.abort();
    this.#activeFetch = null;
  }

  /** @returns {string | null} */
  get #requestUrl() {
    const { productId, sectionId, url, intent, limit } = this.dataset;

    // No product id means an empty cart — nothing to recommend against.
    if (!productId || !sectionId || !url) return null;

    return `${url}?section_id=${encodeURIComponent(sectionId)}&product_id=${encodeURIComponent(
      productId
    )}&limit=${encodeURIComponent(limit ?? '6')}&intent=${encodeURIComponent(intent ?? 'related')}`;
  }

  async #load() {
    const requestUrl = this.#requestUrl;

    if (!requestUrl) {
      this.#renderedKey = '';
      this.hidden = true;
      return;
    }

    // Already showing the right card — the mutation was our own render.
    if (requestUrl === this.#renderedKey && this.childElementCount > 0) return;

    try {
      const html = await this.#fetchSection(requestUrl);
      const card = new DOMParser().parseFromString(html, 'text/html').querySelector('.cart-reco__card');

      // An empty response is the normal "no recommendations" case, not an error.
      if (!card) {
        this.#renderedKey = requestUrl;
        this.hidden = true;
        return;
      }

      this.#renderedKey = requestUrl;
      this.replaceChildren(card);
      this.hidden = false;
      this.#track = card.querySelector('[data-cart-reco-track]');

      card.querySelector('[data-cart-reco-prev]')?.addEventListener('click', () => this.#scrollByOneSlide(-1));
      card.querySelector('[data-cart-reco-next]')?.addEventListener('click', () => this.#scrollByOneSlide(1));

      this.#track?.addEventListener('scroll', this.#syncArrows, { passive: true });
      this.#syncArrows();
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') return;
      console.warn('[cart-recommendations] Could not load recommendations:', error);
    }
  }

  /**
   * @param {string} requestUrl
   * @returns {Promise<string>}
   */
  async #fetchSection(requestUrl) {
    const cached = CartRecommendations.#cache.get(requestUrl);
    if (cached != null) return cached;

    this.#activeFetch?.abort();
    this.#activeFetch = new AbortController();

    try {
      const response = await fetch(requestUrl, { signal: this.#activeFetch.signal });
      if (!response.ok) throw new Error(`Server returned ${response.status}`);

      const html = await response.text();
      CartRecommendations.#cache.set(requestUrl, html);
      return html;
    } finally {
      this.#activeFetch = null;
    }
  }

  /** @param {number} direction */
  #scrollByOneSlide(direction) {
    const track = this.#track;
    if (!track) return;

    const slide = track.querySelector('.cart-reco__slide');
    const step = slide instanceof HTMLElement ? slide.offsetWidth : track.clientWidth;

    track.scrollBy({ left: step * direction, behavior: 'smooth' });
  }

  /** Dims the arrows at either end of the track. */
  #syncArrows = () => {
    const track = this.#track;
    if (!track) return;

    // Sub-pixel scroll positions mean an exact comparison never reaches the end.
    const atStart = track.scrollLeft <= 1;
    const atEnd = track.scrollLeft >= track.scrollWidth - track.clientWidth - 1;

    const prev = this.querySelector('[data-cart-reco-prev]');
    const next = this.querySelector('[data-cart-reco-next]');

    if (prev instanceof HTMLButtonElement) prev.disabled = atStart;
    if (next instanceof HTMLButtonElement) next.disabled = atEnd;
  };
}

if (!customElements.get('cart-recommendations')) {
  customElements.define('cart-recommendations', CartRecommendations);
}
