const fs = require('fs');
const os = require('os');
const path = require('path');
const { baseUrl } = require('./config.js');
const chalk = require('chalk');
const { PDFDocument } = require("pdf-lib");

async function getRandomManga() {
  const url = `${baseUrl}/manga/random`;

 
  try {
    const response = await fetch(url,{
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    })

    if (!response.ok) {
    throw new Error(response.status);
  }else{
    const data = await response.json();

    let randomTitle = data.data["attributes"]["title"];
    let randomMangaTitle = data.data["attributes"]["title"]["en"] || Objects.values(randomTitle)[0];

    return randomMangaTitle;
  }


  }catch(error) {
  console.log(chalk.red.bold("[Error]: No results."));
  }

}

async function ShowDownloadedMangas() {
  let fullPath = path.join(os.homedir(),"Mangas");

  var mangas = fs.readdirSync(fullPath);
  var mangaArr = [];

  for (let i=0;i<mangas.length;i++) {
    mangaArr.push({
      name: mangas[i],
      value: mangas[i],
    })
  }
    if (mangaArr.length === 0) {
        mangaArr.push({
        name: "Nothing here yet",
        value: "Nothing here yet"
      })
  }

    mangaArr.push({
      name: "Back",
      value: "Back",
      description: "Go back to the Home screen"
    })


  return mangaArr;
}

ShowDownloadedMangas();

async function getInformation(manga_title) {
  const url = `${baseUrl}/manga?title=${manga_title}`;

  try {
    const response = await fetch(url,{
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(response.status);
    }else{
      const data = await response.json();

      let tags = [];

      let description = data.data[0]["attributes"]["description"]["en"]
      let status = data.data[0]["attributes"]["status"]
      let year = data.data[0]["attributes"]["year"]


      for (let i=0;i<data.data[0]["attributes"]["tags"].length;i++) {
        let tag = data.data[0]["attributes"]["tags"][i];
        let tagName = tag["attributes"]["name"];
        let name = tagName?.["en"] || tagName?.[Object.keys(tagName)[0]];
        tags.push(name);
      }

      return { tags,description,status,year };
    }

  } catch(error) {
    console.log(error);
  }


}

// let { tags,description,status,year } = await getInformation("Naruto");

async function getMangaID(manga_title) {

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
        //console.log(data.data[i]["attributes"]["availableTranslatedLanguages"]);
        //console.log(titles);

        if (names.match(manga_title)) {
          id = data.data[i]["id"]
          break;
        }



      }
    }
  } catch(err) {
    console.log(err);
  }

  //console.log(id);

  return id;

}

//await getMangaID("Berserk");

async function getMangaLanguages(manga_title) {

  let id = await getMangaID(manga_title);
  var languages = [];
  var seen = new Set();
  var removeDuplicates = [];


  const url = `${baseUrl}/chapter?manga=${id}&limit=100`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    }
  });

  try {
    if (!response.ok) {
      throw new Error(response.status);
    }else{
      const data = await response.json();
      //console.log(data);

      for (let i=0;i<data.data.length;i++) {
        let l = data.data[i]["attributes"]["translatedLanguage"];
        languages.push({
          name: l,
          value:l
        });
      }

    }
  }catch(error) {
    //console.log(error);
    languages.push({
      name: "No results",
      value: "No results",
    })
  }

  for (let i=0;i<languages.length;i++) {
    const lang = languages[i];
    if (!seen.has(lang.name)) {
      seen.add(lang.name);
      removeDuplicates.push(lang);
    }
  }

  //console.log(removeDuplicates);


  return removeDuplicates;


}

//await getMangaLanguages("Berserk")

async function getMangaChapters(manga_id,amountOfChapters,mangaLang) {

  // NOTE: mangas die nur eine englische übersetzung haben
  // werden jz installiert anderer werden ignoriert!
  // get chapters that are in amountOfChapters


  //console.log(mangaLang);


  const url = `${baseUrl}/manga/${manga_id}/feed?translatedLanguage[]=${mangaLang}&order[chapter]=asc`

  var chapterList = {};

  var removeDuplicates = {};
  var seen = new Set();

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


      if (amountOfChapters === "all") {
        for (let i=0;i<data.data.length;i++) {
          let id = data.data[i]["id"];
          let number = data.data[i]["attributes"]["chapter"];
          if ( number  ) {
            chapterList[id] = number;
          }
        }
      }else{
        //console.log("Chapters I want to download:",amountOfChapters);
        for (let i=0;i<data.data.length;i++) {

          const chapterData = data.data[i];
          const chapterNumber = chapterData.attributes.chapter;
          const chapterId = chapterData.id;

          if ( chapterNumber && amountOfChapters.includes(chapterNumber) ) {
            chapterList[chapterNumber] = chapterId;
          }


        }


     }


    }
  }catch(error) {
    console.log(error);
  }

  for (let [id,number] of Object.entries(chapterList)) {
    if (!seen.has(number) ) {
      seen.add(number);
      removeDuplicates[id] = number;
    }
  }

      //console.log("remove",removeDuplicates);
      return removeDuplicates;
}

//let c = await getMangaChapters("32d76d19-8a05-4db0-9fc2-e0b0648fe9d0","all","en");
//console.log(c);

async function getServerData(chapter_id) {

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
    console.log(chalk.red("No results"));
    //console.log(error);
  }

  return [host,pages,chapter_hash];

}

async function CreatePdf(folderPath) {
  console.log(folderPath);
}

async function DownloadChapters(pages,chapterNumber,manga_title,host,chapterHash,rootPath,downloadType) {


    let chapterTitle = `Chapter_${chapterNumber}`
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
          console.log(chalk.red("No results"));
          //console.log(error);
        }


        const buffer = Buffer.from(await imageResponse.arrayBuffer());

        let pageTitle = `Page_${i}.jpg`

        // write jpg to folder


        fs.writeFileSync(path.join(folderPath,pageTitle),buffer,err => {
          if (err) {
            console.log(chalk.red.bold(err));
          }




        });

        console.log("[INFO]",path.join(folderPath,pageTitle));

    }
      }


  }
module.exports = {
  getRandomManga,
  ShowDownloadedMangas,
  getInformation,
  getMangaID,
  getMangaLanguages,
  getMangaChapters,
  getServerData,
  DownloadChapters,
};
