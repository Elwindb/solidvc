import { Injectable } from '@angular/core';
import {  login, fetch, getDefaultSession  } from '@inrupt/solid-client-authn-browser'


@Injectable({
  providedIn: 'root'
})
export class LoginService {

  private loggedIn: boolean = false;
  private session: any;

  constructor() {
  }


  async login(issuerUrl: string) {
    //loggin 
    console.log("LoginService login");
    try {
      this.session = await login({
        oidcIssuer: issuerUrl,
        redirectUrl: new URL("/credential-overview", window.location.href).toString(),
        clientName: "Thrustpod"
      });
      this.loggedIn = true;
      //log session
      console.log("Session:", this.session);
    } catch (err) {
      console.error("Login Error:", err);
    }
  }

  isLoggedIn(): boolean {
    return this.loggedIn;
  }

  // Access token retrieval method (example, adjust based on your library)
  getAccessToken() {
    return this.session; // Replace with actual method
  }
}
