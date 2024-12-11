import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ShaclInterpreterService } from '../shacl-interpreter.service';

@Component({
  selector: 'app-shacl-validator',
  standalone: true,
  imports: [CommonModule], // Import CommonModule here
  templateUrl: './shacl-validator.component.html',
  styleUrls: ['./shacl-validator.component.css']
})
export class ShaclValidatorComponent {
  public validationErrors: string[] = [];

  constructor(private shaclInterpreter: ShaclInterpreterService) {
    // Example data to validate
    const studentData = {
      hasName: 'Alice',
      hasCourses: ['Math', 'Science']
    };

    this.validationErrors = this.shaclInterpreter.validate(studentData);
  }
}
