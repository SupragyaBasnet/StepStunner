// Import footwear images that exist in the assets folder
import converseChuckTaylorMadison from "../assets/Converse Chuck Taylor All Star Madison Mid Lilac .jpg";
import converseChuckTaylorLift from "../assets/Converse Chuck Taylor All Star Lift Women's Platform High.jpg";
import converseLiftHiTop from "../assets/Converse Womens Lift Hi Top Trainers.jpg";
import vansCaldrone from "../assets/Vans Caldrone Sneaker .jpg";
import vansOldSkoolSherpa from "../assets/Vans Unisex Old Skool Sherpa Trainers : Beige Rose Pink .jpg";
import vansOldSkoolWhite from "../assets/Vans Womens Old Skool True White Shoes .jpg";
import vansSk8Hi from "../assets/Vans Sk8 Hi .jpg";
import adidasCampus00s from "../assets/Adidas_Originals_Campus_00s.png";
import adidasCampus from "../assets/Adidas_Originals_Campus_00s.png";
import adidasSambas from "../assets/Pink adidas sambas.jpg";
import calvinKleinSneaker from "../assets/Calvin_Klein_Jeans_Sneaker_in_Weiß.png";
import calvinKleinAubrie from "../assets/Calvin Klein Shoes | Calvin Klein Sneakers Aubrie White Logo Low Top Trainers .jpg";
import calvinKleinWhite from "../assets/Zapatillas CALVIN KLEIN en color bright white black para caballero .jpg";
import louisVuittonPink from "../assets/Replica Louis Vuitton White:Pink Time Out Sneakers .jpg";
import louisVuittonGold from "../assets/Replica Louis Vuitton White:Gold Time Out Sneakers .jpg";
import louisVuittonLuxury from "../assets/Women's Luxury Trainers LOUIS VUITTON .jpg";
import louisVuittonTrainer from "../assets/Louis_Vuitton_Shoes__Lv_Trainer_Sneaker.png";
import nikeAirforceShadow from "../assets/Nike_airforce_shadow.png";
import nikeDunkPinkPaisley from "../assets/Nike Dunk Low Pink Paisley Sneakers .jpg";
import nikePandaDunks from "../assets/Nike_Panda_Dunks_Shoe.png";
import nikeCortez from "../assets/Nike Classic Cortez Women's Leather Sneakers.jpg";

// Heels
import sloyanHighHeel from "../assets/heels/Sloyan_High_Heel_Sandal_in_Gold.png";
import steveMaddenEryka from "../assets/heels/Steve_Madden_Eryka_Ankle_Strap_Sandal_in_Multi_Leather_at_Nordstrom_Rack.png";
import luxuryFashion from "../assets/heels/Luxury_fashion___independent_designers.png";
import jypseyTan from "../assets/heels/JYPSEY_Tan_Leather_Strappy_Stiletto_Women_s_Heel.png";
import milooeyShoes from "../assets/heels/Milooey_shoes_Women_Elegant_Open_Toe_Strappy_Heeled_Sandal_Lace_Up_Block_High_Heels_Ankle_Strap.png";
import chalkOleana from "../assets/heels/Chalk_Oleana_Clear_Trapeze_Heel.png";
import jimmyChoo from "../assets/heels/Jimmy_Choo_us.png";
import steveMaddenManzie from "../assets/heels/Steve_Madden_Manzie_Heeled_Sandal_Women_s_Shoes_White_Zappos.png";
import annieWhite from "../assets/heels/ANNIE_White_Women_s_Strappy_Square_Toe_Heel.png";

export interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
  images?: string[];
  description: string;
  category: string;
  rating: number;
  reviews: number;
  brand?: string;
  colors?: string[];
  sizes?: string[];
}

export const products: Product[] = [
  // SNEAKERS
  {
    id: 1,
    name: "Converse Chuck Taylor All Star Madison Mid",
    price: 8500,
    image: converseChuckTaylorMadison,
    images: [converseChuckTaylorMadison, converseChuckTaylorLift, converseLiftHiTop],
    description: "Classic Chuck Taylor design with a modern mid-top silhouette in beautiful lilac color",
    category: "sneakers",
    rating: 4.8,
    reviews: 156,
    brand: "Converse",
    colors: ["Lilac"],
    sizes: ["5", "6", "7", "8", "9", "10"]
  },
  {
    id: 2,
    name: "Converse Chuck Taylor All Star Lift Platform",
    price: 9200,
    image: converseChuckTaylorLift,
    images: [converseChuckTaylorLift, converseChuckTaylorMadison, converseLiftHiTop],
    description: "Elevated platform version of the iconic Chuck Taylor with added height and style",
    category: "sneakers",
    rating: 4.7,
    reviews: 98,
    brand: "Converse",
    colors: ["White", "Black"],
    sizes: ["5", "6", "7", "8", "9", "10"]
  },
  {
    id: 3,
    name: "Converse Lift Hi Top Trainers",
    price: 8900,
    image: converseLiftHiTop,
    images: [converseLiftHiTop, converseChuckTaylorMadison, converseChuckTaylorLift],
    description: "High-top trainers with lift technology for ultimate comfort and style",
    category: "sneakers",
    rating: 4.6,
    reviews: 87,
    brand: "Converse",
    colors: ["White", "Pink"],
    sizes: ["5", "6", "7", "8", "9", "10"]
  },
  {
    id: 4,
    name: "Vans Caldrone Sneaker",
    price: 7800,
    image: vansCaldrone,
    images: [vansCaldrone, vansOldSkoolSherpa, vansOldSkoolWhite],
    description: "Comfortable and stylish sneaker perfect for everyday wear",
    category: "sneakers",
    rating: 4.5,
    reviews: 134,
    brand: "Vans",
    colors: ["White", "Black"],
    sizes: ["5", "6", "7", "8", "9", "10"]
  },
  {
    id: 5,
    name: "Vans Old Skool Sherpa Trainers",
    price: 8200,
    image: vansOldSkoolSherpa,
    images: [vansOldSkoolSherpa, vansCaldrone, vansOldSkoolWhite],
    description: "Classic Old Skool design with cozy sherpa lining for winter comfort",
    category: "sneakers",
    rating: 4.7,
    reviews: 112,
    brand: "Vans",
    colors: ["Beige Rose Pink"],
    sizes: ["5", "6", "7", "8", "9", "10"]
  },
  {
    id: 6,
    name: "Vans Old Skool True White",
    price: 7500,
    image: vansOldSkoolWhite,
    images: [vansOldSkoolWhite, vansCaldrone, vansOldSkoolSherpa],
    description: "Timeless white Old Skool sneakers with iconic side stripe",
    category: "sneakers",
    rating: 4.8,
    reviews: 203,
    brand: "Vans",
    colors: ["White"],
    sizes: ["5", "6", "7", "8", "9", "10"]
  },
  {
    id: 7,
    name: "Vans Sk8 Hi",
    price: 8000,
    image: vansSk8Hi,
    images: [vansSk8Hi, vansCaldrone, vansOldSkoolWhite],
    description: "High-top skate shoes with classic Vans styling and durability",
    category: "sneakers",
    rating: 4.6,
    reviews: 95,
    brand: "Vans",
    colors: ["Black", "White"],
    sizes: ["5", "6", "7", "8", "9", "10"]
  },
  {
    id: 8,
    name: "Adidas Originals Campus 00s",
    price: 9500,
    image: adidasCampus00s,
    images: [adidasCampus00s, adidasCampus, adidasSambas],
    description: "Retro-inspired sneakers with premium suede upper and classic Adidas styling",
    category: "sneakers",
    rating: 4.7,
    reviews: 167,
    brand: "Adidas",
    colors: ["White", "Green"],
    sizes: ["5", "6", "7", "8", "9", "10"]
  },
  {
    id: 9,
    name: "Adidas Campus Sneakers",
    price: 8800,
    image: adidasCampus,
    images: [adidasCampus, adidasCampus00s, adidasSambas],
    description: "Classic campus sneakers with comfortable fit and versatile style",
    category: "sneakers",
    rating: 4.5,
    reviews: 89,
    brand: "Adidas",
    colors: ["White", "Blue"],
    sizes: ["5", "6", "7", "8", "9", "10"]
  },
  {
    id: 10,
    name: "Adidas Sambas Pink",
    price: 9200,
    image: adidasSambas,
    images: [adidasSambas, adidasCampus00s, adidasCampus],
    description: "Iconic Samba design in beautiful pink with premium leather construction",
    category: "sneakers",
    rating: 4.8,
    reviews: 145,
    brand: "Adidas",
    colors: ["Pink"],
    sizes: ["5", "6", "7", "8", "9", "10"]
  },
  {
    id: 11,
    name: "Calvin Klein Jeans Sneaker",
    price: 12000,
    image: calvinKleinSneaker,
    images: [calvinKleinSneaker, calvinKleinAubrie, calvinKleinWhite],
    description: "Elegant sneakers with Calvin Klein's signature minimalist design",
    category: "sneakers",
    rating: 4.6,
    reviews: 78,
    brand: "Calvin Klein",
    colors: ["White"],
    sizes: ["5", "6", "7", "8", "9", "10"]
  },
  {
    id: 12,
    name: "Calvin Klein Aubrie White Logo",
    price: 13500,
    image: calvinKleinAubrie,
    images: [calvinKleinAubrie, calvinKleinSneaker, calvinKleinWhite],
    description: "Premium low-top trainers with subtle logo branding and clean lines",
    category: "sneakers",
    rating: 4.7,
    reviews: 92,
    brand: "Calvin Klein",
    colors: ["White"],
    sizes: ["5", "6", "7", "8", "9", "10"]
  },
  {
    id: 13,
    name: "Calvin Klein Bright White",
    price: 12800,
    image: calvinKleinWhite,
    images: [calvinKleinWhite, calvinKleinSneaker, calvinKleinAubrie],
    description: "Bright white sneakers with black accents for a classic look",
    category: "sneakers",
    rating: 4.5,
    reviews: 67,
    brand: "Calvin Klein",
    colors: ["White"],
    sizes: ["5", "6", "7", "8", "9", "10"]
  },
  {
    id: 14,
    name: "Louis Vuitton Time Out Pink",
    price: 45000,
    image: louisVuittonPink,
    images: [louisVuittonPink, louisVuittonGold, louisVuittonLuxury],
    description: "Luxury sneakers with Louis Vuitton's iconic design in pink and white",
    category: "sneakers",
    rating: 4.9,
    reviews: 45,
    brand: "Louis Vuitton",
    colors: ["Pink", "White"],
    sizes: ["5", "6", "7", "8", "9", "10"]
  },
  {
    id: 15,
    name: "Louis Vuitton Time Out Gold",
    price: 48000,
    image: louisVuittonGold,
    images: [louisVuittonGold, louisVuittonPink, louisVuittonLuxury],
    description: "Premium luxury sneakers with gold accents and LV monogram",
    category: "sneakers",
    rating: 4.9,
    reviews: 38,
    brand: "Louis Vuitton",
    colors: ["Gold", "White"],
    sizes: ["5", "6", "7", "8", "9", "10"]
  },
  {
    id: 16,
    name: "Louis Vuitton Luxury Trainers",
    price: 52000,
    image: louisVuittonLuxury,
    images: [louisVuittonLuxury, louisVuittonPink, louisVuittonGold],
    description: "Ultimate luxury trainers with premium materials and craftsmanship",
    category: "sneakers",
    rating: 5.0,
    reviews: 29,
    brand: "Louis Vuitton",
    colors: ["White", "Black"],
    sizes: ["5", "6", "7", "8", "9", "10"]
  },
  {
    id: 17,
    name: "Louis Vuitton LV Trainer",
    price: 55000,
    image: louisVuittonTrainer,
    images: [louisVuittonTrainer, louisVuittonPink, louisVuittonGold],
    description: "Signature LV trainer with distinctive design and luxury appeal",
    category: "sneakers",
    rating: 4.9,
    reviews: 52,
    brand: "Louis Vuitton",
    colors: ["White", "Black"],
    sizes: ["5", "6", "7", "8", "9", "10"]
  },
  {
    id: 18,
    name: "Nike Air Force Shadow",
    price: 15000,
    image: nikeAirforceShadow,
    images: [nikeAirforceShadow, nikeDunkPinkPaisley, nikePandaDunks],
    description: "Nike Air Force 1 with shadow design for a unique twist on the classic",
    category: "sneakers",
    rating: 4.7,
    reviews: 234,
    brand: "Nike",
    colors: ["White", "Gray"],
    sizes: ["5", "6", "7", "8", "9", "10"]
  },
  {
    id: 19,
    name: "Nike Dunk Low Pink Paisley",
    price: 18000,
    image: nikeDunkPinkPaisley,
    images: [nikeDunkPinkPaisley, nikeAirforceShadow, nikePandaDunks],
    description: "Nike Dunk Low with beautiful pink paisley pattern for a feminine touch",
    category: "sneakers",
    rating: 4.8,
    reviews: 189,
    brand: "Nike",
    colors: ["Pink", "White"],
    sizes: ["5", "6", "7", "8", "9", "10"]
  },
  {
    id: 20,
    name: "Nike Panda Dunks",
    price: 16000,
    image: nikePandaDunks,
    images: [nikePandaDunks, nikeAirforceShadow, nikeDunkPinkPaisley],
    description: "Classic Nike Dunk High in black and white panda colorway",
    category: "sneakers",
    rating: 4.9,
    reviews: 312,
    brand: "Nike",
    colors: ["Black", "White"],
    sizes: ["5", "6", "7", "8", "9", "10"]
  },
  {
    id: 21,
    name: "Nike Classic Cortez",
    price: 12000,
    image: nikeCortez,
    images: [nikeCortez, nikeAirforceShadow, nikeDunkPinkPaisley],
    description: "Timeless Nike Cortez in premium leather with classic styling",
    category: "sneakers",
    rating: 4.6,
    reviews: 156,
    brand: "Nike",
    colors: ["White", "Red"],
    sizes: ["5", "6", "7", "8", "9", "10"]
  },

  // HEELS
  {
    id: 22,
    name: "Sloyan High Heel Sandal Gold",
    price: 8500,
    image: sloyanHighHeel,
    images: [sloyanHighHeel, steveMaddenEryka, jypseyTan],
    description: "Elegant gold high heel sandals perfect for special occasions",
    category: "heels",
    rating: 4.5,
    reviews: 89,
    brand: "Sloyan",
    colors: ["Gold"],
    sizes: ["5", "6", "7", "8", "9", "10"]
  },
  {
    id: 23,
    name: "Steve Madden Eryka Ankle Strap",
    price: 12000,
    image: steveMaddenEryka,
    images: [steveMaddenEryka, sloyanHighHeel, steveMaddenManzie],
    description: "Multi-leather ankle strap sandals with sophisticated design",
    category: "heels",
    rating: 4.7,
    reviews: 134,
    brand: "Steve Madden",
    colors: ["Multi Leather"],
    sizes: ["5", "6", "7", "8", "9", "10"]
  },
  {
    id: 24,
    name: "Luxury Fashion Heels",
    price: 18000,
    image: luxuryFashion,
    images: [luxuryFashion, jimmyChoo, sloyanHighHeel],
    description: "Premium luxury heels from independent designers",
    category: "heels",
    rating: 4.8,
    reviews: 67,
    brand: "Luxury",
    colors: ["Black", "Red"],
    sizes: ["5", "6", "7", "8", "9", "10"]
  },
  {
    id: 25,
    name: "JYPSEY Tan Leather Stiletto",
    price: 9500,
    image: jypseyTan,
    images: [jypseyTan, sloyanHighHeel, steveMaddenEryka],
    description: "Strappy stiletto heels in beautiful tan leather",
    category: "heels",
    rating: 4.6,
    reviews: 78,
    brand: "JYPSEY",
    colors: ["Tan"],
    sizes: ["5", "6", "7", "8", "9", "10"]
  },
  {
    id: 26,
    name: "Milooey Elegant Strappy Heels",
    price: 11000,
    image: milooeyShoes,
    images: [milooeyShoes, jypseyTan, steveMaddenEryka],
    description: "Elegant open-toe strappy heels with lace-up ankle strap",
    category: "heels",
    rating: 4.5,
    reviews: 92,
    brand: "Milooey",
    colors: ["Black", "White"],
    sizes: ["5", "6", "7", "8", "9", "10"]
  },
  {
    id: 27,
    name: "Chalk Oleana Clear Trapeze",
    price: 14000,
    image: chalkOleana,
    images: [chalkOleana, luxuryFashion, jimmyChoo],
    description: "Unique clear trapeze heels with modern design",
    category: "heels",
    rating: 4.7,
    reviews: 56,
    brand: "Chalk",
    colors: ["Clear"],
    sizes: ["5", "6", "7", "8", "9", "10"]
  },
  {
    id: 28,
    name: "Jimmy Choo Luxury Heels",
    price: 35000,
    image: jimmyChoo,
    images: [jimmyChoo, luxuryFashion, chalkOleana],
    description: "Premium Jimmy Choo heels with luxury craftsmanship",
    category: "heels",
    rating: 4.9,
    reviews: 45,
    brand: "Jimmy Choo",
    colors: ["Black", "Gold"],
    sizes: ["5", "6", "7", "8", "9", "10"]
  },
  {
    id: 29,
    name: "Steve Madden Manzie Heeled Sandal",
    price: 13000,
    image: steveMaddenManzie,
    images: [steveMaddenManzie, steveMaddenEryka, annieWhite],
    description: "White heeled sandals with Steve Madden's signature style",
    category: "heels",
    rating: 4.6,
    reviews: 103,
    brand: "Steve Madden",
    colors: ["White"],
    sizes: ["5", "6", "7", "8", "9", "10"]
  },
  {
    id: 30,
    name: "ANNIE White Strappy Square Toe",
    price: 9800,
    image: annieWhite,
    images: [annieWhite, steveMaddenManzie, jypseyTan],
    description: "White strappy heels with square toe design for modern elegance",
    category: "heels",
    rating: 4.5,
    reviews: 87,
    brand: "ANNIE",
    colors: ["White"],
    sizes: ["5", "6", "7", "8", "9", "10"]
  }
];

export const getProductsByCategory = (category: string) => {
  return products.filter(item => item.category === category);
};

export const getProductsByBrand = (brand: string) => {
  return products.filter(item => item.brand === brand);
};

export const getSneakers = () => {
  return products.filter(item => item.category === "sneakers");
};

export const getHeels = () => {
  return products.filter(item => item.category === "heels");
};


