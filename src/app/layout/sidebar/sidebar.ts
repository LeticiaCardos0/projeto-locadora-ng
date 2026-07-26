import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterModule } from '@angular/router';
import { SidebarModeService } from '../sidebar-modo/sidebar-modo';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule, RouterLinkActive,RouterLink],
  templateUrl: './sidebar.html',
})
export class SidebarComponent {
  sidebarMode = inject(SidebarModeService);

  collapsed = signal(false);
 
  toggleMode(): void {
    this.sidebarMode.toggle();
  }
 
  toggleCollapsed(): void {
    this.collapsed.update((value) => !value);
  }
}