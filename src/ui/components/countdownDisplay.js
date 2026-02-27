export class CountdownDisplay {
  constructor(container) {
    this._container = container;
    this._el = null;
  }

  mount() {
    this._el = document.createElement('div');
    this._el.className = 'countdown-display';
    this._el.style.display = 'none';
    this._container.appendChild(this._el);
  }

  show(text) {
    if (!this._el) return;
    this._el.textContent = text;
    this._el.style.display = 'block';
    // Re-trigger animation
    this._el.style.animation = 'none';
    this._el.offsetHeight; // force reflow
    this._el.style.animation = '';
  }

  hide() {
    if (this._el) this._el.style.display = 'none';
  }

  unmount() {
    if (this._el && this._el.parentNode) {
      this._el.parentNode.removeChild(this._el);
    }
  }
}
