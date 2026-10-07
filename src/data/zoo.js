// Zone positions are real coordinates taken from OpenStreetMap enclosure data
// (© OpenStreetMap contributors) and cross-checked with the official zoo board map.

export const ZOO_INFO = {
  name: 'Bangladesh National Zoo',
  nameBn: 'বাংলাদেশ জাতীয় চিড়িয়াখানা',
  address: 'Zoo Road, Mirpur-1, Dhaka 1216, Bangladesh',
  addressBn: 'চিড়িয়াখানা রোড, মিরপুর-১, ঢাকা ১২১৬',
  phone: '+880 2-9002010',
  email: 'info@nationalzoo.gov.bd',
  hours: 'Mon – Sat: 9:00 AM – 6:00 PM',
  hoursBn: 'সোম – শনি: সকাল ৯টা – সন্ধ্যা ৬টা',
  closed: 'Sunday (weekly closing day)',
  center: [23.8122516, 90.346927],
  gate: [23.812223, 90.346923],
  googleMaps:
    'https://www.google.com/maps/place/Bangladesh+National+Zoo/@23.8130957,90.3444057,17z/data=!4m6!3m5!1s0x3755c102e2ece5bb:0x446e9dc895326a70!8m2!3d23.8122516!4d90.346927',
  areaAcres: 186,
  established: 1974,
};

// Opening rule used for the live "Open now" badge (Asia/Dhaka time).
export const OPENING = { days: [1, 2, 3, 4, 5, 6], open: 9, close: 18 };

export function openStatus(now = new Date()) {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Dhaka', weekday: 'short', hour: 'numeric', minute: 'numeric', hourCycle: 'h23',
  }).formatToParts(now);
  const get = (t) => parts.find((p) => p.type === t)?.value;
  const day = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(get('weekday'));
  const h = Number(get('hour')) + Number(get('minute')) / 60;
  const openDay = OPENING.days.includes(day);
  const open = openDay && h >= OPENING.open && h < OPENING.close;
  return { open, openDay, day };
}

export const CATEGORIES = {
  animal: { label: 'Animals', labelBn: 'প্রাণী', color: '#f08c2e' },
  bird: { label: 'Birds', labelBn: 'পাখি', color: '#1fb5a3' },
  facility: { label: 'Facilities', labelBn: 'সুবিধা', color: '#3a86ff' },
  attraction: { label: 'Lakes & Leisure', labelBn: 'লেক ও বিনোদন', color: '#b15cff' },
};

export const ZONES = [
  // Facilities
  { id: 'gate', name: 'Main Gate & Ticket Counter', bn: 'প্রধান ফটক ও টিকিট কাউন্টার', emoji: '🎟️', pos: [23.812223, 90.346923], cat: 'facility', photo: 'main-gate',
    desc: 'The main entrance on Zoo Road, Mirpur-1. Buy tickets here, check the board map and start your walk.', animals: [] },
  { id: 'wc', name: 'Restrooms (Gate)', bn: 'শৌচাগার', emoji: '🚻', pos: [23.81205, 90.34668], cat: 'facility',
    desc: 'Paid public toilets just inside the main gate.', animals: [] },
  { id: 'wc2', name: 'Zoo Public Toilet', bn: 'চিড়িয়াখানা গণশৌচাগার', emoji: '🚻', pos: [23.815646, 90.346975], cat: 'facility',
    desc: 'Public toilet on the eastern road, near the tiger enclosure.', animals: [] },
  { id: 'hospital', name: 'Veterinary Hospital', bn: 'চিড়িয়াখানা ভেটেরিনারি হাসপাতাল', emoji: '🏥', pos: [23.812426, 90.345924], cat: 'facility',
    desc: 'The zoo’s animal hospital, where vets care for sick and injured animals (not open to visitors).', animals: [] },
  { id: 'office', name: "Director's Office", bn: 'পরিচালকের কার্যালয়', emoji: '🏢', pos: [23.813622, 90.346855], cat: 'facility',
    desc: 'Administration, lost & found and visitor help desk.', animals: [] },
  { id: 'mosque', name: 'Zoo Jame Masjid', bn: 'চিড়িয়াখানা জামে মসজিদ', emoji: '🕌', pos: [23.812605, 90.343245], cat: 'facility',
    desc: 'The mosque inside the zoo grounds, open for visitors at prayer times.', animals: [] },
  { id: 'restaurant', name: 'Eagle Restaurant', bn: 'ঈগল রেস্তোরাঁ', emoji: '🍽️', pos: [23.808598, 90.34403], cat: 'facility',
    desc: 'Restaurant near the South Lake for meals and snacks.', animals: [] },

  // East side, from the gate northwards
  { id: 'monkey', name: "Monkey's Cage", bn: 'বানরের খাঁচা', emoji: '🐒', pos: [23.813089, 90.34579], cat: 'animal',
    desc: 'Rhesus macaques and other monkeys — usually the liveliest enclosure near the gate.', animals: ['macaque'] },
  { id: 'storks', name: 'Hornbill & Stork Aviaries', bn: 'ধনেশ ও মানিকজোড়', emoji: '🦤', pos: [23.814169, 90.346446], cat: 'bird',
    desc: 'Oriental pied hornbills, black-necked storks and lesser adjutants.', animals: ['hornbill', 'stork'] },
  { id: 'sambar', name: 'Sambar Deer', bn: 'সাম্বার হরিণ', emoji: '🦌', pos: [23.814875, 90.347157], cat: 'animal',
    desc: 'The large sambar deer in a long paddock along the eastern wall.', animals: ['sambar'] },
  { id: 'tiger', name: 'Royal Bengal Tiger', bn: 'রয়েল বেঙ্গল টাইগার', emoji: '🐅', pos: [23.815822, 90.347345], cat: 'animal', photo: 'tiger',
    desc: 'The national animal of Bangladesh — the most popular enclosure in the zoo.', animals: ['tiger'] },
  { id: 'lion', name: 'Asian Lion', bn: 'এশিয়ান সিংহ', emoji: '🦁', pos: [23.816985, 90.347597], cat: 'animal',
    desc: 'Lions resting along the moat on the eastern edge of the zoo.', animals: ['lion'] },
  { id: 'deer', name: 'Deer Cage & Deer Zone', bn: 'হরিণের খাঁচা ও হরিণ জোন', emoji: '🦌', pos: [23.818188, 90.347581], cat: 'animal',
    desc: 'Herds of spotted deer (chital) and barking deer grazing in the open deer zone.', animals: ['deer'] },
  { id: 'croc', name: "Crocodile's Cage & Gharial Pond", bn: 'কুমিরের খাঁচা ও ঘড়িয়ালের পুকুর', emoji: '🐊', pos: [23.81885, 90.347597], cat: 'animal',
    desc: 'Mugger crocodiles at the northern end, with the gharial pond just to the west.', animals: ['crocodile'] },
  { id: 'northlake', name: 'North Lake Viewing Deck', bn: 'উত্তর লেক ও দর্শনার্থী ডেক', emoji: '🦢', pos: [23.817545, 90.34712], cat: 'attraction', photo: 'north-lake',
    desc: 'A viewing deck over the North Lake; migratory ducks arrive every winter and pelicans rest on the water.', animals: ['duck', 'pelican'] },

  // Around the North Lake
  { id: 'baboon', name: 'Baboons', bn: 'বেবুন', emoji: '🐵', pos: [23.815971, 90.346009], cat: 'animal',
    desc: 'A troop of baboons with lots of social drama to watch.', animals: ['baboon'] },
  { id: 'snakes', name: "Snake's Cage", bn: 'সাপের খাঁচা', emoji: '🐍', pos: [23.815746, 90.345583], cat: 'animal',
    desc: 'Pythons and other snakes of Bangladesh.', animals: ['python'] },
  { id: 'peafowl', name: 'Peacock Zone', bn: 'ময়ূর জোন', emoji: '🦚', pos: [23.815802, 90.345183], cat: 'bird',
    desc: 'Peacocks displaying their shimmering trains.', animals: ['peacock'] },
  { id: 'picnic', name: 'Utsab Picnic Spot', bn: 'উৎসব পিকনিক স্পট', emoji: '🧺', pos: [23.816259, 90.344298], cat: 'attraction', photo: 'lake-trees',
    desc: 'A shaded picnic spot on the North Lake peninsula, popular with families and groups.', animals: [] },
  { id: 'hippo', name: 'Hippopotamus', bn: 'জলহস্তী', emoji: '🦛', pos: [23.815042, 90.344593], cat: 'animal',
    desc: 'Hippos wallowing in their pool beside the North Lake.', animals: ['hippo'] },
  { id: 'saltcroc', name: 'Estuarine Crocodile', bn: 'লোনা পানির কুমির', emoji: '🐊', pos: [23.814973, 90.344915], cat: 'animal',
    desc: 'The saltwater crocodile — the largest living reptile — next to the hippo pool.', animals: ['saltcroc'] },

  // West side
  { id: 'eland', name: 'Common Eland', bn: 'কমন ইল্যান্ড', emoji: '🦌', pos: [23.814428, 90.342823], cat: 'animal',
    desc: 'The common eland — one of the largest antelopes in the world — near the North Lake’s south-west shore.', animals: ['eland'] },
  { id: 'aviary', name: 'Bird Aviary (Myna House)', bn: 'ময়না পাখির খাঁচা', emoji: '🦜', pos: [23.813589, 90.342957], cat: 'bird',
    desc: 'Aviary with mynas, parakeets and other native birds.', animals: ['parakeet'] },
  { id: 'antelope', name: 'Antelope Row', bn: 'নীলগাই, ওয়াইল্ডবিস্ট ও ওয়াটারবাক', emoji: '🐃', pos: [23.81365, 90.34232], cat: 'animal',
    desc: 'A row of paddocks with nilgai, wildebeest, waterbuck and Bhutani cattle (gayal).', animals: ['nilgai', 'wildebeest', 'waterbuck'] },
  { id: 'llama', name: 'Llama Cage', bn: 'লামা খাঁচা', emoji: '🦙', pos: [23.813359, 90.342056], cat: 'animal',
    desc: 'Woolly South American llamas on the western side of the zoo.', animals: ['llama'] },
  { id: 'bear', name: "Bear's Cage", bn: 'ভালুকের খাঁচা', emoji: '🐻', pos: [23.813246, 90.343408], cat: 'animal',
    desc: 'Asiatic black bears in their enclosure near the mosque.', animals: ['bear'] },
  { id: 'ostrich', name: 'Ostrich Cage', bn: 'উটপাখির খাঁচা', emoji: '🦤', pos: [23.812338, 90.343327], cat: 'bird',
    desc: 'Ostriches — the largest birds in the world.', animals: ['ostrich'] },
  { id: 'giraffe', name: 'Giraffe', bn: 'জিরাফ', emoji: '🦒', pos: [23.812274, 90.342051], cat: 'animal',
    desc: 'Giraffes browsing high branches on the western side of the zoo.', animals: ['giraffe'] },
  { id: 'zebra', name: 'Zebra', bn: 'জেব্রা', emoji: '🦓', pos: [23.810625, 90.342201], cat: 'animal',
    desc: 'Plains zebras in their paddock along the western road.', animals: ['zebra'] },

  // South, around the South Lake
  { id: 'museum', name: 'Zoo Museum', bn: 'চিড়িয়াখানা জাদুঘর', emoji: '🏛️', pos: [23.808382, 90.342222], cat: 'attraction',
    desc: 'Museum with preserved specimens and exhibits about wildlife.', animals: [] },
  { id: 'elephant', name: 'Elephant Ground', bn: 'হাতির মাঠ', emoji: '🐘', pos: [23.808637, 90.343264], cat: 'animal',
    desc: 'Asian elephants in the large oval ground at the southern end.', animals: ['elephant'] },
  { id: 'camel', name: 'Camel Zone', bn: 'উট', emoji: '🐪', pos: [23.808205, 90.344068], cat: 'animal',
    desc: 'Dromedary camels near the South Lake.', animals: ['camel'] },
  { id: 'southlake', name: 'South Lake', bn: 'দক্ষিণ লেক', emoji: '🦆', pos: [23.80815, 90.34625], cat: 'attraction', photo: 'lake-flame-trees',
    desc: 'The largest lake in the zoo, framed by flame trees. Angling by permit on selected Fridays.', animals: ['duck'] },
  { id: 'rhino', name: 'Rhinoceros', bn: 'গণ্ডার', emoji: '🦏', pos: [23.809636, 90.344255], cat: 'animal', photo: 'rhino',
    desc: 'White rhinoceros resting in the shade of their house.', animals: ['rhino'] },
  { id: 'chimp', name: 'Chimpanzee', bn: 'শিম্পাঞ্জি', emoji: '🦍', pos: [23.809744, 90.344058], cat: 'animal',
    desc: 'Chimpanzees — our closest relatives — in their enclosure near the South Lake.', animals: ['chimpanzee'] },
  { id: 'vulture', name: 'Vulture Aviary', bn: 'শকুন', emoji: '🦅', pos: [23.810624, 90.34332], cat: 'bird',
    desc: 'Critically endangered vultures — a conservation priority in Bangladesh.', animals: ['vulture'] },
  { id: 'kids', name: "Children's Corner", bn: 'শিশু কর্নার', emoji: '🎠', pos: [23.81148, 90.34375], cat: 'attraction',
    desc: 'Guinea pigs and small animals children can watch up close.', animals: ['guineapig'] },
  { id: 'leopard', name: 'Leopard', bn: 'চিতাবাঘ', emoji: '🐆', pos: [23.811955, 90.343306], cat: 'animal',
    desc: 'The elusive leopard — look carefully, it loves to rest in the shade.', animals: ['leopard'] },
  { id: 'otter', name: 'Otter Pool', bn: 'ভোঁদড়ের খাঁচা', emoji: '🦦', pos: [23.812133, 90.343981], cat: 'animal',
    desc: 'Smooth-coated otters diving and playing in their pool.', animals: ['otter'] },
  { id: 'flamingo', name: 'Greater Flamingo', bn: 'ফ্লেমিঙ্গো', emoji: '🦩', pos: [23.812603, 90.345304], cat: 'bird',
    desc: 'Pink flamingos wading in their shallow pond along the main loop road.', animals: ['flamingo'] },
];

// Order of the virtual walk: one loop on the real roads, starting and ending at the main gate.
export const TOUR_STOPS = [
  'gate', 'monkey', 'storks', 'sambar', 'tiger', 'lion', 'deer', 'croc', 'northlake', 'baboon', 'snakes',
  'peafowl', 'picnic', 'hippo', 'saltcroc', 'eland', 'aviary', 'antelope', 'llama', 'bear', 'ostrich', 'giraffe',
  'zebra', 'museum', 'elephant', 'camel', 'southlake', 'rhino', 'chimp', 'vulture', 'kids', 'leopard', 'otter',
  'flamingo', 'gate',
];

export const ANIMALS = [
  { id: 'tiger', name: 'Royal Bengal Tiger', bn: 'রয়েল বেঙ্গল টাইগার', emoji: '🐅', zone: 'tiger', group: 'Mammals', sci: 'Panthera tigris tigris', status: 'Endangered', diet: 'Carnivore', fact: 'The national animal of Bangladesh and an icon of the Sundarbans mangrove forest.', grad: ['#f39c12', '#d35400'], photo: 'tiger' },
  { id: 'lion', name: 'Asiatic Lion', bn: 'এশিয়ান সিংহ', emoji: '🦁', zone: 'lion', group: 'Mammals', sci: 'Panthera leo leo', status: 'Vulnerable', diet: 'Carnivore', fact: 'A lion’s roar can be heard up to 8 km away.', grad: ['#f1c40f', '#e67e22'], photo: 'a-lion' },
  { id: 'leopard', name: 'Leopard', bn: 'চিতাবাঘ', emoji: '🐆', zone: 'leopard', group: 'Mammals', sci: 'Panthera pardus', status: 'Vulnerable', diet: 'Carnivore', fact: 'Leopards can haul prey heavier than themselves up into trees.', grad: ['#e2b04a', '#8a5a19'], photo: 'a-leopard' },
  { id: 'elephant', name: 'Asian Elephant', bn: 'হাতি', emoji: '🐘', zone: 'elephant', group: 'Mammals', sci: 'Elephas maximus', status: 'Endangered', diet: 'Herbivore', fact: 'Elephants recognise themselves in a mirror and mourn their dead.', grad: ['#95a5a6', '#576574'], photo: 'a-elephant' },
  { id: 'rhino', name: 'White Rhinoceros', bn: 'গণ্ডার', emoji: '🦏', zone: 'rhino', group: 'Mammals', sci: 'Ceratotherium simum', status: 'Near Threatened', diet: 'Herbivore', fact: 'The second-largest land mammal after the elephant.', grad: ['#b2bec3', '#636e72'], photo: 'rhino' },
  { id: 'hippo', name: 'Hippopotamus', bn: 'জলহস্তী', emoji: '🦛', zone: 'hippo', group: 'Mammals', sci: 'Hippopotamus amphibius', status: 'Vulnerable', diet: 'Herbivore', fact: 'Hippos secrete a reddish “sun-screen” that protects their skin.', grad: ['#a29bfe', '#6c5ce7'], photo: 'a-hippo' },
  { id: 'giraffe', name: 'Giraffe', bn: 'জিরাফ', emoji: '🦒', zone: 'giraffe', group: 'Mammals', sci: 'Giraffa camelopardalis', status: 'Vulnerable', diet: 'Herbivore', fact: 'A giraffe’s tongue is about 50 cm long and dark blue to avoid sunburn.', grad: ['#f6d365', '#d4a017'], photo: 'a-giraffe' },
  { id: 'zebra', name: 'Zebra', bn: 'জেব্রা', emoji: '🦓', zone: 'zebra', group: 'Mammals', sci: 'Equus quagga', status: 'Near Threatened', diet: 'Herbivore', fact: 'No two zebras have exactly the same stripe pattern.', grad: ['#636e72', '#2d3436'], photo: 'a-zebra' },
  { id: 'chimpanzee', name: 'Chimpanzee', bn: 'শিম্পাঞ্জি', emoji: '🦍', zone: 'chimp', group: 'Mammals', sci: 'Pan troglodytes', status: 'Endangered', diet: 'Omnivore', fact: 'Chimpanzees share about 98% of their DNA with humans.', grad: ['#b08968', '#7f5539'], photo: 'a-chimpanzee' },
  { id: 'baboon', name: 'Baboon', bn: 'বেবুন', emoji: '🐵', zone: 'baboon', group: 'Mammals', sci: 'Papio sp.', status: 'Least Concern', diet: 'Omnivore', fact: 'Baboons live in troops with complex social hierarchies.', grad: ['#d4a373', '#9c6644'], photo: 'a-baboon' },
  { id: 'macaque', name: 'Rhesus Macaque', bn: 'বানর', emoji: '🐒', zone: 'monkey', group: 'Mammals', sci: 'Macaca mulatta', status: 'Least Concern', diet: 'Omnivore', fact: 'Highly social, living in troops of up to 200 monkeys.', grad: ['#e6b980', '#c08552'], photo: 'a-macaque' },
  { id: 'deer', name: 'Spotted Deer', bn: 'চিত্রা হরিণ', emoji: '🦌', zone: 'deer', group: 'Mammals', sci: 'Axis axis', status: 'Least Concern', diet: 'Herbivore', fact: 'The beautiful chital is a common sight in the Sundarbans.', grad: ['#e17055', '#b33939'], photo: 'a-deer' },
  { id: 'sambar', name: 'Sambar Deer', bn: 'সাম্বার হরিণ', emoji: '🦌', zone: 'sambar', group: 'Mammals', sci: 'Rusa unicolor', status: 'Vulnerable', diet: 'Herbivore', fact: 'One of the largest deer species in Asia.', grad: ['#a0522d', '#6b3e26'], photo: 'a-sambar' },
  { id: 'nilgai', name: 'Nilgai', bn: 'নীলগাই', emoji: '🐂', zone: 'antelope', group: 'Mammals', sci: 'Boselaphus tragocamelus', status: 'Least Concern', diet: 'Herbivore', fact: 'The largest antelope of Asia — males have a blue-grey coat.', grad: ['#7f8fa6', '#40739e'], photo: 'a-nilgai' },
  { id: 'wildebeest', name: 'Wildebeest', bn: 'ওয়াইল্ডবিস্ট', emoji: '🐃', zone: 'antelope', group: 'Mammals', sci: 'Connochaetes taurinus', status: 'Least Concern', diet: 'Herbivore', fact: 'Famous for the great migration across the Serengeti.', grad: ['#8395a7', '#222f3e'], photo: 'a-wildebeest' },
  { id: 'waterbuck', name: 'Waterbuck', bn: 'ওয়াটারবাক', emoji: '🦌', zone: 'antelope', group: 'Mammals', sci: 'Kobus ellipsiprymnus', status: 'Least Concern', diet: 'Herbivore', fact: 'Recognised by the white ring on its rump.', grad: ['#c7a17a', '#7d5a3c'], photo: 'a-waterbuck' },
  { id: 'eland', name: 'Common Eland', bn: 'ইল্যান্ড', emoji: '🦌', zone: 'eland', group: 'Mammals', sci: 'Taurotragus oryx', status: 'Least Concern', diet: 'Herbivore', fact: 'Despite weighing up to 900 kg, elands can jump over 2 metres from a standstill.', grad: ['#e0c3a0', '#a47148'], photo: 'a-eland' },
  { id: 'otter', name: 'Smooth-coated Otter', bn: 'ভোঁদড়', emoji: '🦦', zone: 'otter', group: 'Mammals', sci: 'Lutrogale perspicillata', status: 'Vulnerable', diet: 'Carnivore', fact: 'Fishermen in Bangladesh have trained otters to help fish for centuries.', grad: ['#a68a64', '#5c4033'], photo: 'a-otter' },
  { id: 'guineapig', name: 'Guinea Pig', bn: 'গিনিপিগ', emoji: '🐹', zone: 'kids', group: 'Mammals', sci: 'Cavia porcellus', status: 'Domesticated', diet: 'Herbivore', fact: 'Guinea pigs “popcorn” — jump in the air — when they are happy.', grad: ['#ffeaa7', '#fdcb6e'], photo: 'a-guineapig' },
  { id: 'squirrel', name: 'Northern Palm Squirrel', bn: 'কাঠবিড়ালি', emoji: '🐿️', zone: 'gate', group: 'Mammals', sci: 'Funambulus pennantii', status: 'Least Concern', diet: 'Omnivore', fact: 'A free-living resident — watch for it foraging along the zoo paths.', grad: ['#c8a165', '#7a5a2f'], photo: 'squirrel' },
  { id: 'bear', name: 'Asiatic Black Bear', bn: 'কালো ভালুক', emoji: '🐻', zone: 'bear', group: 'Mammals', sci: 'Ursus thibetanus', status: 'Vulnerable', diet: 'Omnivore', fact: 'Recognised by the cream-coloured “V” mark on its chest.', grad: ['#8d6e63', '#4e342e'], photo: 'a-bear' },
  { id: 'llama', name: 'Llama', bn: 'লামা', emoji: '🦙', zone: 'llama', group: 'Mammals', sci: 'Lama glama', status: 'Domesticated', diet: 'Herbivore', fact: 'Llamas hum to communicate and may spit when annoyed.', grad: ['#e0c3a0', '#a47148'], photo: 'a-llama' },
  { id: 'camel', name: 'Dromedary Camel', bn: 'উট', emoji: '🐪', zone: 'camel', group: 'Mammals', sci: 'Camelus dromedarius', status: 'Domesticated', diet: 'Herbivore', fact: 'Its hump stores fat, not water.', grad: ['#f6d365', '#c49a3a'], photo: 'a-camel' },
  { id: 'ostrich', name: 'Ostrich', bn: 'উটপাখি', emoji: '🦤', zone: 'ostrich', group: 'Birds', sci: 'Struthio camelus', status: 'Least Concern', diet: 'Omnivore', fact: 'The fastest bird on land, running up to 70 km/h.', grad: ['#b2bec3', '#636e72'], photo: 'a-ostrich' },
  { id: 'crocodile', name: 'Mugger Crocodile', bn: 'মিঠা পানির কুমির', emoji: '🐊', zone: 'croc', group: 'Reptiles', sci: 'Crocodylus palustris', status: 'Vulnerable', diet: 'Carnivore', fact: 'Muggers can stay underwater for over an hour.', grad: ['#55efc4', '#00876c'], photo: 'a-crocodile' },
  { id: 'saltcroc', name: 'Estuarine Crocodile', bn: 'লোনা পানির কুমির', emoji: '🐊', zone: 'saltcroc', group: 'Reptiles', sci: 'Crocodylus porosus', status: 'Least Concern', diet: 'Carnivore', fact: 'The largest living reptile; wild ones still live in the Sundarbans.', grad: ['#20bf6b', '#0b6e4f'], photo: 'a-saltcroc' },
  { id: 'python', name: 'Indian Rock Python', bn: 'অজগর', emoji: '🐍', zone: 'snakes', group: 'Reptiles', sci: 'Python molurus', status: 'Near Threatened', diet: 'Carnivore', fact: 'One of the largest snakes of South Asia — it swallows prey whole.', grad: ['#badc58', '#6ab04c'], photo: 'a-python' },
  { id: 'peacock', name: 'Indian Peafowl', bn: 'ময়ূর', emoji: '🦚', zone: 'peafowl', group: 'Birds', sci: 'Pavo cristatus', status: 'Least Concern', diet: 'Omnivore', fact: 'The male’s train can hold more than 200 shimmering feathers.', grad: ['#00b894', '#0984e3'], photo: 'a-peacock' },
  { id: 'flamingo', name: 'Greater Flamingo', bn: 'ফ্লেমিঙ্গো', emoji: '🦩', zone: 'flamingo', group: 'Birds', sci: 'Phoenicopterus roseus', status: 'Least Concern', diet: 'Omnivore', fact: 'Their pink colour comes from pigments in the food they eat.', grad: ['#ff9ff3', '#f368e0'], photo: 'a-flamingo' },
  { id: 'hornbill', name: 'Oriental Pied Hornbill', bn: 'ধনেশ পাখি', emoji: '🐦', zone: 'storks', group: 'Birds', sci: 'Anthracoceros albirostris', status: 'Least Concern', diet: 'Omnivore', fact: 'Females seal themselves inside tree holes while nesting.', grad: ['#fdcb6e', '#e17055'], photo: 'a-hornbill' },
  { id: 'stork', name: 'Black-necked Stork', bn: 'কালোগলা মানিকজোড়', emoji: '🦤', zone: 'storks', group: 'Birds', sci: 'Ephippiorhynchus asiaticus', status: 'Near Threatened', diet: 'Carnivore', fact: 'A tall, glossy wetland bird now very rare in Bangladesh.', grad: ['#74b9ff', '#2d3436'], photo: 'a-stork' },
  { id: 'vulture', name: 'White-rumped Vulture', bn: 'শকুন', emoji: '🦅', zone: 'vulture', group: 'Birds', sci: 'Gyps bengalensis', status: 'Critically Endangered', diet: 'Carnivore', fact: 'Vultures clean the environment by eating carcasses — over 95% have vanished from South Asia.', grad: ['#b2bec3', '#2d3436'], photo: 'a-vulture' },
  { id: 'parakeet', name: 'Rose-ringed Parakeet', bn: 'টিয়া', emoji: '🦜', zone: 'aviary', group: 'Birds', sci: 'Psittacula krameri', status: 'Least Concern', diet: 'Herbivore', fact: 'Can learn to mimic human speech.', grad: ['#55efc4', '#00a86b'], photo: 'a-parakeet' },
  { id: 'duck', name: 'Lesser Whistling Duck', bn: 'সরালি হাঁস', emoji: '🦆', zone: 'northlake', group: 'Birds', sci: 'Dendrocygna javanica', status: 'Least Concern', diet: 'Omnivore', fact: 'Arrives in large flocks every winter — a spectacular sight on the lakes.', grad: ['#74b9ff', '#0984e3'], photo: 'a-duck' },
  { id: 'pelican', name: 'Pelican', bn: 'পেলিকান', emoji: '🦢', zone: 'northlake', group: 'Birds', sci: 'Pelecanus sp.', status: 'Varies', diet: 'Carnivore', fact: 'Its throat pouch can hold more water than its stomach.', grad: ['#dfe6e9', '#74b9ff'], photo: 'pelican-lake' },
];

export const TICKETS = [
  { id: 'adult', label: 'Adult', price: 50, note: 'Age 13+' },
  { id: 'child', label: 'Child', price: 20, note: 'Age 3–12' },
  { id: 'student', label: 'Student Group', price: 20, note: 'Per student, with institution letter' },
];

export const FEEDING_TIMES = [
  { time: '10:30 AM', what: 'Elephant bath & feeding', zone: 'elephant' },
  { time: '11:30 AM', what: 'Hippo feeding', zone: 'hippo' },
  { time: '12:30 PM', what: 'Aviary keeper talk', zone: 'aviary' },
  { time: '3:00 PM', what: 'Big cats feeding (tiger & lion)', zone: 'tiger' },
  { time: '3:30 PM', what: 'Crocodile feeding', zone: 'croc' },
];

// Zones where Google Street View has no 360° panorama nearby (tested); the tour shows a photo instead.
export const NO_STREETVIEW = new Set(['office', 'storks', 'southlake']);
// Zones where a Google Street View panorama was confirmed at this exact position; the tour opens 360° view there by default.
export const STREETVIEW_OK = new Set(['gate', 'wc', 'mosque', 'flamingo', 'otter', 'leopard', 'kids', 'antelope', 'peafowl',
  'snakes', 'baboon', 'tiger', 'sambar', 'vulture', 'chimp', 'rhino', 'elephant']);

export const zoneById = Object.fromEntries(ZONES.map((z) => [z.id, z]));
export const animalById = Object.fromEntries(ANIMALS.map((a) => [a.id, a]));

export const toBnDigits = (s) => String(s).replace(/\d/g, (d) => '০১২৩৪৫৬৭৮৯'[d]);
