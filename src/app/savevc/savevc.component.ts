import { Component } from '@angular/core';
import { CredentialService } from '../credential-request.service';
import { SolidclientService } from '../solidclient.service';
import { Inject } from '@angular/core';
import { getVCHTML } from '@docknetwork/prettyvc';
import {MatButtonModule} from '@angular/material/button';
import {MatCardModule} from '@angular/material/card';
import { Router } from '@angular/router';

@Component({
  selector: 'app-savevc',
  standalone: true,
  imports: [MatCardModule, MatButtonModule],
  templateUrl: './savevc.component.html',
  styleUrl: './savevc.component.css'
})

export class SavevcComponent {
    credential: string = "";

    constructor(private credentialService: CredentialService, @Inject(SolidclientService) private solidservice: SolidclientService, private router: Router) {
      credentialService.vc.then((result) => {

        this.credential = JSON.stringify(result);

        const options = { generateQR: true };
        getVCHTML(result, options).then((html: any) => { // Explicitly specify the type of 'html' parameter as string
          this.credential = html.html;  
          console.log(html.html);
  
        } );

      });
    }

    saveText() {
      // Implement your save logic here
      console.log('Text saved:', this.credential);
      this.solidservice.saveVc(this.credential);
    }

    saveVcButtonClick() {
      // This method will be executed when the button is clicked
      console.log('Button clicked!');
    }

    cancelSaveVcClick() {
      this.router.navigate(['/credentials-request']);
    }

}
