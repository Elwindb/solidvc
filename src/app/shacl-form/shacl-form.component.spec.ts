import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShaclFormComponent } from './shacl-form.component';

describe('ShaclFormComponent', () => {
  let component: ShaclFormComponent;
  let fixture: ComponentFixture<ShaclFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShaclFormComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ShaclFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
