import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SavevcComponent } from './savevc.component';

describe('SavevcComponent', () => {
  let component: SavevcComponent;
  let fixture: ComponentFixture<SavevcComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SavevcComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SavevcComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
