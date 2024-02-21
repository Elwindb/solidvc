import { Component } from '@angular/core';
import { CredentialService } from '../credential-request.service';
import { SolidclientService } from '../solidclient.service';
import { Inject } from '@angular/core';

@Component({
  selector: 'app-savevc',
  standalone: true,
  imports: [],
  templateUrl: './savevc.component.html',
  styleUrl: './savevc.component.css'
})
export class SavevcComponent {
    inputText: string = '';

    constructor(private credentialService: CredentialService, @Inject(SolidclientService) private solidservice: SolidclientService) {
      credentialService.vc.then((result) => {

        console.log(result);

        this.inputText += JSON.stringify(result);
      });
    }

    saveText() {
      // Implement your save logic here
      console.log('Text saved:', this.inputText);
      this.solidservice.saveVc(this.inputText);
    }






}
