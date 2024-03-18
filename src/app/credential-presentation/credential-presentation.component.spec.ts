import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CredentialPresentationComponent } from './credential-presentation.component';

describe('CredentialPresentationComponent', () => {
  let component: CredentialPresentationComponent;
  let fixture: ComponentFixture<CredentialPresentationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CredentialPresentationComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CredentialPresentationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
