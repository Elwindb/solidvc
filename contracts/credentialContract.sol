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
