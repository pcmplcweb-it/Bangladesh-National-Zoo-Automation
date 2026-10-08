// Master data for the zoo. In production these come from the backend (admin-editable).

export const ZOO = {
  name: 'Bangladesh National Zoo',
  bn: 'বাংলাদেশ জাতীয় চিড়িয়াখানা',
  address: 'Zoo Road, Mirpur-1, Dhaka-1216',
  openDays: [1, 2, 3, 4, 5, 6], // Mon–Sat, closed on Sunday
  openMin: 9 * 60,
  closeMin: 18 * 60,
  lastEntryMin: 17 * 60,
  historyFrom: '2025-01-01', // first day with (demo) history
};

// Visitor categories. "male" / "female" are adults (13+).
export const TICKET_TYPES = [
  { id: 'male', label: 'Adult — Male', short: 'Male', note: 'Age 13+', price: 50 },
  { id: 'female', label: 'Adult — Female', short: 'Female', note: 'Age 13+', price: 50 },
  { id: 'child', label: 'Child', short: 'Children', note: 'Age 3–12 (under 3 free)', price: 20 },
  { id: 'student', label: 'Student', short: 'Students', note: 'Per student, with institution letter', price: 20 },
];
export const TYPE_IDS = TICKET_TYPES.map((t) => t.id);
export const PRICE = Object.fromEntries(TICKET_TYPES.map((t) => [t.id, t.price]));

// Validated categorical palette (fixed order, colour follows the category everywhere).
export const TYPE_COLORS = { male: '#2a78d6', female: '#e8559a', child: '#e3a008', student: '#1f9e74' };
export const FLOW_COLORS = { in: '#2a78d6', out: '#eb6834', inside: '#1f9e74' };

export const GATES = [
  { id: 'G1', name: 'Main Gate (Zoo Road)' },
  { id: 'G2', name: 'North Gate' },
];

export const PAYMENT_METHODS = [
  { id: 'bkash', name: 'bKash', color: '#e2136e', kind: 'wallet' },
  { id: 'nagad', name: 'Nagad', color: '#f6921e', kind: 'wallet' },
  { id: 'rocket', name: 'Rocket', color: '#8c3494', kind: 'wallet' },
  { id: 'card', name: 'Card (Visa / Mastercard / Amex)', color: '#1a1f71', kind: 'card' },
];
export const methodName = (id) => (id === 'cash' ? 'Cash' : PAYMENT_METHODS.find((m) => m.id === id)?.name ?? id);

export const DEPARTMENTS = ['Administration', 'Animal Care', 'Veterinary', 'Ticketing & Gate', 'Security', 'Maintenance'];

export const SHIFTS = {
  morning: { label: 'Morning', start: 7 * 60 + 30, end: 15 * 60 + 30 },
  general: { label: 'General', start: 9 * 60, end: 17 * 60 },
  evening: { label: 'Evening', start: 12 * 60, end: 20 * 60 },
};
export const LATE_GRACE_MIN = 15;

const E = (id, name, gender, dept, designation, shift, weeklyOff, phone, joined) =>
  ({ id, name, gender, dept, designation, shift, weeklyOff, phone, joined });

export const EMPLOYEES = [
  E('E001', 'Dr. Md. Rafiqul Islam', 'M', 'Administration', 'Director (Curator)', 'general', 5, '01711-000101', '2014-03-01'),
  E('E002', 'Nasrin Akter', 'F', 'Administration', 'Deputy Curator', 'general', 5, '01711-000102', '2016-07-12'),
  E('E003', 'Md. Kamrul Hasan', 'M', 'Administration', 'Accounts Officer', 'general', 5, '01711-000103', '2018-01-15'),
  E('E004', 'Farzana Yasmin', 'F', 'Administration', 'HR & Admin Officer', 'general', 5, '01711-000104', '2019-09-01'),
  E('E005', 'Abdul Mannan', 'M', 'Administration', 'Office Assistant', 'general', 5, '01711-000105', '2012-02-20'),
  E('E006', 'Dr. Shahana Parvin', 'F', 'Veterinary', 'Veterinary Surgeon', 'general', 0, '01711-000106', '2015-05-10'),
  E('E007', 'Dr. Tanvir Ahmed', 'M', 'Veterinary', 'Veterinary Officer', 'morning', 3, '01711-000107', '2020-11-02'),
  E('E008', 'Rehana Begum', 'F', 'Veterinary', 'Veterinary Assistant', 'morning', 4, '01711-000108', '2017-08-19'),
  E('E009', 'Md. Jahangir Alam', 'M', 'Animal Care', 'Head Keeper', 'morning', 0, '01711-000109', '2008-04-01'),
  E('E010', 'Habibur Rahman', 'M', 'Animal Care', 'Keeper — Big Cats', 'morning', 1, '01711-000110', '2011-06-15'),
  E('E011', 'Shafiqul Islam', 'M', 'Animal Care', 'Keeper — Elephants', 'morning', 2, '01711-000111', '2009-10-05'),
  E('E012', 'Abul Kalam', 'M', 'Animal Care', 'Keeper — Hippo & Rhino', 'morning', 3, '01711-000112', '2013-01-20'),
  E('E013', 'Mosammat Rina', 'F', 'Animal Care', 'Keeper — Aviary', 'morning', 4, '01711-000113', '2016-03-11'),
  E('E014', 'Delwar Hossain', 'M', 'Animal Care', 'Keeper — Reptiles', 'morning', 0, '01711-000114', '2014-12-01'),
  E('E015', 'Selim Reza', 'M', 'Animal Care', 'Keeper — Primates', 'morning', 1, '01711-000115', '2018-05-23'),
  E('E016', 'Rubina Khatun', 'F', 'Animal Care', 'Keeper — Deer & Antelope', 'morning', 2, '01711-000116', '2019-02-14'),
  E('E017', 'Anwar Hossain', 'M', 'Animal Care', 'Keeper — Giraffe & Zebra', 'morning', 3, '01711-000117', '2015-09-30'),
  E('E018', 'Mizanur Rahman', 'M', 'Animal Care', 'Keeper — Bears', 'morning', 4, '01711-000118', '2017-07-07'),
  E('E019', 'Sumon Mia', 'M', 'Animal Care', 'Food Store Keeper', 'morning', 5, '01711-000119', '2020-01-06'),
  E('E020', 'Taslima Akter', 'F', 'Ticketing & Gate', 'Ticket Counter Supervisor', 'general', 0, '01711-000120', '2016-10-10'),
  E('E021', 'Rakib Hasan', 'M', 'Ticketing & Gate', 'Ticket Clerk', 'general', 1, '01711-000121', '2021-03-15'),
  E('E022', 'Sharmin Sultana', 'F', 'Ticketing & Gate', 'Ticket Clerk', 'general', 2, '01711-000122', '2022-08-01'),
  E('E023', 'Mahmudul Hasan', 'M', 'Ticketing & Gate', 'Gate Checker', 'general', 3, '01711-000123', '2019-12-12'),
  E('E024', 'Nazmul Huda', 'M', 'Ticketing & Gate', 'Gate Checker', 'general', 4, '01711-000124', '2020-06-20'),
  E('E025', 'Ayesha Siddika', 'F', 'Ticketing & Gate', 'Gate Checker', 'general', 0, '01711-000125', '2023-01-09'),
  E('E026', 'Md. Shahidul Islam', 'M', 'Security', 'Security Supervisor', 'general', 0, '01711-000126', '2010-08-08'),
  E('E027', 'Alamgir Kabir', 'M', 'Security', 'Security Guard', 'morning', 1, '01711-000127', '2015-04-04'),
  E('E028', 'Babul Mia', 'M', 'Security', 'Security Guard', 'evening', 2, '01711-000128', '2016-11-21'),
  E('E029', 'Jasim Uddin', 'M', 'Security', 'Security Guard', 'evening', 3, '01711-000129', '2018-02-02'),
  E('E030', 'Kohinur Begum', 'F', 'Security', 'Security Guard', 'general', 4, '01711-000130', '2021-07-17'),
  E('E031', 'Md. Rashed Khan', 'M', 'Maintenance', 'Maintenance Engineer', 'general', 5, '01711-000131', '2014-06-06'),
  E('E032', 'Harun-or-Rashid', 'M', 'Maintenance', 'Electrician', 'general', 0, '01711-000132', '2017-03-03'),
  E('E033', 'Lovely Akter', 'F', 'Maintenance', 'Cleaner', 'morning', 1, '01711-000133', '2019-05-05'),
  E('E034', 'Nurul Amin', 'M', 'Maintenance', 'Cleaner', 'morning', 2, '01711-000134', '2020-09-09'),
  E('E035', 'Monira Khatun', 'F', 'Maintenance', 'Gardener', 'morning', 3, '01711-000135', '2018-10-10'),
  E('E036', 'Kabir Hossain', 'M', 'Maintenance', 'Gardener', 'morning', 4, '01711-000136', '2022-04-04'),
];

export const LEAVE_TYPES = [
  { id: 'casual', name: 'Casual leave', perYear: 10 },
  { id: 'sick', name: 'Sick leave', perYear: 14 },
  { id: 'earned', name: 'Earned leave', perYear: 20 },
  { id: 'maternity', name: 'Maternity leave', perYear: 120, onlyFor: 'F' },
  { id: 'unpaid', name: 'Leave without pay', perYear: 0 },
];
export const leaveTypeName = (id) => LEAVE_TYPES.find((t) => t.id === id)?.name ?? id;

// Daily feeding schedule. days: weekdays the slot applies to (0 = Sunday). Animals are fed every day,
// including Sunday when the zoo is closed to visitors.
const ALL = [0, 1, 2, 3, 4, 5, 6];
const F = (id, animal, emoji, enclosure, time, food, qty, keeperId, days = ALL) =>
  ({ id, animal, emoji, enclosure, time, food, qty, keeperId, days });

export const FEEDING_SCHEDULE = [
  F('F01', 'Asian Elephant', '🐘', 'Elephant shed', '08:00', 'Banana trunk, grass, rice-bran mix', '120 kg', 'E011'),
  F('F02', 'Chital & Sambar Deer', '🦌', 'Deer park', '08:30', 'Green grass, gram, bran', '60 kg', 'E016'),
  F('F03', 'Aviary birds', '🦜', 'Large aviary', '08:30', 'Seed mix, fruits, boiled egg', '12 kg', 'E013'),
  F('F04', 'Rhesus Macaque & Baboon', '🐒', 'Primate house', '09:00', 'Fruits, vegetables, bread', '18 kg', 'E015'),
  F('F05', 'Giraffe & Zebra', '🦒', 'Giraffe yard', '09:30', 'Acacia leaves, lucerne, carrots', '45 kg', 'E017'),
  F('F06', 'Asian Elephant', '🐘', 'Elephant shed', '10:30', 'Bath + sugarcane & fruits', '40 kg', 'E011'),
  F('F07', 'Hippopotamus', '🦛', 'Hippo pool', '11:30', 'Grass, cabbage, pumpkin', '50 kg', 'E012'),
  F('F08', 'Chimpanzee', '🐵', 'Chimp house', '12:00', 'Fruits, milk, boiled rice', '6 kg', 'E015'),
  F('F09', 'Asiatic Black Bear', '🐻', 'Bear den', '13:00', 'Fruits, honey, boiled meat', '8 kg', 'E018'),
  F('F10', 'Aviary birds', '🦜', 'Large aviary', '14:00', 'Seed mix, fruits, fish (pelicans)', '10 kg', 'E013'),
  F('F11', 'Royal Bengal Tiger', '🐅', 'Tiger enclosure', '15:00', 'Beef / chicken (bone-in)', '28 kg', 'E010', [1, 2, 3, 4, 5, 6]),
  F('F12', 'African Lion', '🦁', 'Lion enclosure', '15:00', 'Beef (bone-in)', '24 kg', 'E010', [1, 2, 3, 4, 5, 6]),
  F('F13', 'Mugger Crocodile', '🐊', 'Crocodile pond', '15:30', 'Chicken / fish', '15 kg', 'E014', [3, 6]),
  F('F14', 'Python & snakes', '🐍', 'Reptile house', '16:00', 'Live poultry / rodents', '4 kg', 'E014', [1, 4]),
  F('F15', 'Greater One-horned Rhino', '🦏', 'Rhino yard', '16:00', 'Grass, hay, fruits', '45 kg', 'E012'),
  F('F16', 'Chital & Sambar Deer', '🦌', 'Deer park', '16:30', 'Green grass, gram', '50 kg', 'E016'),
  F('F17', 'Asian Elephant', '🐘', 'Elephant shed', '17:00', 'Banana trunk, rice-bran mix', '100 kg', 'E011'),
];
// Feeding within ±15 min of the scheduled time is on time; up to 60 min late is "late"; later than that is "missed".
export const FEED_ON_TIME_MIN = 15;
export const FEED_MISSED_AFTER_MIN = 60;

// Demo sign-in accounts (frontend only — replace with real authentication).
export const ROLES = {
  admin: { label: 'Central Management', home: '/app' },
  counter: { label: 'Ticket Counter', home: '/app/counter' },
  gate: { label: 'Gate Staff', home: '/app/gate' },
  keeper: { label: 'Animal Keeper', home: '/app/feeding' },
  hr: { label: 'HR Officer', home: '/app/attendance' },
};
export const USERS = [
  { username: 'admin', password: 'admin123', name: 'Dr. Md. Rafiqul Islam', role: 'admin', employeeId: 'E001' },
  { username: 'counter', password: 'counter123', name: 'Taslima Akter', role: 'counter', employeeId: 'E020' },
  { username: 'gate', password: 'gate123', name: 'Mahmudul Hasan', role: 'gate', employeeId: 'E023' },
  { username: 'keeper', password: 'keeper123', name: 'Md. Jahangir Alam', role: 'keeper', employeeId: 'E009' },
  { username: 'hr', password: 'hr123', name: 'Farzana Yasmin', role: 'hr', employeeId: 'E004' },
];

// Which roles may open which module.
export const ACCESS = {
  dashboard: ['admin'],
  reports: ['admin'],
  counter: ['admin', 'counter'],
  tickets: ['admin', 'counter', 'gate'],
  gate: ['admin', 'gate'],
  feeding: ['admin', 'keeper'],
  feedingSchedule: ['admin', 'keeper'],
  employees: ['admin', 'hr'],
  attendance: ['admin', 'hr'],
  leave: ['admin', 'hr', 'counter', 'gate', 'keeper'],
};
