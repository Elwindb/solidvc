import { Component } from '@angular/core';
import { CredentialService } from '../credential-request.service';

@Component({
  selector: 'app-savevc',
  standalone: true,
  imports: [],
  templateUrl: './savevc.component.html',
  styleUrl: './savevc.component.css'
})
export class SavevcComponent {
  inputText: string;

  constructor(private credentialService: CredentialService) {
    this.inputText = credentialService.vc;
  }

  saveText() {
    // Implement your save logic here
    console.log('Text saved:', this.inputText);
  }
}
