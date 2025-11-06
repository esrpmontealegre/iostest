import { Component, OnInit, OnDestroy, ElementRef } from '@angular/core';

@Component({
  selector: 'app-input-box',
  templateUrl: './input-box.component.html',
  styleUrls: ['./input-box.component.scss']
})
export class InputBoxComponent implements OnInit, OnDestroy {
  private visualViewport: any;
  private resizeHandler: () => void;
  debugInfo: string = 'Waiting for keyboard...';

  constructor(private elementRef: ElementRef) {
    // Initialize the resize handler
    this.resizeHandler = () => {
      if (this.visualViewport) {
        const currentHeight = this.visualViewport.height;
        const containerElement = this.elementRef.nativeElement.querySelector('.input-box-container');
        const bottomOffset = window.innerHeight - this.visualViewport.height;
        
        if (containerElement) {
          // When keyboard appears, viewport height decreases
          // We want to position our input just above the keyboard
          containerElement.style.position = 'fixed';
          containerElement.style.bottom = `${bottomOffset}px`;
          
          // Update debug information
          this.debugInfo = `Viewport Height: ${currentHeight}px\n` +
                          `Window Height: ${window.innerHeight}px\n` +
                          `Bottom Offset: ${bottomOffset}px\n` +
                          `Scale: ${this.visualViewport.scale}\n` +
                          `Page Top: ${this.visualViewport.pageTop}px`;
        }
      }
    };
  }

  ngOnInit(): void {
    // Check if VisualViewport API is available (modern mobile browsers)
    if (window.visualViewport) {
      this.visualViewport = window.visualViewport;
      this.visualViewport.addEventListener('resize', this.resizeHandler);
    }
  }

  ngOnDestroy(): void {
    // Clean up event listeners
    if (this.visualViewport) {
      this.visualViewport.removeEventListener('resize', this.resizeHandler);
    }
  }
}
