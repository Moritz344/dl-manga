import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { baseUrl } from './config.js';

// TODO: use ora for text color
// TODO: change popular field -> Select
// TODO: prompt theme
// TODO: base url nicht hardcoden

export async function getMangaID(manga_title) {

  // display available languages

  const url = `${baseUrl}/manga?title=${manga_title}`;

  var id = "";

  try {
    const response = await fetch(url, {
      method: 'GET',
      header:{
        'Content-Type': "application/json",

      },
    });

    if (!response.ok) {
      throw new Error(response.status);
    }else {
      const data = await response.json();


      for (let i=0;i<data.data.length;i++) {
        let titles = data.data[i]["attributes"]["title"];
        let names = titles["en"] || Object.values(titles)[0];
        console.log(data.data[i]["attributes"]["availableTranslatedLanguages"]);
        console.log(titles);

        if (names.match(manga_title)) {
          id = data.data[i]["id"]
          break;
        }



      }
    }
  } catch(err) {
    console.log(err);
  }

  console.log(id);

  return id;

}

//await getMangaID("Berserk");


export async function getMangaChapters(manga_id) {

  // NOTE: mangas die nur eine englische übersetzung haben
  // werden jz installiert anderer werden ignoriert!

  const url = `${baseUrl}/manga/${manga_id}/feed?translatedLanguage[]=en`

  var chapterList = {};

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    })

    if (!response.ok) {
      throw new Error(response.status);
    }else {
      const data = await response.json();

      for (let i=0;i<data.data.length;i++) {
        let id = data.data[i]["id"];
        let number = data.data[i]["attributes"]["chapter"];
        if ( number  ) {
          chapterList[id] = number;
        }


      }


    }
  }catch(error) {
    console.log(error);
  }

      return chapterList;
}

let c = await getMangaChapters("aa6c76f7-5f5f-46b6-a800-911145f81b9b");
console.log(c);

export async function getServerData(chapter_id) {

  //console.log(chapter_id);
  const url = `${baseUrl}/at-home/server/${chapter_id}`;
  var host = "";
  var pages = "";
  var chapter_hash = "";

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    })

    if (!response.ok) {
      throw new Error(response.status);
    }else{
      const data = await response.json();

      host = data.baseUrl;
      pages = data.chapter.data;
      chapter_hash = data.chapter.hash;

      //console.log(host,pages,chapter_hash);
    }


  }catch(error) {
    console.log(error);
  }

  return [host,pages,chapter_hash];

}

export async function DownloadChapters(pages,chapterNumber,manga_title,host,chapterHash,rootPath) {



  for (let i=0;i<chapterNumber;i++) {
    let chapterTitle = `Chapter_${i}`
    let folderPath = path.join(rootPath,chapterTitle);


    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath);

      for (let [i,page] of Object.entries(pages)) {
        //console.log("Page:",i,page);
        let image_url = `${host}/data/${chapterHash}/${page}`;
        //console.log("Image url:",image_url);

        const imageResponse = await fetch(image_url)

        try {
          if (!imageResponse.ok) {
            throw new Error(imageResponse.status)
          }

        } catch(error) {
          console.log(error);
        }


        const buffer = Buffer.from(await imageResponse.arrayBuffer());

        let pageTitle = `Page_${i}.jpg`
        fs.writeFileSync(path.join(folderPath,pageTitle),buffer,err => {
          if (err) {
            console.log(err)
          }


        });

        console.log(path.join(folderPath,pageTitle));

    }
      }

    }

  }

