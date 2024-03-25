import { Injectable } from '@angular/core';
import { writeFile } from 'fs/promises';
import { getFile, isRawData, getContentType, getSourceUrl, Url, saveFileInContainer} from "@inrupt/solid-client";
import { fetch } from '@inrupt/solid-client-authn-browser'
//import { verifiable } from "@transmute/vc.js/src/index";
//import { SigningAlgo  } from '@sphereon/did-auth-siop/dist/index';

@Injectable({
  providedIn: 'root'
})
export class SolidclientService {

  constructor() { }

  public getCredentials(){
    return readFileFromPod("https://elwin.solidweb.org/wallet/vc.jsonld");
    
  }


  public saveVc(vc: string){
    return saveVCinPod(vc);
    
  }

  public loadVCsFromPod(){
    
    
  }

}

async function saveVCinPod(vc: string) {
  try {
    const blob = new Blob([vc], { type: "plain/text" });
    const savedFile = await saveFileInContainer(
      "https://elwin.solidweb.org/wallet/",
      new File([blob], "vc", { type: "plain/text" }),
      { slug: "suggestedFileName.txt", contentType: "text/plain",  fetch: window.fetch.bind(window) }
    );

  } catch (err) {
    console.log(err);
  }

}

// Load verifiable credentials from Pod using authenitcated session
async function readCredentialsFromPod(fileURL: string | Url) {

  try {

    // // Pod URI of the user
    // const podUri = session.info.webId;

    // // Known location of VC index file (replace with actual location)
    // const vcIndexUrl = `${podUri}/.well-known/vc-index.json`;

    // // Fetch VC index
    // const vcIndexResponse = await getFetch(vcIndexUrl, { fetch: session.fetch });

    // // Parse VC index data (assuming JSON format)
    // const vcIndexes = await vcIndexResponse.json();

    // // Loop through each VC index entry
    // for (const vcIndex of vcIndexes) {
    //   const vcUrl = `${podUri}/${vcIndex.path}`;

    //   // Fetch VC data
    //   const vcResponse = await getFetch(vcUrl, { fetch: session.fetch });

    //   // Parse VC data (assuming JSON-LD format)
    //   const verifiableCredential = await vcResponse.json();

    //   // Process the retrieved verifiable credential data
    //   console.log(verifiableCredential);

    // }

  } catch (error) {
      throw error;
  }


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

