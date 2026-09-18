/**
 * Hardcoded content for Phase 1, lifted from the approved design file.
 * Phase 2 replaces this with Prisma queries — the shapes here deliberately
 * mirror the Artist/Artwork model in README.md so that swap stays cheap.
 */

const IMG = "/design";

/** The design bundles each Unsplash id as a flat jpg under public/design. */
function img(id: string): string {
  return `${IMG}/${id}.jpg`;
}

export type Piece = {
  no: string;
  craft: string;
  title: string;
  maker: string;
  city: string;
  material: string;
  hours: string;
  price: number;
  image: string;
  /** Second image revealed on hover. */
  detail: string;
};

export type Maker = {
  name: string;
  line: string;
  note: string;
  image: string;
};

export type Collection = {
  title: string;
  count: string;
  image: string;
};

export type JournalEntry = {
  date: string;
  kind: string;
  title: string;
  blurb: string;
  image: string;
};

export const currency = "€";

export const showPrices = true;

export function formatPrice(n: number): string {
  return currency + n.toLocaleString("en-US");
}

export const pieces: Piece[] = [
  {
    no: "No. 041",
    craft: "Ceramics",
    title: "Kuura Bowls, cobalt",
    maker: "Iida Mäkelä",
    city: "Helsinki",
    material: "Cobalt glaze, stoneware",
    hours: "92",
    price: 1480,
    image: img("1610128361323-6e941c97f023"),
    detail: img("1607556672044-6110fc499247"),
  },
  {
    no: "No. 112",
    craft: "Textile",
    title: "Ryijy VII — madder stripe",
    maker: "Aino Salo",
    city: "Turku",
    material: "Dyed wool, linen warp",
    hours: "410",
    price: 3950,
    image: img("1564656622440-e6206eb5ee63"),
    detail: img("1727027282611-ced15b0855d0"),
  },
  {
    no: "No. 058",
    craft: "Ceramics",
    title: "Ash Cups, pair",
    maker: "Noa Wirtanen",
    city: "Riihimäki",
    material: "Ash glaze, porcelain",
    hours: "26",
    price: 410,
    image: img("1610701596007-11502861dcfa"),
    detail: img("1609881582722-4a8ab7cd54d8"),
  },
  {
    no: "No. 144",
    craft: "Porcelain",
    title: "Table Service, six",
    maker: "Mei Tanaka",
    city: "Kyoto",
    material: "Hand-thrown porcelain",
    hours: "188",
    price: 2260,
    image: img("1740478949628-ff562c3c3923"),
    detail: img("1598815272841-4e85a77e0a67"),
  },
  {
    no: "No. 088",
    craft: "Ceramics",
    title: "Morning Cup, unglazed",
    maker: "Noa Wirtanen",
    city: "Riihimäki",
    material: "Unglazed stoneware",
    hours: "18",
    price: 240,
    image: img("1620140036708-455ed5c0426a"),
    detail: img("1666608531317-06858b2c92c4"),
  },
  {
    no: "No. 003",
    craft: "Textile",
    title: "Handspun Throw, olive & madder",
    maker: "Juho Kettunen",
    city: "Juuka",
    material: "Dyed Finnsheep wool",
    hours: "137",
    price: 1120,
    image: img("1707978932202-751b08324daf"),
    detail: img("1646750421466-a04e689254d4"),
  },
];

export const makers: Maker[] = [
  {
    name: "Aino Salo",
    line: "Ryijy weaving · Turku",
    note: "Rugs on a loom her grandmother strung in 1951.",
    image: img("1643766882273-335aae5a9309"),
  },
  {
    name: "Tomas Lindqvist",
    line: "Looms & frames · Porvoo",
    note: "Builds the frames the other makers weave on, in storm-fallen elm.",
    image: img("1599303000936-1cf21eac4456"),
  },
  {
    name: "Mei Tanaka",
    line: "Fibre · Kyoto",
    note: "Spins and dyes her own weft; thirty-one skeins to a throw.",
    image: img("1727027282611-ced15b0855d0"),
  },
  {
    name: "Ravi Menon",
    line: "Handloom · Jaipur",
    note: "Fourth-generation weaver; every metre passed 4,000 times.",
    image: img("1646750421466-a04e689254d4"),
  },
];

export const collections: Collection[] = [
  {
    title: "The Table",
    count: "64 works",
    image: img("1740478949628-ff562c3c3923"),
  },
  {
    title: "Held Daily",
    count: "88 works",
    image: img("1597371140946-cfd3dd5a76b9"),
  },
  {
    title: "One of One",
    count: "12 works",
    image: img("1622691078858-58f9eb8825e0"),
  },
];

export const journal: JournalEntry[] = [
  {
    date: "Mar 2026",
    kind: "Field note",
    title: "Digging clay in a frozen riverbed",
    blurb: "Three days north of Helsinki with Iida, a shovel, and a permit.",
    image: img("1673339065030-b3bdb45162f0"),
  },
  {
    date: "Feb 2026",
    kind: "Essay",
    title: "Why we refuse the word 'artisanal'",
    blurb: "On language that flatters the buyer and erases the maker.",
    image: img("1739467516216-424041e6d07a"),
  },
  {
    date: "Jan 2026",
    kind: "Interview",
    title: "Aino Salo on the patience of the loom",
    blurb: "Forty passes of the shuttle a day, and thirty-one of them wrong.",
    image: img("1599303000936-1cf21eac4456"),
  },
];

/** Hero and interlude imagery, keyed by the design's own uuids. */
export const stills = {
  hero: `${IMG}/a7cbff28-f98a-4d87-b8e1-ff3b89c4275c.jpg`,
  interlude: `${IMG}/279965af-0eed-4455-805c-d10ab40a07ed.jpg`,
  makerPortrait: `${IMG}/9e8f0532-adcd-4380-af96-a59206885d71.jpg`,
  makerHands: `${IMG}/d15d5026-9ae9-4067-8eb7-c52d4742cd24.jpg`,
  makerTools: `${IMG}/121d59b0-96d8-4319-8eb9-b16c34cedbce.jpg`,
};
