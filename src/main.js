import { search, Separator } from '@inquirer/prompts';
import { select } from '@inquirer/prompts';
import { confirm } from '@inquirer/prompts';
import { input } from '@inquirer/prompts';
import { getMangaID,getMangaChapters,getServerData, DownloadChapters } from './downloadMangaFuncs.js';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

// NOTE: source funktion erwartet: { poop: "pooping", value: 'Wert' },
// TODO: base url nicht hardcoden
// TODO: Choose Chapters to download


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
  const answer = await search({
    pageSize: 7,
    message: 'Select an Manga',
    source: async (input, { signal }) => {
      if (!input) {
        return [];
      }


      const url = "https://api.mangadex.org/manga?limit=10&order[followedCount]=desc";
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
            value: names
          });
        }

        manga_list.push("Back");

      }catch(error) {
        console.log(error);
      }


      return manga_list;


    },

  });
    if (answer === "Back") {
      await HomeScreen();
    }

}


//SearchMangaPopular();

async function SearchManga() {
  const answer = await search({
    message: 'Select a Manga',
    source: async (input, { signal }) => {
      if (!input) {
        return [];
      }


      const url = `https://api.mangadex.org/manga?title=${encodeURIComponent(input)}`;


      try {
        const response = await fetch(url,{ signal }, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        });

        const data = await response.json();


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


  // WHAT WE NEED: pages,chapter_number,host,chapter_hash

  let id = await getMangaID(manga_title); // manga_id
  //console.log("Manga id:",id);
  let chapterDic = await getMangaChapters(id); // manga_id
  //console.log("Dic:",chapterDic);

  for (const [id,number] of Object.entries(chapterDic)) {
    let [host,pages,chapter_hash] = await getServerData(id);


    await DownloadChapters(pages,number,manga_title,host,chapter_hash,folder_path);


  }




}

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
