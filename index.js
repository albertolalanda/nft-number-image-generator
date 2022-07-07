const {
  readFileSync,
  writeFileSync,
  readdirSync,
  rmSync,
  existsSync,
  mkdirSync,
} = require("fs");
const sharp = require("sharp");

const template = `
    <svg width="<!-- width -->" height="114" viewBox="0 0 <!-- width --> 114" fill="none" xmlns="http://www.w3.org/2000/svg">
    
        <!-- bg1 -->
        <!-- alg1 -->

        <g transform="translate(83)">
        <!-- bg2 -->
        <!-- alg2 -->
        </g>

        <g transform="translate(166)">
        <!-- bg3 -->
        <!-- alg3 -->
        </g>

        <g transform="translate(249)">
        <!-- bg4 -->
        <!-- alg4 -->
        </g>
    </svg>
`;

const takenNumbers = {};
// number of images to generate
let idx = 20;
// max number to generate e.g. 10000 (from 0 to 9999)
const max = 10000;
let widthOfImage = 83;

let digitNames = new Map([
  [0, "zero"],
  [1, "one"],
  [2, "two"],
  [3, "three"],
  [4, "four"],
  [5, "five"],
  [6, "six"],
  [7, "seven"],
  [8, "eight"],
  [9, "nine"],
]);
let lengthProb = new Map([
  [1, 0.001],
  [2, 0.01],
  [3, 0.1],
  [4, 0.9],
]);

function randInt(max) {
  return Math.floor(Math.random() * (max + 1));
}

function getDigitAtPosition(number, position) {
  return digitNames.get(parseInt(String(number)[position]));
}

function getName(number, numberLength) {
  let result = "";
  for (var i = 0; i < numberLength; i++) {
    result = result + "-" + getDigitAtPosition(number, i);
  }

  let name = result.substring(1);

  return name;
}

function getLayer(name, skip = 0.0) {
  const svg = readFileSync(`./layers/${name}.svg`, "utf-8");
  const re = /(?<=\<svg\s*[^>]*>)([\s\S]*?)(?=\<\/svg\>)/g;
  const layer = svg.match(re)[0];
  return Math.random() > skip ? layer : "";
}

async function svgToPng(name) {
  const src = `./out/${name}.svg`;
  const dest = `./out/${name}.png`;

  const img = await sharp(src);
  const resized = await img.resize(1024);
  await resized.toFile(dest);
}

function createImage(idx) {
  const bg = randInt(5);
  const number = randInt(max - 1);

  // 10.000 * 5 bg = 50.000 combinations
  // 4 digit ~ 0,9 probability
  // 3 digit ~ 0,1 probability
  // 2 digit ~ 0,01 probability
  // 1 digit 0,001 probability

  const numberLength = number.toString().length;

  const combination = [bg, number].join("");

  if (combination[takenNumbers]) {
    createImage(idx);
  } else {
    const genName = getName(number, numberLength, max);
    console.log(genName);
    combination[takenNumbers] = combination;

    const final = template
      .replace("<!-- width -->", widthOfImage * numberLength)
      .replace("<!-- width -->", widthOfImage * numberLength)
      .replace("<!-- bg1 -->", getLayer(`bg${bg}`))
      .replace("<!-- alg1 -->", getLayer(String(number)[0]))
      .replace("<!-- bg2 -->", numberLength >= 2 ? getLayer(`bg${bg}`) : "")
      .replace(
        "<!-- alg2 -->",
        numberLength >= 2 ? getLayer(String(number)[1]) : ""
      )
      .replace("<!-- bg3 -->", numberLength >= 3 ? getLayer(`bg${bg}`) : "")
      .replace(
        "<!-- alg3 -->",
        numberLength >= 3 ? getLayer(String(number)[2]) : ""
      )
      .replace("<!-- bg4 -->", numberLength >= 4 ? getLayer(`bg${bg}`) : "")
      .replace(
        "<!-- alg4 -->",
        numberLength >= 4 ? getLayer(String(number)[3]) : ""
      );

    let name = `#${idx}`;
    name = name.concat(`-${genName}`);

    const meta = {
      name,
      description: `An image of the number ${genName.split("-").join(" ")}`,
      image: `${idx}.png`,
      attributes: [
        {
          digits: numberLength,
          rarity: lengthProb.get(numberLength),
        },
      ],
    };
    writeFileSync(`./out/${idx}.json`, JSON.stringify(meta));
    writeFileSync(`./out/${idx}.svg`, final);
    svgToPng(idx);
  }
}

// Create dir if not exists
if (!existsSync("./out")) {
  mkdirSync("./out");
}

// Cleanup dir before each run
readdirSync("./out").forEach((f) => rmSync(`./out/${f}`));

idx--;

do {
  createImage(idx);
  idx--;
} while (idx >= 0);
