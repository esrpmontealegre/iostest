import { Component, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { KeyboardService } from './keyboard.service';

interface ChatMsg {
  from: 'me' | 'bot';
  text: string;
  ts: number;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements AfterViewInit {
  @ViewChild('scroller') scroller!: ElementRef<HTMLDivElement>;
  message = '';
  msgs: ChatMsg[] = [
  { from: 'bot', ts: Date.now()-1000*60*30, text: 'Hey! Welcome to the demo chat 👋' },
  { from: 'me',  ts: Date.now()-1000*60*29, text: 'Nice! Does the header stay pinned?' },
  { from: 'bot', ts: Date.now()-1000*60*29, text: 'Yup—header is sticky. Try scrolling.' },
  { from: 'me',  ts: Date.now()-1000*60*28, text: 'How about the input bar with the keyboard?' },
  { from: 'bot', ts: Date.now()-1000*60*28, text: 'It rides up with the keyboard, even on iOS.' },
  { from: 'me',  ts: Date.now()-1000*60*27, text: 'Sweet. Will history stay scrollable?' },
  { from: 'bot', ts: Date.now()-1000*60*27, text: 'Yes. We pad the bottom dynamically so nothing gets covered.' },
  { from: 'me',  ts: Date.now()-1000*60*5,  text: 'Sending a longer message to check wrapping and bubble width. This should stay within 80% and wrap nicely across lines.' },
  { from: 'bot', ts: Date.now()-1000*60*5,  text: 'Confirmed. Looks good!' },
  { from: 'me',  ts: Date.now()-1000*60*2,  text: 'Cool, thanks!' },
  { from: 'bot', ts: Date.now()-1000*60*2,  text: 'Anytime 😊' }
];


  constructor(private kb: KeyboardService) {}

  ngAfterViewInit(): void {
    this.kb.init();
    this.scrollToBottom();
  }

  send() {
    const text = this.message.trim();
    if (!text) return;

    this.msgs.push({ from: 'me', text, ts: Date.now() });
    this.message = '';

    // Simulate a reply
    setTimeout(() => {
      this.msgs.push({ from: 'bot', text: 'Got it!', ts: Date.now() });
      this.scrollToBottom();
    }, 350);

    this.scrollToBottom();
  }

  private scrollToBottom() {
    requestAnimationFrame(() => {
      const el = this.scroller?.nativeElement;
      if (el) el.scrollTop = el.scrollHeight;
    });
  }
}
