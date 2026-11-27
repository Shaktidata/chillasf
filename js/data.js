/* data.js: products, colours, occasions, curated looks and style profiles.
   Loaded as a classic script so the site works when index.html is opened by double-click. */
(function () {
  'use strict';
  const OF = (window.OF = window.OF || {});

  OF.BRAND = { name: 'ChillASF', currency: 'AUD', symbol: '$' };

  // type: neutral | accent. family: used for "tonal" bonuses.
  OF.COLOURS = {
    'black':      { label: 'Black',      hex: '#232321', type: 'neutral', family: 'grey' },
    'off-white':  { label: 'Off-White',  hex: '#F1ECE2', type: 'neutral', family: 'sand' },
    'stone':      { label: 'Stone',      hex: '#CFC5B2', type: 'neutral', family: 'sand' },
    'navy':       { label: 'Navy',       hex: '#283A52', type: 'neutral', family: 'blue' },
    'olive':      { label: 'Olive',      hex: '#5E6B4A', type: 'accent',  family: 'green' },
    'charcoal':   { label: 'Charcoal',   hex: '#48494C', type: 'neutral', family: 'grey' },
    'camel':      { label: 'Camel',      hex: '#B68A5A', type: 'neutral', family: 'sand' },
    'light-blue': { label: 'Light Blue', hex: '#A9C2D9', type: 'accent',  family: 'blue' },
    'rust':       { label: 'Rust',       hex: '#A4553A', type: 'accent',  family: 'earth' },
    // Added for the expanded catalogue (shop only, not shown in the builder's colour filter).
    'white':      { label: 'White',      hex: '#FAFAF7', type: 'neutral', family: 'grey' },
    'grey-marl':  { label: 'Grey Marl',  hex: '#A9A9A6', type: 'neutral', family: 'grey' },
    'sage':       { label: 'Sage',       hex: '#9AA58A', type: 'accent',  family: 'green' },
    'chocolate':  { label: 'Chocolate',  hex: '#4E3427', type: 'neutral', family: 'earth' },
    'tortoiseshell': { label: 'Tortoiseshell', hex: '#6B4226', type: 'accent', family: 'earth' }
  };

  const APPAREL = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
  const SHOES = ['6', '7', '8', '9', '10', '11', '12', '13'];
  const ONE = ['One size'];

  const p = (o) => Object.assign({ tags: [], sizes: APPAREL, care: 'Machine wash cold. Line dry.', fitNote: 'True to size.', images: {} }, o);

  OF.PRODUCTS = [
    // ---- Tops (5)
    p({ id: 'tee-01', name: 'Everyday Organic Tee', category: 'tops', slot: 'top', price: 39,
      sku: 'CHL-U-TEE-001', gender: 'unisex', subcategory: 'T-Shirts', collections: ['warm-days'],
      description: 'Our everyday crew in soft organic cotton. A relaxed body and a neckline that keeps its shape wash after wash.',
      colours: ['off-white', 'black', 'stone', 'navy', 'olive'], defaultColour: 'off-white',
      formality: 1, warmth: 1, occasions: ['casual', 'weekend'], fabric: '100% organic cotton, 180gsm',
      fit: 'Relaxed', tags: ['bestseller', 'featured'], svg: 'tee', fitNote: 'Relaxed through the body. Take your usual size.' }),
    p({ id: 'tee-02', name: 'Heavyweight Boxy Tee', category: 'tops', slot: 'top', price: 49,
      sku: 'CHL-U-TEE-002', gender: 'unisex', subcategory: 'T-Shirts', collections: [],
      description: 'Dense 260gsm jersey cut short and wide. It holds a clean, structured shape on its own or under a layer.',
      colours: ['black', 'off-white', 'olive', 'rust', 'charcoal'], defaultColour: 'black',
      formality: 1, warmth: 1, occasions: ['casual', 'weekend'], fabric: '100% cotton jersey, 260gsm',
      fit: 'Boxy', tags: ['new'], svg: 'boxy', fitNote: 'Cropped and wide. Size down for a closer fit.' }),
    p({ id: 'knit-01', name: 'Merino Crew Knit', category: 'tops', slot: 'top', price: 129,
      sku: 'CHL-U-KNT-001', gender: 'unisex', subcategory: 'Knitwear', collections: ['work-week', 'cool-weather'],
      description: 'Fine 14-gauge merino in a neat crew neck. Warm without bulk, smart enough for the office, soft enough for the weekend.',
      colours: ['charcoal', 'navy', 'camel', 'off-white', 'olive'], defaultColour: 'charcoal',
      formality: 3, warmth: 3, occasions: ['smart-casual', 'work', 'weekend'], fabric: '100% extra-fine merino wool, 14gg',
      fit: 'Regular', tags: ['bestseller', 'featured'], svg: 'knit', care: 'Hand wash cold. Dry flat.' }),
    p({ id: 'shirt-01', name: 'Oxford Button-Down Shirt', category: 'tops', slot: 'top', price: 89,
      sku: 'CHL-M-SHT-001', gender: 'men', subcategory: 'Shirts', collections: ['work-week'],
      description: 'A classic button-down in textured cotton oxford. Wear it buttoned with chinos or open over a tee.',
      colours: ['light-blue', 'off-white', 'navy', 'stone'], defaultColour: 'light-blue',
      formality: 4, warmth: 2, occasions: ['smart-casual', 'work'], fabric: '100% cotton oxford, 140gsm',
      fit: 'Regular', tags: ['bestseller'], svg: 'shirt', care: 'Machine wash 30°. Iron on medium.' }),
    p({ id: 'shirt-02', name: 'Linen Camp Shirt', category: 'tops', slot: 'top', price: 79,
      sku: 'CHL-M-SHT-002', gender: 'men', subcategory: 'Shirts', collections: ['linen-edit', 'warm-days'],
      description: 'An open camp collar and a straight hem in breathable European linen. Made for warm days and worn untucked.',
      colours: ['off-white', 'stone', 'olive', 'rust', 'navy'], defaultColour: 'stone',
      formality: 2, warmth: 1, occasions: ['casual', 'weekend', 'smart-casual'], fabric: '100% European linen',
      fit: 'Relaxed', tags: ['new'], svg: 'camp', care: 'Machine wash cold. Wear the creases.' }),

    // ---- Layers (4)
    p({ id: 'over-01', name: 'Cotton Overshirt', category: 'layers', slot: 'layer', price: 109,
      sku: 'CHL-U-JKT-001', gender: 'unisex', subcategory: 'Overshirts', collections: ['cool-weather'],
      description: 'Heavy cotton twill with two chest pockets. Works as a shirt on mild days and a light jacket when it cools.',
      colours: ['olive', 'stone', 'navy', 'camel', 'black'], defaultColour: 'olive',
      formality: 2, warmth: 2, occasions: ['casual', 'weekend', 'smart-casual'], fabric: '100% cotton twill, 300gsm',
      fit: 'Relaxed', tags: ['bestseller', 'featured'], svg: 'overshirt', canStandAlone: true }),
    p({ id: 'blazer-01', name: 'Unstructured Blazer', category: 'layers', slot: 'layer', price: 249,
      sku: 'CHL-M-BLZ-001', gender: 'men', subcategory: 'Blazers', collections: ['work-week'],
      description: 'A soft-shouldered blazer with a half lining. It sharpens a knit or an oxford without feeling stiff.',
      colours: ['navy', 'charcoal', 'stone', 'black'], defaultColour: 'navy',
      formality: 5, warmth: 2, occasions: ['work', 'smart-casual'], fabric: 'Wool-cotton blend, half lined',
      fit: 'Tailored', tags: [], svg: 'blazer', care: 'Dry clean only.', fitNote: 'Cut close. Size up if between sizes.' }),
    p({ id: 'bomber-01', name: 'Lightweight Bomber', category: 'layers', slot: 'layer', price: 179,
      sku: 'CHL-U-JKT-002', gender: 'unisex', subcategory: 'Jackets', collections: ['cool-weather'],
      description: 'A light bomber in recycled nylon with ribbed trims and a cotton lining. Easy to throw on over anything.',
      colours: ['black', 'navy', 'olive', 'stone'], defaultColour: 'black',
      formality: 2, warmth: 2, occasions: ['casual', 'weekend'], fabric: 'Recycled nylon shell, cotton lining',
      fit: 'Regular', tags: ['new'], svg: 'bomber' }),
    p({ id: 'chore-01', name: 'Chore Jacket', category: 'layers', slot: 'layer', price: 159,
      sku: 'CHL-U-JKT-003', gender: 'unisex', subcategory: 'Jackets', collections: ['cool-weather'],
      description: 'A boxy workwear jacket in 12oz cotton canvas with three patch pockets. Softens and fades with wear.',
      colours: ['navy', 'camel', 'olive', 'rust', 'black'], defaultColour: 'navy',
      formality: 2, warmth: 3, occasions: ['casual', 'weekend', 'smart-casual'], fabric: 'Heavy cotton canvas, 12oz',
      fit: 'Boxy', tags: [], svg: 'chore', canStandAlone: true }),

    // ---- Bottoms (5)
    p({ id: 'chino-01', name: 'Tapered Chinos', category: 'bottoms', slot: 'bottom', price: 89,
      sku: 'CHL-M-TRS-001', gender: 'men', subcategory: 'Chinos', collections: ['work-week'],
      description: 'Cotton twill chinos with a little stretch, tapered to a clean ankle. Smart for work and easy at the weekend.',
      colours: ['stone', 'navy', 'olive', 'black', 'camel'], defaultColour: 'stone',
      formality: 3, warmth: 2, occasions: ['smart-casual', 'work', 'casual'], fabric: 'Cotton twill with 2% stretch',
      fit: 'Tapered', tags: ['bestseller', 'featured'], svg: 'chino' }),
    p({ id: 'denim-01', name: 'Straight Denim', category: 'bottoms', slot: 'bottom', price: 99,
      sku: 'CHL-M-DNM-001', gender: 'men', subcategory: 'Jeans', collections: [],
      description: 'A straight leg in 13oz organic cotton denim. Sits at the waist and falls cleanly to the shoe.',
      colours: ['navy', 'black', 'light-blue'], defaultColour: 'navy',
      formality: 2, warmth: 2, occasions: ['casual', 'weekend', 'smart-casual'], fabric: '13oz organic cotton denim',
      fit: 'Straight', tags: [], svg: 'denim', care: 'Wash rarely, inside out, cold.' }),
    p({ id: 'trouser-01', name: 'Pleated Wide Trousers', category: 'bottoms', slot: 'bottom', price: 119,
      sku: 'CHL-W-TRS-001', gender: 'women', subcategory: 'Trousers', collections: ['work-week'],
      description: 'High-waisted trousers in wool-blend flannel with front pleats and a full wide leg. Polished with flats or sneakers.',
      colours: ['charcoal', 'stone', 'black', 'navy'], defaultColour: 'charcoal',
      formality: 4, warmth: 2, occasions: ['work', 'smart-casual'], fabric: 'Wool-blend flannel',
      fit: 'Wide', tags: ['new', 'featured'], svg: 'wide', care: 'Dry clean or gentle hand wash.' }),
    p({ id: 'trouser-02', name: 'Drawstring Relaxed Trousers', category: 'bottoms', slot: 'bottom', price: 85,
      sku: 'CHL-U-TRS-001', gender: 'unisex', subcategory: 'Trousers', collections: ['linen-edit', 'warm-days'],
      description: 'Easy trousers in a linen-cotton blend with an elastic drawstring waist. Light, breathable and relaxed through the leg.',
      colours: ['stone', 'olive', 'black', 'off-white'], defaultColour: 'stone',
      formality: 1, warmth: 1, occasions: ['casual', 'weekend'], fabric: 'Linen-cotton blend',
      fit: 'Relaxed', tags: [], svg: 'drawstring' }),
    p({ id: 'shorts-01', name: 'Tailored Shorts', category: 'bottoms', slot: 'bottom', price: 69,
      sku: 'CHL-M-SHO-001', gender: 'men', subcategory: 'Shorts', collections: ['warm-days'],
      description: 'Tailored shorts in crisp cotton poplin with a flat front. A neater alternative to the usual weekend short.',
      colours: ['stone', 'navy', 'olive', 'off-white'], defaultColour: 'navy',
      formality: 2, warmth: 1, occasions: ['casual', 'weekend'], fabric: 'Cotton poplin',
      fit: 'Regular', tags: [], svg: 'shorts' }),

    // ---- Shoes (5)
    p({ id: 'sneaker-01', name: 'Leather Court Sneakers', category: 'shoes', slot: 'shoes', price: 169,
      sku: 'CHL-U-FTW-001', gender: 'unisex', subcategory: 'Sneakers', collections: [],
      description: 'A low court sneaker in full-grain leather on a stitched rubber cupsole. Pairs with everything in the store.',
      colours: ['off-white', 'black', 'navy'], defaultColour: 'off-white',
      formality: 3, warmth: 2, occasions: ['casual', 'smart-casual', 'weekend', 'work'], fabric: 'Full-grain leather, rubber cupsole',
      fit: 'True to size', tags: ['bestseller', 'featured'], svg: 'court', sizes: SHOES, care: 'Wipe clean. Use a leather balm.' }),
    p({ id: 'sneaker-02', name: 'Canvas Low-Tops', category: 'shoes', slot: 'shoes', price: 89,
      sku: 'CHL-U-FTW-002', gender: 'unisex', subcategory: 'Sneakers', collections: ['warm-days'],
      description: 'Simple low-tops in organic cotton canvas on a vulcanised sole. Light, flexible and easy to slip on.',
      colours: ['off-white', 'black', 'olive', 'navy'], defaultColour: 'off-white',
      formality: 1, warmth: 1, occasions: ['casual', 'weekend'], fabric: 'Organic cotton canvas, vulcanised sole',
      fit: 'True to size', tags: [], svg: 'canvas', sizes: SHOES }),
    p({ id: 'loafer-01', name: 'Suede Loafers', category: 'shoes', slot: 'shoes', price: 199,
      sku: 'CHL-M-FTW-001', gender: 'men', subcategory: 'Loafers', collections: ['work-week'],
      description: 'Penny loafers in soft suede on a leather sole. Dresses up chinos and suits bare ankles in summer.',
      colours: ['camel', 'black', 'navy'], defaultColour: 'camel',
      formality: 4, warmth: 1, occasions: ['smart-casual', 'work'], fabric: 'Suede upper, leather sole',
      fit: 'Half size small', tags: [], svg: 'loafer', sizes: SHOES, care: 'Brush suede. Protect from rain.', fitNote: 'Runs a half size small. Size up.' }),
    p({ id: 'boot-01', name: 'Chelsea Boots', category: 'shoes', slot: 'shoes', price: 229,
      sku: 'CHL-M-FTW-002', gender: 'men', subcategory: 'Boots', collections: ['cool-weather'],
      description: 'Leather Chelsea boots with elastic sides and a grippy commando sole. Made for wet streets and long days.',
      colours: ['black', 'camel', 'charcoal'], defaultColour: 'black',
      formality: 4, warmth: 3, occasions: ['smart-casual', 'work', 'weekend'], fabric: 'Leather upper, commando sole',
      fit: 'True to size', tags: ['new'], svg: 'chelsea', sizes: SHOES, care: 'Polish regularly.' }),
    p({ id: 'runner-01', name: 'Minimal Runners', category: 'shoes', slot: 'shoes', price: 149,
      sku: 'CHL-U-FTW-003', gender: 'unisex', subcategory: 'Sneakers', collections: [],
      description: 'A light runner with a recycled knit upper and cushioned foam sole. Comfortable from morning to night.',
      colours: ['charcoal', 'off-white', 'navy', 'olive'], defaultColour: 'charcoal',
      formality: 1, warmth: 1, occasions: ['casual', 'weekend'], fabric: 'Recycled knit upper, foam sole',
      fit: 'True to size', tags: [], svg: 'runner', sizes: SHOES, care: 'Hand wash. Air dry.' }),

    // ---- Accessories (5)
    p({ id: 'belt-01', name: 'Leather Belt', category: 'accessories', slot: 'accessory', price: 59,
      sku: 'CHL-A-BLT-001', gender: 'unisex', subcategory: 'Belts', collections: ['work-week'],
      description: 'Vegetable-tanned leather with a solid brass buckle. Develops a rich patina over time.',
      colours: ['black', 'camel', 'navy'], defaultColour: 'camel',
      formality: 3, warmth: 1, occasions: ['smart-casual', 'work', 'casual'], fabric: 'Vegetable-tanned leather, brass buckle',
      fit: 'Regular', tags: [], svg: 'belt', sizes: ['S', 'M', 'L'], care: 'Wipe clean.' }),
    p({ id: 'tote-01', name: 'Canvas Tote', category: 'accessories', slot: 'accessory', price: 35,
      sku: 'CHL-A-BAG-001', gender: 'unisex', subcategory: 'Bags', collections: ['warm-days'],
      description: 'A roomy tote in heavy cotton canvas with long handles that sit comfortably on the shoulder.',
      colours: ['off-white', 'black', 'olive', 'stone'], defaultColour: 'off-white',
      formality: 1, warmth: 1, occasions: ['casual', 'weekend'], fabric: 'Heavy cotton canvas',
      fit: 'One size', tags: [], svg: 'tote', sizes: ONE }),
    p({ id: 'beanie-01', name: 'Wool Beanie', category: 'accessories', slot: 'accessory', price: 39,
      sku: 'CHL-A-HAT-001', gender: 'unisex', subcategory: 'Hats', collections: ['cool-weather'],
      description: 'A rib-knit beanie in soft lambswool with a deep turn-up. Warm without itching.',
      colours: ['charcoal', 'rust', 'olive', 'navy', 'off-white'], defaultColour: 'charcoal',
      formality: 1, warmth: 3, occasions: ['casual', 'weekend'], fabric: '100% lambswool',
      fit: 'One size', tags: [], svg: 'beanie', sizes: ONE, care: 'Hand wash cold.' }),
    p({ id: 'watch-01', name: 'Minimal Watch', category: 'accessories', slot: 'accessory', price: 189,
      sku: 'CHL-A-WAT-001', gender: 'unisex', subcategory: 'Watches', collections: ['work-week'],
      description: 'A clean steel case, a plain dial and a leather strap. Just the time, nothing else.',
      colours: ['black', 'camel', 'navy'], defaultColour: 'black',
      formality: 4, warmth: 1, occasions: ['work', 'smart-casual', 'casual'], fabric: 'Steel case, leather strap',
      fit: 'One size', tags: ['new'], svg: 'watch', sizes: ONE, care: 'Splash resistant. Not for swimming.' }),
    p({ id: 'cap-01', name: 'Cotton Cap', category: 'accessories', slot: 'accessory', price: 35,
      sku: 'CHL-A-HAT-002', gender: 'unisex', subcategory: 'Hats', collections: ['warm-days'],
      description: 'A six-panel cap in washed cotton twill with an adjustable strap. Soft from the first wear.',
      colours: ['navy', 'stone', 'black', 'olive'], defaultColour: 'navy',
      formality: 1, warmth: 1, occasions: ['casual', 'weekend'], fabric: 'Washed cotton twill',
      fit: 'One size', tags: [], svg: 'cap', sizes: ONE }),

    // ---- New catalogue pieces (shop only). No `svg`, so they stay out of the outfit builder,
    // games and suggestions (see OF.BUILDER_PRODUCTS) and only appear in the shop once they have photos.
    // Women
    p({ id: 'tank-01', name: 'Ribbed Fitted Tank', category: 'tops', slot: 'top', price: 29,
      sku: 'CHL-W-TNK-001', gender: 'women', subcategory: 'Tanks', collections: ['warm-days'],
      description: 'A close-fitting tank in soft cotton-modal rib. Smooth under a shirt or cardigan and neat on its own.',
      colours: ['white', 'black', 'stone', 'sage'], defaultColour: 'white',
      formality: 1, warmth: 1, occasions: ['casual', 'weekend'], fabric: 'Cotton-modal rib with 2% elastane',
      fit: 'Slim', tags: [], fitNote: 'Fitted with stretch. Take your usual size.' }),
    p({ id: 'poplin-01', name: 'Relaxed Poplin Shirt', category: 'tops', slot: 'top', price: 69,
      sku: 'CHL-W-SHT-001', gender: 'women', subcategory: 'Shirts & Blouses', collections: ['work-week'],
      description: 'Crisp cotton poplin cut long and roomy with a dropped shoulder. Tuck it in, knot it or wear it open as a layer.',
      colours: ['white', 'light-blue', 'stone', 'black'], defaultColour: 'white',
      formality: 3, warmth: 1, occasions: ['smart-casual', 'work', 'weekend'], fabric: 'Cotton poplin, 120gsm',
      fit: 'Oversized', tags: ['new'], care: 'Machine wash 30°. Iron on medium.', fitNote: 'Cut generously. Take your usual size.' }),
    p({ id: 'cardi-01', name: 'Fine-Knit V-Neck Cardigan', category: 'layers', slot: 'layer', price: 99,
      sku: 'CHL-W-KNT-001', gender: 'women', subcategory: 'Knitwear', collections: ['work-week', 'cool-weather'],
      description: 'A fine-gauge V-neck cardigan with five tonal buttons and neat rib trims. Wear it buttoned as a top or open as a layer.',
      colours: ['navy', 'charcoal', 'stone', 'off-white'], defaultColour: 'navy',
      formality: 3, warmth: 2, occasions: ['smart-casual', 'work', 'casual'], fabric: 'Merino-cotton blend, 16-gauge fine knit',
      fit: 'Regular', tags: ['new'], care: 'Hand wash cold. Dry flat.', fitNote: 'Sits at the hip. Take your usual size.' }),
    p({ id: 'trench-01', name: 'Belted Cotton Trench', category: 'layers', slot: 'layer', price: 229,
      sku: 'CHL-W-JKT-001', gender: 'women', subcategory: 'Coats & Trench', collections: ['work-week', 'cool-weather'],
      description: 'A relaxed knee-length trench in cotton gabardine with a water-repellent finish, storm flap and tie belt.',
      colours: ['stone', 'black', 'navy'], defaultColour: 'stone',
      formality: 4, warmth: 2, occasions: ['work', 'smart-casual'], fabric: 'Cotton gabardine with a water-repellent finish',
      fit: 'Relaxed', tags: [], care: 'Dry clean only.', fitNote: 'Room to layer over knitwear. Take your usual size.' }),
    p({ id: 'jeans-01', name: 'High-Rise Wide Jeans', category: 'bottoms', slot: 'bottom', price: 99,
      sku: 'CHL-W-DNM-001', gender: 'women', subcategory: 'Jeans', collections: [],
      description: 'Rigid organic cotton denim with a high rise and a full-length wide leg. Softens and moulds with wear.',
      colours: ['light-blue', 'navy', 'black'], defaultColour: 'light-blue',
      formality: 2, warmth: 2, occasions: ['casual', 'weekend', 'smart-casual'], fabric: '12oz rigid organic cotton denim',
      fit: 'Wide', tags: [], care: 'Wash rarely, inside out, cold.', fitNote: 'High rise. Rigid denim gives a little with wear.' }),
    p({ id: 'skirt-01', name: 'Satin Midi Skirt', category: 'bottoms', slot: 'bottom', price: 79,
      sku: 'CHL-W-SKT-001', gender: 'women', subcategory: 'Skirts', collections: ['work-week'],
      description: 'A bias-cut midi skirt in fluid recycled satin with a covered elastic waist. Moves easily and drapes cleanly.',
      colours: ['chocolate', 'black', 'stone', 'sage'], defaultColour: 'chocolate',
      formality: 3, warmth: 1, occasions: ['smart-casual', 'work'], fabric: 'Recycled polyester satin, bias cut',
      fit: 'Regular', tags: ['new'], care: 'Gentle machine wash cold. Cool iron.', fitNote: 'Elastic waist. Take your usual size.' }),
    p({ id: 'dress-01', name: 'Linen Shirt Dress', category: 'dresses', slot: null, price: 119,
      sku: 'CHL-W-DRS-001', gender: 'women', subcategory: 'Midi Dresses', collections: ['linen-edit', 'warm-days'],
      description: 'A midi shirt dress in breathable European linen with a point collar, full button front and a tie belt.',
      colours: ['sage', 'off-white', 'navy', 'black'], defaultColour: 'sage',
      formality: 2, warmth: 1, occasions: ['casual', 'weekend', 'smart-casual'], fabric: '100% European linen',
      fit: 'Relaxed', tags: ['new', 'featured'], care: 'Machine wash cold. Wear the creases.', fitNote: 'Relaxed through the body. The belt defines the waist.' }),
    // Men
    p({ id: 'polo-01', name: 'Piqué Polo', category: 'tops', slot: 'top', price: 49,
      sku: 'CHL-M-POL-001', gender: 'men', subcategory: 'Polos', collections: ['warm-days'],
      description: 'A two-button polo in breathable cotton piqué with a ribbed collar and a split hem.',
      colours: ['navy', 'white', 'black', 'olive'], defaultColour: 'navy',
      formality: 2, warmth: 1, occasions: ['casual', 'smart-casual', 'weekend'], fabric: 'Cotton piqué, 210gsm',
      fit: 'Regular', tags: [], fitNote: 'Regular fit. Take your usual size.' }),
    p({ id: 'dshirt-01', name: 'Easy-Care Dress Shirt', category: 'tops', slot: 'top', price: 69,
      sku: 'CHL-M-SHT-003', gender: 'men', subcategory: 'Dress Shirts', collections: ['work-week'],
      description: 'A slim office shirt with a spread collar in smooth twill. The non-iron finish keeps it sharp from wash to desk.',
      colours: ['white', 'light-blue', 'navy'], defaultColour: 'white',
      formality: 5, warmth: 2, occasions: ['work'], fabric: 'Cotton-blend twill with a non-iron finish',
      fit: 'Slim', tags: [], care: 'Machine wash 30°. Hang to dry.', fitNote: 'Slim through the body. Size up for a looser fit.' }),
    p({ id: 'cargo-01', name: 'Wide Cargo Trousers', category: 'bottoms', slot: 'bottom', price: 89,
      sku: 'CHL-M-TRS-002', gender: 'men', subcategory: 'Cargo Trousers', collections: ['cool-weather'],
      description: 'Durable cotton ripstop with bellows side pockets, a zip fly and belt loops. A wide, relaxed leg for everyday wear.',
      colours: ['olive', 'black', 'stone'], defaultColour: 'olive',
      formality: 1, warmth: 2, occasions: ['casual', 'weekend'], fabric: 'Cotton ripstop, 260gsm',
      fit: 'Relaxed', tags: ['new'], fitNote: 'Relaxed and wide. Take your usual size.' }),
    // Unisex
    p({ id: 'hoodie-01', name: 'Heavyweight Hoodie', category: 'tops', slot: 'top', price: 89,
      sku: 'CHL-U-SWT-001', gender: 'unisex', subcategory: 'Sweats & Hoodies', collections: ['cool-weather'],
      description: 'Heavy brushed-back cotton fleece with a double-layer hood, kangaroo pocket and wide rib trims. No logos.',
      colours: ['grey-marl', 'black', 'off-white', 'navy', 'olive'], defaultColour: 'grey-marl',
      formality: 1, warmth: 3, occasions: ['casual', 'weekend'], fabric: 'Brushed-back cotton fleece, 400gsm',
      fit: 'Oversized', tags: ['new', 'featured'], fitNote: 'Oversized with dropped shoulders. Size down for a closer fit.' }),
    p({ id: 'vest-01', name: 'Packable Padded Vest', category: 'layers', slot: 'layer', price: 99,
      sku: 'CHL-U-JKT-004', gender: 'unisex', subcategory: 'Vests', collections: ['cool-weather'],
      description: 'A light quilted vest with recycled synthetic fill. Adds core warmth under a jacket and packs into its own pocket.',
      colours: ['black', 'navy', 'olive'], defaultColour: 'black',
      formality: 1, warmth: 3, occasions: ['casual', 'weekend'], fabric: 'Recycled nylon shell, recycled synthetic fill',
      fit: 'Regular', tags: [], fitNote: 'Room to layer over a knit. Take your usual size.' }),
    // Accessories
    p({ id: 'socks-01', name: 'Ribbed Crew Socks, 3-Pack', category: 'accessories', slot: 'accessory', price: 19,
      sku: 'CHL-A-SCK-001', gender: 'unisex', subcategory: 'Socks', collections: [],
      description: 'Three pairs of rib-knit crew socks in a soft combed cotton blend with a cushioned sole.',
      colours: ['white', 'black', 'grey-marl'], defaultColour: 'white',
      formality: 1, warmth: 1, occasions: ['casual', 'weekend', 'work'], fabric: 'Combed cotton blend with nylon and elastane',
      fit: 'One size', tags: [], sizes: ONE, fitNote: 'One size fits AU/UK 6–11.' }),
    p({ id: 'sling-01', name: 'Nylon Crossbody Sling', category: 'accessories', slot: 'accessory', price: 49,
      sku: 'CHL-A-BAG-002', gender: 'unisex', subcategory: 'Bags', collections: [],
      description: 'A compact sling in recycled nylon with a zip top, front pocket and adjustable webbing strap. Wear it across the chest or on the hip.',
      colours: ['black', 'olive', 'stone'], defaultColour: 'black',
      formality: 1, warmth: 1, occasions: ['casual', 'weekend'], fabric: 'Recycled nylon, webbing strap',
      fit: 'One size', tags: ['new', 'featured'], sizes: ONE, care: 'Wipe clean.', fitNote: 'About 25 × 15 × 7 cm. Adjustable strap.' }),
    p({ id: 'scarf-01', name: 'Brushed Wool Scarf', category: 'accessories', slot: 'accessory', price: 59,
      sku: 'CHL-A-SCF-001', gender: 'unisex', subcategory: 'Scarves', collections: ['cool-weather'],
      description: 'A generous scarf in brushed lambswool with a soft hand and fringed ends. About 180 × 30 cm.',
      colours: ['camel', 'charcoal', 'navy', 'chocolate'], defaultColour: 'camel',
      formality: 2, warmth: 3, occasions: ['casual', 'weekend', 'smart-casual'], fabric: 'Brushed lambswool',
      fit: 'One size', tags: [], sizes: ONE, care: 'Hand wash cold. Dry flat.' }),
    p({ id: 'sunnies-01', name: 'Acetate Sunglasses', category: 'accessories', slot: 'accessory', price: 79,
      sku: 'CHL-A-EYE-001', gender: 'unisex', subcategory: 'Eyewear', collections: ['warm-days'],
      description: 'A rounded square frame in polished acetate with UV400 lenses. Comes with a soft case and cleaning cloth.',
      colours: ['tortoiseshell', 'black'], defaultColour: 'tortoiseshell',
      formality: 2, warmth: 1, occasions: ['casual', 'weekend'], fabric: 'Acetate frame, UV400 lenses',
      fit: 'One size', tags: [], sizes: ONE, care: 'Clean with the included cloth.' })
  ];

  OF.byId = {};
  OF.PRODUCTS.forEach((pr, i) => { pr.featured = i; OF.byId[pr.id] = pr; });

  OF.SLOTS = ['top', 'layer', 'bottom', 'shoes', 'accessory'];
  OF.SLOT_LABEL = { top: 'Top', layer: 'Layer', bottom: 'Bottoms', shoes: 'Shoes', accessory: 'Accessory' };
  OF.CATEGORIES = [
    { id: 'tops', label: 'Tops', slot: 'top' },
    { id: 'layers', label: 'Layers', slot: 'layer' },
    { id: 'bottoms', label: 'Bottoms', slot: 'bottom' },
    { id: 'shoes', label: 'Shoes', slot: 'shoes' },
    { id: 'accessories', label: 'Accessories', slot: 'accessory' }
  ];

  // Builder pieces need SVG garment art. Shop pieces need SVG art or at least one product photo.
  // Defined here (data.js loads first) because main.js uses them while restoring saved state.
  OF.inBuilder = (pr) => !!(pr && pr.svg);
  OF.hasArt = (pr) => !!(pr && (pr.svg || Object.keys(pr.images || {}).length));

  // The outfit builder, games and suggestions use only products with SVG garment art.
  OF.BUILDER_PRODUCTS = OF.PRODUCTS.filter((pr) => pr.svg);
  OF.BUILDER_COLOURS = Object.keys(OF.COLOURS).filter((c) => OF.BUILDER_PRODUCTS.some((pr) => pr.colours.includes(c)));

  // The shop uses its own category list so the builder's tabs stay unchanged.
  OF.SHOP_CATEGORIES = OF.CATEGORIES.slice(0, 3)
    .concat([{ id: 'dresses', label: 'Dresses', slot: null }])
    .concat(OF.CATEGORIES.slice(3));

  OF.GENDERS = [
    { id: 'men', label: 'Men' },
    { id: 'women', label: 'Women' },
    { id: 'unisex', label: 'Unisex' }
  ];

  // Status collections come from tags; edits come from each product's `collections` list.
  OF.COLLECTIONS = [
    { id: 'featured', label: 'Featured', tag: 'featured' },
    { id: 'new-arrivals', label: 'New Arrivals', tag: 'new' },
    { id: 'bestsellers', label: 'Bestsellers', tag: 'bestseller' },
    { id: 'work-week', label: 'Work Week' },
    { id: 'linen-edit', label: 'Linen Edit' },
    { id: 'warm-days', label: 'Warm Days' },
    { id: 'cool-weather', label: 'Cool-Weather Layers' }
  ];
  OF.inCollection = (pr, id) => {
    const c = OF.COLLECTIONS.find((x) => x.id === id);
    return !!c && (c.tag ? pr.tags.includes(c.tag) : (pr.collections || []).includes(id));
  };

  // Target formality (1–5) and warmth (warm | mild | cool) per occasion.
  OF.OCCASIONS = {
    'casual':       { label: 'Casual',       formality: 1.5, weather: 'mild' },
    'smart-casual': { label: 'Smart-casual', formality: 3,   weather: 'mild' },
    'work':         { label: 'Work',         formality: 4,   weather: 'mild' },
    'weekend':      { label: 'Weekend',      formality: 1.5, weather: 'mild' }
  };

  // Prompts for the Occasion Match game.
  OF.OCCASION_PROMPTS = [
    { id: 'office-dinner', text: 'Friday office, then dinner', formality: 3.5, weather: 'mild', needLayer: false },
    { id: 'market', text: "Sunday farmers' market, 14°C", formality: 1.5, weather: 'cool', needLayer: true },
    { id: 'interview', text: 'Job interview, smart-casual', formality: 4, weather: 'mild', needLayer: true },
    { id: 'beach-lunch', text: 'Long lunch by the beach, 29°C', formality: 2, weather: 'warm', needLayer: false },
    { id: 'gallery', text: 'Gallery opening on a cool evening', formality: 3.5, weather: 'cool', needLayer: true }
  ];

  const L = (id, colour) => ({ id, colour });
  OF.CURATED_LOOKS = [
    { id: 'look-tonal-sand', name: 'Tonal Sand', note: 'Stone on stone, softened with camel.',
      outfit: { top: L('tee-01', 'off-white'), layer: L('over-01', 'camel'), bottom: L('chino-01', 'stone'), shoes: L('sneaker-01', 'off-white'), accessory: null } },
    { id: 'look-commute', name: 'Quiet Commute', note: 'Oxford, flannel and suede. Polished, never stiff.',
      outfit: { top: L('shirt-01', 'light-blue'), layer: L('blazer-01', 'navy'), bottom: L('trouser-01', 'charcoal'), shoes: L('loafer-01', 'camel'), accessory: L('watch-01', 'black') } },
    { id: 'look-weekend', name: 'Slow Saturday', note: 'Boxy tee, easy trousers, canvas shoes.',
      outfit: { top: L('tee-02', 'olive'), layer: null, bottom: L('trouser-02', 'stone'), shoes: L('sneaker-02', 'off-white'), accessory: L('tote-01', 'off-white') } },
    { id: 'look-mono', name: 'All Black, Done Right', note: 'Texture over colour.',
      outfit: { top: L('knit-01', 'charcoal'), layer: null, bottom: L('trouser-01', 'black'), shoes: L('boot-01', 'black'), accessory: null } },
    { id: 'look-summer', name: 'Warm Day Linen', note: 'Breathable linen and short hems.',
      outfit: { top: L('shirt-02', 'off-white'), layer: null, bottom: L('shorts-01', 'navy'), shoes: L('sneaker-02', 'off-white'), accessory: L('cap-01', 'navy') } },
    { id: 'look-workwear', name: 'Workwear Navy', note: 'Chore jacket over a soft knit.',
      outfit: { top: L('knit-01', 'off-white'), layer: L('chore-01', 'navy'), bottom: L('denim-01', 'navy'), shoes: L('boot-01', 'camel'), accessory: L('beanie-01', 'charcoal') } }
  ];
  OF.LOOKS_OF_WEEK = ['look-tonal-sand', 'look-commute', 'look-workwear'];

  OF.STYLE_PROFILES = {
    minimalist: {
      name: 'The Minimalist',
      description: 'A few good pieces in quiet colours. You repeat outfits on purpose, because they work.',
      taste: { colours: { 'off-white': 3, 'stone': 3, 'navy': 1 }, formality: 2, fit: 'Regular' },
      outfit: { top: L('tee-01', 'off-white'), layer: null, bottom: L('chino-01', 'stone'), shoes: L('sneaker-01', 'off-white'), accessory: L('belt-01', 'camel') }
    },
    commuter: {
      name: 'The Smart-Casual Commuter',
      description: 'Ready for the office and the evening after it. Collars, clean trousers, good shoes.',
      taste: { colours: { 'navy': 3, 'light-blue': 2, 'charcoal': 2 }, formality: 4, fit: 'Tailored' },
      outfit: { top: L('shirt-01', 'light-blue'), layer: L('blazer-01', 'navy'), bottom: L('chino-01', 'navy'), shoes: L('loafer-01', 'camel'), accessory: L('watch-01', 'black') }
    },
    relaxed: {
      name: 'The Weekend Relaxed',
      description: 'Comfort comes first, but it still looks considered. Soft fabrics and easy shapes.',
      taste: { colours: { 'olive': 3, 'stone': 2, 'off-white': 2 }, formality: 1, fit: 'Relaxed' },
      outfit: { top: L('tee-02', 'olive'), layer: null, bottom: L('trouser-02', 'stone'), shoes: L('sneaker-02', 'off-white'), accessory: L('cap-01', 'stone') }
    },
    mono: {
      name: 'The Monochrome Purist',
      description: 'Black, charcoal and the odd off-white. Sharp lines and no noise.',
      taste: { colours: { 'black': 3, 'charcoal': 3, 'off-white': 1 }, formality: 3, fit: 'Regular' },
      outfit: { top: L('knit-01', 'charcoal'), layer: L('bomber-01', 'black'), bottom: L('trouser-01', 'black'), shoes: L('boot-01', 'black'), accessory: null }
    }
  };

  OF.QUIZ = [
    { q: 'What does a typical week look like?', a: [
      { t: 'Office most days', s: { commuter: 2, mono: 1 } },
      { t: 'Hybrid: some office, some home', s: { minimalist: 2, commuter: 1 } },
      { t: 'Mostly at home or on the move', s: { relaxed: 2, minimalist: 1 } },
      { t: 'Creative work, irregular hours', s: { mono: 2, relaxed: 1 } } ] },
    { q: 'Which colours do you reach for?', a: [
      { t: 'Whites, stones and sand', s: { minimalist: 2 } },
      { t: 'Navy and light blue', s: { commuter: 2 } },
      { t: 'Olive, rust, earthy tones', s: { relaxed: 2 } },
      { t: 'Black and charcoal', s: { mono: 2 } } ] },
    { q: 'How do you like things to fit?', a: [
      { t: 'Clean and regular', s: { minimalist: 2, mono: 1 } },
      { t: 'Close and tailored', s: { commuter: 2, mono: 1 } },
      { t: 'Loose and relaxed', s: { relaxed: 2 } },
      { t: 'Boxy, a bit oversized', s: { mono: 1, relaxed: 1 } } ] },
    { q: 'Comfort or polish?', a: [
      { t: 'Comfort, always', s: { relaxed: 2 } },
      { t: 'Comfort that looks polished', s: { minimalist: 2 } },
      { t: 'Polish, then comfort', s: { commuter: 2 } },
      { t: 'Sharp, even when relaxed', s: { mono: 2 } } ] },
    { q: 'What is your climate like?', a: [
      { t: 'Warm most of the year', s: { relaxed: 1, minimalist: 1 } },
      { t: 'Mild with cool mornings', s: { minimalist: 1, commuter: 1 } },
      { t: 'Cool, layers needed', s: { mono: 1, commuter: 1 } },
      { t: 'It changes every day', s: { minimalist: 1, relaxed: 1 } } ] }
  ];

  OF.DISCOUNTS = {
    PLAY10: { pct: 10, label: '10% off: earned by playing', needsUnlock: true },
    WELCOME5: { pct: 5, label: '5% welcome offer', needsUnlock: false }
  };
  OF.SHIPPING = { freeOver: 150, standard: 10, express: 12 };

  OF.SIZE_GUIDE = {
    apparel: { head: ['Size', 'Chest (cm)', 'Waist (cm)'], rows: [
      ['XS', '84–89', '70–74'], ['S', '89–94', '74–79'], ['M', '94–100', '79–85'],
      ['L', '100–106', '85–91'], ['XL', '106–112', '91–97'], ['XXL', '112–118', '97–103']] },
    shoes: { head: ['AU/UK', 'EU', 'Foot length (cm)'], rows: [
      ['6', '39', '24.5'], ['7', '40', '25.4'], ['8', '41', '26.2'], ['9', '42', '27.1'],
      ['10', '43', '27.9'], ['11', '44', '28.8'], ['12', '45', '29.6'], ['13', '46', '30.5']] },
    womens: { head: ['Size', 'Bust (cm)', 'Waist (cm)', 'Hip (cm)'], rows: [
      ['XS', '78–82', '60–64', '86–90'], ['S', '82–86', '64–68', '90–94'], ['M', '86–92', '68–74', '94–100'],
      ['L', '92–98', '74–80', '100–106'], ['XL', '98–104', '80–86', '106–112'], ['XXL', '104–110', '86–92', '112–118']] },
    accessories: { head: ['Size', 'Fits'], rows: [['One size', 'Adjustable or universal'], ['S / M / L (belts)', 'Waist 76 / 86 / 96 cm']] }
  };
})();
