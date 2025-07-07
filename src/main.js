import { search, Separator } from '@inquirer/prompts';
import { select } from '@inquirer/prompts';

// NOTE: source funktion erwartet: { poop: "pooping", value: 'Wert' },

async function HomeScreen() {

  const answer = await select({
  message: "Select Categorie",
  choices: [
    {
      name: "Popular Manga",
      value: "Popular Manga",
      description: "View Popular Mangas."
    },
    {
      name: "Search Manga",
      value: "Search Manga",
      description: "Search for Mangas"
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

      }catch(error) {
        console.log(error);
      }


      return manga_list;


    },
  });

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

      const manga_list = [];

      try {
        const response = await fetch(url,{ signal }, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        });

        const data = await response.json();

        return data.data.map((mg) => ({
          name: mg.attributes.title.en,
          value: mg.attributes.title.en,
        }));


      }catch(error) {
        return [];
      }

    },
  });

}


//SearchManga();
