import { search, Separator } from '@inquirer/prompts';
import { select } from '@inquirer/prompts';
import { confirm } from '@inquirer/prompts';
import { input } from '@inquirer/prompts';
import { checkbox } from '@inquirer/prompts';
import { getMangaID,getMangaChapters,getServerData, DownloadChapters, getMangaLanguages, getRandomManga } from './downloadMangaFuncs.js';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { baseUrl } from './config.js';
import chalk from 'chalk';
import { PromptTheme, CheckboxPrompt,ErrorPrompt, asciiArt} from './config.js';
import { Command } from 'commander';

const program = new Command();

// TODO: test files
// TODO: View Downloaded Mangas / or history
// BUG:  view chapter screen shows duplicate chapter names sometimes ? NOTE: fixed
// TODO: commander



async function HandleArgv() {
  program
    .name('manga-cli')
    .description('Eine CLI-Anwendung für MangaDex')
    .version('1.0.0');
  
  
  program
    .command('search')
    .argument('<query>', 'Suchbegriff')
    .action((query ) => {
      DownloadMangaQuery(query);
    });


  if (process.argv.length <= 2) {
    console.log(asciiArt);
    console.log(chalk.red.bold("[NEW]: READ MANGAS IN DIFFERENT LANGUAGES!"));
    console.log("");
    await HomeScreen();
  }
  
  program.parse(process.argv);
}
await HandleArgv();

async function HomeScreen() {

  const answer = await select({
  message: "Select Option",
  theme:PromptTheme,
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
    {
      name: "Feeling Lucky?",
      value: "Random Manga",
      description: "View a Random Manga"
    },
  ],


 });

  if (answer === 'Popular Manga') {
    await SearchMangaPopular();
  }else if (answer === 'Random Manga'){
    await SearchRandomManga();
  }else{
    await SearchManga();
  }

}

HomeScreen();


async function SearchRandomManga() {
  let randomMangaTitle = await getRandomManga();

  const answer = await select({
    message: "Random Manga",
    theme:PromptTheme,
    choices: [
    {
      "name": randomMangaTitle,
      "value": randomMangaTitle,
      "description": randomMangaTitle
    },
    {
      "name": "Back",
      "value": "Back",
      "description": "Go back to the Home screen"
    },
    ]
  })

  if (answer === "Back") {
    await HomeScreen();
  }else{
    await DownloadMangaQuery(answer);
  }
}

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
    theme:PromptTheme,
    message: 'Select a Manga',
    choices: manga_list

  })

  if (answer === "Back") {
    await HomeScreen();
  }else {
    await DownloadMangaQuery(answer);
  }

}

//SearchMangaPopular();

async function SearchManga() {
  const answer = await search({
    message: 'Search a Manga ',
    theme: PromptTheme,

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

async function DownloadManga(folder_path,manga_title,amountOfChapters,language) {
  console.log("");
  console.log("[INFO]:",chalk.blue("Downloading",manga_title,"in",folder_path));
  console.log("");

  //console.log(amountOfChapters);

  let id = await getMangaID(manga_title); // manga_id
  //console.log("Manga id:",id);
  let chapterDic = await getMangaChapters(id,amountOfChapters,language); // manga_id
  //console.log("Dic:",chapterDic);

  //if (Object.keys(chapterDic).length === 0 ) {
  //  console.log("[INFO] No chapters found in english.")
  //}

  for (const [number,id] of Object.entries(chapterDic)) {
    //console.log("id",id,"number",number);
    let [host,pages,chapter_hash] = await getServerData(id);


    await DownloadChapters(pages,number,manga_title,host,chapter_hash,folder_path);


  }




}

//await DownloadManga();

async function ViewLanguages(manga_title) {


  let languageArr = await getMangaLanguages(manga_title);


  const answer = await select({
    message: "I found these languages: ",
    choices: languageArr,

  })

  return answer;
}

async function ViewChapters(manga_title,language) {

  let id = await getMangaID(manga_title); // manga_id
  let chapterDic = await getMangaChapters(id,"all",language); // manga_id




  var chapterArr = [];

  for (const [id,number] of Object.entries(chapterDic)) {

    chapterArr.push({
      name: `Chapter ${number}`,
      value: number,
      description: `Chapter number ${number}`,
    });
  }

  try {
    const answer = await checkbox({
      message: 'Select a Chapter(s)',
      choices: chapterArr,
      theme: CheckboxPrompt,
      loop: false,

    });
    return answer;

  } catch(error) {
    console.log(chalk.red("[ERROR]: No results:",error));
    await HomeScreen();
  }




}

async function DownloadMangaQuery(manga_title) {

  var mangaLanguage = await ViewLanguages(manga_title);
  var amountOfChapters = await ViewChapters(manga_title,mangaLanguage);

  //console.log("DEBUG",amountOfChapters);

  const answer = await confirm({
    message:  `Are you sure you want to download ${manga_title}? `,
    theme: PromptTheme
  });

  if (!answer) {
    await SearchManga();
  }else{

    const root_path = path.join(os.homedir(), "Mangas");
    const fullPath = path.join(root_path,manga_title);

    if (!fs.existsSync(fullPath)) {
      fs.mkdirSync(path.join(root_path,manga_title), {recursive: true});
      await DownloadManga(fullPath,manga_title,amountOfChapters,mangaLanguage);
    }else {
      const answerDeleteDir = await confirm({message: `A folder for ${manga_title} already exists. Should I delete it? `,theme: ErrorPrompt})
      if (!answerDeleteDir) {
        await SearchManga();
      }else{
        fs.rmSync(fullPath, { recursive: true, force: true });
        fs.mkdirSync(path.join(root_path,manga_title), { recursive: true });
        await DownloadManga(fullPath,manga_title,amountOfChapters,mangaLanguage);
      }
    }





  }


}
