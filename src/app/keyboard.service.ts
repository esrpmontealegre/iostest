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

    // ...
const updateOffsets = () => {
  let kbOffset = 0;
  const vv = (window as any).visualViewport as VisualViewport | undefined;

  if (vv) {
    const covered = window.innerHeight - vv.height - vv.offsetTop;
    kbOffset = Math.max(0, Math.round(covered));
  } else {
    const covered = window.innerHeight - document.documentElement.clientHeight;
    kbOffset = Math.max(0, Math.round(covered));
  }

  // Set the pure keyboard offset
  this.docEl.style.setProperty('--kb-offset', `${kbOffset}px`);

  // IMPORTANT: do NOT add safe-area here; composer already has it.
  this.docEl.style.setProperty(
    '--bottom-gap',
    `calc(var(--composer-h) + var(--kb-offset))`
  );
};
// ...


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
