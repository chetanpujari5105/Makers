import { atkinson, bricolage, hanken, newsreader, schibsted } from "./fonts";

export type DirectionId = "a" | "b" | "c";

type Swatch = { name: string; hex: string; note: string };

export type Direction = {
  id: DirectionId;
  letter: "A" | "B" | "C";
  name: string;
  oneLiner: string;
  fontClasses: string;
  typePairing: { display: string; body: string; note: string };
  palette: Swatch[];
  hero: string;
  covers: string;
  motion: string[];
  references: string[];
  risks: string;
};

export const directions: Record<DirectionId, Direction> = {
  a: {
    id: "a",
    letter: "A",
    name: "Field Notes",
    oneLiner:
      "A well-made workbook. Warm paper, serif headlines and covers drawn like the figures in a good manual.",
    fontClasses: `${newsreader.variable} ${schibsted.variable}`,
    typePairing: {
      display: "Newsreader 500 + italic (Production Type, OFL)",
      body: "Schibsted Grotesk, variable (OFL)",
      note: "A book serif built for screens, next to a sturdy newspaper sans. Only two weights of the serif load.",
    },
    palette: [
      { name: "Paper", hex: "#f7f3ec", note: "page" },
      { name: "Ink", hex: "#1d1b17", note: "15.5:1 on paper" },
      { name: "Vermilion", hex: "#b5381f", note: "accent · white text 5.9:1" },
      { name: "Clay", hex: "#efc9b4", note: "Create" },
      { name: "Slate", hex: "#c9d8e6", note: "Learn" },
      { name: "Sage", hex: "#cfddc0", note: "Work Smarter" },
      { name: "Ochre", hex: "#edd39a", note: "Build & Make" },
    ],
    hero: "“The open workbook”: one short serif line, an inline search, and real product covers laid out as numbered plates (FIG. 1, 2, 3), with a 3-step margin note: pick a goal, follow the guide, get a first win.",
    covers:
      "Figure plates: each goal has a paper colour; each product type has a technical line drawing with one vermilion part. Labels show only honest facts (type, level, setup time). No title on the cover, so it never repeats the heading next to it.",
    motion: [
      "Feel: paper. Quick, settled, no bounce.",
      "Feedback 120 ms; dialogs and sheets 240 ms; one ease-out curve (0.23, 1, 0.32, 1).",
      "Scroll entrances once: fade + 8 px rise, 260 ms, 40 ms stagger.",
      "Card → product: the cover plate grows into the product cover (View Transition, ~260 ms).",
      "Hover (mouse only): cover lifts 2 px. Reduced motion: fades only.",
    ],
    references: ["Making Software", "Every", "Craft", "Are.na", "Siteinspire"],
    risks:
      "Serif-on-cream is a known editorial look; the drawn figure plates are what keep it ours. Needs care so it never feels old-fashioned on phones.",
  },
  b: {
    id: "b",
    letter: "B",
    name: "Bright Workshop",
    oneLiner:
      "A cheerful maker space. Bold goal colours, chunky grotesk headlines and covers built from cut-paper shapes.",
    fontClasses: `${bricolage.variable} ${atkinson.variable}`,
    typePairing: {
      display: "Bricolage Grotesque, variable (OFL)",
      body: "Atkinson Hyperlegible Next, variable (OFL)",
      note: "A lively display grotesk with a body face designed by the Braille Institute for easy reading by everyone.",
    },
    palette: [
      { name: "Paper", hex: "#fbfaf7", note: "page" },
      { name: "Ink", hex: "#151412", note: "17.6:1 on paper" },
      { name: "Ultramarine", hex: "#4b32d6", note: "accent · white text 7.7:1" },
      { name: "Coral", hex: "#ff9f80", note: "Create · ink text only" },
      { name: "Sky", hex: "#8cc4ff", note: "Learn · ink text only" },
      { name: "Mint", hex: "#7eddb0", note: "Work Smarter" },
      { name: "Marigold", hex: "#ffd25e", note: "Build & Make" },
    ],
    hero: "“Goal bento”: a big question (“What do you want to get better at?”), a large search, then the four goals as bright tiles straight away, so the first tap is a goal, not a file type.",
    covers:
      "Cut-paper covers: full-bleed goal colour, one oversized shape-built figure in thick ink outline, and a white sticker label with the product type. Text on these colours is always ink (grey fails AA on coral and sky).",
    motion: [
      "Feel: springy, but quick and small.",
      "Press and hover use a stiff spring (settles in ~250 ms, under 2% overshoot); tiles grow 2% on hover.",
      "Filter chips pop in 160 ms; lists reorder with layout animation.",
      "Scroll entrances once: 12 px rise, 280 ms, 50 ms stagger.",
      "Card → product cover morph as in A. Reduced motion: fades only, no springs.",
    ],
    references: ["Gumroad", "Notion templates", "Maven", "Lemon Squeezy", "Godly"],
    risks:
      "The loudest option: four strong colours compete with real cover images later. Most likely to drift toward ‘playful SaaS’.",
  },
  c: {
    id: "c",
    letter: "C",
    name: "Clear Shelf",
    oneLiner:
      "A calm product shelf. One clean sans, lots of air, and products shown as simple objects on a soft stage.",
    fontClasses: hanken.variable,
    typePairing: {
      display: "Hanken Grotesk 650 (OFL)",
      body: "Hanken Grotesk 400–500 (same variable file)",
      note: "One family, one file: the lightest option. Hierarchy comes from weight and a two-tone headline.",
    },
    palette: [
      { name: "Paper", hex: "#fafaf8", note: "page" },
      { name: "Ink", hex: "#111312", note: "17.9:1 on paper" },
      { name: "Deep teal", hex: "#0b6b5e", note: "accent · white text 6.4:1" },
      { name: "Blush", hex: "#f3e6e1", note: "Create stage" },
      { name: "Mist", hex: "#e3eaf2", note: "Learn stage" },
      { name: "Fern", hex: "#e2eee8", note: "Work Smarter stage" },
      { name: "Sand", hex: "#f2ece0", note: "Build & Make stage" },
    ],
    hero: "“The shelf”: a centred two-tone headline (strong first half, grey second half), a centred search, then a row of real covers standing on a soft stage with their names below, which scrolls sideways on phones.",
    covers:
      "Object covers: each product type is a soft white object with a goal-coloured detail, standing on a pale goal-tinted stage with a floor shadow. A small caption names the type.",
    motion: [
      "Feel: glide. Smooth and expensive-feeling, never springy.",
      "Panels and buy bar 280 ms on (0.32, 0.72, 0, 1); feedback 140 ms.",
      "Shelf scrolls with snap points; covers ease up 4 px on hover (mouse only).",
      "Card → product cover morph is the signature move (~280 ms).",
      "Scroll entrances once: fade + 12 px, 300 ms. Reduced motion: fades only.",
    ],
    references: ["Apple – Buy iPad Air", "Things", "Framer template page", "Linear", "Stripe"],
    risks:
      "The safest and fastest; also the closest to a generic clean store. Personality depends on the object drawings.",
  },
};

export const directionIds = Object.keys(directions) as DirectionId[];
