import { Component } from '@angular/core';
import { CredentialService } from '../credential-request.service';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {MatIconModule} from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatDividerModule} from '@angular/material/divider';

@Component({
  selector: 'app-credential-request',
  standalone: true,
  imports: [MatDividerModule, FormsModule, MatProgressSpinnerModule, MatFormFieldModule, MatInputModule, FormsModule, MatButtonModule, MatIconModule],
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
