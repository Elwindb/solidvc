import { Component } from "@angular/core";
import { CredentialIssuanceService } from "../credential-issuance.service";
import { CredentialRequestV1_0_11 } from "@sphereon/oid4vci-common";
import { Router } from "@angular/router";
import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { FormsModule } from "@angular/forms";
import { MatButtonModule } from "@angular/material/button";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatSelectModule } from "@angular/material/select";
import {
  AdditionalClaims,
  ICredential,
  ICredentialSubject,
  IVerifiableCredential,
  W3CVerifiableCredential,
} from "@sphereon/ssi-types";

@Component({
  selector: "app-credential-issuance",
  standalone: true,
  imports: [
    FormsModule, // Required for [(ngModel)]
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
  ],
  templateUrl: "./credential-issuance.component.html",
  styleUrl: "./credential-issuance.component.css",
})
export class CredentialIssuanceComponent {
  showOptionalFields = false;
  subjectAttributes: string = "";
  types: string = "";
  requiredCredentials: string = "";
  subjectDid: string =
    "did:ethr:sepolia:0x9e96710A83277465cd8108ba41aA0d818288210e";

  // List of possible settings for the dropdown
  scenarios: string[] = ["Issuance diploma", "ID card", "Vaccine proof"];

  // Preconfigured scenarios with subject attributes
  scenarioSubjectAttributes: Record<
    string,
    | (ICredentialSubject & AdditionalClaims)
    | (ICredentialSubject & AdditionalClaims)[]
  > = {
    "Issuance diploma": {
      id: "did:example:student123",
      degree: {
        type: "https://example.org/degree-types#BachelorOfScience",
        name: "Bachelor of Science in Computer Science",
      },
      // Additional properties specific to "Issuance diploma" can be added here
    },
    "ID card": {
      "id": "urn:id-card:personal:1",
      "personalIdentifier": "34502108",
      "name": "Hanna Herwitz",
      "dateOfBirth": "1984-09-17",
      "placeOfBirth": "Asgard City",
      "currentAddress": "24th Street 210, Asgard City, 1023",
      "gender": "Female"
    },
    "Vaccine proof": [
      {
        "id": "urn:vaccine:personal:0192-203819",
        "vaccinationIdentifier": "0192-203819",
        "name": "Hanna Herwitz",
        "vaccine": "Astrazeneca",
        "lotNumber": "023a23c",
        "dateOfApplication": "2021-04-18",
        "performer": "Atlantis Hospital"
      },
    ],
    // More scenarios can be added here as needed
  };

  // Preconfigured scenarios with subject attributes
  scenarioTypes: Record<
    string,string[]> = {
    "Issuance diploma": ["VerifiableCredential", "UniversityDegree"],
    "ID card": ["VerifiableCredential", "IDCard"],
    "Vaccine proof": ["VerifiableCredential", "VaccineCard"]
  };

  constructor(
    private credentialIssuanceService: CredentialIssuanceService,
    private router: Router
  ) {}

  startIssuanceServer() {
    if (!this.subjectAttributes) {
      alert(
        "Please enter the required fields before starting the issuance process"
      );
      return;
    }

    //convert the subjectAttributes to a (ICredentialSubject & AdditionalClaims) | (ICredentialSubject & AdditionalClaims)[]
    // and pass it to the credentialIssuanceService
    const subjectAttributes = JSON.parse(this.subjectAttributes);
    const types = JSON.parse(this.types);

    this.credentialIssuanceService.startRequest(subjectAttributes, types);
    this.router.navigate(["/savevc"]);
  }

  selectPreconfiguredScenario(selectedScenario: string): void {

    this.types = JSON.stringify(
      this.scenarioTypes[selectedScenario]
    );

    this.subjectAttributes = JSON.stringify(
      this.scenarioSubjectAttributes[selectedScenario]
    );
  }
}
