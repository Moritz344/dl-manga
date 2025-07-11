import { getMangaID } from '../downloadMangaFuncs.js';
import { getMangaChapters } from '../downloadMangaFuncs.js';



test( "getMangaID returns a non-empty string ID", async () => {

  const id = await getMangaID("Berserk");
  expect(typeof id).toBe('string');

  console.log(id);

});


test( "getMangaChapters returns a dic with the id and chapter number", async () => {
  const c = await getMangaChapters("801513ba-a712-498c-8f57-cae55b38cc92","all","en");
  expect(Object.keys(c).length).toBeGreaterThan(0);
});
