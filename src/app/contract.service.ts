import { Injectable } from '@angular/core';
import { ethers } from 'ethers';  // Use ethers directly from v6
const solcjs = require('solc-js');

declare global {
  interface Window {
    ethereum: any;
  }
}

@Injectable({
  providedIn: 'root'
})
export class ContractService {

  constructor() { }

  async deployContract() {

    // Solidity source code
    const sourceCode = `

    // SPDX-License-Identifier: MIT
    pragma solidity ^0.8.24;
    import "hardhat/console.sol";
    
    interface IEthrDidRegistry {
        function setAttribute(address identity, bytes32 name, bytes memory value, uint validity) external;
    }
    
    contract credentialContract{
        IEthrDidRegistry public ethrDidRegistry;
    
        //mapping(string => string) public requiredAttributes;
    
        //adress of approved signer 
        address public signer;
    
        constructor(address registryAddress, address _signer) {
            ethrDidRegistry = IEthrDidRegistry(registryAddress);
            signer = _signer;
    
        }
    
        function addVerificationMethod(
            address identity,
            string memory verificationMethodType,
            bytes calldata verificationMethod,
            uint256 validity
        ) external {
            bytes32 verificationMethodName = bytes32(abi.encodePacked(verificationMethodType));
    
            ethrDidRegistry.setAttribute(identity, verificationMethodName, verificationMethod, validity);
        }
    
    
       function verifyCredential(
            string memory credential,
            uint8 v,
            bytes32 r,
            bytes32 s
        ) public view returns (bool) {
            // Hash the credential directly without any prefix
            bytes32 credentialHash = keccak256(abi.encodePacked(credential));
    
            // Recover the signer address from the signature
            address recoveredSigner = ecrecover(credentialHash, v, r, s);
    
            // Check if the recovered address matches the approved signer
            if (signer == recoveredSigner) {
                return true;
            } else {
                return false; // Indicate an invalid signature
            }
        }
    
     
    
    }
    

    `;

    // Load solc-js compiler and compile the contract
    const compiler = await solcjs();
    const input = {
      language: "Solidity",
      sources: {
        "NewContract.sol": {
          content: sourceCode,
        },
      },
      settings: {
        outputSelection: {
          "*": {
            "*": ["abi", "evm.bytecode"],
          },
        },
      },
    };

    // Compile the contract
    const output = JSON.parse(await compiler.compile(JSON.stringify(input)));
    const compiledContract = output.contracts["NewContract.sol"]["NewContract"];
    const abi = compiledContract.abi;
    const bytecode = compiledContract.evm.bytecode.object;

    // Set up ethers.js provider and signer
    const provider = new ethers.BrowserProvider(window.ethereum); // Correct method in ethers v6
    const signer = await provider.getSigner(); // Updated for v6: getSigner is async

    // Deploy the contract using ethers.js
    const contractFactory = new ethers.ContractFactory(abi, bytecode, signer);
    const contract = await contractFactory.deploy();

    // Use getAddress() to get the deployed contract's address in ethers v6
    console.log("Contract Deployed to Address:", await contract.getAddress());
  }
}
