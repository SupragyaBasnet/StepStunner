const mongoose = require('mongoose');
const Product = require('./models/Product');

const MONGO_URI = 'mongodb://localhost:27017/stepstunner'; // Update if using a different URI

const products = [
  // Frames
  { name: 'Golden Frame', category: 'frames', price: 2500, description: 'A luxurious golden frame for your cherished memories.', image: '/assets/products/frame1.jpg' },
  { name: 'Black Frame', category: 'frames', price: 2500, description: 'A bold black frame for a modern look.', image: '/assets/products/frame2.jpg' },
  { name: 'Wooden Frame', category: 'frames', price: 2500, description: 'A warm wooden frame for a natural touch.', image: '/assets/products/frame3.jpg' },
  { name: 'Classic Frame', category: 'frames', price: 2500, description: 'A timeless classic frame for any photo.', image: '/assets/products/frame4.jpg' },
  // Mugs
  { name: 'Front Mug', category: 'mugs', price: 900, description: 'Personalized mug with your design on the front.', image: '/assets/products/front-mug.png' },
  { name: 'Side Mug', category: 'mugs', price: 900, description: 'Personalized mug with your design on the side.', image: '/assets/products/side-mug.png' },
  // Notebooks
  { name: 'Notebook Front', category: 'notebooks', price: 500, description: 'Notebook with customizable front cover.', image: '/assets/products/notebook.jpg' },
  { name: 'Notebook Back', category: 'notebooks', price: 500, description: 'Notebook with customizable back cover.', image: '/assets/products/notebookback.jpeg' },
  // Pens
  { name: 'Classic Pen', category: 'pens', price: 200, description: 'A sleek, classic pen for everyday writing.', image: '/assets/products/planepen.png' },
  { name: 'Modern Pen', category: 'pens', price: 200, description: 'A modern pen with a stylish design.', image: '/assets/products/planepen1.jpg' },
  // T-Shirts
  { name: 'T-Shirt Back', category: 'tshirts', price: 1500, description: 'Custom t-shirt with back design.', image: '/assets/products/whitetshirt-back.png' },
  { name: 'T-Shirt Front', category: 'tshirts', price: 1500, description: 'Custom t-shirt with front design.', image: '/assets/products/whitetshirt-front.jpg' },
  // Water Bottles
  { name: 'White Bottle 1', category: 'waterbottles', price: 900, description: 'A classic white water bottle.', image: '/assets/products/bottle-white1.png' },
  { name: 'White Bottle 2', category: 'waterbottles', price: 900, description: 'A modern white water bottle.', image: '/assets/products/bottle-white2.jpg' },
  { name: 'White Bottle 3', category: 'waterbottles', price: 900, description: 'A stylish white water bottle.', image: '/assets/products/bottle-white3.jpg' },
  // Keychains
  { name: 'Circle Keychain', category: 'keychains', price: 200, description: 'A round keychain for a unique look.', image: '/assets/products/circle-keychain.jpg' },
  { name: 'Leather Keychain', category: 'keychains', price: 250, description: 'A premium leather keychain.', image: '/assets/products/keychain-leather.jpg' },
  { name: 'Classic Keychain', category: 'keychains', price: 200, description: 'A classic keychain.', image: '/assets/products/keychain.jpg' },
  { name: 'Plane Metal Keychain', category: 'keychains', price: 220, description: 'A metal keychain with a plane design.', image: '/assets/products/planemetalkeychain.jpg' },
  { name: 'Plane Metal Keychain 2', category: 'keychains', price: 220, description: 'A second style of plane metal keychain.', image: '/assets/products/planemetalkeychain1.jpg' },
  { name: 'White Keychain', category: 'keychains', price: 200, description: 'A stylish white keychain.', image: '/assets/products/planewhitekeychain.jpg' },
  // Caps
  { name: 'White Cap', category: 'caps', price: 700, description: 'A classic white cap.', image: '/assets/products/planewhitecap.jpg' },
  // Pillowcases
  { name: 'Circle Pillowcase', category: 'pillowcases', price: 1100, description: 'A soft, round pillow for cozy comfort.', image: '/assets/products/circleshaped-front.jpg' },
  { name: 'Heart Pillowcase', category: 'pillowcases', price: 1100, description: 'A lovely heart-shaped pillow for special moments.', image: '/assets/products/heartshaped-front.jpg' },
  { name: 'Star Pillowcase', category: 'pillowcases', price: 1100, description: 'A star-shaped pillow to brighten any room.', image: '/assets/products/starshaped-back.jpg' },
  { name: 'Square Pillowcase', category: 'pillowcases', price: 1100, description: 'A classic square pillow for everyday use.', image: '/assets/products/whitepillow-front.webp' },
  // Phonecases
  { name: 'iPhone 8 Plus Phone Case', category: 'phonecases', price: 1600, description: 'Premium case for iPhone 8 Plus.', image: '/assets/products/phonecaseiphone 8 plus.jpg' },
  { name: 'iPhone 10 Phone Case', category: 'phonecases', price: 1600, description: 'Premium case for iPhone 10.', image: '/assets/products/phonecaseiphone10.jpg' },
  { name: 'iPhone 11 Phone Case', category: 'phonecases', price: 1600, description: 'Premium case for iPhone 11.', image: '/assets/products/phonecaseiphone11.jpg' },
  { name: 'iPhone 12 Phone Case', category: 'phonecases', price: 1600, description: 'Premium case for iPhone 12.', image: '/assets/products/phonecaseiphone12.jpg' },
  { name: 'iPhone 13 Pro Max / 12 Pro Max Phone Case', category: 'phonecases', price: 1600, description: 'Premium case for iPhone 13 Pro Max or 12 Pro Max.', image: '/assets/products/phonecaseiphone13promax and 12 pro max.jpg' },
  { name: 'iPhone 14 Phone Case', category: 'phonecases', price: 1600, description: 'Premium case for iPhone 14.', image: '/assets/products/phonecaseiphone14.jpg' },
  { name: 'Samsung S21 Ultra Phone Case', category: 'phonecases', price: 1600, description: 'Premium case for Samsung S21 Ultra.', image: '/assets/products/phonecases21ultra.jpg' },
  { name: 'Samsung S23 Ultra Phone Case', category: 'phonecases', price: 1600, description: 'Premium case for Samsung S23 Ultra.', image: '/assets/products/phonecases23 ultra.jpg' },
];

async function insertAllProducts() {
  await mongoose.connect(MONGO_URI);
  for (const prod of products) {
    const exists = await Product.findOne({ name: prod.name, category: prod.category, price: prod.price });
    if (!exists) {
      await Product.create(prod);
      console.log('Inserted:', prod.name, prod.category, prod.price);
    } else {
      console.log('Already exists:', prod.name, prod.category, prod.price);
    }
  }
  await mongoose.disconnect();
  console.log('All products processed.');
}

insertAllProducts().catch(err => {
  console.error('Error inserting products:', err);
  mongoose.disconnect();
}); 