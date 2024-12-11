import { Injectable } from '@angular/core';
import * as Handlebars from 'handlebars';

// SHACL to Solidity type mapping
const shaclToSolidityMap = {
  'xsd:string': { solidityType: 'string' },
  'xsd:integer': { solidityType: 'uint' },
  'xsd:boolean': { solidityType: 'bool' },
  'xsd:date': { solidityType: 'uint' } // Assume date represented as timestamp
};

// Solidity contract template
const contractTemplate = `
pragma solidity ^0.8.0;

contract {{contractName}} {
    {{#each properties}}
    {{type}} {{name}};
    {{/each}}

    function validate{{contractName}}() public pure returns (bool) {
        {{validationLogic}}
        return true; // Replace with actual validation logic
    }
}
`;

@Injectable({
  providedIn: 'root'
})
export class SolidityGeneratorServiceService {

  constructor() {}

  

  // Function to generate Solidity contract code
  generateSolidityContract(contractName: string, properties: any[]): string {
    const template = Handlebars.compile(contractTemplate);

    const propertyValidations = properties.map(prop => {
      const propName = prop.path.split(':')[1];
      let validationLogic = '';

      if (prop.constraints) {
        if (prop.constraints.equal) {
          validationLogic += `if (keccak256(abi.encodePacked(${propName})) != keccak256(abi.encodePacked("${prop.constraints.equal}"))) return false;\n`;
        }
        if (prop.constraints.lessThan) {
          validationLogic += `if (${propName} >= ${prop.constraints.lessThan}) return false;\n`;
        }
        if (prop.constraints.min !== undefined && prop.constraints.max !== undefined) {
          validationLogic += `if (${propName} < ${prop.constraints.min} || ${propName} > ${prop.constraints.max}) return false;\n`;
        }
        if (prop.constraints.pattern) {
          validationLogic += `// pattern matching logic (Solidity lacks direct regex)\n`;
        }
        if (prop.constraints.minCount) {
          validationLogic += `if (${propName}.length < ${prop.constraints.minCount}) return false;\n`;
        }
        if (prop.constraints.minInclusive) {
          validationLogic += `if (${propName} < ${prop.constraints.minInclusive}) return false;\n`;
        }
        if (prop.constraints.maxInclusive) {
          validationLogic += `if (${propName} > ${prop.constraints.maxInclusive}) return false;\n`;
        }
      }

      return validationLogic;
    }).join('\n');

    const data = {
      contractName,
      properties: properties.map(prop => ({
        name: prop.path.split(':')[1],
        type: (shaclToSolidityMap[prop.datatype as keyof typeof shaclToSolidityMap]?.solidityType) || 'string'
      })),
      validationLogic: propertyValidations
    };

    return template(data);
  }
}
