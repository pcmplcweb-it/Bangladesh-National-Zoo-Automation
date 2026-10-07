// Illustrated map coordinate space: viewBox 0 0 1200 900 (north is up, main gate is south).
// Positions are an illustrative layout of the zoo grounds, not a surveyed plan.

export const ZOO_INFO = {
  name: 'Bangladesh National Zoo',
  nameBn: 'বাংলাদেশ জাতীয় চিড়িয়াখানা',
  address: 'Zoo Road, Mirpur-1, Dhaka 1216, Bangladesh',
  phone: '+880 2-9002010',
  email: 'info@nationalzoo.gov.bd',
  hours: 'Sat – Thu: 9:00 AM – 5:00 PM',
  closed: 'Sunday (weekly closing day)',
  center: [23.8122516, 90.346927],
  googleMaps:
    'https://www.google.com/maps/place/Bangladesh+National+Zoo/@23.8130957,90.3444057,17z/data=!4m6!3m5!1s0x3755c102e2ece5bb:0x446e9dc895326a70!8m2!3d23.8122516!4d90.346927',
  areaAcres: 186,
  established: 1974,
};

// Outline of the zoo grounds in map space.
export const BOUNDARY_PATH =
  'M 600 872 C 470 872 330 860 250 815 C 165 765 140 680 140 590 C 140 470 150 370 175 285 C 205 185 270 120 380 105 C 520 88 690 92 820 100 C 950 110 1040 160 1065 260 C 1088 350 1085 470 1075 580 C 1065 690 1030 780 940 828 C 850 868 730 872 600 872 Z';

export const LAKES = [
  { id: 'lake-a', cx: 430, cy: 440, rx: 150, ry: 88, rot: -12, name: 'Migratory Bird Lake' },
  { id: 'lake-b', cx: 700, cy: 230, rx: 115, ry: 58, rot: 8, name: 'North Lake' },
];

export const CATEGORIES = {
  animal: { label: 'Animal Zones', color: '#e07a1f' },
  bird: { label: 'Birds', color: '#2a9d8f' },
  facility: { label: 'Facilities', color: '#3a6ea5' },
  attraction: { label: 'Attractions', color: '#8e44ad' },
};

export const ZONES = [
  {
    id: 'gate', name: 'Main Gate & Ticket Counter', emoji: '🎟️', x: 600, y: 838, cat: 'facility',
    desc: 'Your adventure starts here. Buy tickets, grab a printed map and meet the friendly zoo guides.',
    animals: [],
  },
  {
    id: 'info', name: 'Visitor Information Centre', emoji: 'ℹ️', x: 520, y: 770, cat: 'facility',
    desc: 'Lost & found, first-aid, wheelchair and stroller help, and daily feeding-time notices.',
    animals: [],
  },
  {
    id: 'food', name: 'Food Court', emoji: '🍲', x: 420, y: 805, cat: 'facility',
    desc: 'Snacks, local favourites like fuchka and jhalmuri, tea and cold drinks under shady trees.',
    animals: [],
  },
  {
    id: 'kids', name: "Children's Park", emoji: '🎠', x: 300, y: 740, cat: 'attraction',
    desc: 'Swings, slides and a mini ride area right beside the family picnic lawn.',
    animals: [],
  },
  {
    id: 'aquarium', name: 'Aquarium', emoji: '🐠', x: 720, y: 770, cat: 'attraction',
    desc: 'Freshwater fish of Bangladesh including rui, katla, pangas and colourful ornamental fish.',
    animals: ['fish'],
  },
  {
    id: 'museum', name: 'Zoo Museum', emoji: '🏛️', x: 680, y: 665, cat: 'attraction',
    desc: 'Preserved specimens, skeletons and exhibits on wildlife conservation in Bangladesh.',
    animals: [],
  },
  {
    id: 'aviary', name: 'Bird Aviary & Peacock Garden', emoji: '🦚', x: 430, y: 665, cat: 'bird',
    desc: 'Walk among parakeets, hornbills, mynas, pheasants and dancing peacocks.',
    animals: ['peacock', 'hornbill', 'parrot'],
  },
  {
    id: 'reptile', name: 'Reptile House', emoji: '🐍', x: 555, y: 600, cat: 'animal',
    desc: 'Pythons, monitor lizards and turtles in climate-controlled enclosures.',
    animals: ['python', 'turtle'],
  },
  {
    id: 'primate', name: 'Primate House', emoji: '🐒', x: 270, y: 600, cat: 'animal',
    desc: 'Chimpanzees, rhesus macaques, baboons and the playful langurs.',
    animals: ['chimpanzee', 'macaque'],
  },
  {
    id: 'tiger', name: 'Royal Bengal Tiger', emoji: '🐅', x: 800, y: 600, cat: 'animal',
    desc: "The national animal of Bangladesh — the zoo's most popular enclosure.",
    animals: ['tiger'],
  },
  {
    id: 'bear', name: 'Bear Enclosure', emoji: '🐻', x: 930, y: 700, cat: 'animal',
    desc: 'Asiatic black bears and sun bears exploring their rocky den.',
    animals: ['bear'],
  },
  {
    id: 'lion', name: 'Lion Kingdom', emoji: '🦁', x: 945, y: 545, cat: 'animal',
    desc: 'African lions resting on the sunny rocks — best seen in the morning.',
    animals: ['lion'],
  },
  {
    id: 'hippo', name: 'Hippo Pool', emoji: '🦛', x: 610, y: 470, cat: 'animal',
    desc: 'Watch the hippos wallow and yawn in their deep pool next to the lake.',
    animals: ['hippo'],
  },
  {
    id: 'croc', name: 'Crocodile Pond', emoji: '🐊', x: 245, y: 440, cat: 'animal',
    desc: 'Mugger and saltwater crocodiles basking on the banks.',
    animals: ['crocodile'],
  },
  {
    id: 'lake', name: 'Migratory Bird Lake', emoji: '🦆', x: 430, y: 440, cat: 'bird',
    desc: 'In winter thousands of migratory ducks and whistling teals visit this lake.',
    animals: ['duck', 'pelican'],
  },
  {
    id: 'giraffe', name: 'Giraffe & Zebra Savannah', emoji: '🦒', x: 830, y: 410, cat: 'animal',
    desc: 'An open savannah paddock with giraffes, zebras and impalas.',
    animals: ['giraffe', 'zebra'],
  },
  {
    id: 'elephant', name: 'Elephant Ground', emoji: '🐘', x: 990, y: 400, cat: 'animal',
    desc: 'Asian elephants bathing and dusting — catch the bath time around noon.',
    animals: ['elephant'],
  },
  {
    id: 'deer', name: 'Deer Park', emoji: '🦌', x: 300, y: 260, cat: 'animal',
    desc: 'Herds of spotted deer, sambar and barking deer grazing under the trees.',
    animals: ['deer', 'sambar'],
  },
  {
    id: 'birds-large', name: 'Ostrich & Emu Paddock', emoji: '🦤', x: 950, y: 260, cat: 'bird',
    desc: 'The tallest birds in the world strut around a spacious sandy paddock.',
    animals: ['ostrich', 'emu'],
  },
  {
    id: 'northlake', name: 'North Lake', emoji: '🦢', x: 700, y: 230, cat: 'bird',
    desc: 'Pelicans, swans and cormorants on a quiet lake — a lovely photo spot.',
    animals: ['pelican'],
  },
  {
    id: 'picnic', name: 'Picnic Lawn', emoji: '🧺', x: 500, y: 180, cat: 'attraction',
    desc: 'A large shaded lawn for family picnics and resting after the walk.',
    animals: [],
  },
  {
    id: 'wc1', name: 'Restroom & Prayer Room', emoji: '🚻', x: 640, y: 345, cat: 'facility',
    desc: 'Clean restrooms and a prayer room for visitors.',
    animals: [],
  },
  {
    id: 'wc2', name: 'Restroom & Drinking Water', emoji: '🚰', x: 330, y: 820, cat: 'facility',
    desc: 'Restrooms and safe drinking-water point near the children’s park.',
    animals: [],
  },
];

// Ordered stops for the virtual walk — a loop that starts and ends at the main gate.
export const TOUR_STOPS = [
  'gate', 'aviary', 'primate', 'croc', 'lake', 'deer', 'picnic', 'northlake',
  'birds-large', 'elephant', 'giraffe', 'hippo', 'lion', 'tiger', 'bear', 'museum', 'aquarium', 'gate',
];

// Extra walkway waypoints so the path curves naturally around lakes and enclosures.
export const TOUR_WAYPOINTS = {
  'gate>aviary': [[540, 735]],
  'aviary>primate': [[350, 640]],
  'primate>croc': [[215, 520]],
  'lake>deer': [[300, 350]],
  'northlake>birds-large': [[840, 200]],
  'birds-large>elephant': [[1010, 320]],
  'hippo>lion': [[760, 500]],
  'bear>museum': [[820, 690]],
};

export const ANIMALS = [
  { id: 'tiger', name: 'Royal Bengal Tiger', bn: 'রয়েল বেঙ্গল টাইগার', emoji: '🐅', zone: 'tiger', group: 'Mammals', sci: 'Panthera tigris tigris', status: 'Endangered', diet: 'Carnivore', fact: 'The national animal of Bangladesh and an icon of the Sundarbans mangrove forest.', grad: ['#f39c12', '#d35400'] },
  { id: 'lion', name: 'African Lion', bn: 'সিংহ', emoji: '🦁', zone: 'lion', group: 'Mammals', sci: 'Panthera leo', status: 'Vulnerable', diet: 'Carnivore', fact: 'A lion’s roar can be heard up to 8 km away.', grad: ['#f1c40f', '#e67e22'] },
  { id: 'elephant', name: 'Asian Elephant', bn: 'হাতি', emoji: '🐘', zone: 'elephant', group: 'Mammals', sci: 'Elephas maximus', status: 'Endangered', diet: 'Herbivore', fact: 'Elephants can recognise themselves in a mirror and mourn their dead.', grad: ['#95a5a6', '#576574'] },
  { id: 'giraffe', name: 'Giraffe', bn: 'জিরাফ', emoji: '🦒', zone: 'giraffe', group: 'Mammals', sci: 'Giraffa camelopardalis', status: 'Vulnerable', diet: 'Herbivore', fact: 'A giraffe’s tongue is about 50 cm long and dark blue to avoid sunburn.', grad: ['#f6d365', '#d4a017'] },
  { id: 'zebra', name: 'Zebra', bn: 'জেব্রা', emoji: '🦓', zone: 'giraffe', group: 'Mammals', sci: 'Equus quagga', status: 'Near Threatened', diet: 'Herbivore', fact: 'No two zebras have exactly the same stripe pattern.', grad: ['#636e72', '#2d3436'] },
  { id: 'hippo', name: 'Hippopotamus', bn: 'জলহস্তী', emoji: '🦛', zone: 'hippo', group: 'Mammals', sci: 'Hippopotamus amphibius', status: 'Vulnerable', diet: 'Herbivore', fact: 'Hippos secrete a reddish “sun-screen” that protects their skin.', grad: ['#a29bfe', '#6c5ce7'] },
  { id: 'bear', name: 'Asiatic Black Bear', bn: 'কালো ভালুক', emoji: '🐻', zone: 'bear', group: 'Mammals', sci: 'Ursus thibetanus', status: 'Vulnerable', diet: 'Omnivore', fact: 'Recognised by the cream-coloured “V” mark on its chest.', grad: ['#8d6e63', '#4e342e'] },
  { id: 'chimpanzee', name: 'Chimpanzee', bn: 'শিম্পাঞ্জি', emoji: '🦍', zone: 'primate', group: 'Mammals', sci: 'Pan troglodytes', status: 'Endangered', diet: 'Omnivore', fact: 'Chimpanzees share about 98% of their DNA with humans.', grad: ['#b08968', '#7f5539'] },
  { id: 'macaque', name: 'Rhesus Macaque', bn: 'বানর', emoji: '🐒', zone: 'primate', group: 'Mammals', sci: 'Macaca mulatta', status: 'Least Concern', diet: 'Omnivore', fact: 'Highly social, living in troops of up to 200 monkeys.', grad: ['#e6b980', '#c08552'] },
  { id: 'deer', name: 'Spotted Deer', bn: 'চিত্রা হরিণ', emoji: '🦌', zone: 'deer', group: 'Mammals', sci: 'Axis axis', status: 'Least Concern', diet: 'Herbivore', fact: 'The beautiful chital is a common sight in the Sundarbans.', grad: ['#e17055', '#b33939'] },
  { id: 'sambar', name: 'Sambar Deer', bn: 'সাম্বার হরিণ', emoji: '🦌', zone: 'deer', group: 'Mammals', sci: 'Rusa unicolor', status: 'Vulnerable', diet: 'Herbivore', fact: 'One of the largest deer species in Asia.', grad: ['#a0522d', '#6b3e26'] },
  { id: 'crocodile', name: 'Mugger Crocodile', bn: 'কুমির', emoji: '🐊', zone: 'croc', group: 'Reptiles', sci: 'Crocodylus palustris', status: 'Vulnerable', diet: 'Carnivore', fact: 'Muggers can stay underwater for over an hour.', grad: ['#55efc4', '#00876c'] },
  { id: 'python', name: 'Burmese Python', bn: 'অজগর', emoji: '🐍', zone: 'reptile', group: 'Reptiles', sci: 'Python bivittatus', status: 'Vulnerable', diet: 'Carnivore', fact: 'Can grow longer than 5 metres and swallow prey whole.', grad: ['#badc58', '#6ab04c'] },
  { id: 'turtle', name: 'Indian Flapshell Turtle', bn: 'কচ্ছপ', emoji: '🐢', zone: 'reptile', group: 'Reptiles', sci: 'Lissemys punctata', status: 'Least Concern', diet: 'Omnivore', fact: 'Has skin flaps that close over its legs for protection.', grad: ['#78e08f', '#38ada9'] },
  { id: 'peacock', name: 'Indian Peafowl', bn: 'ময়ূর', emoji: '🦚', zone: 'aviary', group: 'Birds', sci: 'Pavo cristatus', status: 'Least Concern', diet: 'Omnivore', fact: 'The male’s train can hold more than 200 shimmering feathers.', grad: ['#00b894', '#0984e3'] },
  { id: 'hornbill', name: 'Great Hornbill', bn: 'ধনেশ পাখি', emoji: '🐦', zone: 'aviary', group: 'Birds', sci: 'Buceros bicornis', status: 'Vulnerable', diet: 'Omnivore', fact: 'Famous for the bright yellow casque on top of its huge bill.', grad: ['#fdcb6e', '#e17055'] },
  { id: 'parrot', name: 'Rose-ringed Parakeet', bn: 'টিয়া', emoji: '🦜', zone: 'aviary', group: 'Birds', sci: 'Psittacula krameri', status: 'Least Concern', diet: 'Herbivore', fact: 'Can learn to mimic human speech.', grad: ['#55efc4', '#00a86b'] },
  { id: 'duck', name: 'Lesser Whistling Duck', bn: 'সরালি হাঁস', emoji: '🦆', zone: 'lake', group: 'Birds', sci: 'Dendrocygna javanica', status: 'Least Concern', diet: 'Omnivore', fact: 'Arrives in large flocks every winter — a spectacular sight on the lake.', grad: ['#74b9ff', '#0984e3'] },
  { id: 'pelican', name: 'Spot-billed Pelican', bn: 'পেলিকান', emoji: '🦢', zone: 'northlake', group: 'Birds', sci: 'Pelecanus philippensis', status: 'Near Threatened', diet: 'Carnivore', fact: 'Its throat pouch can hold more water than its stomach.', grad: ['#dfe6e9', '#74b9ff'] },
  { id: 'ostrich', name: 'Ostrich', bn: 'উটপাখি', emoji: '🦤', zone: 'birds-large', group: 'Birds', sci: 'Struthio camelus', status: 'Least Concern', diet: 'Omnivore', fact: 'The fastest bird on land, running up to 70 km/h.', grad: ['#b2bec3', '#636e72'] },
  { id: 'emu', name: 'Emu', bn: 'ইমু', emoji: '🐦‍⬛', zone: 'birds-large', group: 'Birds', sci: 'Dromaius novaehollandiae', status: 'Least Concern', diet: 'Omnivore', fact: 'Emus can’t walk backwards!', grad: ['#a4b0be', '#57606f'] },
  { id: 'fish', name: 'Freshwater Fishes', bn: 'মাছ', emoji: '🐟', zone: 'aquarium', group: 'Fish', sci: 'Various species', status: 'Varies', diet: 'Varies', fact: 'Bangladesh has around 260 species of freshwater fish.', grad: ['#81ecec', '#0abde3'] },
];

export const TICKETS = [
  { id: 'adult', label: 'Adult', price: 50, note: 'Age 13+' },
  { id: 'child', label: 'Child', price: 20, note: 'Age 3–12' },
  { id: 'student', label: 'Student Group', price: 20, note: 'Per student, with institution letter' },
  { id: 'aquarium', label: 'Aquarium Entry', price: 20, note: 'Add-on, per person' },
];

export const FEEDING_TIMES = [
  { time: '10:30 AM', what: 'Elephant bath & feeding', zone: 'elephant' },
  { time: '11:30 AM', what: 'Hippo feeding', zone: 'hippo' },
  { time: '12:30 PM', what: 'Bird aviary talk', zone: 'aviary' },
  { time: '3:00 PM', what: 'Big cats feeding (tiger & lion)', zone: 'tiger' },
  { time: '3:30 PM', what: 'Crocodile feeding', zone: 'croc' },
];

export const zoneById = Object.fromEntries(ZONES.map((z) => [z.id, z]));
export const animalById = Object.fromEntries(ANIMALS.map((a) => [a.id, a]));

// Approximate geo-reference of the illustrated map, centred on the zoo's Google Maps pin.
const GEO = { latTop: 23.8165, latBottom: 23.8080, lngLeft: 90.3425, lngRight: 90.3513, xL: 140, xR: 1080, yT: 100, yB: 872 };
export function toLatLng(x, y) {
  const lat = GEO.latTop + ((y - GEO.yT) / (GEO.yB - GEO.yT)) * (GEO.latBottom - GEO.latTop);
  const lng = GEO.lngLeft + ((x - GEO.xL) / (GEO.xR - GEO.xL)) * (GEO.lngRight - GEO.lngLeft);
  return [lat, lng];
}

// Sample the boundary path into lat/lng points for the satellite view.
export function boundaryLatLngs(samples = 90) {
  if (typeof document === 'undefined') return [];
  const NS = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(NS, 'svg');
  svg.style.cssText = 'position:absolute;width:0;height:0;visibility:hidden';
  const p = document.createElementNS(NS, 'path');
  p.setAttribute('d', BOUNDARY_PATH);
  svg.appendChild(p);
  document.body.appendChild(svg);
  const len = p.getTotalLength();
  const pts = [];
  for (let i = 0; i < samples; i++) {
    const pt = p.getPointAtLength((i / samples) * len);
    pts.push(toLatLng(pt.x, pt.y));
  }
  svg.remove();
  return pts;
}
