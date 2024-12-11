import { Component, NO_ERRORS_SCHEMA } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { CommonModule } from '@angular/common';
import { ContractService } from '../contract.service';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ShactriplesChangedlFormComponent } from '../shacl-form/shacl-form.component';
import { SolidityGeneratorServiceService } from '../solidity-generator.service.service';
import { DataFactory, Store, parse } from 'rdflib';
import { Quad } from 'n3';

@Component({
  selector: 'app-savecontract',
  standalone: true,
  imports: [MatCardModule, MatButtonModule, CommonModule, ShactriplesChangedlFormComponent],
  templateUrl: './savecontract.component.html',
  styleUrls: ['./savecontract.component.css'],
  schemas: [NO_ERRORS_SCHEMA],
})
export class SavecontractComponent {
  triples: any;

  constructor(
    private contractService: ContractService,
    private router: Router,
    private _snackBar: MatSnackBar,
    private solidityGeneratorService: SolidityGeneratorServiceService
  ) {}

  onTriplesChange(triples: any) {
    this.triples = triples;
    console.log('Received form data:', this.triples);
  }

  cancelSaveVcClick() {
    this.router.navigate(['/credentials-request']);
  }

  saveVcButtonClick() {
    const form = document.querySelector('shacl-form') as HTMLFormElement;
    const triples = form['serialize']();
    console.log('Form data:', triples);

    console.log('Generating Solidity contract...');

    const shaclDocument = this.parseShaclData(triples as string);
    console.log('Extracted SHACL Document:', shaclDocument);

    const contract = this.solidityGeneratorService.generateSolidityContract('MyContract', shaclDocument.shapes);
    console.log('Generated Solidity Contract:');
    console.log(contract);

    this._snackBar.open('Contract generated successfully!', 'Close', {
      duration: 3000,
    });

    // Optional: Navigate back or deploy the contract
    // this.router.navigate(['/credential-overview']);
  }

  parseShaclData(turtle: string) {
    console.log('Parsing SHACL data:', turtle);

    const store = new Store();

    try {
      // Parse the Turtle data into the RDF store
      parse(turtle, store, 'http://example.org/', 'text/turtle');

      const SH = (localName: string) => DataFactory.namedNode(`http://www.w3.org/ns/shacl#${localName}`);
      const EX = (localName: string) => DataFactory.namedNode(`http://example.org/schema#${localName}`);

      const shaclDocument = { shapes: [] as any[] };

      // Extract SHACL NodeShapes
      const nodeShapes = store.match(null, DataFactory.namedNode('rdf:type'), SH('NodeShape'));

      for (const nodeShape of nodeShapes) {
        const shapeId = nodeShape.subject.value;
        const targetClass = store.any(nodeShape.subject, SH('targetClass'), null)?.value;

        const properties = [];
        const propertyShapes = store.match(nodeShape.subject, SH('property'), null);

        for (const prop of propertyShapes) {
          const objectTerm = prop.object;

          console.log('Object term:', objectTerm);

          // Type guard to ensure the term can act as a Quad_Subject
          if (objectTerm.termType === 'NamedNode' || objectTerm.termType === 'BlankNode') {
            const path = store.any(objectTerm as any, SH('path'), null)?.value;
            const datatype = store.any(objectTerm as any, SH('datatype'), null)?.value;
            const pattern = store.any(objectTerm as any, SH('pattern'), null)?.value;
            const minCount = store.any(objectTerm as any, SH('minCount'), null)?.value;
            const maxInclusive = store.any(objectTerm as any, SH('maxInclusive'), null)?.value;
            const minInclusive = store.any(objectTerm as any, SH('minInclusive'), null)?.value;

            const constraints: any = {};
            if (pattern) constraints.pattern = pattern;
            if (minCount) constraints.minCount = parseInt(minCount, 10);
            if (maxInclusive) constraints.maxInclusive = maxInclusive;
            if (minInclusive) constraints.minInclusive = minInclusive;

            properties.push({
              path,
              datatype,
              constraints,
            });
          } else {
            console.error('Object term is not a valid Quad_Subject:', objectTerm);
          }
        }

        shaclDocument.shapes.push({
          id: shapeId,
          type: 'NodeShape',
          targetClass,
          properties,
        });
      }

      return shaclDocument;
    } catch (error) {
      console.error('Error parsing SHACL data:', error);
      return { shapes: [] };
    }
  }
}
