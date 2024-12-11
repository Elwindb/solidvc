import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ValidatecredentialComponent } from './validatecredential.component';

describe('ValidatecredentialComponent', () => {
  let component: ValidatecredentialComponent;
  let fixture: ComponentFixture<ValidatecredentialComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ValidatecredentialComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ValidatecredentialComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
