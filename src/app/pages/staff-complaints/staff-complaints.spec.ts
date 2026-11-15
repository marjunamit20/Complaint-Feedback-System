import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StaffComplaints } from './staff-complaints';

describe('StaffComplaints', () => {
  let component: StaffComplaints;
  let fixture: ComponentFixture<StaffComplaints>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StaffComplaints],
    }).compileComponents();

    fixture = TestBed.createComponent(StaffComplaints);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
