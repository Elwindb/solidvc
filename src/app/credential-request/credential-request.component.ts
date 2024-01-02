import { Component } from '@angular/core';
import { CredentialService } from '../credential-request.service';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-credential-request',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './credential-request.component.html',
  styleUrl: './credential-request.component.css'
})
export class CredentialRequestComponent {
  oidcRequest: string = '';

  constructor(private credentialService: CredentialService, private router: Router) {}

  
  ngOnInit(): void {
   this.getHeroes();
  }

  getHeroes(): void {
   
   console.log("test");
  }

  processOIDCRequest() {
    this.credentialService.startRequest(this.oidcRequest);

    this.router.navigate(['/savevc']);

  }

}
