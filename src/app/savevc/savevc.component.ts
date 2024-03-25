import { Component } from '@angular/core';
import { CredentialService } from '../credential-request.service';
import { SolidclientService } from '../solidclient.service';
import { Inject } from '@angular/core';
import { getVCHTML } from '@docknetwork/prettyvc';
import {MatButtonModule} from '@angular/material/button';
import {MatCardModule} from '@angular/material/card';
import { Router } from '@angular/router';
import {MatSnackBar} from '@angular/material/snack-bar';

@Component({
  selector: 'app-savevc',
  standalone: true,
  imports: [MatCardModule, MatButtonModule],
  templateUrl: './savevc.component.html',
  styleUrl: './savevc.component.css'
})

export class SavevcComponent {
    credential: string = "";

    constructor(private credentialService: CredentialService, @Inject(SolidclientService) private solidservice: SolidclientService, private router: Router, private _snackBar: MatSnackBar) {
      credentialService.vc.then((result) => {

        this.credential = JSON.stringify(result);

        const options = { generateQR: true };
        getVCHTML(result, options).then((html: any) => { 
          this.credential = html.html;  
  
        }).catch((err: any) => { 
          this._snackBar.open("Failed to load credentials. Please try again.", "action");
          //nativate user back to the credentials-request page
          this.router.navigate(['/credentials-request']);
        });

      });
    }


    saveVcButtonClick() {
      console.log('Calling solidservice.saveVc() to try to save the vc');
      this.solidservice.saveVc(this.credential);
    }

    cancelSaveVcClick() {
      this.router.navigate(['/credentials-request']);
    }

}
