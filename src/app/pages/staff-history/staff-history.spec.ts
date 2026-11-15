import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StaffHistory } from './staff-history';

describe('StaffHistory', () => {
  let component: StaffHistory;
  let fixture: ComponentFixture<StaffHistory>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StaffHistory],
    }).compileComponents();

    fixture = TestBed.createComponent(StaffHistory);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
