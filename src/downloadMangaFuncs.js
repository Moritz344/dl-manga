import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

// TODO: use ora for text color
// TODO: change popular field -> Select
// TODO: prompt theme

export async function getMangaID(manga_title) {

  const url = `https://api.mangadex.org/manga?title=${manga_title}`;

  var id = "";

  try {
    const response = await fetch(url, {
      method: 'GET',
      header:{
        'Content-Type': "applications/json",

      },
    });

    if (!response.ok) {
      throw new Error(response.status);
    }else {
      const data = await response.json();

      for (let i=0;i<data.data.length;i++) {
        let titles = data.data[i]["attributes"]["title"];
        let names = titles["en"] || Object.values(titles)[0];

        if (names.match(manga_title)) {
          id = data.data[i]["id"]
          break;
        }



      }
    }
  } catch(err) {
    console.log(err);
  }

  return id;

}

export async function getMangaChapters(manga_id) {

  const url = `https://api.mangadex.org/manga/${manga_id}/feed?`

  var chapterList = {};

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'applications/json',
      }
    })

    if (!response.ok) {
      throw new Error(response.status);
    }else {
      const data = await response.json();

      for (let i=0;i<data.data.length;i++) {
        let id = data.data[i]["id"];
        let number = data.data[i]["attributes"]["chapter"];
        chapterList[id] = number;

      }


    }
  }catch(error) {
    console.log(error);
  }

  return chapterList;
}

//let c = await getMangaChapters("30196491-8fc2-4961-8886-a58f898b1b3e");
//console.log(c);

export async function getServerData(chapter_id) {

  //console.log(chapter_id);
  const url = `https://api.mangadex.org/at-home/server/${chapter_id}`;
  var host = "";
  var pages = "";
  var chapter_hash = "";

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'applications/json',
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

