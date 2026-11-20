// The nursery's published species catalogue. Shared by the /seedlings page and
// the Guardian database seed, so the species count can never drift apart.

export interface CatalogueSpecies {
  name: string;
  sci: string;
  categories: string[];
  img: string;
  tags: string[];
  uses: { title: string; text: string }[];
  eco: string;
}

export const NURSERY_SPECIES_CATALOGUE: CatalogueSpecies[] = [
  {
    name: 'Silver Oak · Silky Oak',
    sci: 'Grevillea robusta A.Cunn. ex R.Br. · Proteaceae',
    categories: ['medicinal', 'timber', 'ornamental'],
    img: '/assets/images/silver.jpeg',
    tags: ['Medicinal', 'Timber', 'Ornamental'],
    uses: [
      { title: 'Medicine', text: 'Used in Kenya for sore throats, coughs and toothache.' },
      { title: 'Timber', text: 'Good for furniture, plywood and musical instruments.' },
    ],
    eco: 'Good shade for coffee and helps control erosion. Not nitrogen-fixing. Native to Australia.',
  },
  {
    name: 'Doum Palm · Thika Palm',
    sci: 'Hyphaene compressa H.Wendl. · Arecaceae',
    categories: ['food', 'medicinal', 'fodder', 'timber'],
    img: '/assets/images/thika_palm.jpg',
    tags: ['Food', 'Medicinal', 'Fibre'],
    uses: [
      { title: 'Crafts', text: 'Leaves make baskets, mats and thatch. Trunks make poles and beehives.' },
      { title: 'Food', text: 'The sweet fruit is eaten in dry seasons.' },
    ],
    eco: 'Elephants and baboons eat the fruit and spread the seeds.',
  },
  {
    name: 'African Cherry · Red Stinkwood',
    sci: 'Prunus africana (Hook.f.) Kalkman · Rosaceae',
    categories: ['medicinal', 'timber'],
    img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/50/Prunus_africana_MS_3588.jpg/330px-Prunus_africana_MS_3588.jpg',
    tags: ['Medicinal', 'Timber', 'Conservation'],
    uses: [
      { title: 'Medicine', text: 'Bark extract is used to treat prostate problems.' },
      { title: 'Timber', text: 'Hard wood for floors, construction and tool handles.' },
    ],
    eco: 'Vulnerable. Bark harvesting threatens it. Our nursery helps protect it.',
  },
  {
    name: 'Avocado',
    sci: 'Persea americana Mill. · Lauraceae',
    categories: ['food', 'medicinal', 'timber'],
    img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f2/Persea_americana_fruit_2.JPG/330px-Persea_americana_fruit_2.JPG',
    tags: ['Superfood', 'Medicinal', 'Cosmetic'],
    uses: [
      { title: 'Food', text: 'Rich in healthy fats and good for heart health.' },
      { title: 'Skin care', text: 'Leaves and seeds are used for skin and stomach problems. Oil is used in skincare.' },
    ],
    eco: 'Grows well with coffee and gives farmers a high-value fruit.',
  },
  {
    name: 'Matomoko · Common Wild Fig',
    sci: 'Ficus thonningii Blume · Moraceae',
    categories: ['medicinal', 'fodder', 'ornamental'],
    img: 'https://imgs.search.brave.com/jPfzsb_v6uibUBuLSwzLPmrVFz0JAyTuUyzCqQy2bDA/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly93d3cu/c2VsaW5hd2FtdWNp/aS5jb20vd3AtY29u/dGVudC91cGxvYWRz/LzIwMTQvMDgvbWF0/b21va28uanBn',
    tags: ['Fodder', 'Medicinal', 'Shade'],
    uses: [
      { title: 'Livestock feed', text: 'Leaves and young figs feed livestock in dry seasons.' },
      { title: 'Medicine', text: 'Bark is used for colds, sore throats and wounds.' },
    ],
    eco: 'Good live fence, shade and soil cover. Fruit feeds birds.',
  },
  {
    name: 'Markhamia · Nile Tulip Tree',
    sci: 'Markhamia lutea (Benth.) K.Schum. · Bignoniaceae',
    categories: ['medicinal', 'timber', 'ornamental'],
    img: '/assets/images/makhamia.jpg',
    tags: ['Timber', 'Medicinal', 'Bee Forage'],
    uses: [
      { title: 'Timber', text: 'Light, strong wood for furniture, tool handles and beehives.' },
      { title: 'Medicine and bees', text: 'Root bark treats anaemia and stomach problems. Yellow flowers feed bees.' },
    ],
    eco: 'A key bee forage tree for our honey project.',
  },
  {
    name: 'Acacia (Vachellia)',
    sci: 'Vachellia spp. (formerly Acacia) · Fabaceae',
    categories: ['medicinal', 'timber', 'fodder'],
    img: '/assets/images/acacia.jpeg',
    tags: ['Gum', 'Fodder', 'Tannin'],
    uses: [
      { title: 'Fodder and gum', text: 'Pods and leaves feed livestock. Gum has food and medicine uses.' },
      { title: 'Timber', text: 'Very hard wood for furniture, carving and fuel.' },
    ],
    eco: 'Fixes nitrogen in the soil and improves fertility.',
  },
  {
    name: 'African Olive · Mutamaiyu',
    sci: 'Olea europaea subsp. cuspidata · Oleaceae',
    categories: ['medicinal', 'timber', 'ornamental'],
    img: '/assets/images/olea.jpeg',
    tags: ['Sacred Tree', 'Medicinal', 'Hardwood'],
    uses: [
      { title: 'Timber', text: 'Hard, termite-resistant wood for carving and fence posts.' },
      { title: 'Medicine', text: 'Bark and leaves are used for fevers and chest complaints.' },
    ],
    eco: 'A key native forest tree that gives birds nesting sites.',
  },
  {
    name: 'Teclea · Small Fruited Teclea',
    sci: 'Teclea nobilis Del. · Rutaceae',
    categories: ['medicinal'],
    img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/98/Vepris_lanceolata_-_White_Ironwood_Tree_-_South_Africa_22.jpg/330px-Vepris_lanceolata_-_White_Ironwood_Tree_-_South_Africa_22.jpg',
    tags: ['Analgesic', 'Antipyretic', 'Anti-inflammatory'],
    uses: [
      { title: 'Medicine', text: 'Leaves, bark and roots are used for malaria, fever and pain.' },
      { title: 'Traditional use', text: 'Leaf and root preparations treat chest pain and stomach ache.' },
    ],
    eco: 'Studies support its pain relief use and low toxicity.',
  },
  {
    name: 'Chestnut',
    sci: 'Castanea spp. · Fagaceae',
    categories: ['food', 'medicinal', 'timber'],
    img: '/assets/images/chestnut.jpg',
    tags: ['Edible Nut', 'Timber', 'Astringent'],
    uses: [
      { title: 'Food', text: 'Nuts are rich in carbs and low in fat. Eat roasted, boiled or as flour.' },
      { title: 'Timber', text: 'Rot-resistant wood for fences, furniture and outdoor use.' },
    ],
    eco: 'A good shade tree with food and timber uses.',
  },
  {
    name: 'Drypetes',
    sci: 'Drypetes spp. · Putranjivaceae',
    categories: ['medicinal'],
    img: '/assets/images/drypetes.jpg',
    tags: ['Ethnomedicine', 'Pest Control', 'Forest Flora'],
    uses: [
      { title: 'Medicine', text: 'Used in Africa for fever and insect bites.' },
      { title: 'Pest control', text: 'Bark protects stored grain from insects and fungi.' },
    ],
    eco: 'Some species are strong medicines. Use with expert guidance.',
  },
  {
    name: 'Croton · Musine',
    sci: 'Croton megalocarpus Hutch. · Euphorbiaceae',
    categories: ['medicinal', 'timber'],
    img: '/assets/images/croton.jpeg',
    tags: ['Biofuel', 'Medicinal', 'Mulch'],
    uses: [
      { title: 'Oil and feed', text: 'Seeds make biodiesel. Seed cake feeds poultry and livestock.' },
      { title: 'Medicine', text: 'Bark is used for worms, coughs and malaria.' },
      { title: 'Mulch', text: 'Nitrogen-rich leaves make good mulch for coffee.' },
    ],
    eco: 'A fast-growing native tree that captures about 400 kg of CO2.',
  },
  {
    name: 'Toothbrush Tree · Miswak',
    sci: 'Salvadora persica L. · Salvadoraceae',
    categories: ['medicinal'],
    img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e4/Peelo_10.jpg/330px-Peelo_10.jpg',
    tags: ['Oral Hygiene', 'Antibacterial', 'Traditional'],
    uses: [
      { title: 'Natural brush', text: 'Twigs are used as natural toothbrushes and help prevent plaque.' },
      { title: 'Medicine', text: 'Root and leaf remedies treat stomach and chest problems.' },
    ],
    eco: 'Twigs contain fluoride and silica for oral care.',
  },
  {
    name: 'East African Greenheart · Muthiga',
    sci: 'Warburgia ugandensis Sprague · Canellaceae',
    categories: ['medicinal', 'timber'],
    img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/40/Uganda_Greenheart_imported_from_iNaturalist_photo_153670805_on_24_June_2024.jpg/330px-Uganda_Greenheart_imported_from_iNaturalist_photo_153670805_on_24_June_2024.jpg',
    tags: ['Anti-malarial', 'Antifungal', 'Timber'],
    uses: [
      { title: 'Medicine', text: 'Bark and roots treat pneumonia, malaria and skin infections.' },
      { title: 'Timber', text: 'Fragrant, insect-resistant wood. Resin is used as glue.' },
    ],
    eco: 'Endangered by overharvesting. Our nursery protects wild trees.',
  },
  {
    name: 'Jackfruit',
    sci: 'Artocarpus heterophyllus Lam. · Moraceae',
    categories: ['food', 'medicinal', 'timber'],
    img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3b/The_jackfruit_is_holding_on_to_the_tree.jpg/330px-The_jackfruit_is_holding_on_to_the_tree.jpg',
    tags: ['Giant Fruit', 'Timber', 'Antioxidant'],
    uses: [
      { title: 'Food', text: 'The world\'s largest tree fruit is rich in vitamins. Seeds can be eaten.' },
      { title: 'Timber', text: 'Termite-resistant wood for furniture and instruments.' },
    ],
    eco: 'Heavy fruit harvests support local food security.',
  },
  {
    name: 'Sisal',
    sci: 'Agave sisalana Perrine · Asparagaceae',
    categories: ['ornamental'],
    img: '/assets/images/sisal.jpg',
    tags: ['Hard Fibre', 'Ornamental', 'Erosion Control'],
    uses: [
      { title: 'Fibre', text: 'Strong natural fibre for rope, twine and crafts.' },
      { title: 'Soil', text: 'Used for live fences and to stop soil erosion.' },
    ],
    eco: 'Fully biodegradable fibre that supports green enterprise.',
  },
];
