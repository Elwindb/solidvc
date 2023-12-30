import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { SolidclientService } from './solidclient.service';
import { MatSlideToggleModule } from '@angular/material/slide-toggle'


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, MatSlideToggleModule, RouterOutlet, RouterLinkActive, RouterLink],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})


export class AppComponent {
  title = 'solidvc';

  constructor(private solidservice: SolidclientService) {}

  
  ngOnInit(): void {
    //this.getHeroes();
  }

  getHeroes(): void {
    this.solidservice.getHeroes();
  }

      //  "https://elwin.solidweb.org/wallet/vc.jsonld",               // File in Pod to Read

 
}