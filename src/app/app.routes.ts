import { Routes } from '@angular/router';
import { CredentialRequestComponent } from './credential-request/credential-request.component';
import { CredentialOverviewComponent } from './credential-overview/credential-overview.component';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';
import { SavevcComponent } from './savevc/savevc.component';

export const routes: Routes = 
[
    {path: 'credentials-request', component: CredentialRequestComponent},
    {path: 'credential-overview', component: CredentialOverviewComponent},
    {path: 'savevc', component: SavevcComponent},
    {path: '', redirectTo: 'credential-overview', pathMatch: 'full'},
    {path: '**', component: PageNotFoundComponent}
];
