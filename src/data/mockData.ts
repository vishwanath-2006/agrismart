import {
  UserProfile,
  ProduceListing,
  MarketComparisonItem,
  MandiPriceItem,
  PriceHistoryPoint,
  NegotiationDeal,
  TransporterOption,
  OrderItem
} from '../types';

export const LOGO_URL = '/logo.png';
export const SUNRISE_HERO_URL = 'https://lh3.googleusercontent.com/aida-public/AB6AXuD4J5Im7zZdPL6gy96LKEMmHHV5HliXsjNpfq2rPGgGDMNdE4yeQA53Ume8JhHUfDmA_Bk4Ljz72wZPiH7ko-Y9fpOFhVP18Mh8Sl7_KFY6eSThLCUmK7DlCigg7LCCS7c-8AP-DXDdLM5WgfMj1AXW8qiGJgx_0oYDKHgHHQR255kQsn664Ibg5xeiZP4QXFefypl0IvcYEbSnB7Ud2dEp7EeYFIiOyzbYOoX9E4wjNPIeiicWO6K8';
export const FARMER_AVATAR = 'https://lh3.googleusercontent.com/aida-public/AB6AXuCoVVS5C32jWVTOabX5156nRDErG9nO2-sAcf2uCOKoUvoEuhn42KZUnWv-5luGRuTzlmYAkAbj23pHqdYpyD3lNfH7DK2pz0buN7CVjUsSk6rLKdXcnlFbUIgc9s4rwEgN5h1hH1s5JbtPN780hd9psws8nCk9JXQukAoK6MNmqvYmcoboB8w4VhV4yoVFFkgVff-dzew8njnMIBS6f-ls3hZrkYSGPAKDNMK4jW8-2oGJW4xUxqRv';
export const BUYER_AVATAR = 'https://lh3.googleusercontent.com/aida-public/AB6AXuCJwQQqylw5q5IPK4qfNncnTOvDdZRzOBw9oA8h5KbTlq4QIxjiLW0job6GtXve3pKrsCz4zVvJe9GNFCrbJJFm2qx9kTxRZh1t8dkNp_8F4AglQ-_SxDFb2hLf6FiFJOAAohDOXPgUHVJMsenxKJlK2yipWnjxqVqz94QfMLHMdvu68kv3Mr7OQ0GOGYoYUwOY9LrwZSAycEsCFoj257tccuLC8qEm64g5ql3REb3wYRvCLht4b68L';
export const TRANSPORTER_AVATAR = 'https://lh3.googleusercontent.com/aida-public/AB6AXuBwdDEGvqOBuvD0bBROQP1d0zUx-K5QKpNtRCv9rmTszvhdomTA7qf5OVi6hIUHw74Lxb6_qEA6_OI9-BUPvukkRWA37MHqcTKiq2WWA7Sx-O0SeMilCIcieBnIpDAHY4hZScGo_52rQJIFv6EIocnQ4P8Ik_l1ia7_AG5gmOpzeyZ_ohHbEgJcPQ9M6TnBbodosVUtLyZREWHZZasZesuzFpXoECTVdk0Xwk-31hlH64wymh8lXgn7';

export const TOMATO_IMG = 'https://lh3.googleusercontent.com/aida-public/AB6AXuCxzjA8oyed4JZQvdJN7j9L37Mc0YHx7j2xztlThMmtrRoLih0fGyHytD0h-Msm-ep-jnL4KVHptsYxB54uYIwpsf5UbxZl8zbH92cHFQ3aToCngB-Gmdi_1G0HIy4oN_Qb4GblGrZUlBm50YuYefXvUJMOegKs4wYMBJ-U38BaZ-uUGgW3vSq5pHIA-SI8_Ih7fKaw_NR3F-dxd8fJUQ3nQ0Dc6oiGHhDkR3UNKqvyTMDf1hfz-Qsv';
export const ONION_IMG = 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?auto=format&fit=crop&w=800&q=80';
export const POTATO_IMG = 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=800&q=80';
export const WHEAT_IMG = 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=800&q=80';
export const APPLE_IMG = 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?auto=format&fit=crop&w=800&q=80';

export const INITIAL_USERS: Record<string, UserProfile> = {
  farmer: {
    id: 'user_farmer_1',
    name: 'Ramesh Kumar',
    role: 'farmer',
    phone: '+91 98450 12345',
    email: 'ramesh.kumar@agrifarm.in',
    avatarUrl: FARMER_AVATAR,
    location: 'Mysore, Karnataka',
    verified: true,
    rating: 4.9,
    totalSales: '₹1.2L',
    activeListingsCount: 3,
    activeNegotiationsCount: 1
  },
  buyer: {
    id: 'user_buyer_1',
    name: 'Sarah Jenkins',
    businessName: 'XYZ Traders',
    representativeName: 'Sarah Jenkins',
    role: 'buyer',
    phone: '+91 99000 54321',
    email: 'procurement@xyztraders.com',
    avatarUrl: BUYER_AVATAR,
    location: 'Bangalore Central, Karnataka',
    verified: true,
    rating: 4.8,
    ordersCount: 142,
    activeNegotiationsCount: 3,
    trustScore: 98
  },
  transporter: {
    id: 'user_transporter_1',
    name: 'Marcus Vance',
    role: 'transporter',
    phone: '+91 97411 98765',
    email: 'marcus.vance@agrilogistics.com',
    avatarUrl: TRANSPORTER_AVATAR,
    location: 'Mandya - Bangalore Corridor',
    verified: true,
    rating: 4.96,
    tripsCompleted: 842,
    reliabilityScore: 4.96,
    totalEarnings: '₹3.4L ($42.5k)',
    vehicleModel: 'Tata 407 Reefer (4 Ton)',
    vehiclePlate: 'KA-09-E-4421',
    vehicleCapacity: '4,000 kg Cold Chain'
  }
};

export const INITIAL_PRODUCE: ProduceListing[] = [
  {
    id: 'prod_tomato_1',
    farmerId: 'user_farmer_1',
    farmerName: 'Ramesh Kumar',
    farmerLocation: 'Mysore, Karnataka',
    farmerAvatar: FARMER_AVATAR,
    cropName: 'Tomato (Hybrid)',
    variety: 'Abhinav 3140',
    category: 'Vegetables',
    imageUrl: TOMATO_IMG,
    qualityGrade: 'Grade A',
    quantityKg: 500,
    minOrderQuantityKg: 100,
    pricePerKg: 30,
    aiSuggestedPrice: 29.5,
    harvestDate: 'Today, 6:00 AM',
    shelfLifeDays: 8,
    status: 'Active',
    description: 'Fresh farm-harvested red hybrid tomatoes. High TSS, glossy skin, excellent firmness suited for wholesale & retail retail markets.'
  },
  {
    id: 'prod_onion_1',
    farmerId: 'user_farmer_1',
    farmerName: 'Ramesh Kumar',
    farmerLocation: 'Mysore, Karnataka',
    farmerAvatar: FARMER_AVATAR,
    cropName: 'Red Onion',
    variety: 'Nashik Red 55',
    category: 'Vegetables',
    imageUrl: ONION_IMG,
    qualityGrade: 'Grade A',
    quantityKg: 1200,
    minOrderQuantityKg: 200,
    pricePerKg: 22,
    aiSuggestedPrice: 22.0,
    harvestDate: 'Yesterday',
    shelfLifeDays: 30,
    status: 'In Negotiation',
    description: 'Sun-cured medium to large bulb size with tight dry skin and minimal moisture loss.'
  },
  {
    id: 'prod_potato_1',
    farmerId: 'user_farmer_1',
    farmerName: 'Ramesh Kumar',
    farmerLocation: 'Hassan, Karnataka',
    farmerAvatar: FARMER_AVATAR,
    cropName: 'Potato Jyoti',
    variety: 'Kufri Jyoti',
    category: 'Vegetables',
    imageUrl: POTATO_IMG,
    qualityGrade: 'Premium',
    quantityKg: 800,
    minOrderQuantityKg: 150,
    pricePerKg: 18,
    aiSuggestedPrice: 17.8,
    harvestDate: '2 days ago',
    shelfLifeDays: 45,
    status: 'Active',
    description: 'Clean oval tubers with shallow eyes. High starch content ideal for processing & table consumption.'
  },
  {
    id: 'prod_wheat_1',
    farmerId: 'user_farmer_2',
    farmerName: 'Gurpreet Singh',
    farmerLocation: 'Karnal, Haryana',
    farmerAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    cropName: 'Sharbati Wheat',
    variety: 'HD-2967 Golden',
    category: 'Grains',
    imageUrl: WHEAT_IMG,
    qualityGrade: 'Organic Certified',
    quantityKg: 2500,
    minOrderQuantityKg: 500,
    pricePerKg: 34,
    aiSuggestedPrice: 33.5,
    harvestDate: '1 week ago',
    shelfLifeDays: 180,
    status: 'Active',
    description: '100% Organic certified golden heavy grains. High protein and gluten suitable for premium flour milling.'
  },
  {
    id: 'prod_apple_1',
    farmerId: 'user_farmer_3',
    farmerName: 'Virender Thakur',
    farmerLocation: 'Kotkhai, Shimla',
    farmerAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
    cropName: 'Royal Delicious Apple',
    variety: 'Grade 1 Washington Spur',
    category: 'Fruits',
    imageUrl: APPLE_IMG,
    qualityGrade: 'Premium',
    quantityKg: 650,
    minOrderQuantityKg: 100,
    pricePerKg: 110,
    aiSuggestedPrice: 108.0,
    harvestDate: '3 days ago',
    shelfLifeDays: 20,
    status: 'Active',
    description: 'High altitude crisp red apples with natural fruit wax. Handpicked and graded in protective trays.'
  }
];

export const MOCK_MARKET_COMPARISONS: MarketComparisonItem[] = [
  {
    id: 'mkt_kr',
    marketName: 'KR Market (Bangalore)',
    city: 'Bangalore Central',
    distanceKm: 145,
    currentPricePerKg: 32.0,
    expectedSellingPricePerKg: 31.5,
    transportCostTotal: 1450,
    transportCostPerKg: 2.9,
    estNetReturnPerKg: 28.6,
    demandLevel: 'High',
    isAiRecommended: true,
    transitTimeHrs: 3.5
  },
  {
    id: 'mkt_apmc_yesh',
    marketName: 'APMC Yard Yeshwanthpur',
    city: 'North Bangalore',
    distanceKm: 152,
    currentPricePerKg: 30.5,
    expectedSellingPricePerKg: 30.0,
    transportCostTotal: 1520,
    transportCostPerKg: 3.04,
    estNetReturnPerKg: 26.96,
    demandLevel: 'High',
    isAiRecommended: false,
    transitTimeHrs: 3.8
  },
  {
    id: 'mkt_mysore',
    marketName: 'Bandi Palya APMC',
    city: 'Mysore Local',
    distanceKm: 18,
    currentPricePerKg: 27.0,
    expectedSellingPricePerKg: 26.5,
    transportCostTotal: 350,
    transportCostPerKg: 0.7,
    estNetReturnPerKg: 25.8,
    demandLevel: 'Moderate',
    isAiRecommended: false,
    transitTimeHrs: 0.6
  },
  {
    id: 'mkt_kolar',
    marketName: 'Kolar APMC Mandi',
    city: 'Kolar District',
    distanceKm: 210,
    currentPricePerKg: 29.0,
    expectedSellingPricePerKg: 28.5,
    transportCostTotal: 2100,
    transportCostPerKg: 4.2,
    estNetReturnPerKg: 24.3,
    demandLevel: 'High',
    isAiRecommended: false,
    transitTimeHrs: 4.5
  }
];

export const MOCK_MANDI_PRICES: MandiPriceItem[] = [
  {
    id: 'mandi_1',
    cropName: 'Tomato (Hybrid)',
    mandiName: 'KR Market, Bangalore',
    state: 'Karnataka',
    minPrice: 28,
    maxPrice: 34,
    modalPrice: 31,
    changePercent: 8.2,
    trend: 'up',
    arrivalsTonnes: 45.2,
    lastUpdated: '10 mins ago'
  },
  {
    id: 'mandi_2',
    cropName: 'Tomato (Local)',
    mandiName: 'Kolar Mandi',
    state: 'Karnataka',
    minPrice: 24,
    maxPrice: 29,
    modalPrice: 27,
    changePercent: 3.5,
    trend: 'up',
    arrivalsTonnes: 120.0,
    lastUpdated: '25 mins ago'
  },
  {
    id: 'mandi_3',
    cropName: 'Red Onion',
    mandiName: 'Yeshwanthpur APMC',
    state: 'Karnataka',
    minPrice: 20,
    maxPrice: 24,
    modalPrice: 22,
    changePercent: -1.8,
    trend: 'down',
    arrivalsTonnes: 88.5,
    lastUpdated: '15 mins ago'
  },
  {
    id: 'mandi_4',
    cropName: 'Potato Jyoti',
    mandiName: 'Mysore Bandi Palya',
    state: 'Karnataka',
    minPrice: 16,
    maxPrice: 20,
    modalPrice: 18,
    changePercent: 0.0,
    trend: 'stable',
    arrivalsTonnes: 62.0,
    lastUpdated: '1 hour ago'
  },
  {
    id: 'mandi_5',
    cropName: 'Green Chilli',
    mandiName: 'KR Market, Bangalore',
    state: 'Karnataka',
    minPrice: 42,
    maxPrice: 52,
    modalPrice: 48,
    changePercent: 12.4,
    trend: 'up',
    arrivalsTonnes: 18.0,
    lastUpdated: '30 mins ago'
  }
];

export const MOCK_PRICE_HISTORY_POINTS: PriceHistoryPoint[] = [
  { date: 'Aug 24', price: 24 },
  { date: 'Aug 25', price: 26 },
  { date: 'Aug 26', price: 25 },
  { date: 'Aug 27', price: 28 },
  { date: 'Aug 28', price: 29 },
  { date: 'Aug 29', price: 30 },
  { date: 'Aug 30 (Today)', price: 31 },
  // AI Forecast Points
  { date: 'Aug 31 (F)', price: 32.5, isForecast: true },
  { date: 'Sep 01 (F)', price: 33.8, isForecast: true },
  { date: 'Sep 02 (F)', price: 34.2, isForecast: true }
];

export const MOCK_TRANSPORTERS: TransporterOption[] = [
  {
    id: 'trans_1',
    name: 'Marcus Vance',
    avatarUrl: TRANSPORTER_AVATAR,
    vehicleType: 'Tata 407 Reefer (Cold Chain 4T)',
    vehiclePlate: 'KA-09-E-4421',
    isRefrigerated: true,
    rating: 4.96,
    tripsCount: 842,
    distanceKm: 145,
    transitTimeHrs: 3.5,
    ratePerKm: 10,
    totalCost: 1450,
    verified: true,
    isAiBestMatch: true,
    phone: '+91 97411 98765'
  },
  {
    id: 'trans_2',
    name: 'Kiran Reddy Logistics',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    vehicleType: 'Mahindra Bolero Maxi Truck (2T)',
    vehiclePlate: 'KA-04-F-8812',
    isRefrigerated: false,
    rating: 4.78,
    tripsCount: 420,
    distanceKm: 145,
    transitTimeHrs: 4.0,
    ratePerKm: 8.5,
    totalCost: 1232,
    verified: true,
    isAiBestMatch: false,
    phone: '+91 98860 11223'
  },
  {
    id: 'trans_3',
    name: 'GreenExpress AgriTransit',
    avatarUrl: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=400&q=80',
    vehicleType: 'Eicher Pro 2049 Insulated (5T)',
    vehiclePlate: 'KA-51-A-9900',
    isRefrigerated: true,
    rating: 4.88,
    tripsCount: 610,
    distanceKm: 145,
    transitTimeHrs: 3.3,
    ratePerKm: 11.5,
    totalCost: 1667,
    verified: true,
    isAiBestMatch: false,
    phone: '+91 94480 33445'
  }
];

export const INITIAL_NEGOTIATION: NegotiationDeal = {
  id: 'deal_neg_101',
  produceId: 'prod_tomato_1',
  cropName: 'Tomato (Hybrid)',
  produceImage: TOMATO_IMG,
  farmerId: 'user_farmer_1',
  farmerName: 'Ramesh Kumar',
  buyerId: 'user_buyer_1',
  buyerName: 'Sarah Jenkins (XYZ Traders)',
  quantityKg: 500,
  originalPricePerKg: 30.0,
  currentOfferPricePerKg: 28.5,
  lastOfferedBy: 'buyer',
  aiFairPriceMin: 27.5,
  aiFairPriceMax: 29.5,
  status: 'PENDING',
  messages: [
    {
      sender: 'farmer',
      text: 'Listed 500kg of freshly harvested Grade A Hybrid Tomato at ₹30/kg.',
      timestamp: '08:30 AM',
      offeredPrice: 30.0
    },
    {
      sender: 'buyer',
      text: 'Hi Ramesh, XYZ Traders can procure full 500kg today. Proposing ₹28.50/kg for immediate dispatch.',
      timestamp: '09:15 AM',
      offeredPrice: 28.5
    },
    {
      sender: 'system',
      text: 'AI Market Guidance: ₹28.50/kg is within the high-confidence fair value range (₹27.50 – ₹29.50/kg).',
      timestamp: '09:16 AM'
    }
  ]
};

export const INITIAL_ACTIVE_ORDER: OrderItem = {
  id: 'order_ag_8821',
  orderNumber: 'AG-8821',
  produceId: 'prod_tomato_1',
  cropName: 'Tomato (Hybrid)',
  variety: 'Abhinav 3140 Grade A',
  produceImage: TOMATO_IMG,
  quantityKg: 500,
  agreedPricePerKg: 28.5,
  produceSubtotal: 14250,
  transportCost: 1450,
  escrowFee: 250,
  totalAmount: 15950,
  farmer: {
    id: 'user_farmer_1',
    name: 'Ramesh Kumar',
    phone: '+91 98450 12345',
    location: 'Mysore Farm, Gate 2',
    avatar: FARMER_AVATAR
  },
  buyer: {
    id: 'user_buyer_1',
    name: 'Sarah Jenkins',
    businessName: 'XYZ Traders',
    phone: '+91 99000 54321',
    warehouseAddress: 'KR Market Depot 4B, Bangalore Central',
    avatar: BUYER_AVATAR
  },
  transporter: MOCK_TRANSPORTERS[0],
  status: 'IN_TRANSIT',
  createdAt: 'Today, 10:15 AM',
  estimatedDeliveryTime: 'Today, 03:45 PM',
  currentLocation: {
    lat: 12.5218,
    lng: 76.8951,
    description: 'SH-17 near Mandya Bypass (48 km/h)',
    speedKmh: 48,
    temperatureCelsius: 17.8
  },
  trackingSteps: [
    {
      title: 'Order Confirmed & Escrow Funded',
      description: '₹15,950 held in secure AgriEscrow',
      timestamp: '10:15 AM',
      isCompleted: true,
      isCurrent: false
    },
    {
      title: 'Transporter Assigned',
      description: 'Marcus Vance with Tata 407 Cold Chain',
      timestamp: '10:30 AM',
      isCompleted: true,
      isCurrent: false
    },
    {
      title: 'Loaded at Mysore Farm',
      description: '500kg verified by farmer Ramesh Kumar',
      timestamp: '12:15 PM',
      isCompleted: true,
      isCurrent: false
    },
    {
      title: 'In Transit to Bangalore',
      description: 'Approaching Ramanagara Checkpoint (ETA 3:45 PM)',
      timestamp: '01:40 PM',
      isCompleted: false,
      isCurrent: true
    },
    {
      title: 'Delivered & Payment Released',
      description: 'Weighbridge check and buyer OTP sign-off',
      timestamp: 'Expected 03:45 PM',
      isCompleted: false,
      isCurrent: false
    }
  ],
  routeDetails: {
    origin: 'Mysore Farm (Ramesh Kumar)',
    destination: 'KR Market Warehouse 4B, Bangalore',
    distanceKm: 145,
    durationStr: '3h 25m',
    tollsCost: 180,
    fuelSavingPercent: 12
  },
  deliveryVerification: {
    otp: '8492',
    weighedKg: 502,
    qualityChecked: true,
    gradeConfirmed: 'Grade A (TSS 5.8, Moisture optimal)'
  }
};
