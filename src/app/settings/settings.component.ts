import { Component } from '@angular/core';
import {  login, getDefaultSession } from '@inrupt/solid-client-authn-browser'
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {MatIconModule} from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatDividerModule} from '@angular/material/divider';
import { FormsModule } from '@angular/forms';
import { LoginService } from '../login.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [MatDividerModule, FormsModule, MatProgressSpinnerModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.css'
})
export class SettingsComponent {
  oidcIssuer: string = '';

  constructor(private loginService: LoginService) { }

  processLoginButtonClicked() {
    //loggin
    console.log("Login button clicked");
    this.loginService.login(this.oidcIssuer).then(() => {
      console.log("Logged in");
    });

  }

}
