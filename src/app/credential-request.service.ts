import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaderResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CredentialOfferClient, OpenID4VCIClient, MetadataClient, convertURIToJsonObject   } from '@sphereon/oid4vci-client';
import { ProofOfPossessionCallbacks, Alg, JWTHeader, Jwt, JWTSignerCallback, CredentialOffer, ProofOfPossession, JWTHeaderParameters, OpenId4VCIVersion, JWTVerifyCallback } from '@sphereon/oid4vci-common';
import * as Jose from 'jose'
import * as multibase from 'multibase';
import * as multicodec from 'multicodec';
import {  } from '@sphereon/oid4vci-common'; // Import the necessary module
@Injectable({
  providedIn: 'root'
})
export class CredentialService {
  vc: string | undefined;

  constructor() { }

  public async startRequest(oidcRequest: string) {
    this.vc = await testClient(oidcRequest) as string;
  }
}

const keypair = Jose.generateKeyPair(Alg.EdDSA);
//https://stackoverflow.com/questions/43871637/enable-cors-in-angular-web-application
async function testClient(uri: string) {
  const initiationURI = uri;
  const initiationRequestWithUrl = await CredentialOfferClient.fromURI(initiationURI);
  console.log("initiationRequestWithUrl");
  console.log(initiationRequestWithUrl);

  const metadataserver = await MetadataClient.retrieveAllMetadataFromCredentialOffer(initiationRequestWithUrl);

  console.log(metadataserver);  

  const client = await OpenID4VCIClient.fromURI({
    uri: uri,
    //kid: 'did:jwk:1235667890', // Our DID.  You can defer this also to when the acquireCredential method is called
    alg: Alg.EdDSA, // The signing Algorithm we will use. You can defer this also to when the acquireCredential method is called
    clientId: 'test-clientId', // The clientId if the Authrozation Service requires it.  If a clientId is needed you can defer this also to when the acquireAccessToken method is called
    retrieveServerMetadata: true, // Already retrieve the server metadata. Can also be done afterwards by invoking a method yourself.
  });

  console.log(client.getIssuer()); // https://issuer.research.identiproof.io
  console.log(client.getCredentialEndpoint()); // https://issuer.research.identiproof.io/credential
  console.log(client.getAccessTokenEndpoint()); // https://auth.research.identiproof.io/oauth2/token


  const metadata = await client.retrieveServerMetadata();
  console.log(metadata);

  //Add the parameters you want to send to the Authorization Service

  const accessToken = await client.acquireAccessToken();
  console.log(accessToken);


  const publicKeyvalue = await crypto.subtle.exportKey('raw', (await keypair).publicKey as CryptoKey);

  // Encode the public key using Multibase with base58-btc

  const test = multibase.encode('base58btc', multicodec.addPrefix('ed25519-pub', new Uint8Array(publicKeyvalue)))
  const decoder = new TextDecoder('utf8');
  const str = decoder.decode(test);

  console.log(str);



  const credentialResponse = await client.acquireCredentials({
    credentialTypes: 'VerifiableId',
    proofCallbacks: callbacks,
    format: 'jwt_vc_json-ld',
    alg: Alg.EdDSA,
    kid: 'did:key:' + str,
    jti: '1234567890',
  });

  console.log(credentialResponse.credential);

  return credentialResponse.credential;

}
//const  keypair  =  Jose.generateKeyPair(Alg.ES256);
// Must be JWS
async function signCallback(args: Jwt, kid: string): Promise<string> {
  //generate keypair with options

  //const { publicKey, privateKey } = await Jose.generateKeyPair(Alg.ES256);//, { crv: 'Ed25519' } );
  //console.log(publicKey);
  //const publicKey = await crypto.subtle.exportKey('spki', (await keypair).publicKey as CryptoKey);
  //const publicKeyBase64URL = (publicKey);
  //const publicKeyvalue = await crypto.subtle.exportKey('raw', publicKey as CryptoKey);



// Now 'myString' contains the decoded string
  //put the private key in a did of the setissuer
  //const privateKeykeyPair = await crypto.subtle.generateKey({ name: 'RSASSA-PKCS1-v1_5' }, true, ['sign', 'verify']);
  //const privateKey = await crypto.subtle.exportKey('raw', (await keypair).privateKey as CryptoKey);
  //console.log((await keypair).privateKey);

  return await new Jose.SignJWT({ ...args.payload })
  .setProtectedHeader({ alg: args.header.alg, typ: 'openid4vci-proof+jwt', kid: kid })
    .setIssuedAt()
    .setIssuer(kid)
    .setSubject(kid)
    .setAudience(args.payload?.aud || '') // Add null check and provide default value
    .setExpirationTime('2h')
    .sign((await keypair).privateKey);
}

const callbacks: ProofOfPossessionCallbacks<JWTHeaderParameters> = {
  signCallback: signCallback as JWTSignerCallback, // Add type assertion
};


