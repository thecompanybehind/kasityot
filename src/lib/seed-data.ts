/**
 * Seed content for the Kasityot marketplace.
 *
 * Indian artists and crafts, prices in paise (₹1 = 100 paise) to match
 * Razorpay's smallest-unit convention. Photography is reused from the
 * approved design bundle in public/design — the client replaces these with
 * real artist and artwork photography before launch.
 *
 * Per the README: at least 6 artists and 20 artworks, with two artists
 * deliberately having no video so the no-video layout rule can be checked.
 */

const D = "/design";

export type SeedArtist = {
  name: string;
  slug: string;
  photo: string;
  craftType: string;
  region: string;
  story: string;
  videoUrl: string | null;
  status: "visible" | "hidden";
};

export type SeedArtwork = {
  title: string;
  slug: string;
  artistSlug: string;
  description: string;
  price: number | null;
  priceOnRequest: boolean;
  material: string;
  dimensions: string;
  images: string[];
  status: "available" | "sold" | "hidden";
  featured: boolean;
};

export const seedArtists: SeedArtist[] = [
  {
    name: "Sita Devi",
    slug: "sita-devi",
    photo: `${D}/9e8f0532-adcd-4380-af96-a59206885d71.jpg`,
    craftType: "Madhubani Painting",
    region: "Madhubani, Bihar",
    story:
      "Sita learned Madhubani at six, sitting behind her grandmother on a mud floor in Jitwarpur. She paints in the kachni line style — fine hatching, no shading, the pigment ground from lampblack, turmeric and crushed marigold. A single wedding panel takes her three weeks, and she refuses to draw a fish without its whiskers, because her grandmother said a fish without whiskers cannot swim to the next life.",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    status: "visible",
  },
  {
    name: "Ramesh Chandra Prajapati",
    slug: "ramesh-chandra-prajapati",
    photo: `${D}/1599303000936-1cf21eac4456.jpg`,
    craftType: "Blue Pottery",
    region: "Jaipur, Rajasthan",
    story:
      "Blue pottery uses no clay at all — quartz powder, fuller's earth, borax and gum, fired low so the cobalt stays true. Ramesh is the fourth generation in his family to work it, and the only one left who still grinds his own oxide. He lost a whole kiln in 2019 when the glaze crazed, and rebuilt it by hand over a monsoon.",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    status: "visible",
  },
  {
    name: "Ghulam Nabi Dar",
    slug: "ghulam-nabi-dar",
    photo: `${D}/1643766882273-335aae5a9309.jpg`,
    craftType: "Pashmina Weaving",
    region: "Srinagar, Kashmir",
    story:
      "The wool comes off the Changthangi goat at 14,000 feet, and is separated by hand — the guard hair pulled out one strand at a time before anything reaches the loom. Ghulam weaves kani shawls on a handloom his father set up in 1968, using wooden tojis instead of a shuttle. A full kani shawl is two years of work. He has made eleven.",
    videoUrl: null,
    status: "visible",
  },
  {
    name: "Bhuri Bai",
    slug: "bhuri-bai",
    photo: `${D}/d15d5026-9ae9-4067-8eb7-c52d4742cd24.jpg`,
    craftType: "Pithora & Bhil Art",
    region: "Jhabua, Madhya Pradesh",
    story:
      "Bhil painting is built from dots — thousands of them, laid in rows that follow the form rather than fill it. Bhuri Bai was the first Bhil woman to paint on paper rather than a wall, and was told at the time that it would not count. Her horses carry the dead across water; her dots are said to be the ancestors watching.",
    videoUrl: null,
    status: "visible",
  },
  {
    name: "Sridhar Achary",
    slug: "sridhar-achary",
    photo: `${D}/121d59b0-96d8-4319-8eb9-b16c34cedbce.jpg`,
    craftType: "Channapatna Toys",
    region: "Channapatna, Karnataka",
    story:
      "Ivory-wood, lac from the forest, and a lathe turned by foot. Sridhar's toys carry no paint — the colour is lac pressed onto the spinning wood until friction melts it into the grain, which is why a Channapatna rattle can be chewed by an infant without harm. He turns about nine pieces a day and rejects three.",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    status: "visible",
  },
  {
    name: "Jaidev Sharma",
    slug: "jaidev-sharma",
    photo: `${D}/1727027282611-ced15b0855d0.jpg`,
    craftType: "Dhokra Metal Casting",
    region: "Bastar, Chhattisgarh",
    story:
      "Dhokra is lost-wax casting, unchanged for four thousand years — a clay core, wound with wax threads drawn one at a time, packed in mud and fired until the wax runs out and the bronze runs in. The mould is broken to free the piece, so every Dhokra object is the only one of itself. Jaidev works with brass scrap collected from the Jagdalpur market.",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    status: "visible",
  },
];

/** ₹ to paise. */
const rs = (rupees: number) => rupees * 100;

export const seedArtworks: SeedArtwork[] = [
  // ── Sita Devi — Madhubani ──────────────────────────────
  {
    title: "Kohbar Ghar, marriage panel",
    slug: "kohbar-ghar-marriage-panel",
    artistSlug: "sita-devi",
    description:
      "The kohbar is painted on the wall of the bridal chamber: lotus, bamboo, and the fish that must keep swimming. Drawn in kachni hatching with a bamboo nib, on handmade paper sized with cow dung and gum.",
    price: rs(18500),
    priceOnRequest: false,
    material: "Natural pigment on handmade paper",
    dimensions: "56 × 76 cm",
    images: [
      `${D}/1610128361323-6e941c97f023.jpg`,
      `${D}/1607556672044-6110fc499247.jpg`,
    ],
    status: "available",
    featured: true,
  },
  {
    title: "Fish and Lotus, small",
    slug: "fish-and-lotus-small",
    artistSlug: "sita-devi",
    description:
      "A single pair of fish, whiskers intact, circling a lotus. Painted in an afternoon and left unframed.",
    price: rs(4200),
    priceOnRequest: false,
    material: "Natural pigment on handmade paper",
    dimensions: "30 × 30 cm",
    images: [`${D}/1609881582722-4a8ab7cd54d8.jpg`],
    status: "available",
    featured: false,
  },
  {
    title: "Tree of Life, bharni fill",
    slug: "tree-of-life-bharni-fill",
    artistSlug: "sita-devi",
    description:
      "Bharni is the filled style — solid colour bounded by a double line, traditionally painted by women of the Brahmin caste. Turmeric yellow, lampblack, and red from crushed kusum flower.",
    price: rs(24000),
    priceOnRequest: false,
    material: "Natural pigment on handmade paper",
    dimensions: "76 × 102 cm",
    images: [`${D}/1673339065030-b3bdb45162f0.jpg`],
    status: "sold",
    featured: false,
  },
  {
    title: "Raas Leela, commissioned panel",
    slug: "raas-leela-commissioned-panel",
    artistSlug: "sita-devi",
    description:
      "A large narrative panel, priced on request because the scale and pigment are agreed with the buyer before Sita begins.",
    price: null,
    priceOnRequest: true,
    material: "Natural pigment on handmade paper",
    dimensions: "By commission",
    images: [`${D}/1739467516216-424041e6d07a.jpg`],
    status: "available",
    featured: false,
  },

  // ── Ramesh — Blue Pottery ──────────────────────────────
  {
    title: "Cobalt Bowls, set of four",
    slug: "cobalt-bowls-set-of-four",
    artistSlug: "ramesh-chandra-prajapati",
    description:
      "Quartz-bodied and fired once at 800°C. The blue is raw cobalt oxide ground in the workshop; no two bowls take the glaze identically.",
    price: rs(6800),
    priceOnRequest: false,
    material: "Quartz paste, cobalt glaze",
    dimensions: "12 cm diameter each",
    images: [
      `${D}/1610701596007-11502861dcfa.jpg`,
      `${D}/1666608531317-06858b2c92c4.jpg`,
    ],
    status: "available",
    featured: true,
  },
  {
    title: "Surahi, long-necked",
    slug: "surahi-long-necked",
    artistSlug: "ramesh-chandra-prajapati",
    description:
      "A water vessel with the narrow throat that keeps the contents cool. Painted freehand with a squirrel-hair brush.",
    price: rs(9500),
    priceOnRequest: false,
    material: "Quartz paste, cobalt and copper glaze",
    dimensions: "34 cm tall",
    images: [`${D}/1620140036708-455ed5c0426a.jpg`],
    status: "available",
    featured: false,
  },
  {
    title: "Tile Panel, nine square",
    slug: "tile-panel-nine-square",
    artistSlug: "ramesh-chandra-prajapati",
    description:
      "Nine tiles that read as one garden when hung together, or as nine separate ones when not.",
    price: rs(14200),
    priceOnRequest: false,
    material: "Quartz paste, cobalt glaze",
    dimensions: "45 × 45 cm assembled",
    images: [`${D}/1598815272841-4e85a77e0a67.jpg`],
    status: "available",
    featured: false,
  },
  {
    title: "Kalash, turquoise",
    slug: "kalash-turquoise",
    artistSlug: "ramesh-chandra-prajapati",
    description:
      "Copper oxide instead of cobalt, which reads turquoise rather than blue and is far less forgiving in the kiln.",
    price: rs(7400),
    priceOnRequest: false,
    material: "Quartz paste, copper glaze",
    dimensions: "26 cm tall",
    images: [`${D}/1597371140946-cfd3dd5a76b9.jpg`],
    status: "hidden",
    featured: false,
  },

  // ── Ghulam Nabi Dar — Pashmina (no video) ──────────────
  {
    title: "Kani Shawl, jamawar ground",
    slug: "kani-shawl-jamawar-ground",
    artistSlug: "ghulam-nabi-dar",
    description:
      "Two years on the loom. The pattern is not printed or embroidered but woven, each colour carried by its own wooden toji across a warp of 2,400 threads.",
    price: null,
    priceOnRequest: true,
    material: "Changthangi pashmina, natural dye",
    dimensions: "203 × 102 cm",
    images: [
      `${D}/1564656622440-e6206eb5ee63.jpg`,
      `${D}/1727027282611-ced15b0855d0.jpg`,
    ],
    status: "available",
    featured: true,
  },
  {
    title: "Sozni Stole, ivory",
    slug: "sozni-stole-ivory",
    artistSlug: "ghulam-nabi-dar",
    description:
      "Needle embroidery so fine the reverse is nearly as clean as the face. Seven months of work by a single hand.",
    price: rs(86000),
    priceOnRequest: false,
    material: "Pashmina, silk thread",
    dimensions: "200 × 70 cm",
    images: [`${D}/1646750421466-a04e689254d4.jpg`],
    status: "available",
    featured: false,
  },
  {
    title: "Plain Pashmina, undyed",
    slug: "plain-pashmina-undyed",
    artistSlug: "ghulam-nabi-dar",
    description:
      "No dye, no pattern — the natural colour of the fleece, which varies from cream to pale grey depending on the animal.",
    price: rs(32000),
    priceOnRequest: false,
    material: "Changthangi pashmina, undyed",
    dimensions: "200 × 70 cm",
    images: [`${D}/1622691078858-58f9eb8825e0.jpg`],
    status: "sold",
    featured: false,
  },

  // ── Bhuri Bai — Bhil art (no video) ────────────────────
  {
    title: "Horses Crossing Water",
    slug: "horses-crossing-water",
    artistSlug: "bhuri-bai",
    description:
      "Bhil horses carry the dead across the river. Built entirely from dots laid in rows that follow the body rather than fill it.",
    price: rs(21000),
    priceOnRequest: false,
    material: "Acrylic on canvas",
    dimensions: "91 × 61 cm",
    images: [`${D}/1740478949628-ff562c3c3923.jpg`],
    status: "available",
    featured: true,
  },
  {
    title: "Pithora Wall, study",
    slug: "pithora-wall-study",
    artistSlug: "bhuri-bai",
    description:
      "A small study of the Pithora form normally painted onto the front wall of a house after a vow is fulfilled.",
    price: rs(8800),
    priceOnRequest: false,
    material: "Acrylic on paper",
    dimensions: "45 × 60 cm",
    images: [`${D}/1607556672044-6110fc499247.jpg`],
    status: "available",
    featured: false,
  },
  {
    title: "Mahua Tree",
    slug: "mahua-tree",
    artistSlug: "bhuri-bai",
    description:
      "The mahua flowers once a year and the whole village collects through the night. Painted in seven dot colours.",
    price: rs(16500),
    priceOnRequest: false,
    material: "Acrylic on canvas",
    dimensions: "76 × 56 cm",
    images: [`${D}/1609881582722-4a8ab7cd54d8.jpg`],
    status: "available",
    featured: false,
  },

  // ── Sridhar — Channapatna ──────────────────────────────
  {
    title: "Stacking Rings, lac-turned",
    slug: "stacking-rings-lac-turned",
    artistSlug: "sridhar-achary",
    description:
      "Ivory-wood turned on a foot lathe, coloured with lac melted onto the spinning blank. Safe in an infant's mouth because there is no paint on it at all.",
    price: rs(1450),
    priceOnRequest: false,
    material: "Ivory-wood, natural lac",
    dimensions: "14 cm tall",
    images: [`${D}/1666608531317-06858b2c92c4.jpg`],
    status: "available",
    featured: false,
  },
  {
    title: "Spinning Tops, set of six",
    slug: "spinning-tops-set-of-six",
    artistSlug: "sridhar-achary",
    description: "Six tops, each a different lac colour, turned in a single morning.",
    price: rs(980),
    priceOnRequest: false,
    material: "Ivory-wood, natural lac",
    dimensions: "6 cm each",
    images: [`${D}/1610701596007-11502861dcfa.jpg`],
    status: "available",
    featured: false,
  },
  {
    title: "Elephant Pull-Toy",
    slug: "elephant-pull-toy",
    artistSlug: "sridhar-achary",
    description:
      "Wheels pegged rather than glued, so it can be taken apart and put back together by a child.",
    price: rs(2200),
    priceOnRequest: false,
    material: "Ivory-wood, natural lac, cotton cord",
    dimensions: "18 × 12 cm",
    images: [`${D}/1620140036708-455ed5c0426a.jpg`],
    status: "sold",
    featured: false,
  },

  // ── Jaidev — Dhokra ────────────────────────────────────
  {
    title: "Dancing Figure, Bastar",
    slug: "dancing-figure-bastar",
    artistSlug: "jaidev-sharma",
    description:
      "Lost-wax bronze: the mould is broken to release the casting, so this piece cannot be repeated even by the man who made it.",
    price: rs(12800),
    priceOnRequest: false,
    material: "Cast brass",
    dimensions: "28 cm tall",
    images: [
      `${D}/121d59b0-96d8-4319-8eb9-b16c34cedbce.jpg`,
      `${D}/1643766882273-335aae5a9309.jpg`,
    ],
    status: "available",
    featured: true,
  },
  {
    title: "Measuring Bowl, wound thread",
    slug: "measuring-bowl-wound-thread",
    artistSlug: "jaidev-sharma",
    description:
      "The surface texture is the wax thread itself, wound by hand around the clay core and never smoothed.",
    price: rs(6400),
    priceOnRequest: false,
    material: "Cast brass",
    dimensions: "15 cm diameter",
    images: [`${D}/1598815272841-4e85a77e0a67.jpg`],
    status: "available",
    featured: false,
  },
  {
    title: "Tribal Horse, large",
    slug: "tribal-horse-large",
    artistSlug: "jaidev-sharma",
    description:
      "Cast in four sections and joined hot. The largest piece Jaidev has attempted; the first two attempts cracked in the fire.",
    price: null,
    priceOnRequest: true,
    material: "Cast brass",
    dimensions: "52 cm tall",
    images: [`${D}/1739467516216-424041e6d07a.jpg`],
    status: "available",
    featured: false,
  },
];
