import { Injectable, signal } from '@angular/core';

/** Estado compartilhado do menu lateral: aberto ou fechado. Usado pelo layout e pelo dashboard. */
@Injectable({ providedIn: 'root' })
export class SidebarService {
  readonly open = signal(false);

  toggle(): void {
    this.open.update((isOpen) => !isOpen);
  }

  close(): void {
    this.open.set(false);
  }

  show(): void {
    this.open.set(true);
  }
}
