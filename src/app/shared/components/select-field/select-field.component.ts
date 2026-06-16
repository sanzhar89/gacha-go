import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  HostListener,
  ViewChild,
  forwardRef,
  inject,
  input,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

export interface SelectOption {
  value: string;
  label: string;
}

@Component({
  selector: 'app-select-field',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './select-field.component.html',
  styleUrl: './select-field.component.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SelectFieldComponent),
      multi: true,
    },
  ],
})
export class SelectFieldComponent implements ControlValueAccessor {
  private readonly elementRef = inject(ElementRef);
  private readonly cdr = inject(ChangeDetectorRef);

  @ViewChild('trigger') trigger?: ElementRef<HTMLButtonElement>;

  readonly options = input<string[]>([]);
  readonly items = input<SelectOption[]>([]);
  readonly placeholder = input('Выберите');

  open = false;
  value = '';
  disabled = false;
  menuTop = 0;
  menuLeft = 0;
  menuWidth = 0;

  private onChange: (value: string) => void = () => undefined;
  private onTouched: () => void = () => undefined;

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.close();
    }
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.close();
  }

  @HostListener('window:scroll')
  @HostListener('window:resize')
  onViewportChange(): void {
    if (this.open) {
      this.updateMenuPosition();
    }
  }

  writeValue(value: string): void {
    this.value = value ?? '';
    this.cdr.markForCheck();
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
    this.cdr.markForCheck();
  }

  toggle(event: MouseEvent): void {
    event.stopPropagation();
    if (this.disabled) {
      return;
    }
    this.open = !this.open;
    if (this.open) {
      this.onTouched();
      this.updateMenuPosition();
    }
    this.cdr.markForCheck();
  }

  select(option: string, event: MouseEvent): void {
    event.stopPropagation();
    this.value = option;
    this.onChange(option);
    this.onTouched();
    this.close();
  }

  displayLabel(): string {
    const match = this.menuOptions().find((item) => item.value === this.value);
    return match?.label ?? this.value;
  }

  menuOptions(): SelectOption[] {
    const items = this.items();
    if (items.length) {
      return items;
    }
    return this.options().map((option) => ({ value: option, label: option }));
  }

  private updateMenuPosition(): void {
    const trigger = this.trigger?.nativeElement;
    if (!trigger) {
      return;
    }
    const rect = trigger.getBoundingClientRect();
    this.menuTop = rect.bottom + 6;
    this.menuLeft = rect.left;
    this.menuWidth = rect.width;
  }

  private close(): void {
    if (!this.open) {
      return;
    }
    this.open = false;
    this.cdr.markForCheck();
  }
}
