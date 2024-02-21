import { Injectable } from '@angular/core';
import { writeFile } from 'fs/promises';
import { getFile, isRawData, getContentType, getSourceUrl, Url, saveFileInContainer} from "@inrupt/solid-client";
//import { verifiable } from "@transmute/vc.js/src/index";
//import { SigningAlgo  } from '@sphereon/did-auth-siop/dist/index';

@Injectable({
  providedIn: 'root'
})
export class SolidclientService {

  constructor() { }

  public getHeroes(){
    readFileFromPod("https://elwin.solidweb.org/wallet/vc.jsonld");
    
  }


  public saveVc(vc: string){
    saveVCinPod(vc);
    
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

async function readFileFromPod(fileURL: string | Url) {
  try {
    // File (https://docs.inrupt.com/developer-tools/api/javascript/solid-client/modules/interfaces.html#file) is a Blob (see https://developer.mozilla.org/docs/Web/API/Blob)
    const file = await getFile(
      fileURL      // fetch from authenticated session
    );

    console.log( `Fetched a ${getContentType(file)} file from ${getSourceUrl(file)}.`);
    console.log(`The file is ${isRawData(file) ? "not " : ""}a dataset.`);
    console.log((await file.text()));

    const credential = file.text;
    const jsoncredential:JSON = JSON.parse( await file.text());

    console.log(jsoncredential);

  } catch (err) {
    console.log(err);
  }
}