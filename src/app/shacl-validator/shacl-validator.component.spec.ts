import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShaclValidatorComponent } from './shacl-validator.component';

describe('ShaclValidatorComponent', () => {
  let component: ShaclValidatorComponent;
  let fixture: ComponentFixture<ShaclValidatorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShaclValidatorComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ShaclValidatorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
