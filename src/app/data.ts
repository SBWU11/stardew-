// All static Stardew Valley game data for the co-op tracker.
// Bundle data follows the Community Center checklist (DestructiveBurn / Stardew Wiki).
// Calendar + gift data based on the NoobSenpai calendar.

export type Season = "Spring" | "Summer" | "Fall" | "Winter";
export type ItemSeason = Season | "Any";

export const seasons: Season[] = ["Spring", "Summer", "Fall", "Winter"];

export type Room =
  | "Crafts Room"
  | "Pantry"
  | "Fish Tank"
  | "Boiler Room"
  | "Bulletin Board"
  | "Vault"
  | "Abandoned JojaMart";

export type BundleItem = {
  id: string;
  name: string;
  room: Room;
  bundle: string;
  need: string;
  seasons: ItemSeason[];
  source: string;
  note?: string;
  /** e.g. "5 of 9" — pick 5 of the 9 listed items to complete the bundle. */
  choice?: string;
};

export type CalendarEvent = {
  type: "festival" | "birthday" | "forage" | "new";
  text: string;
};

export type Villager = {
  name: string;
  season: Season;
  day: number;
  /** Loved gifts (+80 friendship). */
  loved: string;
  /** Notable specific liked gifts (+45). Universal likes also apply — see `universalGifts`. */
  liked?: string;
};

/** Gifts that work on (almost) everyone, regardless of the person. */
export const universalGifts = {
  loved: "Golden Pumpkin, Magic Rock Candy, Pearl, Prismatic Shard, Rabbit's Foot (note: Penny dislikes Rabbit's Foot & Pearl; Haley dislikes Prismatic Shard)",
  liked:
    "Most cooked dishes, all flowers, all fruit, most gems & minerals, and artisan goods (wine, juice, jelly, cheese, honey…). Higher quality = more friendship.",
  hated: "Trash, Sap, Slime, and other junk — never gift these.",
};

export type Crop = {
  name: string;
  season: Season;
  grow: number;
  regrow?: number;
  /** A standout best-profit crop for its season. */
  top?: boolean;
  note?: string;
};

export type Building = {
  name: string;
  category: "Animal" | "Utility";
  /** Gold cost at Robin's Carpenter Shop. */
  gold: number;
  /** Materials needed, e.g. "Wood ×300, Stone ×100". */
  materials: string;
  /** Footprint in tiles, e.g. "6×3". */
  size: string;
  /** Prerequisite building, if any. */
  requires?: string;
  note: string;
};

// Display order + colour accent for the seven Community Center rooms.
export const roomOrder: Room[] = [
  "Crafts Room",
  "Pantry",
  "Fish Tank",
  "Boiler Room",
  "Bulletin Board",
  "Vault",
  "Abandoned JojaMart",
];

export const roomAccent: Record<Room, string> = {
  "Crafts Room": "#6aa84f",
  Pantry: "#c98a2b",
  "Fish Tank": "#3b88b5",
  "Boiler Room": "#b1563f",
  "Bulletin Board": "#8a6bb0",
  Vault: "#b8962e",
  "Abandoned JojaMart": "#5a6b7a",
};

// Reward earned when a bundle is completed (shown as a hint).
export const bundleRewards: Record<string, string> = {
  "Spring Foraging": "30 Spring Seeds",
  "Summer Foraging": "30 Summer Seeds",
  "Fall Foraging": "30 Fall Seeds",
  "Winter Foraging": "30 Winter Seeds",
  Construction: "Charcoal Kiln recipe",
  "Exotic Foraging": "Autumn's Bounty x5",
  "Spring Crops": "Speed-Gro x20",
  "Summer Crops": "Quality Sprinkler",
  "Fall Crops": "Bee House",
  "Quality Crops": "Preserves Jar",
  Animal: "Cheese Press",
  Artisan: "Keg",
  "River Fish": "Bait x30",
  "Lake Fish": "Dressed Spinner",
  "Ocean Fish": "Crab Pot recipe x3",
  "Night Fishing": "Small Glow Ring",
  "Crab Pot": "Crab Pot x3",
  "Specialty Fish": "Dish O' The Sea x5",
  Blacksmith: "Furnace recipe",
  Geologist: "Omni Geode x5",
  Adventurer: "Small Magnet Ring",
  Chef: "Pink Cake x3",
  Dye: "Seed Maker",
  "Field Research": "Recycling Machine",
  Fodder: "Heater",
  Enchanter: "Gold Bar x5",
  Vault: "Unlocks the bus to the Desert",
  "The Missing Bundle": "Movie Theater",
};

export const bundleItems: BundleItem[] = [
  { id: "spring-foraging-wild-horseradish", name: "Wild Horseradish", room: "Crafts Room", bundle: "Spring Foraging", need: "1", seasons: ["Spring"], source: "Spring foraging" },
  { id: "spring-foraging-daffodil", name: "Daffodil", room: "Crafts Room", bundle: "Spring Foraging", need: "1", seasons: ["Spring"], source: "Spring foraging or Flower Dance shop" },
  { id: "spring-foraging-leek", name: "Leek", room: "Crafts Room", bundle: "Spring Foraging", need: "1", seasons: ["Spring"], source: "Spring foraging" },
  { id: "spring-foraging-dandelion", name: "Dandelion", room: "Crafts Room", bundle: "Spring Foraging", need: "1", seasons: ["Spring"], source: "Spring foraging or Flower Dance shop" },
  { id: "summer-foraging-grape", name: "Grape", room: "Crafts Room", bundle: "Summer Foraging", need: "1", seasons: ["Summer", "Fall"], source: "Summer forage or Fall crop" },
  { id: "summer-foraging-spice-berry", name: "Spice Berry", room: "Crafts Room", bundle: "Summer Foraging", need: "1", seasons: ["Summer"], source: "Summer foraging or fruit bat cave" },
  { id: "summer-foraging-sweet-pea", name: "Sweet Pea", room: "Crafts Room", bundle: "Summer Foraging", need: "1", seasons: ["Summer"], source: "Summer foraging" },
  { id: "fall-foraging-common-mushroom", name: "Common Mushroom", room: "Crafts Room", bundle: "Fall Foraging", need: "1", seasons: ["Fall", "Spring"], source: "Fall forage, Secret Woods, mushroom cave" },
  { id: "fall-foraging-wild-plum", name: "Wild Plum", room: "Crafts Room", bundle: "Fall Foraging", need: "1", seasons: ["Fall"], source: "Fall foraging or fruit bat cave" },
  { id: "fall-foraging-hazelnut", name: "Hazelnut", room: "Crafts Room", bundle: "Fall Foraging", need: "1", seasons: ["Fall"], source: "Fall foraging" },
  { id: "fall-foraging-blackberry", name: "Blackberry", room: "Crafts Room", bundle: "Fall Foraging", need: "1", seasons: ["Fall"], source: "Fall foraging, especially Fall 8-11" },
  { id: "winter-foraging-winter-root", name: "Winter Root", room: "Crafts Room", bundle: "Winter Foraging", need: "1", seasons: ["Winter"], source: "Winter tilling or Blue Slimes" },
  { id: "winter-foraging-crystal-fruit", name: "Crystal Fruit", room: "Crafts Room", bundle: "Winter Foraging", need: "1", seasons: ["Winter"], source: "Winter foraging or Dust Sprites" },
  { id: "winter-foraging-snow-yam", name: "Snow Yam", room: "Crafts Room", bundle: "Winter Foraging", need: "1", seasons: ["Winter"], source: "Winter tilling" },
  { id: "winter-foraging-crocus", name: "Crocus", room: "Crafts Room", bundle: "Winter Foraging", need: "1", seasons: ["Winter"], source: "Winter foraging" },
  { id: "construction-wood", name: "Wood", room: "Crafts Room", bundle: "Construction", need: "198", seasons: ["Any"], source: "Trees, branches, Carpenter's Shop" },
  { id: "construction-stone", name: "Stone", room: "Crafts Room", bundle: "Construction", need: "99", seasons: ["Any"], source: "Rocks or Carpenter's Shop" },
  { id: "construction-hardwood", name: "Hardwood", room: "Crafts Room", bundle: "Construction", need: "10", seasons: ["Any"], source: "Large stumps, logs, mahogany trees" },
  { id: "exotic-coconut", name: "Coconut", room: "Crafts Room", bundle: "Exotic Foraging", need: "1", seasons: ["Any"], source: "Desert foraging, Oasis, palm trees", choice: "5 of 9" },
  { id: "exotic-cactus-fruit", name: "Cactus Fruit", room: "Crafts Room", bundle: "Exotic Foraging", need: "1", seasons: ["Any"], source: "Desert foraging or Oasis", choice: "5 of 9" },
  { id: "exotic-cave-carrot", name: "Cave Carrot", room: "Crafts Room", bundle: "Exotic Foraging", need: "1", seasons: ["Any"], source: "Mines boxes or tilled soil", choice: "5 of 9" },
  { id: "exotic-red-mushroom", name: "Red Mushroom", room: "Crafts Room", bundle: "Exotic Foraging", need: "1", seasons: ["Summer", "Fall", "Any"], source: "Mines, Secret Woods, mushroom cave", choice: "5 of 9" },
  { id: "exotic-purple-mushroom", name: "Purple Mushroom", room: "Crafts Room", bundle: "Exotic Foraging", need: "1", seasons: ["Fall", "Any"], source: "Mines or mushroom cave", choice: "5 of 9" },
  { id: "exotic-maple-syrup", name: "Maple Syrup", room: "Crafts Room", bundle: "Exotic Foraging", need: "1", seasons: ["Any"], source: "Tap Maple Tree", choice: "5 of 9" },
  { id: "exotic-oak-resin", name: "Oak Resin", room: "Crafts Room", bundle: "Exotic Foraging", need: "1", seasons: ["Any"], source: "Tap Oak Tree", choice: "5 of 9" },
  { id: "exotic-pine-tar", name: "Pine Tar", room: "Crafts Room", bundle: "Exotic Foraging", need: "1", seasons: ["Any"], source: "Tap Pine Tree", choice: "5 of 9" },
  { id: "exotic-morel", name: "Morel", room: "Crafts Room", bundle: "Exotic Foraging", need: "1", seasons: ["Spring"], source: "Secret Woods, Forest Farm, mushroom cave", choice: "5 of 9" },

  { id: "spring-crops-parsnip", name: "Parsnip", room: "Pantry", bundle: "Spring Crops", need: "1", seasons: ["Spring"], source: "Spring crop" },
  { id: "spring-crops-green-bean", name: "Green Bean", room: "Pantry", bundle: "Spring Crops", need: "1", seasons: ["Spring"], source: "Spring crop" },
  { id: "spring-crops-cauliflower", name: "Cauliflower", room: "Pantry", bundle: "Spring Crops", need: "1", seasons: ["Spring"], source: "Spring crop" },
  { id: "spring-crops-potato", name: "Potato", room: "Pantry", bundle: "Spring Crops", need: "1", seasons: ["Spring"], source: "Spring crop" },
  { id: "summer-crops-tomato", name: "Tomato", room: "Pantry", bundle: "Summer Crops", need: "1", seasons: ["Summer"], source: "Summer crop" },
  { id: "summer-crops-hot-pepper", name: "Hot Pepper", room: "Pantry", bundle: "Summer Crops", need: "1", seasons: ["Summer"], source: "Summer crop" },
  { id: "summer-crops-blueberry", name: "Blueberry", room: "Pantry", bundle: "Summer Crops", need: "1", seasons: ["Summer"], source: "Summer crop" },
  { id: "summer-crops-melon", name: "Melon", room: "Pantry", bundle: "Summer Crops", need: "1", seasons: ["Summer"], source: "Summer crop" },
  { id: "fall-crops-corn", name: "Corn", room: "Pantry", bundle: "Fall Crops", need: "1", seasons: ["Summer", "Fall"], source: "Summer or Fall crop" },
  { id: "fall-crops-eggplant", name: "Eggplant", room: "Pantry", bundle: "Fall Crops", need: "1", seasons: ["Fall"], source: "Fall crop" },
  { id: "fall-crops-pumpkin", name: "Pumpkin", room: "Pantry", bundle: "Fall Crops", need: "1", seasons: ["Fall"], source: "Fall crop" },
  { id: "fall-crops-yam", name: "Yam", room: "Pantry", bundle: "Fall Crops", need: "1", seasons: ["Fall"], source: "Fall crop or Duggy drop" },
  { id: "quality-parsnip", name: "Gold Parsnip", room: "Pantry", bundle: "Quality Crops", need: "5", seasons: ["Spring"], source: "Gold quality Spring crop", choice: "3 of 4" },
  { id: "quality-melon", name: "Gold Melon", room: "Pantry", bundle: "Quality Crops", need: "5", seasons: ["Summer"], source: "Gold quality Summer crop", choice: "3 of 4" },
  { id: "quality-pumpkin", name: "Gold Pumpkin", room: "Pantry", bundle: "Quality Crops", need: "5", seasons: ["Fall"], source: "Gold quality Fall crop", choice: "3 of 4" },
  { id: "quality-corn", name: "Gold Corn", room: "Pantry", bundle: "Quality Crops", need: "5", seasons: ["Summer", "Fall"], source: "Gold quality Summer or Fall crop", choice: "3 of 4" },
  { id: "animal-large-milk", name: "Large Milk", room: "Pantry", bundle: "Animal", need: "1", seasons: ["Any"], source: "Cows", choice: "5 of 6" },
  { id: "animal-large-brown-egg", name: "Large Brown Egg", room: "Pantry", bundle: "Animal", need: "1", seasons: ["Any"], source: "Brown chickens", choice: "5 of 6" },
  { id: "animal-large-egg", name: "Large Egg", room: "Pantry", bundle: "Animal", need: "1", seasons: ["Any"], source: "White chickens", choice: "5 of 6" },
  { id: "animal-large-goat-milk", name: "Large Goat Milk", room: "Pantry", bundle: "Animal", need: "1", seasons: ["Any"], source: "Goats", choice: "5 of 6" },
  { id: "animal-wool", name: "Wool", room: "Pantry", bundle: "Animal", need: "1", seasons: ["Any"], source: "Sheep or rabbits", choice: "5 of 6" },
  { id: "animal-duck-egg", name: "Duck Egg", room: "Pantry", bundle: "Animal", need: "1", seasons: ["Any"], source: "Ducks", choice: "5 of 6" },
  { id: "artisan-truffle-oil", name: "Truffle Oil", room: "Pantry", bundle: "Artisan", need: "1", seasons: ["Any"], source: "Oil Maker with Truffle", choice: "6 of 12" },
  { id: "artisan-cloth", name: "Cloth", room: "Pantry", bundle: "Artisan", need: "1", seasons: ["Any"], source: "Loom, recycling, Desert Trader, Mummies", choice: "6 of 12" },
  { id: "artisan-goat-cheese", name: "Goat Cheese", room: "Pantry", bundle: "Artisan", need: "1", seasons: ["Any"], source: "Cheese Press", choice: "6 of 12" },
  { id: "artisan-cheese", name: "Cheese", room: "Pantry", bundle: "Artisan", need: "1", seasons: ["Any"], source: "Cheese Press", choice: "6 of 12" },
  { id: "artisan-honey", name: "Honey", room: "Pantry", bundle: "Artisan", need: "1", seasons: ["Spring", "Summer", "Fall", "Any"], source: "Bee House or Oasis", choice: "6 of 12" },
  { id: "artisan-jelly", name: "Jelly", room: "Pantry", bundle: "Artisan", need: "1", seasons: ["Any"], source: "Preserves Jar", choice: "6 of 12" },
  { id: "artisan-apple", name: "Apple", room: "Pantry", bundle: "Artisan", need: "1", seasons: ["Fall"], source: "Apple tree or fruit bat cave", choice: "6 of 12" },
  { id: "artisan-apricot", name: "Apricot", room: "Pantry", bundle: "Artisan", need: "1", seasons: ["Spring"], source: "Apricot tree or fruit bat cave", choice: "6 of 12" },
  { id: "artisan-orange", name: "Orange", room: "Pantry", bundle: "Artisan", need: "1", seasons: ["Summer"], source: "Orange tree or fruit bat cave", choice: "6 of 12" },
  { id: "artisan-peach", name: "Peach", room: "Pantry", bundle: "Artisan", need: "1", seasons: ["Summer"], source: "Peach tree or fruit bat cave", choice: "6 of 12" },
  { id: "artisan-pomegranate", name: "Pomegranate", room: "Pantry", bundle: "Artisan", need: "1", seasons: ["Fall"], source: "Pomegranate tree or fruit bat cave", choice: "6 of 12" },
  { id: "artisan-cherry", name: "Cherry", room: "Pantry", bundle: "Artisan", need: "1", seasons: ["Spring"], source: "Cherry tree or fruit bat cave", choice: "6 of 12" },

  { id: "river-fish-sunfish", name: "Sunfish", room: "Fish Tank", bundle: "River Fish", need: "1", seasons: ["Spring", "Summer"], source: "River, 6am-7pm, sunny" },
  { id: "river-fish-catfish", name: "Catfish", room: "Fish Tank", bundle: "River Fish", need: "1", seasons: ["Spring", "Fall", "Summer"], source: "River/Secret Woods, rain, 6am-midnight" },
  { id: "river-fish-shad", name: "Shad", room: "Fish Tank", bundle: "River Fish", need: "1", seasons: ["Spring", "Summer", "Fall"], source: "River, rain, 9am-2am" },
  { id: "river-fish-tiger-trout", name: "Tiger Trout", room: "Fish Tank", bundle: "River Fish", need: "1", seasons: ["Fall", "Winter"], source: "River, 6am-7pm" },
  { id: "lake-fish-largemouth-bass", name: "Largemouth Bass", room: "Fish Tank", bundle: "Lake Fish", need: "1", seasons: ["Any"], source: "Mountain Lake, 6am-7pm" },
  { id: "lake-fish-carp", name: "Carp", room: "Fish Tank", bundle: "Lake Fish", need: "1", seasons: ["Spring", "Summer", "Fall", "Any"], source: "Mountain Lake, Secret Woods, Sewer" },
  { id: "lake-fish-bullhead", name: "Bullhead", room: "Fish Tank", bundle: "Lake Fish", need: "1", seasons: ["Any"], source: "Mountain Lake, any time" },
  { id: "lake-fish-sturgeon", name: "Sturgeon", room: "Fish Tank", bundle: "Lake Fish", need: "1", seasons: ["Summer", "Winter"], source: "Mountain Lake, 6am-7pm" },
  { id: "ocean-fish-sardine", name: "Sardine", room: "Fish Tank", bundle: "Ocean Fish", need: "1", seasons: ["Spring", "Fall", "Winter"], source: "Ocean, 6am-7pm" },
  { id: "ocean-fish-tuna", name: "Tuna", room: "Fish Tank", bundle: "Ocean Fish", need: "1", seasons: ["Summer", "Winter"], source: "Ocean, 6am-7pm" },
  { id: "ocean-fish-red-snapper", name: "Red Snapper", room: "Fish Tank", bundle: "Ocean Fish", need: "1", seasons: ["Summer", "Fall"], source: "Ocean, rain, 6am-7pm" },
  { id: "ocean-fish-tilapia", name: "Tilapia", room: "Fish Tank", bundle: "Ocean Fish", need: "1", seasons: ["Summer", "Fall"], source: "Ocean, 6am-2pm" },
  { id: "night-fishing-walleye", name: "Walleye", room: "Fish Tank", bundle: "Night Fishing", need: "1", seasons: ["Fall", "Winter"], source: "River/lake/pond, rain, 12pm-2am" },
  { id: "night-fishing-bream", name: "Bream", room: "Fish Tank", bundle: "Night Fishing", need: "1", seasons: ["Any"], source: "River, 6pm-2am" },
  { id: "night-fishing-eel", name: "Eel", room: "Fish Tank", bundle: "Night Fishing", need: "1", seasons: ["Spring", "Fall"], source: "Ocean, rain, 4pm-2am" },
  { id: "crab-pot-lobster", name: "Lobster", room: "Fish Tank", bundle: "Crab Pot", need: "1", seasons: ["Any"], source: "Ocean crab pot", choice: "5 of 10" },
  { id: "crab-pot-crayfish", name: "Crayfish", room: "Fish Tank", bundle: "Crab Pot", need: "1", seasons: ["Any"], source: "Freshwater crab pot", choice: "5 of 10" },
  { id: "crab-pot-crab", name: "Crab", room: "Fish Tank", bundle: "Crab Pot", need: "1", seasons: ["Any"], source: "Ocean crab pot or Rock Crab drop", choice: "5 of 10" },
  { id: "crab-pot-cockle", name: "Cockle", room: "Fish Tank", bundle: "Crab Pot", need: "1", seasons: ["Any"], source: "Ocean crab pot or Beach forage", choice: "5 of 10" },
  { id: "crab-pot-mussel", name: "Mussel", room: "Fish Tank", bundle: "Crab Pot", need: "1", seasons: ["Any"], source: "Ocean crab pot or Beach forage", choice: "5 of 10" },
  { id: "crab-pot-shrimp", name: "Shrimp", room: "Fish Tank", bundle: "Crab Pot", need: "1", seasons: ["Any"], source: "Ocean crab pot", choice: "5 of 10" },
  { id: "crab-pot-snail", name: "Snail", room: "Fish Tank", bundle: "Crab Pot", need: "1", seasons: ["Any"], source: "Freshwater crab pot", choice: "5 of 10" },
  { id: "crab-pot-periwinkle", name: "Periwinkle", room: "Fish Tank", bundle: "Crab Pot", need: "1", seasons: ["Any"], source: "Freshwater crab pot", choice: "5 of 10" },
  { id: "crab-pot-oyster", name: "Oyster", room: "Fish Tank", bundle: "Crab Pot", need: "1", seasons: ["Any"], source: "Ocean crab pot or Beach forage", choice: "5 of 10" },
  { id: "crab-pot-clam", name: "Clam", room: "Fish Tank", bundle: "Crab Pot", need: "1", seasons: ["Any"], source: "Ocean crab pot or Beach forage", choice: "5 of 10" },
  { id: "specialty-pufferfish", name: "Pufferfish", room: "Fish Tank", bundle: "Specialty Fish", need: "1", seasons: ["Summer"], source: "Ocean, sunny, 12pm-4pm" },
  { id: "specialty-ghostfish", name: "Ghostfish", room: "Fish Tank", bundle: "Specialty Fish", need: "1", seasons: ["Any"], source: "Mines floors 20/60 or Ghost drop" },
  { id: "specialty-sandfish", name: "Sandfish", room: "Fish Tank", bundle: "Specialty Fish", need: "1", seasons: ["Any"], source: "Desert pond, 6am-8pm" },
  { id: "specialty-woodskip", name: "Woodskip", room: "Fish Tank", bundle: "Specialty Fish", need: "1", seasons: ["Any"], source: "Secret Woods or Forest Farm" },

  { id: "blacksmith-copper-bar", name: "Copper Bar", room: "Boiler Room", bundle: "Blacksmith", need: "1", seasons: ["Any"], source: "Smelt Copper Ore" },
  { id: "blacksmith-iron-bar", name: "Iron Bar", room: "Boiler Room", bundle: "Blacksmith", need: "1", seasons: ["Any"], source: "Smelt Iron Ore" },
  { id: "blacksmith-gold-bar", name: "Gold Bar", room: "Boiler Room", bundle: "Blacksmith", need: "1", seasons: ["Any"], source: "Smelt Gold Ore" },
  { id: "geologist-quartz", name: "Quartz", room: "Boiler Room", bundle: "Geologist", need: "1", seasons: ["Any"], source: "Mines foraging" },
  { id: "geologist-earth-crystal", name: "Earth Crystal", room: "Boiler Room", bundle: "Geologist", need: "1", seasons: ["Any"], source: "Mines floors 1-39, geodes" },
  { id: "geologist-frozen-tear", name: "Frozen Tear", room: "Boiler Room", bundle: "Geologist", need: "1", seasons: ["Any"], source: "Mines floors 41-79, frozen geodes" },
  { id: "geologist-fire-quartz", name: "Fire Quartz", room: "Boiler Room", bundle: "Geologist", need: "1", seasons: ["Any"], source: "Mines floors 81-119, magma geodes" },
  { id: "adventurer-slime", name: "Slime", room: "Boiler Room", bundle: "Adventurer", need: "99", seasons: ["Any"], source: "Slimes", choice: "2 of 4" },
  { id: "adventurer-bat-wing", name: "Bat Wing", room: "Boiler Room", bundle: "Adventurer", need: "10", seasons: ["Any"], source: "Bats", choice: "2 of 4" },
  { id: "adventurer-solar-essence", name: "Solar Essence", room: "Boiler Room", bundle: "Adventurer", need: "1", seasons: ["Any"], source: "Ghosts, Squid Kids, Metal Heads, Krobus", choice: "2 of 4" },
  { id: "adventurer-void-essence", name: "Void Essence", room: "Boiler Room", bundle: "Adventurer", need: "1", seasons: ["Any"], source: "Shadow Brutes, Serpents, Krobus", choice: "2 of 4" },

  { id: "chef-maple-syrup", name: "Maple Syrup", room: "Bulletin Board", bundle: "Chef", need: "1", seasons: ["Any"], source: "Tap Maple Tree" },
  { id: "chef-fiddlehead-fern", name: "Fiddlehead Fern", room: "Bulletin Board", bundle: "Chef", need: "1", seasons: ["Summer"], source: "Secret Woods summer forage or Green Rain trees" },
  { id: "chef-truffle", name: "Truffle", room: "Bulletin Board", bundle: "Chef", need: "1", seasons: ["Any"], source: "Pigs" },
  { id: "chef-poppy", name: "Poppy", room: "Bulletin Board", bundle: "Chef", need: "1", seasons: ["Summer"], source: "Summer crop" },
  { id: "chef-maki-roll", name: "Maki Roll", room: "Bulletin Board", bundle: "Chef", need: "1", seasons: ["Any"], source: "Cook or buy from Saloon" },
  { id: "chef-fried-egg", name: "Fried Egg", room: "Bulletin Board", bundle: "Chef", need: "1", seasons: ["Any"], source: "Cook" },
  { id: "dye-red-mushroom", name: "Red Mushroom", room: "Bulletin Board", bundle: "Dye", need: "1", seasons: ["Summer", "Fall", "Any"], source: "Mines, Secret Woods, mushroom cave" },
  { id: "dye-sea-urchin", name: "Sea Urchin", room: "Bulletin Board", bundle: "Dye", need: "1", seasons: ["Any"], source: "Beach forage after bridge repair" },
  { id: "dye-sunflower", name: "Sunflower", room: "Bulletin Board", bundle: "Dye", need: "1", seasons: ["Summer", "Fall"], source: "Summer or Fall crop" },
  { id: "dye-duck-feather", name: "Duck Feather", room: "Bulletin Board", bundle: "Dye", need: "1", seasons: ["Any"], source: "Ducks" },
  { id: "dye-aquamarine", name: "Aquamarine", room: "Bulletin Board", bundle: "Dye", need: "1", seasons: ["Any"], source: "Aquamarine nodes, Mines boxes, treasure" },
  { id: "dye-red-cabbage", name: "Red Cabbage", room: "Bulletin Board", bundle: "Dye", need: "1", seasons: ["Summer"], source: "Summer crop, usually Year 2 or Traveling Cart" },
  { id: "field-purple-mushroom", name: "Purple Mushroom", room: "Bulletin Board", bundle: "Field Research", need: "1", seasons: ["Any"], source: "Mines, mushroom cave, Forest Farm fall" },
  { id: "field-nautilus-shell", name: "Nautilus Shell", room: "Bulletin Board", bundle: "Field Research", need: "1", seasons: ["Winter"], source: "Winter Beach forage or Demetrius gift" },
  { id: "field-chub", name: "Chub", room: "Bulletin Board", bundle: "Field Research", need: "1", seasons: ["Any"], source: "Mountain lake or river" },
  { id: "field-frozen-geode", name: "Frozen Geode", room: "Bulletin Board", bundle: "Field Research", need: "1", seasons: ["Any"], source: "Mines floors 41-79" },
  { id: "fodder-wheat", name: "Wheat", room: "Bulletin Board", bundle: "Fodder", need: "10", seasons: ["Summer", "Fall"], source: "Summer or Fall crop" },
  { id: "fodder-hay", name: "Hay", room: "Bulletin Board", bundle: "Fodder", need: "10", seasons: ["Any"], source: "Marnie's Ranch, grass, wheat" },
  { id: "fodder-apple", name: "Apple", room: "Bulletin Board", bundle: "Fodder", need: "3", seasons: ["Fall"], source: "Apple tree or fruit bat cave" },
  { id: "enchanter-oak-resin", name: "Oak Resin", room: "Bulletin Board", bundle: "Enchanter", need: "1", seasons: ["Any"], source: "Tap Oak Tree" },
  { id: "enchanter-wine", name: "Wine", room: "Bulletin Board", bundle: "Enchanter", need: "1", seasons: ["Any"], source: "Keg" },
  { id: "enchanter-rabbits-foot", name: "Rabbit's Foot", room: "Bulletin Board", bundle: "Enchanter", need: "1", seasons: ["Any"], source: "Rabbits or Serpent drop" },
  { id: "enchanter-pomegranate", name: "Pomegranate", room: "Bulletin Board", bundle: "Enchanter", need: "1", seasons: ["Fall"], source: "Pomegranate tree or fruit bat cave" },

  { id: "vault-2500", name: "2,500g payment", room: "Vault", bundle: "Vault", need: "1", seasons: ["Any"], source: "Community Center purchase" },
  { id: "vault-5000", name: "5,000g payment", room: "Vault", bundle: "Vault", need: "1", seasons: ["Any"], source: "Community Center purchase" },
  { id: "vault-10000", name: "10,000g payment", room: "Vault", bundle: "Vault", need: "1", seasons: ["Any"], source: "Community Center purchase" },
  { id: "vault-25000", name: "25,000g payment", room: "Vault", bundle: "Vault", need: "1", seasons: ["Any"], source: "Community Center purchase" },
  { id: "missing-wine", name: "Silver Wine", room: "Abandoned JojaMart", bundle: "The Missing Bundle", need: "1", seasons: ["Any"], source: "Cask-aged Wine", choice: "5 of 6" },
  { id: "missing-dinosaur-mayonnaise", name: "Dinosaur Mayonnaise", room: "Abandoned JojaMart", bundle: "The Missing Bundle", need: "1", seasons: ["Any"], source: "Dinosaur Egg in Mayonnaise Machine", choice: "5 of 6" },
  { id: "missing-prismatic-shard", name: "Prismatic Shard", room: "Abandoned JojaMart", bundle: "The Missing Bundle", need: "1", seasons: ["Any"], source: "Mining and rare drops", choice: "5 of 6" },
  { id: "missing-ancient-fruit", name: "Gold Ancient Fruit", room: "Abandoned JojaMart", bundle: "The Missing Bundle", need: "5", seasons: ["Spring", "Summer", "Fall"], source: "Ancient Fruit crop", choice: "5 of 6" },
  { id: "missing-void-salmon", name: "Gold or Iridium Void Salmon", room: "Abandoned JojaMart", bundle: "The Missing Bundle", need: "1", seasons: ["Any"], source: "Witch's Swamp fishing", choice: "5 of 6" },
  { id: "missing-caviar", name: "Caviar", room: "Abandoned JojaMart", bundle: "The Missing Bundle", need: "1", seasons: ["Any"], source: "Sturgeon Roe in Preserves Jar", choice: "5 of 6" },
];

export const calendarData: Record<Season, Partial<Record<number, CalendarEvent[]>>> = {
  Spring: {
    4: [{ type: "birthday", text: "Kent" }],
    7: [{ type: "birthday", text: "Lewis" }],
    10: [{ type: "birthday", text: "Vincent" }],
    13: [{ type: "festival", text: "Egg Festival" }],
    14: [{ type: "birthday", text: "Haley" }],
    15: [{ type: "new", text: "Desert Festival" }, { type: "forage", text: "Salmonberry" }],
    16: [{ type: "new", text: "Desert Festival" }, { type: "forage", text: "Salmonberry" }],
    17: [{ type: "new", text: "Desert Festival" }, { type: "forage", text: "Salmonberry" }],
    18: [{ type: "birthday", text: "Pam" }, { type: "forage", text: "Salmonberry" }],
    20: [{ type: "birthday", text: "Shane" }],
    24: [{ type: "festival", text: "Flower Dance" }],
    26: [{ type: "birthday", text: "Pierre" }],
    27: [{ type: "birthday", text: "Emily" }],
  },
  Summer: {
    4: [{ type: "birthday", text: "Jas" }],
    8: [{ type: "birthday", text: "Gus" }],
    10: [{ type: "birthday", text: "Maru" }],
    11: [{ type: "festival", text: "Luau" }],
    13: [{ type: "birthday", text: "Alex" }],
    17: [{ type: "birthday", text: "Sam" }],
    19: [{ type: "birthday", text: "Demetrius" }],
    20: [{ type: "new", text: "Trout Derby" }],
    21: [{ type: "new", text: "Trout Derby" }],
    22: [{ type: "birthday", text: "Dwarf" }, { type: "birthday", text: "Vincent" }],
    24: [{ type: "birthday", text: "Willy" }],
    26: [{ type: "birthday", text: "Leo" }],
    28: [{ type: "festival", text: "Dance of the Moonlight Jellies" }],
  },
  Fall: {
    2: [{ type: "birthday", text: "Penny" }],
    5: [{ type: "birthday", text: "Elliott" }],
    8: [{ type: "forage", text: "Blackberry" }],
    9: [{ type: "forage", text: "Blackberry" }],
    10: [{ type: "forage", text: "Blackberry" }],
    11: [{ type: "birthday", text: "Jodi" }, { type: "forage", text: "Blackberry" }],
    13: [{ type: "birthday", text: "Abigail" }],
    15: [{ type: "birthday", text: "Sandy" }],
    16: [{ type: "festival", text: "Stardew Valley Fair" }],
    18: [{ type: "birthday", text: "Marnie" }],
    21: [{ type: "birthday", text: "Robin" }],
    24: [{ type: "birthday", text: "George" }],
    27: [{ type: "festival", text: "Spirit's Eve" }],
  },
  Winter: {
    1: [{ type: "birthday", text: "Krobus" }],
    3: [{ type: "birthday", text: "Linus" }],
    7: [{ type: "birthday", text: "Caroline" }],
    8: [{ type: "festival", text: "Festival of Ice" }],
    10: [{ type: "birthday", text: "Sebastian" }],
    12: [{ type: "new", text: "SquidFest" }],
    13: [{ type: "new", text: "SquidFest" }],
    14: [{ type: "birthday", text: "Harvey" }],
    15: [{ type: "festival", text: "Night Market" }],
    16: [{ type: "festival", text: "Night Market" }],
    17: [{ type: "birthday", text: "Wizard" }, { type: "festival", text: "Night Market" }],
    20: [{ type: "birthday", text: "Evelyn" }],
    23: [{ type: "birthday", text: "Leah" }],
    25: [{ type: "festival", text: "Feast of the Winter Star" }],
    26: [{ type: "birthday", text: "Clint" }],
  },
};

export const villagers: Villager[] = [
  { name: "Abigail", season: "Fall", day: 13, loved: "Amethyst, Banana Pudding, Blackberry Cobbler, Chocolate Cake, Pufferfish, Pumpkin, Spicy Eel", liked: "Quartz" },
  { name: "Alex", season: "Summer", day: 13, loved: "Complete Breakfast, Salmon Dinner", liked: "Eggs (any but Void Egg)" },
  { name: "Caroline", season: "Winter", day: 7, loved: "Fish Taco, Green Tea, Summer Spangle, Tropical Curry", liked: "Daffodil" },
  { name: "Clint", season: "Winter", day: 26, loved: "Amethyst, Aquamarine, Artichoke Dip, Emerald, Fiddlehead Risotto, Gold Bar, Iridium Bar, Jade, Omni Geode, Ruby, Topaz", liked: "Quartz, geodes & most gems and minerals" },
  { name: "Demetrius", season: "Summer", day: 19, loved: "Bean Hotpot, Ice Cream, Rice Pudding, Strawberry", liked: "Daffodil, Purple Mushroom" },
  { name: "Dwarf", season: "Summer", day: 22, loved: "Amethyst, Aquamarine, Emerald, Jade, Lemon Stone, Omni Geode, Ruby, Topaz", liked: "Geodes, Quartz & most minerals" },
  { name: "Elliott", season: "Fall", day: 5, loved: "Crab Cakes, Duck Feather, Lobster, Pomegranate, Squid Ink, Tom Kha Soup", liked: "Octopus, Squid" },
  { name: "Emily", season: "Spring", day: 27, loved: "Amethyst, Aquamarine, Cloth, Emerald, Jade, Ruby, Survival Burger, Topaz, Wool", liked: "Daffodil, Quartz, gems & minerals" },
  { name: "Evelyn", season: "Winter", day: 20, loved: "Beet, Chocolate Cake, Diamond, Fairy Rose, Stuffing, Tulip", liked: "Daffodil" },
  { name: "George", season: "Fall", day: 24, loved: "Fried Mushroom, Leek", liked: "Daffodil" },
  { name: "Gus", season: "Summer", day: 8, loved: "Diamond, Escargot, Fish Taco, Orange, Tropical Curry" },
  { name: "Haley", season: "Spring", day: 14, loved: "Coconut, Fruit Salad, Pink Cake, Sunflower", liked: "Daffodil" },
  { name: "Harvey", season: "Winter", day: 14, loved: "Coffee, Pickles, Super Meal, Truffle Oil, Wine" },
  { name: "Jas", season: "Summer", day: 4, loved: "Fairy Rose, Pink Cake, Plum Pudding", liked: "Coconut, Ancient Doll" },
  { name: "Jodi", season: "Fall", day: 11, loved: "Chocolate Cake, Crispy Bass, Diamond, Eggplant Parmesan, Fried Eel, Pancakes, Rhubarb Pie, Vegetable Medley" },
  { name: "Kent", season: "Spring", day: 4, loved: "Fiddlehead Risotto, Roasted Hazelnuts", liked: "Daffodil" },
  { name: "Krobus", season: "Winter", day: 1, loved: "Diamond, Iridium Bar, Pumpkin, Void Egg, Void Mayonnaise, Wild Horseradish", liked: "Monster Musk, Mixed Seeds" },
  { name: "Leah", season: "Winter", day: 23, loved: "Goat Cheese, Poppyseed Muffin, Salad, Stir Fry, Truffle, Vegetable Medley, Wine", liked: "Most forage & gems" },
  { name: "Leo", season: "Summer", day: 26, loved: "Duck Feather, Mango, Ostrich Egg, Poi", liked: "Dried Sunflowers, Mango Sticky Rice, Banana" },
  { name: "Lewis", season: "Spring", day: 7, loved: "Autumn's Bounty, Glazed Yams, Green Tea, Hot Pepper, Vegetable Medley" },
  { name: "Linus", season: "Winter", day: 3, loved: "Blueberry Tart, Cactus Fruit, Coconut, Dish O' The Sea, Yam" },
  { name: "Marnie", season: "Fall", day: 18, loved: "Diamond, Farmer's Lunch, Pink Cake, Pumpkin Pie" },
  { name: "Maru", season: "Summer", day: 10, loved: "Battery Pack, Cauliflower, Cheese Cauliflower, Diamond, Gold Bar, Iridium Bar, Miner's Treat, Pepper Poppers, Radioactive Bar, Rhubarb Pie, Strawberry", liked: "Copper/Iron/Gold/Iridium Bar, Quartz" },
  { name: "Pam", season: "Spring", day: 18, loved: "Beer, Cactus Fruit, Glazed Yams, Mead, Pale Ale, Parsnip, Parsnip Soup, Piña Colada" },
  { name: "Penny", season: "Fall", day: 2, loved: "Diamond, Emerald, Melon, Poppy, Poppyseed Muffin, Red Plate, Roots Platter, Sandfish, Tom Kha Soup", liked: "Dandelion, Leek, Milk" },
  { name: "Pierre", season: "Spring", day: 26, loved: "Fried Calamari", liked: "Daffodil" },
  { name: "Robin", season: "Fall", day: 21, loved: "Goat Cheese, Peach, Spaghetti", liked: "Quartz, Geodes, most minerals" },
  { name: "Sam", season: "Summer", day: 17, loved: "Cactus Fruit, Maple Bar, Pizza, Tigerseye", liked: "Joja Cola, Eggs" },
  { name: "Sandy", season: "Fall", day: 15, loved: "Crocus, Daffodil, Mango Sticky Rice, Sweet Pea" },
  { name: "Sebastian", season: "Winter", day: 10, loved: "Frozen Tear, Obsidian, Pumpkin Soup, Sashimi, Void Egg", liked: "Quartz, Frog Eggs, most fish" },
  { name: "Shane", season: "Spring", day: 20, loved: "Beer, Hot Pepper, Pepper Poppers, Pizza", liked: "Eggs, Fruit" },
  { name: "Vincent", season: "Summer", day: 22, loved: "Cranberry Candy, Ginger Ale, Grape, Pink Cake, Snail", liked: "Coconut, most fruit" },
  { name: "Willy", season: "Summer", day: 24, loved: "Catfish, Diamond, Iridium Bar, Mead, Octopus, Pumpkin, Sea Cucumber, Sturgeon", liked: "Most fish & gems" },
  { name: "Wizard", season: "Winter", day: 17, loved: "Purple Mushroom, Solar Essence, Super Cucumber, Void Essence", liked: "Most gems & minerals" },
];

// Rough "where to find them through the day" guide for the marriageable villagers.
// Real schedules also shift with weather, season, and heart level — treat as a hint.
export const villagerRoutines: Record<string, string> = {
  Abigail: "Home above Pierre's shop in the mornings; roams town or the mountains midday; Stardrop Saloon on Friday evenings.",
  Alex: "Around his grandparents' house on River Road and the town square; gridball and jogging by day; the beach on warm days.",
  Elliott: "His cabin on the beach during the day; the library or the Saloon some evenings.",
  Emily: "Home at 2 Willow Lane in the morning; tends the bar at the Stardrop Saloon in the evenings.",
  Haley: "Home at 2 Willow Lane; out photographing around town midday; the beach on sunny days.",
  Harvey: "Runs the medical clinic through the day; his apartment above it at night; occasionally the Saloon.",
  Leah: "Her cottage in the forest most of the day; out foraging nearby; the Saloon on weekend evenings.",
  Maru: "The Carpenter's house up the mountain; works shifts at Harvey's clinic (Tue & Thu); stargazes at night.",
  Penny: "The trailer with Pam; tutors Jas & Vincent by the museum and river (Tue & Wed); the library.",
  Sam: "Home at 1 Willow Lane; skateboarding around town; band practice and the Saloon on Friday nights.",
  Sebastian: "His basement room at the Carpenter's; out by the mountain lake; the Saloon on Fridays with Sam & Abigail.",
  Shane: "Works at JojaMart by day; Marnie's Ranch otherwise; drinks at the Stardrop Saloon most evenings.",
};

export const crops: Crop[] = [
  { name: "Strawberry", season: "Spring", grow: 8, regrow: 4, top: true, note: "Best Spring earner — buy seeds at the Egg Festival on Spring 13 and plant the same day." },
  { name: "Cauliflower", season: "Spring", grow: 12, top: true, note: "Bundle crop; high single-harvest value, keep gold ones for Quality Crops." },
  { name: "Potato", season: "Spring", grow: 6, top: true, note: "Bundle crop; fast, cheap, and can yield extra potatoes per harvest." },
  { name: "Parsnip", season: "Spring", grow: 4, note: "Bundle crop" },
  { name: "Green Bean", season: "Spring", grow: 10, regrow: 3, note: "Bundle crop" },
  { name: "Rhubarb", season: "Spring", grow: 13, note: "Buy at the Desert Oasis; high value, great kegged into wine." },
  { name: "Carrot", season: "Spring", grow: 3, note: "1.6 seed from Spring artifact spots" },
  { name: "Blueberry", season: "Summer", grow: 13, regrow: 4, top: true, note: "Bundle crop; regrows every 4 days with 3 berries each — huge season total." },
  { name: "Starfruit", season: "Summer", grow: 13, top: true, note: "Highest base value crop — buy seeds at the Oasis; keg into wine for top profit." },
  { name: "Hops", season: "Summer", grow: 11, regrow: 1, top: true, note: "Harvests daily once grown; Pale Ale via Keg is the best gold-per-day." },
  { name: "Tomato", season: "Summer", grow: 11, regrow: 4, note: "Bundle crop" },
  { name: "Hot Pepper", season: "Summer", grow: 5, regrow: 3, note: "Bundle crop and Shane/Lewis gift" },
  { name: "Melon", season: "Summer", grow: 12, note: "Bundle crop; gold quality for Quality Crops" },
  { name: "Wheat", season: "Summer", grow: 4, note: "Fodder bundle; also Fall" },
  { name: "Poppy", season: "Summer", grow: 7, note: "Chef bundle" },
  { name: "Red Cabbage", season: "Summer", grow: 9, note: "Dye bundle; normally Year 2+" },
  { name: "Summer Squash", season: "Summer", grow: 6, regrow: 3, note: "1.6 seed from Summer artifact spots" },
  { name: "Cranberries", season: "Fall", grow: 7, regrow: 5, top: true, note: "Best Fall profit per tile; 2 berries every 5 days. Buy seeds early." },
  { name: "Pumpkin", season: "Fall", grow: 13, top: true, note: "Bundle crop; high value, keep gold ones for Quality Crops and the Fair." },
  { name: "Grape", season: "Fall", grow: 10, regrow: 3, top: true, note: "Regrows every 3 days; strong keg/jar fodder." },
  { name: "Corn", season: "Fall", grow: 14, regrow: 4, note: "Bundle crop; also Summer — survives into the next season." },
  { name: "Eggplant", season: "Fall", grow: 5, regrow: 5, note: "Bundle crop" },
  { name: "Yam", season: "Fall", grow: 10, note: "Bundle crop" },
  { name: "Sunflower", season: "Fall", grow: 8, note: "Dye bundle; also Summer" },
  { name: "Broccoli", season: "Fall", grow: 8, regrow: 4, note: "1.6 seed from Fall artifact spots" },
  { name: "Powdermelon", season: "Winter", grow: 7, note: "1.6 seed from Winter artifact spots" },
];

// Carpenter / animal buildings and the resources each needs. Costs from Robin's shop.
export const buildings: Building[] = [
  { name: "Coop", category: "Animal", gold: 4000, materials: "Wood ×300, Stone ×100", size: "6×3", note: "Houses 4 animals. Start: chickens. Buy from Marnie." },
  { name: "Big Coop", category: "Animal", gold: 10000, materials: "Wood ×400, Stone ×150", size: "6×3", requires: "Coop", note: "Houses 8; adds incubator. Unlocks ducks." },
  { name: "Deluxe Coop", category: "Animal", gold: 20000, materials: "Wood ×500, Stone ×200", size: "6×3", requires: "Big Coop", note: "Houses 12; auto-feed. Unlocks rabbits & dinosaurs." },
  { name: "Barn", category: "Animal", gold: 6000, materials: "Wood ×350, Stone ×150", size: "7×4", note: "Houses 4 animals. Start: cows." },
  { name: "Big Barn", category: "Animal", gold: 12000, materials: "Wood ×450, Stone ×200", size: "7×4", requires: "Barn", note: "Houses 8; animals give birth. Unlocks goats & pigs." },
  { name: "Deluxe Barn", category: "Animal", gold: 25000, materials: "Wood ×550, Stone ×300", size: "7×4", requires: "Big Barn", note: "Houses 12; auto-feed. Unlocks sheep." },
  { name: "Slime Hutch", category: "Animal", gold: 10000, materials: "Stone ×500, Refined Quartz ×10, Iron Bar ×1", size: "11×6", note: "Houses 20 slimes for slime balls." },
  { name: "Silo", category: "Utility", gold: 100, materials: "Stone ×100, Clay ×10, Copper Bar ×5", size: "3×3", note: "Stores hay from cut grass. Build this before coops/barns." },
  { name: "Well", category: "Utility", gold: 1000, materials: "Stone ×75", size: "3×3", note: "Refill your watering can out in the fields." },
  { name: "Mill", category: "Utility", gold: 2500, materials: "Wood ×150, Stone ×50, Cloth ×4", size: "4×2", note: "Turns wheat into flour and beets into sugar." },
  { name: "Stable", category: "Utility", gold: 10000, materials: "Hardwood ×100, Iron Bar ×5", size: "4×2", note: "Get a horse — about 30% faster movement." },
  { name: "Fish Pond", category: "Utility", gold: 5000, materials: "Stone ×200, Seaweed ×5, Green Algae ×5", size: "5×5", note: "Raise fish for roe, ink, and other goods." },
  { name: "Shed", category: "Utility", gold: 15000, materials: "Wood ×300", size: "7×3", note: "Empty interior — fill it with kegs, casks, or machines." },
  { name: "Big Shed", category: "Utility", gold: 20000, materials: "Wood ×550, Stone ×300", size: "7×3", requires: "Shed", note: "Larger interior with windows for even more machines." },
];

export type Tool = {
  name: string;
  /** When to upgrade + what each tier changes. */
  note: string;
};

// Tools you upgrade at Clint's Blacksmith. Timing matters — you lose the tool for 2 days.
export const tools: Tool[] = [
  {
    name: "Watering Can",
    note: "Upgrade on a RAINY day — crops water themselves, so the 2 days without it cost nothing. Charge-up waters more each tier: 3 → 5 → 9 → 18 tiles.",
  },
  {
    name: "Hoe",
    note: "Upgrade when you're between plantings. Charge-up tills more each tier: 3 → 5 → 9 → 18 tiles.",
  },
  {
    name: "Pickaxe",
    note: "Mines faster and breaks tougher rocks each tier; Iridium clears the biggest nodes. Upgrade overnight when you don't need the mines.",
  },
  {
    name: "Axe",
    note: "Chops faster each tier; Copper clears large stumps, Iridium clears large logs. Upgrade on a town / social day.",
  },
  {
    name: "Trash Can",
    note: "Better gold refund when you trash items — no field downtime, so upgrade whenever you have the bars.",
  },
];

// Every tool follows the same upgrade ladder (2 in-game days each).
export const toolUpgrades: { tier: string; gold: number; bar: string }[] = [
  { tier: "Copper", gold: 2000, bar: "Copper Bar ×5" },
  { tier: "Steel", gold: 5000, bar: "Iron Bar ×5" },
  { tier: "Gold", gold: 10000, bar: "Gold Bar ×5" },
  { tier: "Iridium", gold: 25000, bar: "Iridium Bar ×5" },
];

export type MissionTemplate = {
  name: string;
  icon: string;
  items: string[];
};

// Bigger multi-step goals you can drop onto the board ready-made.
export const missionTemplates: MissionTemplate[] = [
  {
    name: "Reach the bottom of the Mines",
    icon: "⛏️",
    items: [
      "Buy a sword from the Adventurer's Guild",
      "Pack cooked food to heal",
      "Ride the elevator down (it saves every 5 floors)",
      "Reach floor 120 and grab the Skull Key",
    ],
  },
  {
    name: "Skull Cavern deep run",
    icon: "💀",
    items: [
      "Stock 20+ bombs / mega bombs",
      "Bring coffee or Spicy Eel for speed + luck",
      "Go on a lucky day (check the TV Fortune Teller)",
      "Stack staircases to skip floors fast",
      "Reach floor 100",
    ],
  },
  {
    name: "Complete the Community Center",
    icon: "🏛️",
    items: [
      "Finish the Crafts Room",
      "Finish the Pantry",
      "Finish the Fish Tank",
      "Finish the Boiler Room",
      "Finish the Bulletin Board",
      "Pay off the Vault",
    ],
  },
  {
    name: "Unlock the Greenhouse",
    icon: "🪴",
    items: [
      "Complete every Pantry bundle (Crops, Quality, Animal, Artisan)",
      "Greenhouse repaired — grow any crop year-round",
      "Plant Ancient Fruit / Starfruit for steady wine",
    ],
  },
  {
    name: "Fill the Museum",
    icon: "🏺",
    items: [
      "Donate artifacts & minerals to Gunther",
      "Hit 40 donations for a reward",
      "Reach all 95 donations for the Stardrop",
    ],
  },
  {
    name: "Max a skill to level 10",
    icon: "⭐",
    items: [
      "Pick the skill (Farming, Mining, Foraging, Fishing, Combat)",
      "Choose your level 5 profession",
      "Choose your level 10 profession",
    ],
  },
  {
    name: "Become Master Angler",
    icon: "🎣",
    items: [
      "Catch all Spring & Summer fish",
      "Catch all Fall & Winter fish",
      "Catch the Legendary fish",
      "Catch the Night Market & Ginger Island fish",
    ],
  },
  {
    name: "Find all the Stardrops",
    icon: "🌟",
    items: [
      "Stardew Valley Fair — buy it for 2,000 star tokens",
      "Mines floor 100 — open the treasure chest",
      "Museum — reach all 95 donations",
      "Get the Krobus, fishing-chest, and spouse Stardrops",
    ],
  },
];

export const seasonFocus: Record<Season, string[]> = {
  Spring: [
    "Save Spring Foraging items before selling forage.",
    "Plant Parsnip, Green Bean, Cauliflower, and Potato for the Pantry.",
    "Fish Sunfish on sunny days, Catfish/Shad/Eel on rainy days.",
    "Buy Strawberry Seeds at the Egg Festival on Spring 13 if you can.",
  ],
  Summer: [
    "Save Tomato, Hot Pepper, Blueberry, Melon, Poppy, and Wheat.",
    "Catch Pufferfish on sunny 12pm-4pm Ocean days.",
    "Catch Sturgeon in Mountain Lake and Red Snapper on rainy Ocean days.",
    "Watch for Green Rain and collect Moss plus Fiddlehead Ferns.",
  ],
  Fall: [
    "Save Corn, Eggplant, Pumpkin, Yam, Sunflower, and Apples.",
    "Get Blackberry forage on Fall 8-11.",
    "Catch Walleye and Eel on rainy days.",
    "Prepare 9 varied high-quality items for the Stardew Valley Fair.",
  ],
  Winter: [
    "Dig for Winter Root and Snow Yam; forage Crystal Fruit and Crocus.",
    "Collect Nautilus Shell from the Beach for Field Research.",
    "Catch Sturgeon, Tuna, Sardine, Tiger Trout, and SquidFest Squid.",
    "Check your Feast of the Winter Star gift assignment on Winter 1.",
  ],
};

export function isAvailableInSeason(item: BundleItem, season: Season) {
  return item.seasons.includes("Any") || item.seasons.includes(season);
}

export function clampDay(day: number): number {
  if (Number.isNaN(day)) return 1;
  return Math.min(28, Math.max(1, Math.round(day)));
}

// How many distinct items a bundle needs to be considered complete.
// "5 of 9" -> 5; otherwise every listed item is required.
export function bundleRequiredCount(items: BundleItem[]): number {
  const choice = items.find((item) => item.choice)?.choice;
  if (choice) {
    const match = choice.match(/^(\d+)\s+of\s+(\d+)/i);
    if (match) return Number(match[1]);
  }
  return items.length;
}

export type BundleGroup = {
  room: Room;
  bundle: string;
  items: BundleItem[];
  required: number;
};

// Bundles grouped by room, preserving game order.
export const bundleGroups: BundleGroup[] = (() => {
  const order: string[] = [];
  const map = new Map<string, BundleItem[]>();
  for (const item of bundleItems) {
    const key = `${item.room}::${item.bundle}`;
    if (!map.has(key)) {
      map.set(key, []);
      order.push(key);
    }
    map.get(key)!.push(item);
  }
  return order.map((key) => {
    const items = map.get(key)!;
    return {
      room: items[0].room,
      bundle: items[0].bundle,
      items,
      required: bundleRequiredCount(items),
    };
  });
})();
