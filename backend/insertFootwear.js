const mongoose = require('mongoose');
const Product = require('./models/Product');

const MONGO_URI = 'mongodb://localhost:27017/StepStunner'; // Update if using a different URI

const footwear = [
  // SNEAKERS
  {
    name: "Converse Chuck Taylor All Star Madison Mid",
    category: "sneakers",
    price: 8500,
    description: "Classic Chuck Taylor design with a modern mid-top silhouette in beautiful lilac color",
    image: "/Converse Chuck Taylor All Star Madison Mid Lilac .jpg",
    brand: "Converse",
    colors: ["Lilac"],
    sizes: ["5", "6", "7", "8", "9", "10"],
    rating: 4.8,
    reviews: 156
  },
  {
    name: "Converse Chuck Taylor All Star Lift Platform",
    category: "sneakers",
    price: 9200,
    description: "Elevated platform version of the iconic Chuck Taylor with added height and style",
    image: "/Converse Chuck Taylor All Star Lift Women's Platform High.jpg",
    brand: "Converse",
    colors: ["White", "Black"],
    sizes: ["5", "6", "7", "8", "9", "10"],
    rating: 4.7,
    reviews: 98
  },
  {
    name: "Converse Lift Hi Top Trainers",
    category: "sneakers",
    price: 8900,
    description: "High-top trainers with lift technology for ultimate comfort and style",
    image: "/Converse Womens Lift Hi Top Trainers.jpg",
    brand: "Converse",
    colors: ["White", "Pink"],
    sizes: ["5", "6", "7", "8", "9", "10"],
    rating: 4.6,
    reviews: 87
  },
  {
    name: "Vans Caldrone Sneaker",
    category: "sneakers",
    price: 7800,
    description: "Comfortable and stylish sneaker perfect for everyday wear",
    image: "/Vans Caldrone Sneaker .jpg",
    brand: "Vans",
    colors: ["White", "Black"],
    sizes: ["5", "6", "7", "8", "9", "10"],
    rating: 4.5,
    reviews: 134
  },
  {
    name: "Vans Old Skool Sherpa Trainers",
    category: "sneakers",
    price: 8200,
    description: "Classic Old Skool design with cozy sherpa lining for winter comfort",
    image: "/Vans Unisex Old Skool Sherpa Trainers : Beige Rose Pink .jpg",
    brand: "Vans",
    colors: ["Beige Rose Pink"],
    sizes: ["5", "6", "7", "8", "9", "10"],
    rating: 4.7,
    reviews: 112
  },
  {
    name: "Vans Old Skool True White",
    category: "sneakers",
    price: 7500,
    description: "Timeless white Old Skool sneakers with iconic side stripe",
    image: "/Vans Womens Old Skool True White Shoes .jpg",
    brand: "Vans",
    colors: ["White"],
    sizes: ["5", "6", "7", "8", "9", "10"],
    rating: 4.8,
    reviews: 203
  },
  {
    name: "Vans Sk8 Hi",
    category: "sneakers",
    price: 8000,
    description: "High-top skate shoes with classic Vans styling and durability",
    image: "/Vans Sk8 Hi .jpg",
    brand: "Vans",
    colors: ["Black", "White"],
    sizes: ["5", "6", "7", "8", "9", "10"],
    rating: 4.6,
    reviews: 95
  },
  {
    name: "Adidas Originals Campus 00s",
    category: "sneakers",
    price: 9500,
    description: "Retro-inspired sneakers with premium suede upper and classic Adidas styling",
    image: "/Adidas Originals Campus 00s.jpg",
    brand: "Adidas",
    colors: ["White", "Green"],
    sizes: ["5", "6", "7", "8", "9", "10"],
    rating: 4.7,
    reviews: 167
  },
  {
    name: "Adidas Campus Sneakers",
    category: "sneakers",
    price: 8800,
    description: "Classic campus sneakers with comfortable fit and versatile style",
    image: "/Adidas Campus Sneakers.jpg",
    brand: "Adidas",
    colors: ["White", "Blue"],
    sizes: ["5", "6", "7", "8", "9", "10"],
    rating: 4.5,
    reviews: 89
  },
  {
    name: "Adidas Sambas Pink",
    category: "sneakers",
    price: 9200,
    description: "Iconic Samba design in beautiful pink with premium leather construction",
    image: "/Pink adidas sambas.jpg",
    brand: "Adidas",
    colors: ["Pink"],
    sizes: ["5", "6", "7", "8", "9", "10"],
    rating: 4.8,
    reviews: 145
  },
  {
    name: "Calvin Klein Jeans Sneaker",
    category: "sneakers",
    price: 12000,
    description: "Elegant sneakers with Calvin Klein's signature minimalist design",
    image: "/Calvin Klein Jeans Sneaker in Weiß.jpg",
    brand: "Calvin Klein",
    colors: ["White"],
    sizes: ["5", "6", "7", "8", "9", "10"],
    rating: 4.6,
    reviews: 78
  },
  {
    name: "Calvin Klein Aubrie White Logo",
    category: "sneakers",
    price: 13500,
    description: "Premium low-top trainers with subtle logo branding and clean lines",
    image: "/Calvin Klein Shoes | Calvin Klein Sneakers Aubrie White Logo Low Top Trainers .jpg",
    brand: "Calvin Klein",
    colors: ["White"],
    sizes: ["5", "6", "7", "8", "9", "10"],
    rating: 4.7,
    reviews: 92
  },
  {
    name: "Calvin Klein Bright White",
    category: "sneakers",
    price: 12800,
    description: "Bright white sneakers with black accents for a classic look",
    image: "/Zapatillas CALVIN KLEIN en color bright white black para caballero .jpg",
    brand: "Calvin Klein",
    colors: ["White"],
    sizes: ["5", "6", "7", "8", "9", "10"],
    rating: 4.5,
    reviews: 67
  },
  {
    name: "Louis Vuitton Time Out Pink",
    category: "sneakers",
    price: 45000,
    description: "Luxury sneakers with Louis Vuitton's iconic design in pink and white",
    image: "/Replica Louis Vuitton White:Pink Time Out Sneakers .jpg",
    brand: "Louis Vuitton",
    colors: ["Pink", "White"],
    sizes: ["5", "6", "7", "8", "9", "10"],
    rating: 4.9,
    reviews: 45
  },
  {
    name: "Louis Vuitton Time Out Gold",
    category: "sneakers",
    price: 48000,
    description: "Premium luxury sneakers with gold accents and LV monogram",
    image: "/Replica Louis Vuitton White:Gold Time Out Sneakers .jpg",
    brand: "Louis Vuitton",
    colors: ["Gold", "White"],
    sizes: ["5", "6", "7", "8", "9", "10"],
    rating: 4.9,
    reviews: 38
  },
  {
    name: "Louis Vuitton Luxury Trainers",
    category: "sneakers",
    price: 52000,
    description: "Ultimate luxury trainers with premium materials and craftsmanship",
    image: "/Women's Luxury Trainers LOUIS VUITTON .jpg",
    brand: "Louis Vuitton",
    colors: ["White", "Black"],
    sizes: ["5", "6", "7", "8", "9", "10"],
    rating: 5.0,
    reviews: 29
  },
  {
    name: "Louis Vuitton LV Trainer",
    category: "sneakers",
    price: 55000,
    description: "Signature LV trainer with distinctive design and luxury appeal",
    image: "/Louis Vuitton Shoes  Lv Trainer Sneaker .jpg",
    brand: "Louis Vuitton",
    colors: ["White", "Black"],
    sizes: ["5", "6", "7", "8", "9", "10"],
    rating: 4.9,
    reviews: 52
  },
  {
    name: "Nike Air Force Shadow",
    category: "sneakers",
    price: 15000,
    description: "Nike Air Force 1 with shadow design for a unique twist on the classic",
    image: "/Nike airforce shadow.jpg",
    brand: "Nike",
    colors: ["White", "Gray"],
    sizes: ["5", "6", "7", "8", "9", "10"],
    rating: 4.7,
    reviews: 234
  },
  {
    name: "Nike Dunk Low Pink Paisley",
    category: "sneakers",
    price: 18000,
    description: "Nike Dunk Low with beautiful pink paisley pattern for a feminine touch",
    image: "/Nike Dunk Low Pink Paisley Sneakers .jpg",
    brand: "Nike",
    colors: ["Pink", "White"],
    sizes: ["5", "6", "7", "8", "9", "10"],
    rating: 4.8,
    reviews: 189
  },
  {
    name: "Nike Panda Dunks",
    category: "sneakers",
    price: 16000,
    description: "Classic Nike Dunk High in black and white panda colorway",
    image: "/Nike Panda Dunks Shoe .jpg",
    brand: "Nike",
    colors: ["Black", "White"],
    sizes: ["5", "6", "7", "8", "9", "10"],
    rating: 4.9,
    reviews: 312
  },
  {
    name: "Nike Classic Cortez",
    category: "sneakers",
    price: 12000,
    description: "Timeless Nike Cortez in premium leather with classic styling",
    image: "/Nike Classic Cortez Women's Leather Sneakers.jpg",
    brand: "Nike",
    colors: ["White", "Red"],
    sizes: ["5", "6", "7", "8", "9", "10"],
    rating: 4.6,
    reviews: 156
  },

  // HEELS
  {
    name: "Sloyan High Heel Sandal Gold",
    category: "heels",
    price: 8500,
    description: "Elegant gold high heel sandals perfect for special occasions",
    image: "/heels/Sloyan High Heel Sandal in Gold .jpg",
    brand: "Sloyan",
    colors: ["Gold"],
    sizes: ["5", "6", "7", "8", "9", "10"],
    rating: 4.5,
    reviews: 89
  },
  {
    name: "Steve Madden Eryka Ankle Strap",
    category: "heels",
    price: 12000,
    description: "Multi-leather ankle strap sandals with sophisticated design",
    image: "/heels/Steve Madden Eryka Ankle Strap Sandal in Multi Leather at Nordstrom Rack.jpg",
    brand: "Steve Madden",
    colors: ["Multi Leather"],
    sizes: ["5", "6", "7", "8", "9", "10"],
    rating: 4.7,
    reviews: 134
  },
  {
    name: "Luxury Fashion Heels",
    category: "heels",
    price: 18000,
    description: "Premium luxury heels from independent designers",
    image: "/heels/Luxury fashion & independent designers .jpg",
    brand: "Luxury",
    colors: ["Black", "Red"],
    sizes: ["5", "6", "7", "8", "9", "10"],
    rating: 4.8,
    reviews: 67
  },
  {
    name: "JYPSEY Tan Leather Stiletto",
    category: "heels",
    price: 9500,
    description: "Strappy stiletto heels in beautiful tan leather",
    image: "/heels/JYPSEY Tan Leather Strappy Stiletto Women's Heel .jpg",
    brand: "JYPSEY",
    colors: ["Tan"],
    sizes: ["5", "6", "7", "8", "9", "10"],
    rating: 4.6,
    reviews: 78
  },
  {
    name: "Milooey Elegant Strappy Heels",
    category: "heels",
    price: 11000,
    description: "Elegant open-toe strappy heels with lace-up ankle strap",
    image: "/heels/Milooey shoes Women Elegant Open Toe Strappy Heeled Sandal Lace Up Block High Heels Ankle Strap.jpg",
    brand: "Milooey",
    colors: ["Black", "White"],
    sizes: ["5", "6", "7", "8", "9", "10"],
    rating: 4.5,
    reviews: 92
  },
  {
    name: "Chalk Oleana Clear Trapeze",
    category: "heels",
    price: 14000,
    description: "Unique clear trapeze heels with modern design",
    image: "/heels/Chalk Oleana Clear Trapeze Heel .jpg",
    brand: "Chalk",
    colors: ["Clear"],
    sizes: ["5", "6", "7", "8", "9", "10"],
    rating: 4.7,
    reviews: 56
  },
  {
    name: "Jimmy Choo Luxury Heels",
    category: "heels",
    price: 35000,
    description: "Premium Jimmy Choo heels with luxury craftsmanship",
    image: "/heels/Jimmy Choo us.jpg",
    brand: "Jimmy Choo",
    colors: ["Black", "Gold"],
    sizes: ["5", "6", "7", "8", "9", "10"],
    rating: 4.9,
    reviews: 45
  },
  {
    name: "Steve Madden Manzie Heeled Sandal",
    category: "heels",
    price: 13000,
    description: "White heeled sandals with Steve Madden's signature style",
    image: "/heels/Steve Madden Manzie Heeled Sandal Women's Shoes White Zappos.jpg",
    brand: "Steve Madden",
    colors: ["White"],
    sizes: ["5", "6", "7", "8", "9", "10"],
    rating: 4.6,
    reviews: 103
  },
  {
    name: "ANNIE White Strappy Square Toe",
    category: "heels",
    price: 9800,
    description: "White strappy heels with square toe design for modern elegance",
    image: "/heels/ANNIE White Women's Strappy Square Toe Heel .jpg",
    brand: "ANNIE",
    colors: ["White"],
    sizes: ["5", "6", "7", "8", "9", "10"],
    rating: 4.5,
    reviews: 87
  },

  // FLATS
  {
    name: "Charles & Keith Black Roxane Slingback",
    category: "flats",
    price: 8500,
    description: "Elegant black slingback mary jane flats with sophisticated design",
    image: "/flats/Black_Roxane_Slingback_Mary_Jane_Flats___CHARLES___KEITH.png",
    brand: "Charles & Keith",
    colors: ["Black"],
    sizes: ["5", "6", "7", "8", "9", "10"],
    rating: 4.6,
    reviews: 112
  },
  {
    name: "Louis Vuitton LV Sunset Flat Comfort",
    category: "flats",
    price: 45000,
    description: "Luxury comfort sandals with Louis Vuitton's signature style",
    image: "/flats/White_Products_by_Louis_Vuitton-_LV_Sunset_Flat_Comfort_Sandal.png",
    brand: "Louis Vuitton",
    colors: ["White"],
    sizes: ["5", "6", "7", "8", "9", "10"],
    rating: 4.9,
    reviews: 67
  },
  {
    name: "ODYSSEY Natural Strappy Square-Toe",
    category: "flats",
    price: 6500,
    description: "Natural strappy square-toe flats for everyday comfort",
    image: "/flats/ODYSSEY_Natural_Strappy_Square-Toe_Flats.png",
    brand: "ODYSSEY",
    colors: ["Natural"],
    sizes: ["5", "6", "7", "8", "9", "10"],
    rating: 4.4,
    reviews: 89
  },
  {
    name: "Beach Wedding Flats",
    category: "flats",
    price: 4200,
    description: "Perfect beach wedding flats with elegant design",
    image: "/flats/_Beach_Wedding_Flats.png",
    brand: "Beach Wedding",
    colors: ["White", "Ivory"],
    sizes: ["5", "6", "7", "8", "9", "10"],
    rating: 4.3,
    reviews: 156
  },
  {
    name: "Linear Black Suede Flats",
    category: "flats",
    price: 7200,
    description: "Linear black suede flats with premium comfort",
    image: "/flats/Linear_Black_Suede_Flats.png",
    brand: "Linear",
    colors: ["Black"],
    sizes: ["5", "6", "7", "8", "9", "10"],
    rating: 4.5,
    reviews: 78
  },
  {
    name: "BABUDOG White Flats with Bow",
    category: "flats",
    price: 5800,
    description: "Comfortable white flats with pomegranate embroidery and bow detail",
    image: "/flats/BABUDOG_Womens_Flats_Shoes_with_Pomegranate_Embroidery_White_Flats_with_Bow_Comfortable_Round-Toe_Flats_Shoes.png",
    brand: "BABUDOG",
    colors: ["White"],
    sizes: ["5", "6", "7", "8", "9", "10"],
    rating: 4.7,
    reviews: 134
  }
];

async function insertAllFootwear() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');
    
    for (const item of footwear) {
      const exists = await Product.findOne({ 
        name: item.name, 
        category: item.category, 
        price: item.price 
      });
      
      if (!exists) {
        await Product.create(item);
        console.log('✅ Inserted:', item.name, `(${item.category})`);
      } else {
        console.log('⏭️  Already exists:', item.name, `(${item.category})`);
      }
    }
    
    console.log('\n🎉 All footwear products processed successfully!');
  } catch (error) {
    console.error('❌ Error inserting footwear:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

insertAllFootwear(); 