<h1 align="center">dl manga</h1>

![Timeline 1](https://github.com/user-attachments/assets/65816e98-0334-4cb9-9770-67e71645cfca)

![Linux](https://img.shields.io/badge/Linux-FCC624?style=for-the-badge&logo=linux&logoColor=black)



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
  "theme": "nord",
  "ascii_on": false,
  "clear_history_on_start": false,
  "marked": [
  ],
  "history": [
  ]
}
```


## Credits
This cli tool uses the mangadex api.

## Author
- Moritz344
