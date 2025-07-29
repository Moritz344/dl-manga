Download mangas from the comfort of your terminal.

## Table of Contents

- [Features](#features)
- [Installation](#installation)

# Installation
```bash
npm i dl-manga
```

```bash
Usage: dl-manga [options] [command]

Download Manga in different languages

Options:
  -V, --version           output the version number
  -h, --help              display help for command

Commands:
  download <manga_title>
  random
  popular
  clear_history
  clear_marked
  help [command]          display help for command
```

# Features
- [x] Download Mangas
- [x] Search Manga
- [x] View Popular Manga  
- [x] prompt themes
- [x] debug infos with colors
- [x] Download Mangas in different languages
- [x] config file
- [x] User Manga list

# Small Config File

```bash
{
  "theme": "nord", // gruvbox or nord
  "ascii_on": false, // shows ascii art
  "marked": [ 
    "Back"
  ]
```


## Credits
This cli tool uses the mangadex api.

## Author
- Moritz344
