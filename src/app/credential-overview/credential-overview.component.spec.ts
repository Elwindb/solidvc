import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CredentialOverviewComponent } from './credential-overview.component';

describe('CredentialOverviewComponent', () => {
  let component: CredentialOverviewComponent;
  let fixture: ComponentFixture<CredentialOverviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CredentialOverviewComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CredentialOverviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
