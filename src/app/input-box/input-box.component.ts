import { Component, OnInit, OnDestroy, ElementRef, NgZone, ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-input-box',
  templateUrl: './input-box.component.html',
  styleUrls: ['./input-box.component.scss']
})
export class InputBoxComponent implements OnInit, OnDestroy {
  private visualViewport: any;
  private resizeHandler: () => void;
  private initialWindowHeight: number;
  debugInfo: string = 'Waiting for keyboard...';
  isKeyboardVisible: boolean = false;

  constructor(
    private elementRef: ElementRef,
    private ngZone: NgZone,
    private cdr: ChangeDetectorRef
  ) {
    this.initialWindowHeight = window.innerHeight;
    
    // Initialize the resize handler
    this.resizeHandler = () => {
      this.ngZone.run(() => {
        if (this.visualViewport) {
          const currentHeight = this.visualViewport.height;
          const containerElement = this.elementRef.nativeElement.querySelector('.input-box-container');
          const bottomOffset = this.initialWindowHeight - this.visualViewport.height;
          
          // Consider keyboard visible if height reduction is significant (> 100px)
          this.isKeyboardVisible = bottomOffset > 100;
          
          if (containerElement) {
            containerElement.style.position = 'fixed';
            containerElement.style.left = '0';
            containerElement.style.right = '0';
            
            if (this.isKeyboardVisible) {
              containerElement.style.bottom = `${bottomOffset}px`;
            } else {
              containerElement.style.bottom = '0';
            }
            
            // Update debug information
            this.debugInfo = `Is Keyboard Visible: ${this.isKeyboardVisible}\n` +
                           `Initial Window Height: ${this.initialWindowHeight}px\n` +
                           `Current Viewport Height: ${currentHeight}px\n` +
                           `Window Height: ${window.innerHeight}px\n` +
                           `Bottom Offset: ${bottomOffset}px\n` +
                           `Scale: ${this.visualViewport.scale}\n` +
                           `Page Top: ${this.visualViewport.pageTop}px`;
                           
            // Ensure change detection runs
            this.cdr.detectChanges();
          }
        }
      });
    };
  }

  ngOnInit(): void {
    this.ngZone.runOutsideAngular(() => {
      // Check if VisualViewport API is available (modern mobile browsers)
      if (window.visualViewport) {
        this.visualViewport = window.visualViewport;
        this.visualViewport.addEventListener('resize', this.resizeHandler);
        
        // Also listen for scroll events as some mobile browsers trigger this
        this.visualViewport.addEventListener('scroll', this.resizeHandler);
        
        // Force initial calculation
        this.resizeHandler();
      } else {
        // Fallback for browsers without VisualViewport API
        window.addEventListener('resize', this.resizeHandler);
      }

      // Add focus event listener to force recalculation
      const textarea = this.elementRef.nativeElement.querySelector('textarea');
      if (textarea) {
        textarea.addEventListener('focus', () => {
          setTimeout(this.resizeHandler, 100); // Small delay to ensure keyboard is shown
        });
      }
    });
  }

  ngOnDestroy(): void {
    // Clean up event listeners
    if (this.visualViewport) {
      this.visualViewport.removeEventListener('resize', this.resizeHandler);
      this.visualViewport.removeEventListener('scroll', this.resizeHandler);
    } else {
      window.removeEventListener('resize', this.resizeHandler);
    }
  }
}
