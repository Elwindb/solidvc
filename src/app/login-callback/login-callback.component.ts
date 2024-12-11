import { Component } from '@angular/core';
import { handleIncomingRedirect } from '@inrupt/solid-client-authn-browser'

@Component({
  selector: 'app-login-callback',
  standalone: true,
  imports: [],
  templateUrl: './login-callback.component.html',
  styleUrl: './login-callback.component.css'
})
export class LoginCallbackComponent {

  constructor() {
    //logincomplete 
    console.log("LoginCallbackComponent constructor");
    this.completeLogin();
  }

  async completeLogin() {
 // Logging
    console.log("LoginCallbackComponent completeLogin");

    let session;
    try {
      // Likely uses inrupt client library to handle redirection
      session = await handleIncomingRedirect(); // Assuming inrupt is a library
      console.log("Login successful:", session);
    } catch (err) {
      console.error("Login failed:", err);
      // Handle login failure (display error message, etc.)
    }
  }
}
