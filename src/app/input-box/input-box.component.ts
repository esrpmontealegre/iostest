import { Component, OnInit, OnDestroy, ElementRef, NgZone, ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-input-box',
  templateUrl: './input-box.component.html',
  styleUrls: ['./input-box.component.scss']
})
export class InputBoxComponent implements OnInit, OnDestroy {
  private visualViewport: any;
  private resizeHandler: () => void;
  private focusInHandler: (e: Event) => void;
  private focusOutHandler: (e: Event) => void;
  private pollingId: any = null;
  private maxSeenViewportHeight: number = window.innerHeight;
  debugInfo: string = 'Waiting for keyboard...';
  isKeyboardVisible: boolean = false;

  constructor(
    private elementRef: ElementRef,
    private ngZone: NgZone,
    private cdr: ChangeDetectorRef
  ) {
    // Initialize the resize handler
    this.resizeHandler = () => {
      // Use ngZone.run because we update component state (debugInfo)
      this.ngZone.run(() => this.checkViewport());
    };

    // Focusin / focusout handlers for document-level events
    this.focusInHandler = (e: Event) => {
      const target = e.target as HTMLElement;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) {
        // start polling to detect keyboard (some browsers don't fire resize reliably)
        this.startPolling();
      }
    };

    this.focusOutHandler = (e: Event) => {
      const target = e.target as HTMLElement;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) {
        // stop polling and recalc
        this.stopPolling();
        this.checkViewport();
      }
    };
  }

  ngOnInit(): void {
    this.ngZone.runOutsideAngular(() => {
      // VisualViewport API if available
      if (window.visualViewport) {
        this.visualViewport = window.visualViewport;
        this.visualViewport.addEventListener('resize', this.resizeHandler);
        this.visualViewport.addEventListener('scroll', this.resizeHandler);
      }

      // Always listen to window resize as a fallback
      window.addEventListener('resize', this.resizeHandler);

      // Document-level focusin/focusout to detect when inputs gain focus
      document.addEventListener('focusin', this.focusInHandler);
      document.addEventListener('focusout', this.focusOutHandler);

      // Initial check
      setTimeout(() => this.ngZone.run(() => this.checkViewport()), 50);
    });
  }

  ngOnDestroy(): void {
    // Clean up event listeners
    if (this.visualViewport) {
      this.visualViewport.removeEventListener('resize', this.resizeHandler);
      this.visualViewport.removeEventListener('scroll', this.resizeHandler);
    }
    window.removeEventListener('resize', this.resizeHandler);
    document.removeEventListener('focusin', this.focusInHandler);
    document.removeEventListener('focusout', this.focusOutHandler);
    this.stopPolling();
  }

  // Start a short polling loop while an input is focused (helps on browsers that don't emit resize)
  private startPolling() {
    if (this.pollingId) { return; }
    this.pollingId = setInterval(() => this.ngZone.run(() => this.checkViewport()), 100);
    // Also run an immediate check
    this.checkViewport();
  }

  private stopPolling() {
    if (this.pollingId) {
      clearInterval(this.pollingId);
      this.pollingId = null;
    }
  }

  // Core viewport check used by handlers and polling
  private checkViewport() {
    try {
      const viewportHeight = this.visualViewport ? this.visualViewport.height : window.innerHeight;
      // Track the largest viewport height seen as the 'no keyboard' baseline
      if (viewportHeight > this.maxSeenViewportHeight) {
        this.maxSeenViewportHeight = viewportHeight;
      }

      const bottomOffset = Math.max(0, this.maxSeenViewportHeight - viewportHeight);
      const containerElement = this.elementRef.nativeElement.querySelector('.input-box-container');

      this.isKeyboardVisible = bottomOffset > 100; // threshold

      if (containerElement) {
        containerElement.style.position = 'fixed';
        containerElement.style.left = '0';
        containerElement.style.right = '0';
        containerElement.style.bottom = this.isKeyboardVisible ? `${bottomOffset}px` : '0';
      }

  // Find nearest chat-shell ancestor and set CSS variable so the chat container moves up too
  {
        const chatShell = document.querySelector('.chat-shell') as HTMLElement | null;
        if (chatShell) {
          chatShell.style.setProperty('--keyboard-offset', `${bottomOffset}px`);
        }

        // If keyboard visible, scroll chat-container to bottom to show latest messages
        const chatContainer = document.querySelector('.chat-container') as HTMLElement | null;
        if (chatContainer && this.isKeyboardVisible) {
          // small timeout to allow layout to settle
          setTimeout(() => {
            chatContainer.scrollTop = chatContainer.scrollHeight;
          }, 50);
        }
      }

      // Update debug information
      this.debugInfo = `Is Keyboard Visible: ${this.isKeyboardVisible}\n` +
                       `Max Seen Height: ${Math.round(this.maxSeenViewportHeight)}px\n` +
                       `Current Viewport Height: ${Math.round(viewportHeight)}px\n` +
                       `Window.innerHeight: ${Math.round(window.innerHeight)}px\n` +
                       `Bottom Offset1: ${Math.round(bottomOffset)}px`;
      this.cdr.detectChanges();
      console.debug('[InputBox] checkViewport', { viewportHeight, maxSeen: this.maxSeenViewportHeight, bottomOffset, isKeyboardVisible: this.isKeyboardVisible });
    } catch (err) {
      console.error('checkViewport error', err);
    }
  }
}
