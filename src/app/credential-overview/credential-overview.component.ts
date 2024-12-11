import { Component } from "@angular/core";
import { SolidclientService } from "../solidclient.service";
import { CommonModule } from "@angular/common";
import { getVCHTML } from "@docknetwork/prettyvc";
import { MatButtonModule } from "@angular/material/button";
import { MatCardModule } from "@angular/material/card";
import rdfSerializer from "rdf-serialize";
const stringifyStream = require("stream-to-string");
import jsonld, { Options } from "jsonld";
import { toRdfJsDataset } from "@inrupt/solid-client";
import rdfParser from "rdf-parse";
const streamifyArray = require("streamify-array");
import { normalize } from 'jsonld';
import { Store } from "n3";
//const { Graph } = require('graphlib').Graph;
var Graph = require("@dagrejs/graphlib").Graph;
var graphlib = require("@dagrejs/graphlib");
import { Resolver } from "did-resolver";
import { getResolver } from "ethr-did-resolver";
import {
  IVerifiableCredential,
  IProof,
  W3CVerifiableCredential,
  isWrappedW3CVerifiableCredential,
  ICredential,
} from "@sphereon/ssi-types";
//const util = require('ethereumjs-util')
import {
  ethers,
  keccak256,
  getBytes,
  toUtf8Bytes,
  Signature,
  recoverAddress,
} from "ethers";
import { Base64 } from "js-base64";
import { Buffer } from "buffer";

@Component({
  selector: "app-credential-overview",
  standalone: true,
  imports: [MatCardModule, MatButtonModule, CommonModule],
  templateUrl: "./credential-overview.component.html",
  styleUrl: "./credential-overview.component.css",
})
export class CredentialOverviewComponent {
  credentials: { value: any, valid: boolean }[] = [];

  constructor(private solidservice: SolidclientService) {
    this.solidservice.getCredentials().then((credentialPromises) => {
      Promise.all(credentialPromises)
        .then((credentials) => {
          credentials.forEach((data: any, index) => {
            console.log(`File ${index + 1}:`, data);


            const rdfJsDataset = toRdfJsDataset(data);
            // Create a new directed graph
            var g = new Graph({ multigraph: true });
      
            //make a hashlist to store the predicate mapped as ints
            var predicateList = {};
      
            // Convert the RDF.js dataset to a Store<Quad> type
            const context = {}; // Define the context variable
            const store = new Store();
            for (const quad of rdfJsDataset) {
              store.addQuad(quad.subject, quad.predicate, quad.object, quad.graph);
              g.setEdge({
                v: quad.subject.value,
                w: quad.object.value,
                name: quad.predicate.value,
              });
              //g.setEdge(quad.subject.value, quad.object.value,"edge" , quad.predicate.value);
              console.log(
                quad.subject.value,
                quad.object.value,
                quad.predicate.value
              );
            }
      
            const topsorted = graphlib.alg.topsort(g);
            const rootnode = topsorted[0];
            console.log(g);
       
            const vc = this.buildJsonLdCredential(g, rootnode);
            //extraxt the urls from the type field need for the cannonization

            for (let i = 0; i < vc.type.length; i++) {
              vc.type[i] = vc.type[i].split("#")[1];
            };
  
            console.log(vc);
            console.log(JSON.stringify(vc));
      
            getVCHTML(vc).then((html: any) => {  
              
              this.validateCredential(vc).then((valid) => {
                this.credentials.push({ value: html.html, valid: valid});
              });
            });


          });
        })
        .catch((err) => {
          console.log("Failed to fetch credentials from container:", err);
        });
    });

  }

  deleteCredential(credential: string) {
    // Implement your logic to delete the credential
  }

  shareCredential(credential: string) {
    // Implement your logic to share the credential
  }

  findEdgeByValue(graph: any, edgeValue: any) {
    // Iterate through all edges in the graph
    for (let edge of graph.edges()) {
      // Check if the edge has the specified value
      if (edge.name === edgeValue) {
        // Return the edge
        return edge;
      }
    }
    return null; // If no such edge exists
  }

  buildJsonLdCredential(graph: any, rootNode: string) {
    // Initialize the credential object with the context at the start
    const w3cVerifiableCredential: any = {
      "@context": [
        "https://www.w3.org/ns/credentials/examples/v2",
        "https://www.w3.org/ns/credentials/v2"
      ],
    };

    // Start the recursive process to build the rest of the credential
    this.buildJsonLdCredentialRecursive(
      graph,
      rootNode,
      w3cVerifiableCredential
    );

    return w3cVerifiableCredential;
  }

  buildJsonLdCredentialRecursive(
    graph: any,
    rootNode: string,
    w3cVerifiableCredential: any
  ) {
    // If the root node is an ID or URN, add it to the JSON-LD object with the id
    if (rootNode.startsWith("urn:") || rootNode.startsWith("did:")) {
      w3cVerifiableCredential["id"] = rootNode;
    }

    // Get the neighbors of the node
    const neighbors = graph.successors(rootNode);
    console.log(neighbors);

    // Iterate through the neighbors
    for (const neighbor of neighbors) {
      console.log(neighbor);

      // Get the edge between the root node and the neighbor
      const edges = graph.nodeEdges(rootNode, neighbor);
      for (const edge of edges) {
        const keyname = this.extractKeyname(edge.name);

        // Check if the neighbor is a blank node
        if (neighbor.startsWith("b")) {
          // If it is a blank node, call the function recursively
          w3cVerifiableCredential[keyname] = {};
          this.buildJsonLdCredentialRecursive(
            graph,
            neighbor,
            w3cVerifiableCredential[keyname]
          );
        } else {
          // Check if the object already exists in the JSON-LD object
          if (w3cVerifiableCredential[keyname]) {
            // If it does, add it to an array
            if (Array.isArray(w3cVerifiableCredential[keyname])) {
              w3cVerifiableCredential[keyname].push(edge.w);
            } else {
              // If it is not an array, make it an array
              w3cVerifiableCredential[keyname] = [
                w3cVerifiableCredential[keyname],
                edge.w,
              ];
            }
          } else {
            // If it does not exist, add it to the JSON-LD object
            w3cVerifiableCredential[keyname] = edge.w;

            // Check if the object has more neighbors
            if (graph.successors(neighbor).length > 0) {
              w3cVerifiableCredential[keyname] = {};
              this.buildJsonLdCredentialRecursive(
                graph,
                neighbor,
                w3cVerifiableCredential[keyname]
              );
            }
          }
        }
      }
    }
  }

  //extract the keyname if the url can't be split throw an error
  extractKeyname(edgeName: string) {
    const keyName = edgeName.split("#").pop();
    if (keyName) {
      return keyName;
    } else {
      throw new Error('Invalid URL"),');
    }
  }

  validateCredential(credential: IVerifiableCredential): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
      const providerConfig = {
        name: "sepolia",
        rpcUrl: "https://sepolia.infura.io/v3/929f6c4236464db1b99c3d0e7ce006c8",
        registry: "0x03d5003bf0e79C5F5223588F347ebA39AfbC3818",
      };
  
      const resolver = new Resolver(getResolver(providerConfig));
  
      resolver
        .resolve("did:ethr:sepolia:0x9e96710A83277465cd8108ba41aA0d818288210e")
        .then((doc: any) => {
          console.log(doc);
        });
  
      const signature = (credential.proof as IProof).jws?.split(".")[2];
  
      //CHeck if the signature is valid
      if (!signature) {
        throw new Error("Invalid signature");
      }
  
      const { proof, ...UnsignedCredential } = credential;

      console.log("UnsignedCredential",JSON.stringify( UnsignedCredential as ICredential));
  
      const canonized =  jsonld.canonize(UnsignedCredential as ICredential, 
        
        {
          algorithm: "URDNA2015",
          format: "application/n-quads",
        }
      );


      const options: Options.Normalize = {
        algorithm: 'URDNA2015',
        skipExpansion: false,
        expansion: true,
        format: 'application/n-quads',
        useNative: false
       };
    
        normalize(UnsignedCredential as ICredential, options)
        .then(canonized => {
            console.log('Canonized Result:', canonized);
        })
        .catch(error => {
            console.error('Normalization Error:', error);
        });

        
  
      canonized.then((data: any) => {
        console.log(data);
  
        const messageHash = keccak256(toUtf8Bytes(data));
        console.log("messageHash", messageHash);
  
        const basse64decoded = Base64.decode(signature);
        console.log("basse64decoded", basse64decoded);
  
        const signaturedecoded = this.extractRS(basse64decoded);
  
        const sign = Signature.from({
          r: "0x" + signaturedecoded.r,
          s: "0x" + signaturedecoded.s,
          v: signaturedecoded.v,
        });

        console.log("Credential sign", sign);
  
        const recoveredAddress = ethers.recoverAddress(messageHash, sign);
        console.log("Credential recoveredAddress", recoveredAddress);
  
        //validate the if the signer is the same as the issuer
        if (recoveredAddress == credential.issuer.split(":").pop()) {
          resolve(true);
        }else{
          resolve(false);
          
        }
        
      });


    });

  }

  extractRS(signatureHex: string) {
    // Ensure the input is a string and has correct length
    if (signatureHex.length !== 130) { // 65 bytes * 2 (hex representation) = 130
        throw new Error("Invalid signature length");
    }

    // Convert hex string to bytes
    const signatureBytes = Buffer.from(signatureHex, "hex");

    // Define lengths
    const rLength = 32; // 32 bytes for r
    const sLength = 32; // 32 bytes for s
    const vLength = 1;  // 1 byte for v

    // Extract r, s, and v
    const r = signatureBytes.slice(0, rLength);
    const s = signatureBytes.slice(rLength, rLength + sLength);
    const v = signatureBytes.slice(rLength + sLength, rLength + sLength + vLength);

    // Convert back to hex for display
    return {
        r: r.toString("hex"),
        s: s.toString("hex"),
        v: v.toString("hex")
    };
}

}
