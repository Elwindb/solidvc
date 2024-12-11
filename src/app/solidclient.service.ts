import { Injectable } from '@angular/core';
import { getContainedResourceUrlAll, getSolidDataset, getFile, saveSolidDatasetAt, createSolidDataset, isRawData, getContentType, getSourceUrl, Url, saveFileInContainer, WithResourceInfo, thingAsMarkdown, addDatetime, addLiteral } from "@inrupt/solid-client";
import {  login, getDefaultSession } from '@inrupt/solid-client-authn-browser'
import { __await, __decorate } from "tslib"; // Import the 'tslib' module
import { LoginService } from './login.service';
import {JsonLdParser} from "jsonld-streaming-parser";
import {  DefaultGraph, Store } from 'n3';
import { promisifyEventEmitter } from 'event-emitter-promisify';
import { addRdfJsQuadToDataset } from '../../node_modules-backup/@inrupt/solid-client/dist/rdfjs.internal';
import { Quad } from '@rdfjs/types';
import { Readable } from 'stream';
import { DataFactory, Parser } from 'n3';
//import { ParserJsonld  } from '@rdfjs/parser-jsonld';

@Injectable({
  providedIn: 'root'
})
export class SolidclientService {
  //login of the pod
  // Removed loginFetch as it's not needed with LoginService
  //a qeue of the VCs to save in the pod
  vcQueue: any[];

  constructor(private loginService: LoginService) {
    //loggin 
    console.log("SolidClientService constructor");
    // Initialize the qeue
    this.vcQueue = [];

  }

  public async getCredentials(): Promise<Promise<any>[]> {
    try {
      // Fetch the SolidDataset representing the directory
      const directoryDataset = await getSolidDataset("https://elwindb.solidweb.org/vc/", { fetch: getDefaultSession().fetch });
  
      console.log("directoryDataset", directoryDataset);
  
      // Retrieve all URLs of the contained resources
      const fileUrls = getContainedResourceUrlAll(directoryDataset);
  
      console.log("Fetched files from the directory:", fileUrls);
  
      // Create an array of promises for fetching each file
      const filePromises = fileUrls.map((fileUrl) => {
        console.log("Fetching file at:", fileUrl);
        return readRDFromPod(fileUrl); // Returns a promise for each file
      });
  
      // Return the array of promises
      return filePromises;
  
    } catch (err) {
      console.log("directoryDataset failed", err);
      // Return an empty array in case of an error
      return [];
    }
  }
  

  saveVc(vc: string) {

    return saveVCinPodDRF(vc, getDefaultSession());

  }
}

async function saveVCinPodDRF(vc: string, session: any) {

  const store = new Store();
  const dg = new DefaultGraph();
  //Verifiable Credentials (VCs)  don't directly support the features of JSON-LD-star
  const parser = new JsonLdParser({rdfstar: false,  defaultGraph: dg});
  //if vc is not a string convert it to a string
  if(typeof vc !== "string"){
    vc = JSON.stringify(vc);
  }
  console.log(vc);
  parser.write(vc);
  parser.end();


    await promisifyEventEmitter(store.import(parser));

    // Logs all the quads in the store
    console.log(...store);

    //create a soliddataset
    let solidDatasetWithThings = createSolidDataset();
    
    for (const quad of store) {
      if(quad.graph.termType == "DefaultGraph"){
        solidDatasetWithThings = addRdfJsQuadToDataset(solidDatasetWithThings, quad);
        
      }else if(quad.graph.termType == "BlankNode"){
        //addRdfJsQuadToDataset does not support BlankNodes use default graph and make the si
        const newQuad = {subject: quad.graph, predicate: quad.predicate, object: quad.object, graph: dg} as any as Quad;

        solidDatasetWithThings = addRdfJsQuadToDataset(solidDatasetWithThings, newQuad);
      }
    }

  try {

    //verify is user is logged in 
    if (!session.info.isLoggedIn) {
      throw new Error("The user is not logged in.");
    }
    const url = new URL(session.info.webId as string);
    const urlvc = `${url.protocol}//${url.host}` + "/vc/";

    return  saveSolidDatasetAt(
      //use the subject of the first quad as the url
      urlvc +store.getQuads(null, null, null, null)[0].subject.value,
      solidDatasetWithThings,
      session
     );
   } catch (error) {
     console.error("Error saving VC to Pod:", error);
     throw error; // Re-throw the error for handling in the calling code
   }

}

async function readRDFromPod(fileURL: string | Url) {
  try {
    const myDataset = await getSolidDataset(
      fileURL,
      getDefaultSession()        // fetch from authenticated session
    );

    console.log("Fetched a SolidDataset:", myDataset);

    return myDataset;

  } catch (err) {
    console.log(err);
  }

  return null; // Add a return statement to handle the case when an error occurs
}

async function readFileFromPod(fileURL: string | Url) {

  try {
    // File (https://docs.inrupt.com/developer-tools/api/javascript/solid-client/modules/interfaces.html#file) is a Blob (see https://developer.mozilla.org/docs/Web/API/Blob)
    const file = await getFile(fileURL); // fetch from authenticated session

    console.log(`Fetched a ${getContentType(file)} file from ${getSourceUrl(file)}.`);
    console.log(`The file is ${isRawData(file) ? "not " : ""}a dataset.`);
    console.log(await file.text());

    const credential = file.text;
    const jsoncredential: JSON = JSON.parse(await file.text());

    console.log(jsoncredential);

    return jsoncredential;

  } catch (err) {
    console.log(err);
  }

  return null; // Add a return statement to handle the case when an error occurs
}

async function startLogin() {
  // Start the Login Process if not already logged in.
  if (!getDefaultSession().info.isLoggedIn) {
    await login({
      oidcIssuer: "https://elwindb.solidweb.org/",
      redirectUrl: new URL("/savevc", window.location.href).toString(),
      clientName: "My application"
    });
  }
}

async function solidDatasetToQuadStream(soliddataset: any) {

 // Create a quad stream from the Solid dataset
 const quadStream = new ReadableStream({
  start(controller) {
      // Parse the quads from the dataset and push them into the quad stream
      const parser = new Parser({ format: 'text/turtle' }); // Adjust format based on your dataset
      parser.parse(soliddataset.body, (error, quad, prefixes) => {
          if (error) {
              controller.error(error);
          } else if (quad) {
              controller.enqueue(quad);
          } else {
              controller.close(); // Signal end of stream
          }
      });
  }
});

return quadStream;
}