import { CITY_MAP } from './constants'
import { daysFromNow, hoursFromNow } from './dateUtils'
import type { EventItem, Profile, Reminder } from './types'

/** Bump this when the sample data changes so existing local storage is refreshed. */
export const SEED_VERSION = 4

const img = (id: string) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=900&q=75`

type Seed = Partial<EventItem> &
  Pick<
    EventItem,
    'title' | 'category' | 'city' | 'starts_at' | 'venue_name' | 'description'
  >

export interface SeedAccount {
  email: string
  password: string
  fullName: string
  interests: string[]
  isAdmin: boolean
  role: string
}

export const SEED_ACCOUNTS: SeedAccount[] = [
  {
    email: 'aanya@utsav.in',
    password: 'utsav2026',
    fullName: 'Aanya Sharma',
    interests: ['music', 'food', 'culture', 'arts'],
    isAdmin: false,
    role: 'Attendee — favourites, reminders & recommendations',
  },
  {
    email: 'rohan@utsav.in',
    password: 'utsav2026',
    fullName: 'Rohan Mehta',
    interests: ['tech', 'sports'],
    isAdmin: false,
    role: 'Organiser — approved, pending & rejected submissions',
  },
  {
    email: 'admin@utsav.in',
    password: 'utsav2026',
    fullName: 'Meera Iyer',
    interests: ['culture', 'community'],
    isAdmin: true,
    role: 'Admin — approve or reject submissions',
  },
]

export function localUserId(email: string) {
  return `local:${email.toLowerCase()}`
}

const organiser = localUserId('rohan@utsav.in')

/** Readable, stable IDs that look like real event slugs in detail URLs. */
export function eventId(title: string) {
  return `evt-${title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')}`
}

function seed(n: number, data: Seed): EventItem {
  const city = CITY_MAP[data.city]
  // Small deterministic offsets so pins in the same city don't stack on top
  // of each other in the map view.
  const jitter = (((n * 37) % 13) - 6) * 0.006
  return {
    id: eventId(data.title),
    venue_address: `${data.venue_name}, ${data.city}`,
    latitude: (city?.lat ?? 22.5) + jitter,
    longitude: (city?.lng ?? 79) + jitter * 0.9,
    ends_at: null,
    image_url: null,
    registration_url: `https://example.com/register/${n}`,
    organizer_name: 'Utsav Community',
    is_free: true,
    price: 0,
    status: 'approved',
    submitted_by: null,
    created_at: daysFromNow(-2 - (n % 8)),
    ...data,
    city: data.city,
  }
}

/** Approved events — visible in list, calendar, map and details. */
export const SEED_EVENTS: EventItem[] = [
  seed(1, {
    title: 'Sunburn Arena: Live in Mumbai',
    category: 'music',
    city: 'Mumbai',
    starts_at: daysFromNow(2, 19),
    venue_name: 'Jio World Garden',
    description:
      'Three hours of non-stop electronic music under the open sky, with international DJs, a spectacular light show and food trucks. One of the biggest nights on the city calendar.',
    image_url: img('photo-1470225620780-dba8ba36b745'),
    organizer_name: 'Sunburn Live',
    is_free: false,
    price: 2499,
    registration_url: 'https://www.sunburn.in/',
  }),
  seed(2, {
    title: 'Street Food Carnival',
    category: 'food',
    city: 'New Delhi',
    starts_at: daysFromNow(1, 12),
    venue_name: 'India Habitat Centre',
    description:
      'Taste your way through 40+ stalls serving regional favourites from every corner of India, with live cooking shows and a chai-tasting corner.',
    image_url: img('photo-1504674900247-0877df9cc836'),
    organizer_name: 'Delhi Food Collective',
    price: 300,
    is_free: false,
  }),
  seed(3, {
    title: 'React & AI Summit 2026',
    category: 'tech',
    city: 'Bengaluru',
    starts_at: daysFromNow(4, 9, 30),
    venue_name: 'Bangalore International Centre',
    description:
      'A full day of talks and hands-on workshops on modern React, AI-assisted development and building products for a billion users.',
    image_url: img('photo-1540575467063-178a50c2df87'),
    organizer_name: 'DevCircle India',
    price: 1500,
    is_free: false,
  }),
  seed(4, {
    title: 'Navratri Garba Night',
    category: 'culture',
    city: 'Ahmedabad',
    starts_at: daysFromNow(3, 19, 30),
    venue_name: 'Sardar Patel Stadium Grounds',
    description:
      'Nine nights of colour, dandiya and devotion. Live garba groups, traditional attire and folk food stalls come together for an unforgettable celebration.',
    image_url: img('photo-1531058020387-3be344556be6'),
    organizer_name: 'Ahmedabad Cultural Trust',
  }),
  seed(5, {
    title: 'Weekend Cricket League Finals',
    category: 'sports',
    city: 'Chennai',
    starts_at: daysFromNow(5, 16),
    venue_name: 'YMCA Grounds',
    description:
      'The city’s best amateur cricket teams battle it out for the trophy. Bring your friends, grab a seat and cheer for your neighbourhood side.',
    image_url: img('photo-1461896836934-ffe607ba8211'),
    organizer_name: 'Chennai Sports Club',
    price: 100,
    is_free: false,
  }),
  seed(6, {
    title: 'Contemporary Art Walk',
    category: 'arts',
    city: 'Kolkata',
    starts_at: daysFromNow(6, 11),
    venue_name: 'Experimenter Gallery',
    description:
      'A guided walk through emerging contemporary artists from Bengal, with artist talks, a live painting session and a closing reception.',
    image_url: img('photo-1513364776144-60967b0f800f'),
    organizer_name: 'Kolkata Art Forum',
  }),
  seed(7, {
    title: 'Hyderabad Food & Wine Fest',
    category: 'food',
    city: 'Hyderabad',
    starts_at: daysFromNow(8, 13),
    venue_name: 'Hitex Exhibition Centre',
    description:
      'Celebrate the flavours of the Deccan with biryani tastings, fusion menus and masterclasses from celebrated chefs.',
    image_url: img('photo-1414235077428-338989a2e8c0'),
    organizer_name: 'Hyderabad Hospitality Group',
    price: 800,
    is_free: false,
  }),
  seed(8, {
    title: 'Indie Music Evening',
    category: 'music',
    city: 'Pune',
    starts_at: daysFromNow(2, 20),
    venue_name: 'High Street Cafe',
    description:
      'An intimate evening with four of Pune’s favourite indie acts. Acoustic sets, original songwriting and great coffee.',
    image_url: img('photo-1493225457124-a3eb161ffa5f'),
    organizer_name: 'Pune Music Society',
    price: 400,
    is_free: false,
  }),
  seed(9, {
    title: 'Jaipur Literature Circle',
    category: 'culture',
    city: 'Jaipur',
    starts_at: daysFromNow(9, 17),
    venue_name: 'Hotel Clarks Amer',
    description:
      'Authors, poets and storytellers gather for readings and conversations against the backdrop of the Pink City.',
    image_url: img('photo-1524995997946-a1c2e315a42f'),
    organizer_name: 'Jaipur Lit Circle',
  }),
  seed(10, {
    title: 'Kochi Backwater Cleanup',
    category: 'community',
    city: 'Kochi',
    starts_at: daysFromNow(3, 7),
    venue_name: 'Marine Drive',
    description:
      'Join local volunteers for a morning of cleaning the waterfront, followed by a community breakfast. All supplies provided.',
    image_url: img('photo-1529156069898-49953e39b3ac'),
    organizer_name: 'Kochi Green Movement',
  }),
  seed(11, {
    title: 'Goa Sunset Beach Party',
    category: 'music',
    city: 'Goa',
    starts_at: daysFromNow(6, 17, 30),
    venue_name: 'Anjuna Beach',
    description:
      'Dance barefoot on the sand as the sun goes down, with a curated playlist of house and chill tracks, local food and cocktails.',
    image_url: img('photo-1507525428034-b723cf961d3e'),
    organizer_name: 'Goa Beach Collective',
    price: 1200,
    is_free: false,
  }),
  seed(12, {
    title: 'Startup Founders Meetup',
    category: 'tech',
    city: 'Mumbai',
    starts_at: daysFromNow(7, 18, 30),
    venue_name: 'BKC Incubation Hub',
    description:
      'Short talks, honest founder stories and informal networking over snacks. Open to founders, builders and the curious.',
    image_url: img('photo-1518770660439-4636190af475'),
    organizer_name: 'Mumbai Founders Network',
  }),
  seed(13, {
    title: 'Classical Dance Festival',
    category: 'culture',
    city: 'Lucknow',
    starts_at: daysFromNow(11, 18),
    venue_name: 'Bhatkhande Music Institute',
    description:
      'An evening of Kathak and Hindustani classical music by renowned artists, celebrating the living heritage of Awadh.',
    image_url: img('photo-1531058020387-3be344556be6'),
    organizer_name: 'Awadh Sangeet Sabha',
    price: 500,
    is_free: false,
  }),
  seed(14, {
    title: 'City Marathon 10K',
    category: 'sports',
    city: 'Chandigarh',
    starts_at: daysFromNow(12, 6),
    venue_name: 'Sector 17 Plaza',
    description:
      'A scenic 10K run through the city’s tree-lined avenues, with categories for all ages and a post-run breakfast.',
    image_url: img('photo-1552674605-db6ffd4facb5'),
    organizer_name: 'Chandigarh Runners Club',
    price: 700,
    is_free: false,
  }),
  seed(15, {
    title: 'Pottery & Clay Workshop',
    category: 'arts',
    city: 'Bengaluru',
    starts_at: daysFromNow(5, 15),
    venue_name: 'The Clay Studio',
    description:
      'Get your hands dirty in a relaxed wheel-throwing workshop. All materials included, and you take home what you make.',
    image_url: img('photo-1565193566173-7a0ee3dbe261'),
    organizer_name: 'The Clay Studio',
    price: 1600,
    is_free: false,
  }),
  seed(16, {
    title: 'Diwali Community Feast',
    category: 'community',
    city: 'Indore',
    starts_at: daysFromNow(14, 18),
    venue_name: 'Nehru Park',
    description:
      'A neighbourhood celebration with diyas, sweets, folk performances and a community feast open to everyone.',
    image_url: img('photo-1583939003579-730e3918a45a'),
    organizer_name: 'Indore Samaj Seva',
  }),
  seed(17, {
    title: 'Jazz & Chai Session',
    category: 'music',
    city: 'Kolkata',
    starts_at: daysFromNow(10, 19),
    venue_name: 'College Street Cafe',
    description:
      'A cosy evening of live jazz, poetry and endless chai in the heart of College Street.',
    image_url: img('photo-1511192336575-5a79af67a629'),
    organizer_name: 'Kolkata Jazz Society',
    price: 250,
    is_free: false,
  }),
  seed(18, {
    title: 'AI for Everyone Workshop',
    category: 'tech',
    city: 'Hyderabad',
    starts_at: daysFromNow(13, 10),
    venue_name: 'IIIT Campus',
    description:
      'A beginner-friendly, hands-on introduction to everyday AI tools with practical exercises you can use at work.',
    image_url: img('photo-1677442136019-21780ecad995'),
    organizer_name: 'Hyderabad Tech Guild',
  }),
  seed(19, {
    title: 'Bengaluru Film Festival',
    category: 'arts',
    city: 'Bengaluru',
    starts_at: daysFromNow(18, 14),
    venue_name: 'Ravindra Kalakshetra',
    description:
      'Screenings of independent Indian films, director Q&As and a closing night awards ceremony.',
    image_url: img('photo-1489599849927-2ee91cede3ba'),
    organizer_name: 'Bengaluru Film Society',
    price: 600,
    is_free: false,
  }),
  seed(20, {
    title: 'Morning Yoga & Breakfast',
    category: 'community',
    city: 'New Delhi',
    starts_at: daysFromNow(4, 7),
    venue_name: 'Lodhi Gardens',
    description:
      'Start the day with a guided yoga session in the gardens, followed by a light breakfast and informal conversation.',
    image_url: img('photo-1544367567-0f2fcb009e0b'),
    organizer_name: 'Delhi Wellness Circle',
  }),
  seed(21, {
    title: 'Badminton Open Cup',
    category: 'sports',
    city: 'Pune',
    starts_at: daysFromNow(15, 9),
    venue_name: 'Balewadi Sports Complex',
    description:
      'Singles and doubles categories for all skill levels, with prizes and refreshments for everyone.',
    image_url: img('photo-1626224583764-f87db24ac4ea'),
    organizer_name: 'Pune Badminton Association',
    price: 350,
    is_free: false,
  }),
  seed(22, {
    title: 'Kathakali & Rustic Flavours',
    category: 'culture',
    city: 'Kochi',
    starts_at: daysFromNow(20, 17),
    venue_name: 'Kerala Kathakali Centre',
    description:
      'Watch a traditional Kathakali performance and enjoy a tasting menu of authentic Kerala dishes afterwards.',
    image_url: img('photo-1509678663083-623e30d6f3c7'),
    organizer_name: 'Kerala Cultural Trust',
    price: 900,
    is_free: false,
  }),
  seed(23, {
    title: 'Carnatic Music Evening',
    category: 'music',
    city: 'Chennai',
    starts_at: daysFromNow(6, 18, 30),
    venue_name: 'Music Academy',
    description:
      'An evening of soulful Carnatic vocal and instrumental performances by rising artists, followed by a small dinner.',
    image_url: img('photo-1516280440614-37939bbacd81'),
    organizer_name: 'Chennai Music Academy',
    price: 450,
    is_free: false,
    submitted_by: organiser,
  }),
  seed(24, {
    title: 'Dosa & Filter Coffee Crawl',
    category: 'food',
    city: 'Bengaluru',
    starts_at: hoursFromNow(5),
    venue_name: 'Malleshwaram',
    description:
      'A guided evening crawl through the old coffee houses of Malleshwaram, tasting iconic dosas and filter coffee along the way.',
    image_url: img('photo-1555939594-58d7cb561ad1'),
    organizer_name: 'Bengaluru Food Trails',
    price: 550,
    is_free: false,
  }),
  seed(25, {
    title: 'Rooftop Acoustic Session',
    category: 'music',
    city: 'Jaipur',
    starts_at: hoursFromNow(7),
    venue_name: 'The Rooftop, Hauz Rani',
    description:
      'Unplug with an easygoing acoustic set under the Pink City sky. Limited seats, chai and snacks included.',
    image_url: img('photo-1514525253161-7a46d19cd819'),
    organizer_name: 'Jaipur Live',
  }),
  seed(26, {
    title: 'Weekend Pottery Market',
    category: 'arts',
    city: 'Mumbai',
    starts_at: daysFromNow(6, 11),
    venue_name: 'Kala Ghoda',
    description:
      'Local ceramicists open their studios for a weekend of handmade pottery, workshops and conversations with the makers.',
    image_url: img('photo-1536924940846-227afb31e2a5'),
    organizer_name: 'Kala Ghoda Arts Collective',
  }),
  seed(27, {
    title: 'Cycling for Clean Air',
    category: 'community',
    city: 'Pune',
    starts_at: daysFromNow(9, 6, 30),
    venue_name: 'Saras Baug',
    description:
      'A relaxed group ride through the city to spread awareness about clean air, ending with a healthy breakfast.',
    image_url: img('photo-1528605248644-14dd04022da1'),
    organizer_name: 'Pune Cycle Chai',
  }),
  seed(28, {
    title: 'Marathi Theatre Night',
    category: 'culture',
    city: 'Mumbai',
    starts_at: daysFromNow(12, 19),
    venue_name: 'Prithvi Theatre',
    description:
      'A celebrated Marathi play with English surtitles, followed by a conversation with the cast.',
    image_url: img('photo-1503095396549-807759245b35'),
    organizer_name: 'Prithvi Theatre',
    price: 500,
    is_free: false,
  }),
  seed(29, {
    title: 'Football Futsal Jam',
    category: 'sports',
    city: 'Kolkata',
    starts_at: daysFromNow(8, 18),
    venue_name: 'East Bengal Ground',
    description:
      'Fast-paced 5-a-side futsal, mixed teams and a friendly crowd. Bring your boots and play a few games.',
    image_url: img('photo-1519861531473-9200262188bf'),
    organizer_name: 'Kolkata Football Circle',
    price: 200,
    is_free: false,
  }),
  seed(30, {
    title: 'Data Science Breakfast Club',
    category: 'tech',
    city: 'New Delhi',
    starts_at: daysFromNow(10, 8, 30),
    venue_name: 'The Engineers Cafe',
    description:
      'A small-group morning meetup to swap ideas on data, ML and the tools we use. Short talk followed by open discussion.',
    image_url: img('photo-1559223607-a43c990c692c'),
    organizer_name: 'Delhi Data Club',
  }),
  seed(31, {
    title: 'Skit & Sketch Comedy Night',
    category: 'arts',
    city: 'Hyderabad',
    starts_at: daysFromNow(7, 20),
    venue_name: 'The Habitat Cafe',
    description:
      'An open-mic style evening of sketches, improv and stand-up from some of the city’s sharpest new comedians.',
    image_url: img('photo-1507924538820-ede94a04019d'),
    organizer_name: 'Hyderabad Laughs',
    price: 350,
    is_free: false,
  }),
  seed(32, {
    title: 'Heritage Walk & Chai',
    category: 'culture',
    city: 'Lucknow',
    starts_at: daysFromNow(5, 16),
    venue_name: 'Bara Imambara',
    description:
      'A story-filled walk through old Lucknow’s architecture and lanes, ending with a cup of chai at a heritage cafe.',
    image_url: img('photo-1594766155110-18831cf0328b'),
    organizer_name: 'Lucknow Heritage Trust',
  }),

  seed(33, {
    title: 'Bollywood Retro Night',
    category: 'music',
    city: 'Mumbai',
    starts_at: daysFromNow(9, 20),
    venue_name: 'Jio World Drive',
    description:
      'A high-energy night of 90s and 2000s Bollywood hits with a live band, dance floor and retro photo booth.',
    image_url: img('photo-1459749411175-04bf5292ceea'),
    organizer_name: 'Mumbai Music Nights',
    price: 1200,
    is_free: false,
  }),
  seed(34, {
    title: 'Kala Ghoda Street Art Tour',
    category: 'arts',
    city: 'Mumbai',
    starts_at: hoursFromNow(28),
    venue_name: 'Kala Ghoda',
    description:
      'A guided walk past the neighbourhood’s best murals and installations, with stories from the artists behind them.',
    image_url: img('photo-1531913764164-f85c52e6e654'),
    organizer_name: 'Mumbai Art Walks',
  }),
  seed(35, {
    title: 'Hauz Khas Vintage Market',
    category: 'arts',
    city: 'New Delhi',
    starts_at: daysFromNow(3, 11),
    venue_name: 'Hauz Khas Village',
    description:
      'Vintage clothing, vinyl records, handmade jewellery and a flea market vibe beside the old water tank.',
    image_url: img('photo-1521334884684-d80222895322'),
    organizer_name: 'Delhi Vintage Collective',
  }),
  seed(36, {
    title: 'Delhi Half Marathon',
    category: 'sports',
    city: 'New Delhi',
    starts_at: daysFromNow(18, 6),
    venue_name: 'India Gate Lawns',
    description:
      'A flat, scenic 21K route through the capital with 5K and 10K categories, hydration stations and a finisher breakfast.',
    image_url: img('photo-1552674605-db6ffd4facb5'),
    organizer_name: 'Delhi Runners Association',
    price: 1200,
    is_free: false,
  }),
  seed(37, {
    title: 'Cubbon Park Sunset Run',
    category: 'sports',
    city: 'Bengaluru',
    starts_at: daysFromNow(2, 6, 30),
    venue_name: 'Cubbon Park',
    description:
      'An easy 5K through the green heart of the city, open to all paces and followed by coffee with the group.',
    image_url: img('photo-1485965120184-e220f721d03e'),
    organizer_name: 'Bengaluru Running Club',
  }),
  seed(38, {
    title: 'Sabarmati Riverfront Food Fest',
    category: 'food',
    city: 'Ahmedabad',
    starts_at: daysFromNow(2, 13),
    venue_name: 'Sabarmati Riverfront',
    description:
      'A riverside spread of Gujarati thalis, street snacks and sweet shops, with live music and family picnic areas.',
    image_url: img('photo-1555396273-367ea4eb4db5'),
    organizer_name: 'Ahmedabad Food Guild',
    price: 250,
    is_free: false,
  }),
  seed(39, {
    title: 'Gujarati Folk Music Evening',
    category: 'music',
    city: 'Ahmedabad',
    starts_at: daysFromNow(7, 19),
    venue_name: 'BHAI Hall',
    description:
      'An intimate concert of folk songs and bhajans performed by a small ensemble of traditional musicians.',
    image_url: img('photo-1516280440614-37939bbacd81'),
    organizer_name: 'Gujarat Folk Foundation',
    price: 300,
    is_free: false,
  }),
  seed(40, {
    title: 'Kite Flying Festival',
    category: 'culture',
    city: 'Ahmedabad',
    starts_at: daysFromNow(13, 10),
    venue_name: 'Sardar Patel Stadium Grounds',
    description:
      'Colour-coded skies as flyers of all ages take to the grounds with kites, manjha and plenty of chai.',
    image_url: img('photo-1492684223066-81342ee5ff30'),
    organizer_name: 'Ahmedabad Kite Club',
  }),
  seed(41, {
    title: 'Startup Saturday Ahmedabad',
    category: 'tech',
    city: 'Ahmedabad',
    starts_at: daysFromNow(6, 10),
    venue_name: 'Ahmedabad One Mall',
    description:
      'A relaxed morning of founder stories, product showcases and open networking for anyone building something new.',
    image_url: img('photo-1519389950473-47ba0277781c'),
    organizer_name: 'Ahmedabad Founders Forum',
  }),
  seed(42, {
    title: 'Marina Beach Food Fiesta',
    category: 'food',
    city: 'Chennai',
    starts_at: daysFromNow(4, 16),
    venue_name: 'Marina Beach',
    description:
      'An evening by the sea with dosa counters, filter coffee stalls and live sessions from local chefs.',
    image_url: img('photo-1547592180-85f173990554'),
    organizer_name: 'Chennai Food Circle',
    price: 200,
    is_free: false,
  }),
  seed(43, {
    title: 'Bharatanatyam at Dawn',
    category: 'culture',
    city: 'Chennai',
    starts_at: daysFromNow(8, 6, 30),
    venue_name: 'Kalakshetra Foundation',
    description:
      'A sunrise performance of classical Bharatanatyam followed by a short conversation with the dancers.',
    image_url: img('photo-1549476464-37392f717541'),
    organizer_name: 'Kalakshetra Arts Trust',
    price: 400,
    is_free: false,
  }),
  seed(44, {
    title: 'Chennai Tech Coffee Meetup',
    category: 'tech',
    city: 'Chennai',
    starts_at: daysFromNow(5, 9),
    venue_name: 'Tidel Park',
    description:
      'Coffee, short talks and honest conversation about engineering careers and side projects in the city.',
    image_url: img('photo-1497366754035-f200968a6e72'),
    organizer_name: 'Chennai Tech Community',
  }),
  seed(45, {
    title: 'City Triathlon Sprint',
    category: 'sports',
    city: 'Chennai',
    starts_at: daysFromNow(22, 6),
    venue_name: 'Covelong Beach',
    description:
      'A beginner-friendly swim, bike and run sprint with team categories and a post-race breakfast by the beach.',
    image_url: img('photo-1530549387789-4c1017266635'),
    organizer_name: 'Chennai Multisport Club',
    price: 1500,
    is_free: false,
  }),
  seed(46, {
    title: 'Durga Puja Artisan Bazaar',
    category: 'arts',
    city: 'Kolkata',
    starts_at: daysFromNow(12, 11),
    venue_name: 'Park Street',
    description:
      'Handmade idols, terracotta crafts, jewellery and seasonal sweets from the artisans who make the festival come alive.',
    image_url: img('photo-1579783902614-a3fb3927b6a5'),
    organizer_name: 'Kolkata Craft Collective',
  }),
  seed(47, {
    title: 'Howrah Bridge Photo Walk',
    category: 'arts',
    city: 'Kolkata',
    starts_at: hoursFromNow(20),
    venue_name: 'Howrah Bridge',
    description:
      'A golden-hour walk for photographers along the riverfront, with tips from a local street photographer.',
    image_url: img('photo-1452587925148-ce544e77e70d'),
    organizer_name: 'Kolkata Photo Society',
  }),
  seed(48, {
    title: 'Biryani & Bazaar Walk',
    category: 'food',
    city: 'Hyderabad',
    starts_at: daysFromNow(3, 17),
    venue_name: 'Charminar',
    description:
      'A guided tasting route through old-city biryani kitchens, pearl markets and a final cup of Irani chai.',
    image_url: img('photo-1563379091339-03b21ab4a4f8'),
    organizer_name: 'Hyderabad Food Trails',
    price: 650,
    is_free: false,
  }),
  seed(49, {
    title: 'Telugu Film Score Night',
    category: 'music',
    city: 'Hyderabad',
    starts_at: daysFromNow(14, 19),
    venue_name: 'Ravindra Bharathi',
    description:
      'An orchestra and vocalists perform beloved Telugu film scores, with a short talk about the composers behind them.',
    image_url: img('photo-1470225620780-dba8ba36b745'),
    organizer_name: 'Hyderabad Music Forum',
    price: 700,
    is_free: false,
  }),
  seed(50, {
    title: 'Classical Vocal Evening',
    category: 'music',
    city: 'Pune',
    starts_at: daysFromNow(10, 18),
    venue_name: 'Bharat Natya Mandir',
    description:
      'A candlelit recital of Hindustani classical bandishes by an award-winning young vocalist from the city.',
    image_url: img('photo-1511192336575-5a79af67a629'),
    organizer_name: 'Pune Sangeet Sabha',
    price: 350,
    is_free: false,
  }),
  seed(51, {
    title: 'DIY Robotics Workshop',
    category: 'tech',
    city: 'Pune',
    starts_at: daysFromNow(16, 10),
    venue_name: 'COEP Campus',
    description:
      'A hands-on session building a small line-following robot. Components are provided and no prior experience is needed.',
    image_url: img('photo-1485827404703-89b55fcc595e'),
    organizer_name: 'Pune Robotics Lab',
    price: 900,
    is_free: false,
  }),
  seed(52, {
    title: 'Amber Fort Sound & Light',
    category: 'culture',
    city: 'Jaipur',
    starts_at: daysFromNow(4, 19),
    venue_name: 'Amber Fort',
    description:
      'The historic fort comes alive with lighting, narration and music telling the story of the Rajput courts.',
    image_url: img('photo-1531058020387-3be344556be6'),
    organizer_name: 'Rajasthan Heritage Trust',
    price: 500,
    is_free: false,
  }),
  seed(53, {
    title: 'Rajasthani Puppet Show',
    category: 'arts',
    city: 'Jaipur',
    starts_at: daysFromNow(11, 17),
    venue_name: 'Raj Mandir Hall',
    description:
      'A colourful puppet performance of folk tales and royal legends, with a short workshop for young visitors afterwards.',
    image_url: img('photo-1513519245088-0e12902e5a38'),
    organizer_name: 'Jaipur Puppet Theatre',
    price: 250,
    is_free: false,
  }),
  seed(54, {
    title: 'Pink City Food Walk',
    category: 'food',
    city: 'Jaipur',
    starts_at: hoursFromNow(9),
    venue_name: 'Johari Bazaar',
    description:
      'Sample kachori, lassi and sweets while wandering the old market lanes with a local food guide.',
    image_url: img('photo-1555939594-58d7cb561ad1'),
    organizer_name: 'Jaipur Food Walks',
    price: 450,
    is_free: false,
  }),
  seed(55, {
    title: 'Fort Kochi Seafood Fest',
    category: 'food',
    city: 'Kochi',
    starts_at: daysFromNow(5, 13),
    venue_name: 'Fort Kochi',
    description:
      'Coastal kitchens serve fresh seafood, coconut curries and toddy, with cooking sessions by local chefs.',
    image_url: img('photo-1517248135467-4c7edcad34c4'),
    organizer_name: 'Kochi Coastal Kitchens',
    price: 600,
    is_free: false,
  }),
  seed(56, {
    title: 'Kathakali Makeup Workshop',
    category: 'arts',
    city: 'Kochi',
    starts_at: daysFromNow(14, 10),
    venue_name: 'Kerala Kathakali Centre',
    description:
      'Learn how the elaborate makeup and costumes come together, then watch a short performance in full costume.',
    image_url: img('photo-1509678663083-623e30d6f3c7'),
    organizer_name: 'Kerala Cultural Trust',
    price: 800,
    is_free: false,
  }),
  seed(57, {
    title: 'Backwater Birdwatching',
    category: 'community',
    city: 'Kochi',
    starts_at: daysFromNow(19, 6, 30),
    venue_name: 'Kumarakom Bird Sanctuary',
    description:
      'A small-group morning boat ride through the backwaters with a naturalist spotting kingfishers and herons.',
    image_url: img('photo-1529156069898-49953e39b3ac'),
    organizer_name: 'Kerala Nature Circle',
    price: 1000,
    is_free: false,
  }),
  seed(58, {
    title: 'Anjuna Flea Market',
    category: 'arts',
    city: 'Goa',
    starts_at: daysFromNow(3, 10),
    venue_name: 'Anjuna Beach',
    description:
      'A sprawling beachside market of handicrafts, clothing, jewellery and food stalls, open through the afternoon.',
    image_url: img('photo-1507525428034-b723cf961d3e'),
    organizer_name: 'Goa Market Collective',
  }),
  seed(59, {
    title: 'Goa Jazz by the Sea',
    category: 'music',
    city: 'Goa',
    starts_at: daysFromNow(11, 19),
    venue_name: 'Candolim Beach',
    description:
      'An evening of laid-back jazz with a trio on the sand, sunset snacks and a relaxed crowd.',
    image_url: img('photo-1516450360452-9312f5e86fc7'),
    organizer_name: 'Goa Jazz Club',
    price: 900,
    is_free: false,
  }),
  seed(60, {
    title: 'Sunrise SUP & Breakfast',
    category: 'sports',
    city: 'Goa',
    starts_at: daysFromNow(7, 6),
    venue_name: 'Calangute Beach',
    description:
      'A calm stand-up paddle session at first light with a qualified instructor, followed by breakfast on the shore.',
    image_url: img('photo-1502680390469-be75c86b636f'),
    organizer_name: 'Goa Water Sports',
    price: 1800,
    is_free: false,
  }),
  seed(61, {
    title: 'Goa Food & Spice Tour',
    category: 'food',
    city: 'Goa',
    starts_at: daysFromNow(16, 11),
    venue_name: 'Panaji',
    description:
      'A walking tour of old Panaji tasting local snacks and learning about the spices that shape Goan cooking.',
    image_url: img('photo-1414235077428-338989a2e8c0'),
    organizer_name: 'Goa Food Trails',
    price: 750,
    is_free: false,
  }),
  seed(62, {
    title: 'Awadhi Biryani Tasting',
    category: 'food',
    city: 'Lucknow',
    starts_at: daysFromNow(6, 19),
    venue_name: 'Hazratganj',
    description:
      'A tasting plate of three classic Awadhi biryanis with kebabs and a short history of the city’s kitchens.',
    image_url: img('photo-1504674900247-0877df9cc836'),
    organizer_name: 'Lucknow Food Society',
    price: 500,
    is_free: false,
  }),
  seed(63, {
    title: 'Chikankari Embroidery Workshop',
    category: 'arts',
    city: 'Lucknow',
    starts_at: daysFromNow(15, 11),
    venue_name: 'Chowk',
    description:
      'Learn the basic stitches of Lucknow’s signature chikankari from an artisan and stitch a small piece to take home.',
    image_url: img('photo-1536924940846-227afb31e2a5'),
    organizer_name: 'Chikankari Craft Guild',
    price: 700,
    is_free: false,
  }),
  seed(64, {
    title: 'Ghazal Evening at Chowk',
    category: 'music',
    city: 'Lucknow',
    starts_at: daysFromNow(20, 19),
    venue_name: 'Chowk',
    description:
      'An intimate mehfil of ghazals and poetry in a heritage courtyard, with tea and sweets served throughout.',
    image_url: img('photo-1514525253161-7a46d19cd819'),
    organizer_name: 'Awadh Sangeet Sabha',
    price: 450,
    is_free: false,
  }),
  seed(65, {
    title: 'Sukhna Lake Boating & Brunch',
    category: 'community',
    city: 'Chandigarh',
    starts_at: daysFromNow(2, 9),
    venue_name: 'Sukhna Lake',
    description:
      'A relaxed morning of paddle boating followed by a brunch potluck at the lakeside lawns.',
    image_url: img('photo-1527529482837-4698179dc6ce'),
    organizer_name: 'Chandigarh Community Club',
  }),
  seed(66, {
    title: 'Punjabi Folk Dance Night',
    category: 'culture',
    city: 'Chandigarh',
    starts_at: daysFromNow(10, 19),
    venue_name: 'Sector 21 Community Hall',
    description:
      'Bhangra and gidda performances, a live dhol and a dance floor for everyone who wants to join in.',
    image_url: img('photo-1508700115892-45ecd05ae2ad'),
    organizer_name: 'Punjab Cultural Forum',
    price: 300,
    is_free: false,
  }),
  seed(67, {
    title: 'Chandigarh Design Meetup',
    category: 'tech',
    city: 'Chandigarh',
    starts_at: daysFromNow(13, 17),
    venue_name: 'Chandigarh IT Park',
    description:
      'Short talks on product design and design systems, followed by portfolio reviews over coffee.',
    image_url: img('photo-1531297484001-80022131f5a1'),
    organizer_name: 'Chandigarh Designers',
  }),
  seed(68, {
    title: 'Rose Garden 5K Fun Run',
    category: 'sports',
    city: 'Chandigarh',
    starts_at: daysFromNow(25, 7),
    venue_name: 'Zakir Hussain Rose Garden',
    description:
      'A family-friendly 5K through the rose gardens with a kids’ dash, music and a post-run breakfast.',
    image_url: img('photo-1571019613454-1cb2f99b2d8b'),
    organizer_name: 'Chandigarh Runners Club',
    price: 400,
    is_free: false,
  }),
  seed(69, {
    title: 'Indore Street Food Safari',
    category: 'food',
    city: 'Indore',
    starts_at: hoursFromNow(6),
    venue_name: 'Sarafa Bazaar',
    description:
      'A guided evening through the famous night market sampling chaat, pav bhaji and the city’s favourite sweets.',
    image_url: img('photo-1555939594-58d7cb561ad1'),
    organizer_name: 'Indore Food Explorers',
    price: 350,
    is_free: false,
  }),
  seed(70, {
    title: 'Malwa Folk Night',
    category: 'culture',
    city: 'Indore',
    starts_at: daysFromNow(9, 19),
    venue_name: 'Nehru Park',
    description:
      'An evening of Malwa folk songs, dance and storytelling around an open-air stage.',
    image_url: img('photo-1531058020387-3be344556be6'),
    organizer_name: 'Malwa Cultural Society',
  }),
  seed(71, {
    title: 'Indore Tech Talks',
    category: 'tech',
    city: 'Indore',
    starts_at: daysFromNow(17, 18),
    venue_name: 'Indore SEZ',
    description:
      'Three short talks on building products for small teams, followed by open discussion and networking.',
    image_url: img('photo-1540575467063-178a50c2df87'),
    organizer_name: 'Indore Tech Guild',
  }),
  seed(72, {
    title: 'Sant Singaji Charity Run',
    category: 'community',
    city: 'Indore',
    starts_at: daysFromNow(28, 7),
    venue_name: 'Sant Singaji Stadium',
    description:
      'A community 5K and 10K run raising funds for local school supplies, with categories for all ages.',
    image_url: img('photo-1552674605-db6ffd4facb5'),
    organizer_name: 'Indore Community Foundation',
    price: 500,
    is_free: false,
  }),

  // Pending submissions — visible only to the submitter and admins.
  seed(101, {
    title: 'Indie Folk Night at the Amphitheatre',
    category: 'music',
    city: 'Mumbai',
    starts_at: daysFromNow(21, 19),
    venue_name: 'Bandra Amphitheatre',
    description:
      'An intimate open-air evening of indie folk with three emerging acts from the city. Please review the stage and sound plan.',
    image_url: img('photo-1493225457124-a3eb161ffa5f'),
    organizer_name: 'Rohan Mehta',
    status: 'pending',
    submitted_by: organiser,
    price: 400,
    is_free: false,
  }),
  seed(102, {
    title: 'Regional Cook-Off Fundraiser',
    category: 'food',
    city: 'Pune',
    starts_at: daysFromNow(24, 12),
    venue_name: 'JM Road Community Hall',
    description:
      'Home cooks compete with family recipes from across India. Proceeds go to a local children’s education fund.',
    image_url: img('photo-1481931098730-318b6f776db0'),
    organizer_name: 'Pune Food Circle',
    status: 'pending',
    submitted_by: organiser,
  }),
  seed(103, {
    title: 'Android Study Jam',
    category: 'tech',
    city: 'Bengaluru',
    starts_at: daysFromNow(27, 10),
    venue_name: 'Indiranagar Co-working Space',
    description:
      'A hands-on weekend workshop introducing Android development with Kotlin. Laptops and mentor support provided.',
    image_url: img('photo-1505373877841-8d25f7d46678'),
    organizer_name: 'GDG Bengaluru',
    status: 'pending',
    submitted_by: organiser,
  }),
  seed(104, {
    title: 'Ladies Night Run 5K',
    category: 'sports',
    city: 'Chennai',
    starts_at: daysFromNow(30, 6),
    venue_name: 'Marina Beach',
    description:
      'A community 5K run celebrating women in sport, with a warm-up session and a post-run breakfast.',
    image_url: img('photo-1552674605-db6ffd4facb5'),
    organizer_name: 'Chennai Runners Club',
    status: 'pending',
    submitted_by: organiser,
  }),

  // A rejected submission for status coverage.
  seed(105, {
    title: 'Midnight Rooftop Party',
    category: 'music',
    city: 'Goa',
    starts_at: daysFromNow(16, 23),
    venue_name: 'Candolim Rooftop',
    description:
      'A late-night rooftop party with guest DJs. Submitted with an incomplete venue address and needs revision.',
    image_url: img('photo-1516450360452-9312f5e86fc7'),
    organizer_name: 'Rohan Mehta',
    status: 'rejected',
    submitted_by: organiser,
    price: 900,
    is_free: false,
  }),

  seed(106, {
    title: 'Marathi Poetry Slam',
    category: 'arts',
    city: 'Mumbai',
    starts_at: daysFromNow(33, 18),
    venue_name: 'Prithvi Theatre',
    description:
      'An open-stage evening of Marathi poetry with a small panel of judges and an audience vote for the final round.',
    image_url: img('photo-1503095396549-807759245b35'),
    organizer_name: 'Rohan Mehta',
    status: 'pending',
    submitted_by: organiser,
  }),
  seed(107, {
    title: 'Zero-Waste Cooking Workshop',
    category: 'food',
    city: 'Kochi',
    starts_at: daysFromNow(35, 11),
    venue_name: 'Fort Kochi Community Kitchen',
    description:
      'A practical workshop on cooking with leftovers and avoiding single-use plastic, with a shared lunch at the end.',
    image_url: img('photo-1481931098730-318b6f776db0'),
    organizer_name: 'Rohan Mehta',
    status: 'pending',
    submitted_by: organiser,
  }),
  seed(108, {
    title: 'Women in Tech Panel',
    category: 'tech',
    city: 'New Delhi',
    starts_at: daysFromNow(38, 16),
    venue_name: 'India Habitat Centre',
    description:
      'A panel discussion with women engineers and product leaders, followed by a mentoring circle and tea.',
    image_url: img('photo-1517457373958-b7bdd4587205'),
    organizer_name: 'Rohan Mehta',
    status: 'pending',
    submitted_by: organiser,
  }),
  seed(109, {
    title: 'Kabaddi League Trials',
    category: 'sports',
    city: 'Chandigarh',
    starts_at: daysFromNow(40, 9),
    venue_name: 'Sector 16 Stadium',
    description:
      'Open trials for the city kabaddi league with separate men’s and women’s categories and a short skills clinic.',
    image_url: img('photo-1547347298-4074fc3086f0'),
    organizer_name: 'Rohan Mehta',
    status: 'pending',
    submitted_by: organiser,
  }),
  seed(110, {
    title: 'Rooftop Bollywood Bash',
    category: 'music',
    city: 'Bengaluru',
    starts_at: daysFromNow(25, 22),
    venue_name: 'Indiranagar Rooftop',
    description:
      'A late-night Bollywood party with guest DJs. Submitted without sound-permit details and awaiting revision.',
    image_url: img('photo-1516450360452-9312f5e86fc7'),
    organizer_name: 'Rohan Mehta',
    status: 'rejected',
    submitted_by: organiser,
    price: 900,
    is_free: false,
  }),
]

export function seedProfileFor(userId: string): Profile | null {
  const account = SEED_ACCOUNTS.find((a) => localUserId(a.email) === userId)
  if (!account) return null
  return {
    id: userId,
    email: account.email,
    full_name: account.fullName,
    interests: account.interests,
    is_admin: account.isAdmin,
    created_at: daysFromNow(-45),
  }
}

const attendee = localUserId('aanya@utsav.in')

export function seedFavoritesFor(userId: string): string[] | null {
  if (userId !== attendee) return null
  return [
    eventId('Sunburn Arena: Live in Mumbai'),
    eventId('Street Food Carnival'),
    eventId('Navratri Garba Night'),
    eventId('Goa Sunset Beach Party'),
    eventId('Jazz & Chai Session'),
    eventId('Carnatic Music Evening'),
    eventId('Weekend Pottery Market'),
    eventId('Kochi Backwater Cleanup'),
    eventId('Bengaluru Film Festival'),
    eventId('Heritage Walk & Chai'),
  ]
}

export function seedRemindersFor(userId: string): Reminder[] | null {
  if (userId !== attendee) return null
  return [
    {
      id: 'rem-1',
      user_id: userId,
      event_id: eventId('Sunburn Arena: Live in Mumbai'),
      minutes_before: 1440,
      created_at: daysFromNow(-1),
    },
    {
      id: 'rem-2',
      user_id: userId,
      event_id: eventId('React & AI Summit 2026'),
      minutes_before: 60,
      created_at: daysFromNow(-1),
    },
    {
      id: 'rem-3',
      user_id: userId,
      event_id: eventId('Dosa & Filter Coffee Crawl'),
      minutes_before: 15,
      created_at: daysFromNow(-1),
    },
    {
      id: 'rem-4',
      user_id: userId,
      event_id: eventId('Rooftop Acoustic Session'),
      minutes_before: 60,
      created_at: daysFromNow(-1),
    },
    {
      id: 'rem-5',
      user_id: userId,
      event_id: eventId('Pottery & Clay Workshop'),
      minutes_before: 1440,
      created_at: daysFromNow(-1),
    },
  ]
}
