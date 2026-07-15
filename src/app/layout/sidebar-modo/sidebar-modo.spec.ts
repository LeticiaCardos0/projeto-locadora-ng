import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SidebarModeService } from './sidebar-modo';

describe('SidebarModeService', () => {
  let component: SidebarModeService;
  let fixture: ComponentFixture<SidebarModeService>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SidebarModeService],
    }).compileComponents();

    fixture = TestBed.createComponent(SidebarModeService);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
