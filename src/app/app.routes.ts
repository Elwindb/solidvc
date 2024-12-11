import { Routes } from '@angular/router';
import { CredentialRequestComponent } from './credential-request/credential-request.component';
import { CredentialOverviewComponent } from './credential-overview/credential-overview.component';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';
import { SavevcComponent } from './savevc/savevc.component';
import { SettingsComponent } from './settings/settings.component';
import { CredentialPresentationComponent } from './credential-presentation/credential-presentation.component';
import { LoginCallbackComponent } from './login-callback/login-callback.component';
import { CredentialIssuanceComponent } from './credential-issuance/credential-issuance.component';
import { SavecontractComponent } from './savecontract/savecontract.component';
import { validate } from 'uuid';
import { ValidatecredentialComponent } from './validatecredential/validatecredential.component';
import { ShaclValidatorComponent } from './shacl-validator/shacl-validator.component';

export const routes: Routes = 
[
    {path: 'credentials-request', component: CredentialRequestComponent},
    {path: 'credential-overview', component: CredentialOverviewComponent},
    {path: 'credential-presentation', component: CredentialPresentationComponent},
    {path: 'login-callback', component: LoginCallbackComponent},
    {path: 'settings', component: SettingsComponent},
    {path: 'savevc', component: SavevcComponent},
    {path: 'savecontract', component: SavecontractComponent},
    {path: 'credential-issuance', component: CredentialIssuanceComponent},
    {path: 'validate-credential', component: ValidatecredentialComponent},
    {path: 'shacl-validator', component: ShaclValidatorComponent},
    {path: '', redirectTo: 'credential-overview', pathMatch: 'full'},
    {path: '**', component: PageNotFoundComponent}
];
