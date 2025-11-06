import { Injectable, Inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';

@Injectable({ providedIn: 'root' })
export class KeyboardService {
  private docEl: HTMLElement;

  constructor(@Inject(DOCUMENT) private document: Document) {
    this.docEl = this.document.documentElement;
  }

  init() {
    const vv = (window as any).visualViewport as VisualViewport | undefined;

    const updateOffsets = () => {
      // Base values
      let kbOffset = 0;

      if (vv) {
        // Amount of viewport "covered" by the VK
        // Ref: visualViewport height is the *visible* area above the keyboard.
        const covered = window.innerHeight - vv.height - vv.offsetTop;
        kbOffset = Math.max(0, Math.round(covered));
      } else {
        // Fallback (older browsers): try to detect with resize
        const covered = window.innerHeight - document.documentElement.clientHeight;
        kbOffset = Math.max(0, Math.round(covered));
      }

      // Set CSS variables globally
      this.docEl.style.setProperty('--kb-offset', `${kbOffset}px`);
      // bottom gap = composer height + keyboard offset + safe area
      this.docEl.style.setProperty(
        '--bottom-gap',
        `calc(var(--composer-h) + ${kbOffset}px + env(safe-area-inset-bottom))`
      );
    };

    // Initial set
    updateOffsets();

    // VisualViewport listeners (best for iOS Safari)
    if (vv) {
      vv.addEventListener('resize', updateOffsets);
      vv.addEventListener('scroll', updateOffsets);
    }

    // Fallback listeners
    window.addEventListener('resize', updateOffsets);
    window.addEventListener('orientationchange', updateOffsets);
  }
}
