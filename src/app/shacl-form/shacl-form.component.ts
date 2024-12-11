import { Component, OnInit, CUSTOM_ELEMENTS_SCHEMA,  EventEmitter, Output  } from '@angular/core';

@Component({
  selector: 'app-generic-thing-form',
  standalone: true,  // Declare it as standalone
  template: `
    <div>
      <shacl-form [attr.data-shapes]="shape" [id]="id" class="generic-thing-form"></shacl-form>
    </div>
  `,
  styles: [],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]  // This is valid for standalone components
})
export class ShactriplesChangedlFormComponent implements OnInit {
  @Output() triplesChanged = new EventEmitter<any>();
  
  id: string = 'your-form-id';
  shape: string = `
  @prefix sh: <http://www.w3.org/ns/shacl#> .
@prefix ex: <http://example.org/schema#> .
@prefix xsd: <http://www.w3.org/2001/XMLSchema#> .
@prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>.

ex:DiplomaShape
    a sh:NodeShape ;
    sh:targetClass ex:Student ;

    # Validate that the student has a DID
    sh:property [
        sh:path ex:studentDID ;
        sh:datatype xsd:string ;
        sh:pattern "^did:.*" ; # Ensure it's a DID
        sh:minCount 1 ;
        sh:maxCount 1 ;
    ] ;

    # Validate courses completed by the student
    sh:property [
        sh:path ex:coursesCompleted ; # Property representing the completed courses
        sh:node ex:CourseShape ;      # Reference to the course shape
        sh:minCount 3 ;               # Ensure exactly three courses are completed
        sh:maxCount 3 ;               # Ensure exactly three courses are completed
    ] .

# Define the CourseShape for individual course validation
ex:CourseShape
    a sh:NodeShape ;
    sh:property [
        sh:path ex:courseName ;
        sh:datatype xsd:string ;
        sh:description "The name of the course." ;
        sh:minCount 1 ;
    ] ;
    sh:property [
        sh:path ex:completionDate ;
        sh:datatype xsd:date ;
        sh:description "The date the course was completed." ;
        sh:minCount 1 ;
        sh:maxExclusive [
            sh:path ex:deadline ;
            sh:datatype xsd:date ;
            sh:description "The deadline before which the course must be completed." ;
        ] ;
    ] ;
.
`;

  ngOnInit(): void {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/@ulb-darmstadt/shacl-form/dist/index.js';
    script.type = 'module';
    document.body.appendChild(script);
  }

    // Call this method when triples change
    updateTriples(newTriples: any) {
      this.triplesChanged.emit(newTriples);

      console.log('Received form data:', newTriples);
    }

}
