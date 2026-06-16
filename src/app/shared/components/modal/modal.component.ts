import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  HostListener,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  inject,
  EventEmitter,
  viewChild,
} from '@angular/core';

@Component({
  selector: 'app-modal',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './modal.component.html',
  styleUrl: './modal.component.scss',
})
export class ModalComponent implements OnChanges {
  private readonly host = inject(ElementRef<HTMLElement>);

  @Input({ required: true }) open = false;
  @Input() title = '';
  @Input() size: 'sm' | 'md' | 'lg' = 'md';
  @Input() closeOnBackdrop = true;

  @Output() closed = new EventEmitter<void>();

  readonly panelRef = viewChild<ElementRef<HTMLElement>>('panel');

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['open']) {
      document.body.style.overflow = this.open ? 'hidden' : '';
    }
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.open) {
      this.close();
    }
  }

  onBackdropClick(): void {
    if (this.closeOnBackdrop) {
      this.close();
    }
  }

  close(): void {
    this.closed.emit();
  }
}
