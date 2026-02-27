export class WebcamView {
  constructor(container) {
    this._container = container;
    this._video = null;
    this._canvas = null;
    this._ctx = null;
    this._label = null;
    this._stream = null;
  }

  mount() {
    const wrapper = document.createElement('div');
    wrapper.className = 'webcam-container';

    this._video = document.createElement('video');
    this._video.setAttribute('autoplay', '');
    this._video.setAttribute('playsinline', '');
    this._video.setAttribute('muted', '');

    this._canvas = document.createElement('canvas');
    this._ctx = this._canvas.getContext('2d');

    this._label = document.createElement('div');
    this._label.className = 'gesture-label';
    this._label.textContent = 'Show your hand...';

    wrapper.appendChild(this._video);
    wrapper.appendChild(this._canvas);
    wrapper.appendChild(this._label);
    this._container.appendChild(wrapper);
    this._wrapper = wrapper;
  }

  async startCamera() {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' },
    });
    this._stream = stream;
    this._video.srcObject = stream;
    await this._video.play();
    this._canvas.width = this._video.videoWidth;
    this._canvas.height = this._video.videoHeight;
  }

  getVideoElement() {
    return this._video;
  }

  drawLandmarks(landmarks) {
    if (!this._ctx || !landmarks) return;
    const ctx = this._ctx;
    const w = this._canvas.width;
    const h = this._canvas.height;
    ctx.clearRect(0, 0, w, h);

    // Draw connections
    ctx.strokeStyle = '#6c63ff';
    ctx.lineWidth = 2;
    const connections = [
      [0,1],[1,2],[2,3],[3,4],
      [0,5],[5,6],[6,7],[7,8],
      [0,9],[9,10],[10,11],[11,12],
      [0,13],[13,14],[14,15],[15,16],
      [0,17],[17,18],[18,19],[19,20],
      [5,9],[9,13],[13,17],
    ];
    for (const [a, b] of connections) {
      ctx.beginPath();
      ctx.moveTo(landmarks[a].x * w, landmarks[a].y * h);
      ctx.lineTo(landmarks[b].x * w, landmarks[b].y * h);
      ctx.stroke();
    }

    // Draw dots
    ctx.fillStyle = '#ff6584';
    for (const lm of landmarks) {
      ctx.beginPath();
      ctx.arc(lm.x * w, lm.y * h, 4, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  clearCanvas() {
    if (this._ctx) {
      this._ctx.clearRect(0, 0, this._canvas.width, this._canvas.height);
    }
  }

  setGestureLabel(text) {
    if (this._label) this._label.textContent = text;
  }

  stopCamera() {
    if (this._stream) {
      this._stream.getTracks().forEach((t) => t.stop());
      this._stream = null;
    }
    if (this._video) this._video.srcObject = null;
  }

  unmount() {
    this.stopCamera();
    if (this._wrapper && this._wrapper.parentNode) {
      this._wrapper.parentNode.removeChild(this._wrapper);
    }
  }
}
