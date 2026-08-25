// lib/constants.ts
// Centralized application constants

export const BOOK = {
  title: 'The Ride',
  titleTelugu: 'ది రైడ్',
  subtitle: 'రహదారుల నుండి.. జన హృదయాలలోకి',
  subtitleEn: 'From the Roads... Into the Hearts of People',
  author: 'Pavan Akondi',
  authorTelugu: 'పవన్ అకొండి',
  price: 150,
  deliveryCharge: 50, // Flat rate delivery anywhere in India
  pages: 137,
  language: 'Telugu',
  publisher: 'Eswari Publications',
  edition: '1st Edition, 2026',
  isbn: '', // Add when available
  tagline: 'Eight Journeys. Hundreds of People. Countless Moments.',
  description: `Eight journeys. Hundreds of people. Countless moments. One unforgettable ride.

The Ride is not simply a collection of motorcycle journeys. It is a story of experiences lived on the road—of unfamiliar places that became familiar, strangers who became memories, challenges that became lessons, and moments of happiness that could never have been planned.

Across eight different bike journeys, the road becomes more than a path from one destination to another. Every ride brings something new: unexpected challenges, beautiful landscapes, difficult decisions, quiet moments of reflection, encounters with people from different walks of life, and experiences that slowly change the way one sees life.

The journey is sometimes about reaching a destination. But more often, it is about everything that happens along the way.`,
  descriptionFull: `Eight journeys. Hundreds of people. Countless moments. One unforgettable ride.

The Ride is not simply a collection of motorcycle journeys. It is a story of experiences lived on the road—of unfamiliar places that became familiar, strangers who became memories, challenges that became lessons, and moments of happiness that could never have been planned.

Across eight different bike journeys, the road becomes more than a path from one destination to another. Every ride brings something new: unexpected challenges, beautiful landscapes, difficult decisions, quiet moments of reflection, encounters with people from different walks of life, and experiences that slowly change the way one sees life.

The journey is sometimes about reaching a destination. But more often, it is about everything that happens along the way.

The people met on the road. The conversations shared. The places discovered. The difficulties overcome. The laughter, exhaustion, uncertainty and joy. The moments that were never planned but became the ones worth remembering.

Through these eight journeys, The Ride captures the simple truth that travelling is not only about seeing new places—it is about living new experiences.

Because when the journey finally ends, the roads may disappear behind you, but the people, lessons, memories and moments you collected along the way stay with you.

The Ride is about those moments. The journeys that changed something within. And the life that happened between one destination and the next.`,
  rides: [
    'Varanasi Ride',
    'Hanuman Yatra',
    'Brotherhood Ride',
    'Nation Ride',
    'Suicide Prevention Ride',
    'Kashmir Ride',
    'Ladakh',
    'Spirit of Sivaji Ride',
  ],
};

export const LAUNCH = {
  date: '23 August 2026',
  time: '5:00 PM',
  venue: 'Sri Akondi Gopala Krishna Murthy Premises',
  guests: {
    president: {
      name: 'Sri Madhunapantula Satyanarayana Murthy Garu',
      role: 'Presided by',
      org: 'Founder, Andhra Kutiram',
    },
    chiefGuest: {
      name: 'Sri Akella Raghavendra Garu',
      role: 'Chief Guest',
      org: 'Founder – E Gurukulam for IAS',
    },
    specialInvitee: {
      name: 'Sandra Sudheer Kumar',
      role: 'Special Invitee',
      org: 'Founder – Parent Shaala',
    },
    host: {
      name: 'Sri Mukkamala Chakradhar',
      role: 'Programme Hosted by',
      org: 'Senior Journalist',
    },
  },
};

export const ORDER_STATUS = {
  ORDER_PLACED: 'Order Placed',
  PAYMENT_CONFIRMED: 'Payment Confirmed',
  PROCESSING: 'Order Processing',
  PACKED: 'Book Packed',
  SHIPPED: 'Shipped',
  OUT_FOR_DELIVERY: 'Out for Delivery',
  DELIVERED: 'Delivered',
  CANCELLED: 'Cancelled',
} as const;

export type OrderStatusKey = keyof typeof ORDER_STATUS;

export const PAYMENT_STATUS = {
  PENDING: 'Pending',
  PAID: 'Paid',
  FAILED: 'Failed',
  CANCELLED: 'Cancelled',
} as const;

export const ESTIMATED_DELIVERY_DAYS = '2–4 working days';

export const ADMIN_EMAIL = 'askgrapika@gmail.com';

export const ORDER_ID_PREFIX = 'TR';
export const ORDER_ID_YEAR = new Date().getFullYear();
