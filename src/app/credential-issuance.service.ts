import { Injectable } from "@angular/core";
import jsonld from "jsonld";
import {
  CNonceState,
  CredentialOfferPayloadV1_0_11,
  CredentialRequestV1_0_11,
  CredentialResponse,
  CredentialSupported,
  Grant,
  IStateManager,
  JWTVerifyCallback,
  JwtVerifyResult,
} from "@sphereon/oid4vci-common";
import {
  CredentialIssuanceInput,
  CredentialSignerCallback,
  VcIssuerBuilder,
} from "@sphereon/oid4vci-issuer";
import { JwtHelperService } from "@auth0/angular-jwt";
import { jwtDecode } from "../../node_modules/jwt-decode/build/esm/index.js";
import {
  AdditionalClaims,
  ICredential,
  ICredentialSubject,
  IVerifiableCredential,
  W3CVerifiableCredential,
} from "@sphereon/ssi-types";
import { v4 as uuidv4 } from "uuid";
import { CredentialService } from "./credential-request.service.js";
const jsigs: any = require("jsonld-signatures");
const {
  purposes: { AssertionProofPurpose },
} = jsigs;
var EC = require("elliptic").ec;
import { Base64 } from "js-base64";
const vc = require("@digitalcredentials/vc");
const { toUtf8Bytes, keccak256, concat } = require("ethers");
const hex2ascii = require("hex2ascii");

@Injectable({
  providedIn: "root",
})
export class CredentialIssuanceService {
  cNonceManager: cNonceManager;

  constructor(private credentialService: CredentialService) {
    //intialize cnonce manager
    this.cNonceManager = new cNonceManager();
  }

  public startRequest(credentialSubject: (ICredentialSubject & AdditionalClaims) | (ICredentialSubject & AdditionalClaims)[], types: string[]) {
    this.credentialService.vc = this.startCredentialIssuance( credentialSubject, types);
  }

  public async startCredentialIssuance(credentialSubject: (ICredentialSubject & AdditionalClaims) | (ICredentialSubject & AdditionalClaims)[], types: string[]) {
    const credentialsSupported: CredentialSupported[] = [];

    credentialsSupported.push({
      types: ["VerifiableCredential"],
      format: "jwt_vc_json",
    });

    this.cNonceManager.set("random-nonce-value", {
      cNonce: "random-nonce-value",
      createdAt: Date.now() + 60000, // 1 minute
      preAuthorizedCode: "urn:ietf:params:oauth:grant-type:pre-authorized_code", // Add the missing 'preAuthorizedCode' property
    });

    const vcIssuer = new VcIssuerBuilder()
      .withAuthorizationServer("http://localhost:4200/authorization-server")
      .withCredentialEndpoint("http://localhost:4200/credential-endpoint")
      .withCredentialIssuer("http://localhost:4200")
      .withTokenEndpoint("http://localhost:4200/token")
      .withDefaultCredentialOfferBaseUri(
        "http://localhost:4200/credential-offer"
      )
      .withIssuerDisplay({
        name: "example issuer",
        locale: "en-US",
      })
      .withCredentialsSupported(credentialsSupported)
      .withInMemoryCredentialOfferState()
      .withCNonceStateManager(this.cNonceManager)
      .withJWTVerifyCallback(this.jwtVerifyCallback)
      .withCredentialSignerCallback(this.credentialSignerCallback)
      .withCNonceExpiresIn(60000)
      .build();

    let uuid = uuidv4();

    const credentialIssuanceInput: CredentialIssuanceInput = {
      "@context": [
        "https://www.w3.org/ns/credentials/examples/v2",
        "https://www.w3.org/ns/credentials/v2"
      ], // Context
      type: types,
      id: ("urn:credential:" + uuid) as string,
      issuer: "did:example:issuer123",
      credentialSubject: credentialSubject,
      vct: "test", // Add the missing 'vct' property
      iss: "did:example:issuer123", // Add the missing 'iss' property
      iat: 50, // Add the missing 'iat' property
    };

    //create CredentialRequestV1_0_11
    const credentialRequest: CredentialRequestV1_0_11 = {
      format: "jwt_vc_json",
      types: ["VerifiableCredential"],
      proof: {
        proof_type: "jwt",
        jwt: "eyJhbGciOiJIUzI1NiIsInR5cCI6Im9wZW5pZDR2Y2ktcHJvb2Yrand0Iiwia2lkIjoiZGlkOmV4YW1wbGU6c3R1ZGVudDEyMyJ9.eyJpc3MiOiJkaWQ6ZXhhbXBsZTpzdHVkZW50MTIzIiwic3ViIjoic3ViamVjdC1pZGVudGlmaWVyIiwiYXVkIjoiaHR0cDovL2xvY2FsaG9zdDo0MjAwIiwiaWF0IjoxNzE4NjI0MTE4LCJleHAiOjE5MTYyNDI2MjIsIm5vbmNlIjoicmFuZG9tLW5vbmNlLXZhbHVlIiwiY3JlZGVudGlhbF9yZXF1ZXN0Ijp7ImZvcm1hdCI6Imp3dF92Y19qc29uIiwidHlwZXMiOlsiVmVyaWZpYWJsZUNyZWRlbnRpYWwiXSwicHJvb2YiOnsicHJvb2ZfdHlwZSI6Imp3dCJ9fX0.L2Cn3U-lqf-EAXMns5tasRarn78eFL_o7oYD7yTQVF8", // Place the actual JWT token here
      },
    };

    try {
      //Create an url offer point
      const grant: Grant = {
        "urn:ietf:params:oauth:grant-type:pre-authorized_code": {
          "pre-authorized_code":
            "urn:ietf:params:oauth:grant-type:pre-authorized_code", // Or your actual pre-auth code
          user_pin_required: false, // Add the missing property value
        },
      };

      const credentialOfferUri = vcIssuer.createCredentialOfferURI({
        grants: grant,
        qrCodeOpts: {},
      });

      const credentialResponse = vcIssuer.issueCredential({
        credential: credentialIssuanceInput,
        credentialRequest: credentialRequest,
      });

      const response = await credentialResponse;
      let credential = response.credential as string;

      console.log("Credential:", credential);
      //The stringified wraps the credential with quotes, so we need to remove them
      return response.credential as string; // credential.substring(1, credential.length -1);
    } catch (error) {
      console.error("Error Issuing Credential:", error);
      return "Could not create the credential";
    }
  }

  private verifySignature(jwt: string, secretOrPublicKey: string): boolean {
    // Example: Use a library like `jsonwebtoken` to verify the signature
    return true;
  }

  private credentialSignerCallback: CredentialSignerCallback<any> = async ({
    credentialRequest,
    credential,
    format,
    jwtVerifyResult,
  }) => {
    try {
      const jwt = jwtVerifyResult.jwt;
      const header = jwtVerifyResult.jwt.header;
      const payload = jwtVerifyResult.jwt.payload;

      console.log("Signing Credential:", {
        credentialRequest,
        credential,
        format,
        header,
        payload,
      });

      let uuid = uuidv4();

      const UnsignedCredential: ICredential = {
        "@context": [
          "https://www.w3.org/ns/credentials/examples/v2",
          "https://www.w3.org/ns/credentials/v2"
        ], // Context
        type: credential.type as string[],
        id: ("urn:credential:" + uuid) as string,
        issuer: "did:ethr:sepolia:0x9e96710A83277465cd8108ba41aA0d818288210e",
        credentialSubject: credential.credentialSubject as ICredentialSubject & AdditionalClaims,
        issuanceDate: new Date(credential.iat * 1000).toISOString(),
      };


      console.log("Unsigned Credential JSON.stringify(UnsignedCredential):",JSON.stringify(UnsignedCredential));

       const canonized = await jsonld.canonize(UnsignedCredential, {
        algorithm: 'URDNA2015',
        format: 'application/n-quads'
      });

       console.log("Canonicalized:", canonized);

      var ec = new EC("secp256k1");

      // Generate keys
      const keyPair = ec.genKeyPair();
      //convert hex to string
      //Private eth key
      const privateKeyHex =
        "5378DEF4E4BECD6158EB8F49E169D10D82D8D7306755621EC4A72AC9BBFAD021";
      //console.log('private Key Hex:', hex2ascii(privateKeyHex));
      const privatekey = ec.keyFromPrivate(privateKeyHex);
      //const publicKey = keyPair.getPublic('hex');
      //const privateKey = keyPair.getPrivate('hex');
      console.log(
        "private Key:",
        privatekey.getPrivate("hex"),
        "this should be 5378DEF4E4BECD6158EB8F49E169D10D82D8D7306755621EC4A72AC9BBFAD021"
      );
  
      //THis should be canonicalized nomally for test reasons we will use the keccak256 and sign the json-ld string
      const messageHash = keccak256(toUtf8Bytes(canonized));
      console.log("Message Hash:", messageHash);
      //Sha256 hash of the message
      const signature = privatekey.sign(messageHash.substring(2), {canonical: true,enc: 'hex'});
      console.log("Signature", signature);

      let encodedSignature = signature.r.toString("hex").padStart(64, '0');
      encodedSignature += signature.s.toString("hex").padStart(64, '0');
      encodedSignature += signature.recoveryParam.toString(16).padStart(2, '0');
 
      const r = signature.r.toString("hex");
      const s = signature.s.toString("hex");
      const recoveryParam = signature.recoveryParam.toString(); // Typically 0 or 1

      console.log("Signature:", { r, s, recoveryParam });

      // Base64URL encode the header and payload
      const encodedHeader = Base64.encodeURI(JSON.stringify(header));

      const encodedSignaturebase64 = Base64.toBase64(encodedSignature);

      const jwsToken = `${encodedHeader}..${encodedSignaturebase64}`;


// Add the proof property to the unsigned credential
  UnsignedCredential['proof'] = {
    created: new Date().toISOString(),
    proofPurpose: "assertionMethod",
    type: "EcdsaSecp256k1Signature2019",
    verificationMethod: "did:example:123#key1",
    jws: jwsToken,
  };

  console.log("Credential with Proof (unsigned):", UnsignedCredential);

  // Assign the credential with proof to the W3CVerifiableCredential
  let signedCredentialw3c: W3CVerifiableCredential = UnsignedCredential as W3CVerifiableCredential;


      console.log("Signed Credential W3C:", JSON.stringify(signedCredentialw3c));

      return signedCredentialw3c;
    } catch (error) {
      console.error("Error Signing Credential:", error);
      throw error;
    }
  };

  private jwtVerifyCallback: JWTVerifyCallback<any> = async ({ jwt, kid }) => {
    try {
      // 1. Fetch Key (replace with your actual implementation)
      const secretOrPublicKey = ""; // Replace with actual secret or public key

      console.log("JWT Verification:", { jwt, kid, secretOrPublicKey });

      // 2. Verify JWT
      const jwtHelper = new JwtHelperService();
      const decodedToken = jwtHelper.decodeToken(jwt);

      const decodedHeader = jwtDecode(jwt, { header: true });
      console.log("Decoded Header:", decodedHeader);

      if (jwtHelper.isTokenExpired(jwt)) {
        throw new Error("Token is expired");
      }

      // Verify signature (replace with your actual implementation)
      const isSignatureValid = this.verifySignature(jwt, secretOrPublicKey);
      if (!isSignatureValid) {
        throw new Error("Invalid JWT signature");
      }

      console.log("JWT Decoded:", decodedToken);

      return {
        alg: decodedHeader.alg as string,
        kid: decodedHeader.kid as string,
        did: "did:example:issuer123",
        didDocument: { id: "did:example:issuer123" },
        //jwk: decodedHeader.kid as string, MUST NOT be present if kid is present
        jwt: {
          header: {
            typ: decodedHeader.typ as string,
            alg: decodedHeader.alg as string,
            kid: decodedHeader.kid as string,
          },
          payload: decodedToken,
        },
      };
    } catch (error) {
      console.error("JWT Verification Error:", error);
      throw error;
    }
  };
}

export class cNonceManager implements IStateManager<CNonceState> {
  private cNonceStates: Map<string, CNonceState> = new Map();

  clearExpired(timestamp?: number | undefined): Promise<void> {
    const now = timestamp ?? Date.now();
    for (const [key, value] of this.cNonceStates.entries()) {
      if (value.createdAt < now) {
        this.cNonceStates.delete(key);
      }
    }
    return Promise.resolve();
  }
  getAsserted(id: string): Promise<CNonceState> {
    const state = this.cNonceStates.get(id);
    if (!state) {
      return Promise.reject(new Error(`CNonceState with id ${id} not found.`));
    }
    return Promise.resolve(state);
  }
  set(id: string, stateValue: CNonceState): Promise<void> {
    this.cNonceStates.set(id, stateValue);
    return Promise.resolve();
  }
  get(id: string): Promise<CNonceState | undefined> {
    return Promise.resolve(this.cNonceStates.get(id));
  }
  has(id: string): Promise<boolean> {
    return Promise.resolve(this.cNonceStates.has(id));
  }
  delete(id: string): Promise<boolean> {
    return Promise.resolve(this.cNonceStates.delete(id));
  }
  clearAll(): Promise<void> {
    this.cNonceStates.clear();
    return Promise.resolve();
  }
  startCleanupRoutine(timeout?: number | undefined): Promise<void> {
    throw new Error("Method not implemented.");
  }
  stopCleanupRoutine(): Promise<void> {
    throw new Error("Method not implemented.");
  }
}

export class MemoryCredentialOfferStateManager
  implements ICredentialOfferStateManager
{
  private readonly credentialOfferStateManager: Map<
    string,
    CredentialOfferState
  >;
  constructor() {
    this.credentialOfferStateManager = new Map();
  }

  async clearAllStates(): Promise<void> {
    this.credentialOfferStateManager.clear();
  }

  async clearExpiredStates(timestamp?: number): Promise<void> {
    const states = Array.from(this.credentialOfferStateManager.entries());
    timestamp = timestamp ?? +new Date();
    for (const [issuerState, state] of states) {
      if (state.createdOn < timestamp) {
        this.credentialOfferStateManager.delete(issuerState);
      }
    }
  }

  async deleteState(state: string): Promise<boolean> {
    return this.credentialOfferStateManager.delete(state);
  }

  async getState(state: string): Promise<CredentialOfferState | undefined> {
    return this.credentialOfferStateManager.get(state);
  }

  async hasState(state: string): Promise<boolean> {
    return this.credentialOfferStateManager.has(state);
  }

  async setState(
    state: string,
    payload: CredentialOfferState
  ): Promise<Map<string, CredentialOfferState>> {
    return this.credentialOfferStateManager.set(state, payload);
  }
}

export interface ICredentialOfferStateManager {
  setState(
    state: string,
    payload: CredentialOfferState
  ): Promise<Map<string, CredentialOfferState>>;

  getState(state: string): Promise<CredentialOfferState | undefined>;

  hasState(state: string): Promise<boolean>;

  deleteState(state: string): Promise<boolean>;

  clearExpiredStates(timestamp?: number): Promise<void>; // clears all expired states compared against timestamp if provided, otherwise current timestamp

  clearAllStates(): Promise<void>; // clears all states
}

export interface CredentialOfferState {
  credentialOffer: CredentialOfferPayloadV1_0_11;
  createdOn: number;
}


function hexToUtf8(hex: string): string {
  // Convert hex string to byte array
  let bytes: number[] = [];
  for (let i = 0; i < hex.length; i += 2) {
      bytes.push(parseInt(hex.substr(i, 2), 16));
  }

  // Convert byte array to UTF-8 string
  let utf8String = new TextDecoder().decode(new Uint8Array(bytes));
  return utf8String;
}