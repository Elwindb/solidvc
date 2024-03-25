import { Injectable } from '@angular/core';
import { CredentialOfferClient, OpenID4VCIClient, MetadataClient   } from '@sphereon/oid4vci-client';
import { ProofOfPossessionCallbacks, Alg, Jwt, JWTSignerCallback, JWTHeaderParameters, AuthorizationRequestOpts } from '@sphereon/oid4vci-common';
import * as Jose from 'jose'
import * as multibase from 'multibase';
import * as multicodec from 'multicodec';
import {  } from '@sphereon/oid4vci-common'; // Import the necessary module
@Injectable({
  providedIn: 'root'
})
export class CredentialService {
  vc: Promise<string>;

  constructor() {
    this.vc = Promise.resolve('no vc has been requested yet');
  }

  public startRequest(oidcRequest: string) {
    this.vc = testClient(oidcRequest);
    // testClient(oidcRequest).then((result) => {
    //   this.vc += result; // This will log "Promise resolved with a value" after 2 seconds
    // });
  }
}

const keypair = Jose.generateKeyPair(Alg.EdDSA);
//https://stackoverflow.com/questions/43871637/enable-cors-in-angular-web-application
async function testClient(uri: string) {
  try {
    const initiationURI = uri;
    const initiationRequestWithUrl = await CredentialOfferClient.fromURI(initiationURI);
    console.log("initiationRequestWithUrl");
    console.log(initiationRequestWithUrl);
  
    const metadataserver = await MetadataClient.retrieveAllMetadataFromCredentialOffer(initiationRequestWithUrl);
  
    console.log(metadataserver);
  
    const authorizationRequestOpts: AuthorizationRequestOpts = {
      redirectUri: 'https://your-app.com/callback',
      scope: 'read_user_profile openid',
      //state: "blabla", // Function to generate a random string
      //display: 'page', // Optional: Request the authorization server to display a full page for login
      //prompt: 'consent', // Optional: Request the authorization server to prompt the user for consent if not already granted
    };
  
    const client = await OpenID4VCIClient.fromURI({
      uri: uri,
      createAuthorizationRequestURL: true,
      authorizationRequest: authorizationRequestOpts,
      //kid: 'did:jwk:1235667890', // Our DID.  You can defer this also to when the acquireCredential method is called
      alg: Alg.EdDSA, // The signing Algorithm we will use. You can defer this also to when the acquireCredential method is called
      clientId: 'test-clientId', // The clientId if the Authrozation Service requires it.  If a clientId is needed you can defer this also to when the acquireAccessToken method is called
      retrieveServerMetadata: true, // Already retrieve the server metadata. Can also be done afterwards by invoking a method yourself.
    });
  
    if (client.hasAuthorizationURL()) {
      // Redirect the user to the authorization request URL
      console.log('Authorization Code flow  supported');
    } else {
      // Handle cases where the offer doesn't support the Authorization Code flow
      console.log('Authorization Code flow not supported');
    }
  
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
  
    console.log(credentialResponse.credential as string);
  
    return credentialResponse.credential as string;
  } catch (error) {
    throw new Error('Error in testClient: ' + error);
  }
 

}

async function signCallback(args: Jwt, kid: string): Promise<string> {


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


