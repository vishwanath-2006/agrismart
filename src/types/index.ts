export type UserRole = 'farmer' | 'buyer' | 'transporter';

export interface UserProfile {
  id: string;
  name: string;
  role: UserRole;
  phone: string;
  email: string;
  avatarUrl: string;
  location: string;
  verified: boolean;
  businessName?: string;
  representativeName?: string;
  rating?: number;
  totalSales?: string;
  activeListingsCount?: number;
  ordersCount?: number;
  activeNegotiationsCount?: number;
  trustScore?: number;
  tripsCompleted?: number;
  reliabilityScore?: number;
  totalEarnings?: string;
  vehicleModel?: string;
  vehiclePlate?: string;
  vehicleCapacity?: string;
}

export interface ProduceListing {
  id: string;
  farmerId: string;
  farmerName: string;
  farmerLocation: string;
  farmerAvatar: string;
  cropName: string;
  variety: string;
  category: 'Vegetables' | 'Fruits' | 'Grains' | 'Pulses';
  imageUrl: string;
  qualityGrade: 'Grade A' | 'Grade B' | 'Organic Certified' | 'Premium';
  quantityKg: number;
  minOrderQuantityKg: number;
  pricePerKg: number;
  aiSuggestedPrice: number;
  harvestDate: string;
  shelfLifeDays: number;
  status: 'Active' | 'In Negotiation' | 'Sold Out';
  description?: string;
}

export interface MarketComparisonItem {
  id: string;
  marketName: string;
  city: string;
  distanceKm: number;
  currentPricePerKg: number;
  expectedSellingPricePerKg: number;
  transportCostTotal: number;
  transportCostPerKg: number;
  estNetReturnPerKg: number;
  demandLevel: 'High' | 'Moderate' | 'Low';
  isAiRecommended: boolean;
  transitTimeHrs: number;
}

export interface MandiPriceItem {
  id: string;
  cropName: string;
  mandiName: string;
  state: string;
  minPrice: number;
  maxPrice: number;
  modalPrice: number;
  changePercent: number;
  trend: 'up' | 'down' | 'stable';
  arrivalsTonnes: number;
  lastUpdated: string;
}

export interface PriceHistoryPoint {
  date: string;
  price: number;
  isForecast?: boolean;
}

export interface NegotiationDeal {
  id: string;
  produceId: string;
  cropName: string;
  produceImage: string;
  farmerId: string;
  farmerName: string;
  buyerId: string;
  buyerName: string;
  quantityKg: number;
  originalPricePerKg: number;
  currentOfferPricePerKg: number;
  lastOfferedBy: 'farmer' | 'buyer';
  aiFairPriceMin: number;
  aiFairPriceMax: number;
  status: 'PENDING' | 'COUNTERED' | 'ACCEPTED' | 'DEAL_CLOSED';
  messages: Array<{
    sender: 'farmer' | 'buyer' | 'system';
    text: string;
    timestamp: string;
    offeredPrice?: number;
  }>;
}

export interface TransporterOption {
  id: string;
  name: string;
  avatarUrl: string;
  vehicleType: string;
  vehiclePlate: string;
  isRefrigerated: boolean;
  rating: number;
  tripsCount: number;
  distanceKm: number;
  transitTimeHrs: number;
  ratePerKm: number;
  totalCost: number;
  verified: boolean;
  isAiBestMatch: boolean;
  phone: string;
}

export type OrderStatus =
  | 'ORDER_PLACED'
  | 'TRANSPORTER_ASSIGNED'
  | 'PICKED_UP'
  | 'IN_TRANSIT'
  | 'ARRIVING'
  | 'DELIVERED'
  | 'PAYMENT_RELEASED'
  | 'COMPLETED';

export interface OrderItem {
  id: string;
  orderNumber: string;
  produceId: string;
  cropName: string;
  variety: string;
  produceImage: string;
  quantityKg: number;
  agreedPricePerKg: number;
  produceSubtotal: number;
  transportCost: number;
  escrowFee: number;
  totalAmount: number;
  farmer: {
    id: string;
    name: string;
    phone: string;
    location: string;
    avatar: string;
  };
  buyer: {
    id: string;
    name: string;
    businessName: string;
    phone: string;
    warehouseAddress: string;
    avatar: string;
  };
  transporter?: TransporterOption;
  status: OrderStatus;
  createdAt: string;
  estimatedDeliveryTime: string;
  currentLocation?: {
    lat: number;
    lng: number;
    description: string;
    speedKmh: number;
    temperatureCelsius?: number;
  };
  trackingSteps: Array<{
    title: string;
    description: string;
    timestamp: string;
    isCompleted: boolean;
    isCurrent: boolean;
  }>;
  routeDetails: {
    origin: string;
    destination: string;
    distanceKm: number;
    durationStr: string;
    tollsCost: number;
    fuelSavingPercent: number;
  };
  deliveryVerification?: {
    otp: string;
    weighedKg: number;
    qualityChecked: boolean;
    gradeConfirmed: string;
    signedBy?: string;
    deliveredAt?: string;
  };
}

export interface FarmerProfileData {
  id?: string;
  userId?: string;
  fullName: string;
  phone: string;
  farmLocation: string;
  village: string;
  district: string;
  state: string;
  pincode: string;
  latitude?: number;
  longitude?: number;
  farmSize: number;
  farmSizeUnit: string;
  mainCrops: string[];
  otherCrops?: string;
  farmingExperience: string;
  farmingType: string;
  preferredMarkets: string[];
  primaryMarket: string;
  secondaryMarket: string;
  preferredSellingDistance: string;
  typicalProduceQuantity: string;
  sellingFrequency: string;
  preferredBuyerType: string;
  expectedPricePreference?: number;
  minimumPricePreference?: number;
  profileCompleted: boolean;
  completionPercentage: number;
}

export interface BuyerProfileData {
  id?: string;
  userId?: string;
  fullName: string;
  phone: string;
  email: string;
  businessName: string;
  businessType: string;
  businessLocation: string;
  city: string;
  district: string;
  state: string;
  pincode: string;
  latitude?: number;
  longitude?: number;
  receivingAddress: string;
  primaryReceivingMarket: string;
  secondaryReceivingMarket: string;
  preferredDeliveryWindow: string;
  preferredVegetables: string[];
  preferredQuantity: string;
  minimumOrderQuantity: string;
  typicalPurchaseQuantity: string;
  buyingFrequency: string;
  preferredQuality: string;
  preferredPriceRange: string;
  preferredMarkets: string[];
  preferredDeliveryDistance: string;
  profileCompleted: boolean;
  completionPercentage: number;
}

export interface TransporterProfileData {
  id?: string;
  userId?: string;
  fullName: string;
  phone: string;
  email: string;
  currentLocation: string;
  latitude?: number;
  longitude?: number;
  vehicleType: string;
  vehicleRegistrationNumber: string;
  vehicleCapacity: string;
  vehicleModel: string;
  vehicleAge: string;
  operatingLocation: string;
  preferredPickupAreas: string[];
  preferredDeliveryMarkets: string[];
  availability: string;
  workingDays: string;
  preferredPickupTime: string;
  transportChargePerKm: number;
  minimumTripCharge: number;
  additionalLoadingCharge: number;
  profileCompleted: boolean;
  completionPercentage: number;
}

