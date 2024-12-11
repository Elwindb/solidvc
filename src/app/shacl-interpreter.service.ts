import { Injectable } from '@angular/core';
import { Constraint } from '../../constraints/constraint';
import { DatatypeConstraint } from '../../constraints/datatype-constraint';
import { MinCountConstraint } from '../../constraints/min-count-constraint';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ShaclInterpreterService {
  private constraints: Constraint[] = [];

  constructor(private http: HttpClient) {}

  // Load and parse the SHACL document
  loadShaclDocument(url: string): void {
    this.http.get<any>(url).subscribe(
      (shaclDoc: any) => {
        this.parseShaclDocument(shaclDoc);
      },
      (error: any ) => {
        console.error('Error loading SHACL document', error);
      }
    );
  }

  // Parse the SHACL document and create constraint instances
  private parseShaclDocument(shaclDoc: any): void {
    const nodeShapes = shaclDoc['@graph'].filter((node: any) => node['@type'] === 'sh:NodeShape');

    nodeShapes.forEach((nodeShape: any) => {
      const properties = nodeShape['sh:property'];
      properties.forEach((property: any) => {
        const path = property['sh:path'];
        
        if (property['sh:datatype']) {
          const datatype = property['sh:datatype'];
          this.constraints.push(new DatatypeConstraint(path, datatype));
        }

        // Add other SHACL constraints here if needed
      });
    });
  }

  // Validate data using loaded constraints
  validate(data: any): string[] {
    const errors: string[] = [];
    for (const constraint of this.constraints) {
      const result = constraint.evaluate(data);
      if (result) {
        errors.push(result);
      }
    }
    return errors;
  }
}