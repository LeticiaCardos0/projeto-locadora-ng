// Select customizado (não usa <select> nativo). Existe porque o popup de opções do
// <select> nativo não segue de forma confiável o color-scheme da página em vários
// navegadores (o Chromium no Windows, por exemplo, ignora color-scheme na lista de
// opções, só respeita na caixa fechada) — então no dark mode o popup fica sempre
// branco. Implementa ControlValueAccessor pra funcionar com [(ngModel)] igual a um
// <select> normal.

import { Component, ElementRef, HostListener, Input, forwardRef, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

export interface OpcaoSelect {
  value: string;
  label: string;
}

@Component({
  selector: 'app-select-custom',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './select-custom.html',
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => SelectCustomComponent), multi: true },
  ],
})
export class SelectCustomComponent implements ControlValueAccessor {
  @Input() options: OpcaoSelect[] = [];
  @Input() placeholder = 'Selecione';
  /** Classes do botão visível (o "select fechado") — pra encaixar visualmente em cada tela. */
  @Input() triggerClass =
    'rounded-lg border border-gray-300 dark:border-white/10 bg-white dark:bg-[#030609] px-3 py-2 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-[#D9603F]/50 focus:border-[#D9603F]';

  aberto = signal(false);
  valor = signal('');
  desabilitado = signal(false);

  private onChange: (value: string) => void = () => {};
  private onTouched: () => void = () => {};

  constructor(private elementRef: ElementRef<HTMLElement>) {}

  @HostListener('document:click', ['$event'])
  aoClicarFora(event: MouseEvent): void {
    if (!this.elementRef.nativeElement.contains(event.target as Node)) {
      this.aberto.set(false);
    }
  }

  get labelAtual(): string {
    return this.options.find((o) => o.value === this.valor())?.label ?? this.placeholder;
  }

  alternar(): void {
    if (this.desabilitado()) return;
    this.aberto.update((v) => !v);
    this.onTouched();
  }

  fechar(): void {
    this.aberto.set(false);
  }

  selecionar(opcao: OpcaoSelect): void {
    this.valor.set(opcao.value);
    this.onChange(opcao.value);
    this.fechar();
  }

  writeValue(value: string): void {
    this.valor.set(value ?? '');
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(disabled: boolean): void {
    this.desabilitado.set(disabled);
  }
}
