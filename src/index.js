#!/usr/bin/env node

const { search, Separator, select, confirm, input, password, checkbox } = require('@inquirer/prompts');
const {
  getMangaID,
  getMangaChapters,
  getServerData,
  DownloadChapters,
  getMangaLanguages,
  getRandomManga,
  ShowDownloadedMangas,
  getInformation,
  getNewMangas,
  UpcomingMangas
} = require('./downloadMangaFuncs.js');

const fs = require('fs');
const os = require('os');
const path = require('path');
const { baseUrl, GruvboxTheme, NordTheme, ErrorPrompt, asciiArt } = require('./config.js');
const chalk = require('chalk').default;
const { Command } = require('commander');


// TODO: more homescreen options last option
// NOTE: fixed hardcoded version number

//let path = path.join(os.homedir,"/Mangas");
//if (!fs.existsSync(path)) {
//		fs.mkdirSync(path);
//}

const configPath = path.resolve(__dirname, 'config.json');

const configData = fs.readFileSync(configPath, 'utf-8');
const config = JSON.parse(configData);
var history = config.history;
var historyOption = config.clear_history_on_start;

if (historyOption) {
    history.length = 0;
}


const theme = config.theme;
var UserTheme = undefined;
const page_size = 20;


if (theme === "gruvbox") {
  UserTheme = GruvboxTheme;
}else if (theme === "nord") {
  UserTheme = NordTheme;
}

const program = new Command();

const pkg = JSON.parse(
  fs.readFileSync(path.join(__dirname,'package.json'),'utf-8')
);


async function HandleArgv() {
  program
    .name('dl-manga')
    .description('Download Mangas in different languages')
    .version(pkg.version);
  
  
  program
    .command('download')
    .argument('<manga_title>',"manga title")
    .action((query) => {
      DownloadMangaQuery(query);
    });

  program
    .command('random')
    .description("Get a random manga")
    .action(() => {
      SearchRandomManga();
    });
  program
    .command('popular')
    .description("Get Alltime popular manga")
    .action(() => {
      SearchMangaPopular();
    });
  program
    .command('clear_history')
    .action(() => {
      console.log("Cleared History");
      history.length = 0;
      fs.writeFileSync('./config.json',JSON.stringify(config,null,2),'utf-8');
    });
  program
    .command('clear_marked')
    .action(() => {
      console.log("Cleared Marked Mangas");
      config.marked.length = 0;
      fs.writeFileSync('./config.json',JSON.stringify(config,null,2),'utf-8');
    });


  if (process.argv.length <= 2) {
    console.log("");
    await HomeScreen();
  }
  
  program.parse(process.argv);
}
HandleArgv();

async function HomeScreen() {

  console.clear();
  if (config.ascii_on) {
      console.log(asciiArt);
    }
  try {
    const answer = await select({
    message: "Select Option \n",
    theme:UserTheme,
    loop: false,
    pageSize: page_size,
    choices: [
      {
        name: "Search Mangas",
        value: "Search Manga",
        description: " \nSearch for Mangas"
      },
      {
        name: "Alltime Popular Mangas",
        value: "Alltime Popular Manga",
        description: " \nView popular Mangas"
      },
      {
        name: "Popular Mangas This Year",
        value: "Popular Manga",
        description: " \nView popular Mangas"
      },
      {
        name: "Upcoming Manga",
        value: "Upcoming",
        description: " \nView upcoming Mangas"
      },
      {
        name: "Feeling Lucky?",
        value: "Random Manga",
        description: " \nView a Random Manga"
      },
      {
        name: "Downloaded Mangas",
        value: "Downloaded Mangas",
        description: " \nView your Downloaded Mangas"
      },
      {
        name: "View Manga List",
        value: "List",
        description: " \nView your Manga List"
      },
      {
        name: "History",
        value: "history",
        description: " \nView your Manga History"
      },
      {
        name: "Exit",
        value: "Exit",
        description: " \nExit program"
      }

    ],


    });

    // holy

     if (answer === 'Alltime Popular Manga') {
       await SearchMangaPopular();
     }else if (answer === 'Random Manga'){
       await SearchRandomManga();
     }else if (answer === 'Downloaded Mangas'){
      await SearchDownloadedMangas();
    }else if (answer === 'Search Manga'){
       await SearchManga();
    }else if (answer === "List"){
      await ShowMangaList();
    }else if (answer === "history") {
      await ShowHistory();
    }else if (answer === "Popular Manga") {
      await ShowPopularMangaNew();
    }else if (answer === "Upcoming"){
      await ShowUpcomingManga();
    }else {

      process.exit();
    }
    

  } catch(error) {
    console.log(error);
    console.log(chalk.green.bold("Abort"));
  }


}

async function ShowUpcomingManga() {
  let manga_list = await UpcomingMangas();

  if (!manga_list.includes("Back")) {
    manga_list.push({
      name: "Back",
      value: "Back"
    })

  }


  try {
    const answer = await select({
      message: "Select an Option",
      theme: UserTheme,
      loop: false,
      choices:manga_list,
      pageSize: page_size
    })
    if (answer === "Back") {
      await HomeScreen();
    }else{
      await DownloadMangaQuery(answer);
    }
  }catch(err) {
    console.log(err);
  }

}

async function ShowPopularMangaNew() {
  try {

  
    let manga_list = await getNewMangas();
    manga_list.push({
      name: "Back",
      value: "Back",
    })
    const answer = await select({
      message: "Select Option",
      loop: false,
      choices:manga_list,
      pageSize: page_size,
      theme: UserTheme,
    })

    if (answer === "Back") {
      await HomeScreen();
    }else{
      await MangaOptions(answer);
    }
  }catch(err) {
    await HomeScreen();
  }
}

async function ShowMangaList() {


  let markedArray = config.marked;

  const value = markedArray.indexOf("Back");
  markedArray.splice(value,1);
  markedArray.push("Back");

  try {
    const answer = await select({
      message: "Select Action",
      theme: UserTheme,
      loop: false,
      choices: markedArray,
    })

    if (answer === "Back") {
      await HomeScreen();
    }else {
      await MangaOptions(answer);
    }

  }catch(err) {
    await HomeScreen();
  }



}

async function ShowHistory() {


  let historyArray = history;

  const value = historyArray.indexOf("Back");
  historyArray.splice(value,1);
  historyArray.push("Back");


  try {
    const answer = await select({
      message: "History",
      theme:UserTheme,
      loop:false,
      pageSize:page_size,
      choices: historyArray
    })

    console.log(answer);

    if (answer === "Back") {
      await HomeScreen();
    }else{
      await DownloadMangaQuery(answer);
    }

  }catch(err) {
    await HomeScreen();
  }

}

async function ShowInformation(manga_title,last_query) {
  try{
    console.clear();
    let { tags,description,status,year } = await getInformation(manga_title);

    var statusColored = "";

    if (status === "completed") {
      statusColored = chalk.green(status);
    }else{
      statusColored = chalk.red(status);

    }

    const infos = `
    Title  ${chalk.green(manga_title)}
    Year   ${chalk.blue(year)}
    Status ${statusColored}
    Tags   ${chalk.blue(tags)}

    ${chalk.yellow("Description")}

    ${description}
   `

    console.log(infos);


    const answer = await confirm({ message: "Do you want to go back ",theme: UserTheme},);

    
    if (answer && last_query === "Download") {
      await MangaOptions(manga_title);
    }else if (answer && last_query === "Local Download"){
      await ShowOptionDownloadedMangas(manga_title);
    }else{
      await ShowInformation(manga_title,last_query);
  }
  }catch(err) {
    console.log(err);
  }
}


async function ShowOptionDownloadedMangas(manga_title) {
  try {

    console.clear();
    const answer = await select({
      message: "Select Option",
      loop: false,
      theme: UserTheme,
      choices: [
        {
          name: "View Downloaded Chapters",
          value: "View Downloaded",
        },
        {
          name: "View Info",
          value: "Info",
        },
        {
          name: "Back",
          value: "Back"
        }
      ]
    })
    if (answer === "View Downloaded") {
      await ShowDownloadedChapters(manga_title);
    }else if (answer === "Back") {
      await HomeScreen();
    }else if (answer === "Info") {
      await ShowInformation(manga_title,"Local Download");
    }
  }catch(err) {
    console.log(err);
  }
}

async function ShowDownloadedChapters(answer,) {
        console.clear();
        let pfad = path.join(os.homedir(),`Mangas/${answer}`);
        var chapterArr = [];
        var listChapters = fs.readdirSync(pfad);



        for (let i=0;i<listChapters.length;i++) {
              chapterArr.push({
                name: listChapters[i],
                value: listChapters[i],
                description: listChapters[i]
            })
        }

       chapterArr.push({
                name: "Back",
                value: "Back",
            })


        const selected = await select({
          message: "View Downloaded Chapters:",
          choices: chapterArr,
          theme: UserTheme,
          loop: false,
      })

        if (selected === "Back") {
          await ShowOptionDownloadedMangas(answer);
        }
      

}

async function SearchDownloadedMangas() {

  var mangas = await ShowDownloadedMangas();

  try {
    const answer = await search({
      message: "Search Downloaded Mangas (space to see all)",
      theme: UserTheme,
      pageSize: page_size,
      source: async (input, { signal }) => {
        if (!input) return [];

 
        return mangas
          .filter((manga) =>
            manga.name.toLowerCase().includes(input.toLowerCase())
          )
          .map((manga) => ({
            name: manga.name,
            value: manga.value

          }));
      },
    });
  await ShowOptionDownloadedMangas(answer);
  }catch(err) {
    await HomeScreen();
  }



    
}



async function SearchRandomManga() {
  console.clear();
  let randomMangaTitle = await getRandomManga();

  try {
    const answer = await select({
      message: "Random Manga",
      theme:UserTheme,
      choices: [
      {
        "name": randomMangaTitle,
        "value": randomMangaTitle,
        "description": randomMangaTitle
      },
      {
        "name": "Back",
        "value": "Back",
      },
      ]
    })
    if (answer === "Back") {
      await HomeScreen();
    }else{
      await MangaOptions(answer);
    }

  }catch(err) {
    await HomeScreen();
  }

}

async function SearchMangaPopular() {
      console.clear();
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
        console.log(chalk.red("No results"));
      }

  try {
    const answer = await select({
      pageSize: page_size,
      loop: false,
      theme:UserTheme,
      message: 'Select a Manga',
      choices: manga_list

    })

    if (answer === "Back") {
      await HomeScreen();
    }else {
      await MangaOptions(answer);
    }

    }catch(err) {
    await HomeScreen();
  }

}


//SearchMangaPopular();

async function MangaOptions(manga_title) {
  console.clear();
  const answer = await select({
    message: "Select Option",
    loop: false,
    theme:UserTheme,
    choices: [
      {
        name: "Download Manga",
        value: "Download Manga",
        description: " \Download a Manga"
      },
      {
        name: "View Info",
        value: "View Info",
        description: " \nView Manga information"
      },
      {
        name: "Add to List",
        value: "Add to List",
        description: " \nAdd Manga to your manga list"
      },
      {
        name: "Remove from List",
        value: "Remove from List",
        description: " \nRemove a Manga from your list"
      },
      {
        name: "Back",
        value: "Back",
      },

    ],
  })

  if (!history.includes(manga_title)) {
    history.push(manga_title);
  }


  fs.writeFileSync('./config.json',JSON.stringify(config,null,2),'utf-8');

  if (answer === "Download Manga") {
    await DownloadMangaQuery(manga_title);
  }else if (answer === "Back") {
    await HomeScreen();
  }else if (answer === "View Info") {
    await ShowInformation(manga_title,"Download");
  }else if (answer === "Add to List") {
    await AddMangaToMarked(manga_title);
  }else if (answer === "Remove from List") {
    await RemoveMangaFromList(manga_title);
  }

}

async function RemoveMangaFromList(manga_title) {

  const value = config.marked.indexOf(manga_title);

  if ( config.marked.includes(manga_title)) {
    config.marked.splice(value,1);

  }

  fs.writeFileSync('./config.json',JSON.stringify(config,null,2),'utf-8');
  //console.log(chalk.red("Remove ",manga_title,"from list"));

  await MangaOptions(manga_title);

}

async function AddMangaToMarked(manga_title) {
  
  //console.log("adding ",manga_title,"to list");
  if (!config.marked.includes(manga_title)) {
    config.marked.push(manga_title);

  }

  fs.writeFileSync('./config.json',JSON.stringify(config,null,2),'utf-8');

  await MangaOptions(manga_title);
}

async function SearchManga() {
  console.clear();
  try {
    const answer = await search({
      message: 'Search a Manga ',
      pageSize: page_size,
      theme: UserTheme,

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
    
    await MangaOptions(answer);

    }catch(error) {
      console.log(chalk.green.bold("Abort"));
    }


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
  console.clear();


  let languageArr = await getMangaLanguages(manga_title);

  try {

  const answer = await select({
    message: "I found these languages: ",
    choices: languageArr,
    theme: UserTheme,
    pageSize: 5,
    loop:false,

  })

  return answer;
  }catch(err) {
    await HomeScreen();
  }
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
      theme: UserTheme,
      loop: false,

    });
    return answer;

  } catch(error) {
    console.log(chalk.red("[ERROR]: No results:",error));
    await HomeScreen();
  }




}

async function DownloadMangaQuery(manga_title) {
  
  console.clear();


  var mangaLanguage = await ViewLanguages(manga_title);
  var amountOfChapters = await ViewChapters(manga_title,mangaLanguage);


  //console.log("DEBUG",amountOfChapters);

  const answer = await confirm({
    message:  `Are you sure you want to download ${manga_title}? `,
    theme: UserTheme 
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
