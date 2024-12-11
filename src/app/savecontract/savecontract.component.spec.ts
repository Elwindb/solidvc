import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SavecontractComponent } from './savecontract.component';

describe('SavecontractComponent', () => {
  let component: SavecontractComponent;
  let fixture: ComponentFixture<SavecontractComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SavecontractComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SavecontractComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
