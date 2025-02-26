import { Component } from '@angular/core';
import { CredentialService } from '../credential-request.service';
import { SolidclientService } from '../solidclient.service';
import { Inject } from '@angular/core';
import { getVCHTML } from '@docknetwork/prettyvc';
import {MatButtonModule} from '@angular/material/button';
import {MatCardModule} from '@angular/material/card';
import { Router } from '@angular/router';
import {MatSnackBar} from '@angular/material/snack-bar';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-savevc',
  standalone: true,
  imports: [MatCardModule, MatButtonModule, MatProgressSpinnerModule, CommonModule],
  templateUrl: './savevc.component.html',
  styleUrl: './savevc.component.css'
})

export class SavevcComponent {
    credential: string = "";
    credentialHtml: string = "";
    isLoading: boolean = false;
  

    constructor(private credentialService: CredentialService, private solidservice: SolidclientService, private router: Router, private _snackBar: MatSnackBar) {
       
          credentialService.vc.then((result) => {
          this.isLoading = true;
          this.credential = result;//JSON.stringify(result);
          
          const options = { generateQR: true };
          getVCHTML(this.credential, options).then((html: any) => { 
            this.credentialHtml = html.html;
            this.isLoading = false;
    
          }).catch((err: any) => { 
            this._snackBar.open("Failed to load credentials. Please try again.", "action");
            //nativate user back to the credentials-request page
            //this.router.navigate(['/credentials-request']);
          });
  
        });
    }


    saveVcButtonClick() {
      console.log('Calling solidservice.saveVc() to try to save the vc');

      this.solidservice.saveVc(this.credential).then((result: any) => {
        if (result) {
          this._snackBar.open("Credential saved successfully", "Great");
          this.router.navigate(['/credential-overview']);
        } else {
          this._snackBar.open("Failed to save credential. Please try again.", "OK");
          this.router.navigate(['/credentials-request']);
        }
      });
    }

    cancelSaveVcClick() {
      this.router.navigate(['/credentials-request']);
    }

}
