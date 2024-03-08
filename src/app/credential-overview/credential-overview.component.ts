import { Component } from '@angular/core';
import { SolidclientService } from '../solidclient.service';
import { getVCHTML } from '@docknetwork/prettyvc';
import {MatButtonModule} from '@angular/material/button';
import {MatCardModule} from '@angular/material/card';

@Component({
  selector: 'app-credential-overview',
  standalone: true,
  imports: [MatCardModule, MatButtonModule],
  templateUrl: './credential-overview.component.html',
  styleUrl: './credential-overview.component.css'
})
export class CredentialOverviewComponent {
  credential: string | undefined;

  constructor(private solidservice: SolidclientService) {
    //get heroes from solid pod and place it in the string 
    this.solidservice.getCredentials().then((data) => {

      const options = { generateQR: true };
      getVCHTML(data, options).then((html: any) => { // Explicitly specify the type of 'html' parameter as string
        this.credential = html.html;  
        console.log(html.html);

      } );

    });
  }

}