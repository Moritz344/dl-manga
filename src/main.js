import { search, Separator } from '@inquirer/prompts';
import { select } from '@inquirer/prompts';
import { confirm } from '@inquirer/prompts';
import { input } from '@inquirer/prompts';
import { getMangaID,getMangaChapters,getServerData, DownloadChapters } from './downloadMangaFuncs.js';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { baseUrl } from './config.js';

// TODO: Choose Chapters to download
// TODO: test files
// FIX: tool is downloading mangas that are not in englich  NOTE: Temp Fix (nur englische kapitel verfügbar)

async function HomeScreen() {

  const answer = await select({
  message: "Select Categorie",
  choices: [
    {
      name: "Search Mangas",
      value: "Search Manga",
      description: "Search for Mangas"
    },
    {
      name: "Popular Mangas",
      value: "Popular Manga",
      description: "View popular Mangas"
    },
  ],


 });

  if (answer === 'Popular Manga') {
    await SearchMangaPopular();
  }else{
    await SearchManga();
  }

}

HomeScreen();

async function SearchMangaPopular() {
      const url = `${baseUrl}/manga?limit=10&order[followedCount]=desc `;
      const manga_list = [];

      try {
        const response = await fetch(url,{
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        });

        const data = await response.json();

        for (let i=0;i<data.data.length;i++) {
          let titles = data.data[i]["attributes"]["title"]
          let names = titles.en || Object.values(titles)[0]; // <- titles ist ein objekt


          manga_list.push({
            name: names,
            value: names,
          });
        }

        manga_list.push("Back");

      }catch(error) {
        console.log(error);
      }

  const answer = await select({
    pageSize: 7,
    loop: false,
    message: 'Select a Manga',
    choices: manga_list

  })

}

//SearchMangaPopular();

async function SearchManga() {
  const answer = await search({
    message: 'Search a Manga',
    source: async (input, { signal }) => {
      if (!input) {
        return [];
      }


      const url = `${baseUrl}/manga?title=${encodeURIComponent(input)}`;


      try {
        const response = await fetch(url,{ signal }, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        });

        const data = await response.json();


        //for (let i=0;i<data.data.length;i++) {
        //  let titles = data.data[i]["attributes"]["title"]
        //  let names = titles.en || Object.values(titles)[0]; // <- titles ist ein objekt

        //  console.log(Object.values(titles)[0]);
        //}


        return data.data.map((mg) => ({
          name: mg.attributes.title.en || Object.values(mg.attributes.title)[0],
          value: mg.attributes.title.en || Object.values(mg.attributes.title)[0],
        }));



      }catch(error) {
        return [];
      }

    },
  });

  await DownloadMangaQuery(answer);

}


//SearchManga();

async function DownloadManga(folder_path,manga_title) {
  console.log("");
  console.log("Downloading",manga_title,"in",folder_path);

  let id = await getMangaID(manga_title); // manga_id
  console.log("Manga id:",id);
  let chapterDic = await getMangaChapters(id); // manga_id
  //console.log("Dic:",chapterDic);

  if (Object.keys(chapterDic).length === 0 ) {
    console.log("[INFO]: No chapters found in english.")
  }

  for (const [id,number] of Object.entries(chapterDic)) {
    let [host,pages,chapter_hash] = await getServerData(id);


    await DownloadChapters(pages,number,manga_title,host,chapter_hash,folder_path);


  }




}

//await DownloadManga();

async function DownloadMangaQuery(manga_title) {
  const answer = await confirm({message:  `Are you sure you want to download ${manga_title}? `})

  if (!answer) {
    await SearchManga();
  }else{

    const root_path = path.join(os.homedir(), "Mangas");
    const fullPath = path.join(root_path,manga_title);

    if (!fs.existsSync(fullPath)) {
      fs.mkdirSync(path.join(root_path,manga_title), {recursive: true});
      await DownloadManga(fullPath,manga_title);
    }else {
      console.log("[ERROR]: Folder exists")
    }





  }


}
