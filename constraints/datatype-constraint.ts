import { Constraint } from './constraint';

export class DatatypeConstraint implements Constraint {
  constructor(private propertyPath: string, private datatype: string) {}

  evaluate(data: any): string | null {
    const value = data[this.propertyPath];
    if (typeof value !== this.datatype) {
      return `Error: Property ${this.propertyPath} must be of type ${this.datatype}`;
    }
    return null;
  }
}
