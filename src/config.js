import chalk from "chalk";
export const baseUrl = "https://api.mangadex.org";

export const NordTheme = {
  prefix: {
    idle: chalk.hex("#88C0D0")("❯"), // nord10 - frost blue
    done: chalk.hex("#A3BE8C")("✔"), // nord14 - green
  },
  spinner: {
    interval: 80,
    frames: ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"],
  },
  style: {
    answer: (txt) => chalk.hex("#A3BE8C").bold(txt), // nord14 - green
    message: (txt, status) => {
      if (status === "done") return chalk.hex("#4C566A")(txt); // nord3 - comment gray
      return chalk.hex("#D8DEE9")(txt); // nord5 - light text
    },
    error: (txt) => chalk.hex("#BF616A")(`✖ ${txt}`), // nord11 - red
    help: (txt) => chalk.hex("#81A1C1")(txt), // nord9 - blue
    highlight: (txt) => chalk.hex("#88C0D0")(txt), // nord10 - cyan
    description: (txt) => chalk.hex("#616E88")(txt), // nord4 - grayish
    disabled: (txt) => chalk.strikethrough.hex("#434C5E")(txt), // nord2 - dark gray
    searchTerm: (txt) => chalk.hex("#ECEFF4")(txt), // nord6 - bright white
  },
  icon: {
    cursor: chalk.hex("#88C0D0")("❯"), // nord10 - cyan
  },
  helpMode: "never",
};

export const GruvboxTheme = {
  prefix: {
    idle: chalk.hex("#fabd2f")("❯"), // yellow
    done: chalk.hex("#b8bb26")("✔"), // green
  },
  spinner: {
    interval: 80,
    frames: ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"],
  },
  style: {
    answer: (txt) => chalk.hex("#b8bb26").bold(txt), // bright green
    message: (txt, status) => {
      if (status === "done") return chalk.hex("#928374")(txt); // gray
      return chalk.hex("#ebdbb2")(txt); // light foreground
    },
    error: (txt) => chalk.hex("#fb4934")(`✖ ${txt}`), // red
    help: (txt) => chalk.hex("#83a598")(txt),
    highlight: (txt) => chalk.hex("#fe8019")(txt), // blue
    description: (txt) => chalk.hex("#928374")(txt), // gray
    disabled: (txt) => chalk.strikethrough.hex("#665c54")(txt), // dark gray
    searchTerm: (txt) => chalk.white(txt), // dark gray
  },
  icon: {
    cursor: chalk.hex("#fabd2f")("❯"), // yellow
  },
  helpMode: "never",
};
export const CheckboxPrompt = {
  prefix: {
    idle: chalk.hex("#fabd2f")("❯"), // yellow
    done: chalk.hex("#b8bb26")("✔"), // green
  },
  spinner: {
    interval: 80,
    frames: ["-", "\\", "|", "/"],
  },
  style: {
    answer: (txt) => chalk.hex("#fabd2f").bold(txt), // yellow
    message: (txt, status) => {
      if (status === "done") return chalk.hex("#928374")(txt); // gray
      return chalk.hex("#fabd2f")(txt); // yellow
    },
    error: (txt) => chalk.hex("#fb4934")(`✖ ${txt}`), // red
    help: (txt) => chalk.hex("#d79921")(txt), // muted yellow
    highlight: (txt) => chalk.hex("#fe8019")(txt), // orange
    description: (txt) => chalk.hex("#928374")(txt), // gray
    disabled: (txt) => chalk.strikethrough.hex("#665c54")(txt),
    searchTerm: (txt) => chalk.hex("#fe8019").black(txt),
  },
  icon: {
    cursor: chalk.hex("#fe8019")(" "),
  },
  helpMode: "auto",
};
export const ErrorPrompt = {
  prefix: {
    idle: chalk.hex("#fb4934")("✖"), // red error icon
    done: chalk.hex("#b8bb26")("✔"), // green for done
  },
  spinner: {
    interval: 80,
    frames: ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"],
  },
  style: {
    answer: (txt) => chalk.hex("#fb4934").bold(txt), // red
    message: (txt, status) => {
      if (status === "done") return chalk.hex("#928374")(txt); // gray
      return chalk.hex("#fb4934")(txt); // red
    },
    error: (txt) => chalk.bgHex("#fb4934").white.bold(` ${txt} `),
    help: (txt) => chalk.hex("#d3869b")(txt), // purple-ish help
    highlight: (txt) => chalk.hex("#fb4934").bold(txt),
    description: (txt) => chalk.hex("#928374")(txt),
    disabled: (txt) => chalk.strikethrough.hex("#665c54")(txt),
    searchTerm: (txt) => chalk.bgHex("#fb4934").white(txt),
  },
  icon: {
    cursor: chalk.hex("#fb4934")("❯"),
  },
  helpMode: "auto",
};

export const asciiArt = `
▓█████▄  ██▓     ███▄ ▄███▓ ▄▄▄       ███▄    █   ▄████  ▄▄▄
▒██▀ ██▌▓██▒    ▓██▒▀█▀ ██▒▒████▄     ██ ▀█   █  ██▒ ▀█▒▒████▄
░██   █▌▒██░    ▓██    ▓██░▒██  ▀█▄  ▓██  ▀█ ██▒▒██░▄▄▄░▒██  ▀█▄
░▓█▄   ▌▒██░    ▒██    ▒██ ░██▄▄▄▄██ ▓██▒  ▐▌██▒░▓█  ██▓░██▄▄▄▄██
░▒████▓ ░██████▒▒██▒   ░██▒ ▓█   ▓██▒▒██░   ▓██░░▒▓███▀▒ ▓█   ▓██▒
 ▒▒▓  ▒ ░ ▒░▓  ░░ ▒░   ░  ░ ▒▒   ▓▒█░░ ▒░   ▒ ▒  ░▒   ▒  ▒▒   ▓▒█░
 ░ ▒  ▒ ░ ░ ▒  ░░  ░      ░  ▒   ▒▒ ░░ ░░   ░ ▒░  ░   ░   ▒   ▒▒ ░
 ░ ░  ░   ░ ░   ░      ░     ░   ▒      ░   ░ ░ ░ ░   ░   ░   ▒
   ░        ░  ░       ░         ░  ░         ░       ░       ░  ░
 ░

`;
