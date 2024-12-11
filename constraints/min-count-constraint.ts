import { Constraint } from './constraint';

export class MinCountConstraint implements Constraint {
  constructor(private propertyPath: string, private minCount: number) {}

  evaluate(data: any): string | null {
    const value = data[this.propertyPath];
    if (!Array.isArray(value) || value.length < this.minCount) {
      return `Error: Property ${this.propertyPath} must have at least ${this.minCount} items`;
    }
    return null;
  }
}
