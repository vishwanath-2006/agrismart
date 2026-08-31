import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import {
  UserRole,
  UserProfile,
  ProduceListing,
  MarketComparisonItem,
  MandiPriceItem,
  PriceHistoryPoint,
  NegotiationDeal,
  TransporterOption,
  OrderItem,
  OrderStatus,
  FarmerProfileData,
  BuyerProfileData,
  TransporterProfileData
} from '../types';
import {
  INITIAL_USERS,
  INITIAL_PRODUCE,
  MOCK_MARKET_COMPARISONS,
  MOCK_MANDI_PRICES,
  MOCK_PRICE_HISTORY_POINTS,
  MOCK_TRANSPORTERS,
  INITIAL_NEGOTIATION,
  INITIAL_ACTIVE_ORDER,
  FARMER_AVATAR,
  TOMATO_IMG
} from '../data/mockData';
import {
  syncOrderToSupabase,
  claimTransportJobInSupabase,
  updateOrderStatusInSupabase
} from '../services/orderSyncService';
import {
  fetchMandiPricesFromSupabase,
  fetchMarketComparisonsFromSupabase,
  fetchPriceHistoryFromSupabase,
  triggerMandiPriceSync
} from '../services/mandiPriceService';

interface AppContextType {
  currentRole: UserRole;
  currentUser: UserProfile;
  switchRole: (role: UserRole) => void;

  // Supabase Auth
  supabaseUser: User | null;
  supabaseSession: Session | null;
  isAuthLoading: boolean;
  isProfileLoading: boolean;
  loginWithGoogle: () => Promise<{ error: Error | null }>;
  logout: () => Promise<void>;
  assignRole: (role: UserRole) => Promise<boolean>;

  // Role Profile Data & Persistence
  farmerProfile: FarmerProfileData;
  buyerProfile: BuyerProfileData;
  transporterProfile: TransporterProfileData;
  saveFarmerProfile: (data: Partial<FarmerProfileData>) => Promise<boolean>;
  saveBuyerProfile: (data: Partial<BuyerProfileData>) => Promise<boolean>;
  saveTransporterProfile: (data: Partial<TransporterProfileData>) => Promise<boolean>;
  isProfileComplete: (role: UserRole) => boolean;

  produceListings: ProduceListing[];
  addProduceListing: (listing: {
    cropName: string;
    variety: string;
    category: 'Vegetables' | 'Fruits' | 'Grains' | 'Pulses';
    qualityGrade: 'Grade A' | 'Grade B' | 'Organic Certified' | 'Premium';
    quantityKg: number;
    minOrderQuantityKg: number;
    pricePerKg: number;
    harvestDate: string;
    shelfLifeDays: number;
    imageUrl?: string;
    description?: string;
  }) => ProduceListing;
  selectedProduce: ProduceListing | null;
  setSelectedProduce: (produce: ProduceListing | null) => void;

  marketComparisons: MarketComparisonItem[];
  selectedMarket: MarketComparisonItem | null;
  setSelectedMarket: (market: MarketComparisonItem | null) => void;

  mandiPrices: MandiPriceItem[];
  priceHistory: PriceHistoryPoint[];

  negotiations: NegotiationDeal[];
  currentNegotiation: NegotiationDeal | null;
  setCurrentNegotiation: (deal: NegotiationDeal | null) => void;
  startNegotiationForProduce: (produce: ProduceListing) => NegotiationDeal;
  sendCounterOffer: (dealId: string, pricePerKg: number, message: string) => void;
  acceptDeal: (dealId: string) => NegotiationDeal | null;

  transporters: TransporterOption[];
  selectedTransporter: TransporterOption | null;
  setSelectedTransporter: (transporter: TransporterOption | null) => void;

  orders: OrderItem[];
  activeOrder: OrderItem | null;
  setActiveOrder: (order: OrderItem | null) => void;
  createOrder: (produce: ProduceListing, transporter: TransporterOption, agreedPrice?: number) => OrderItem;
  updateOrderStatus: (orderId: string, newStatus: OrderStatus) => void;
  acceptTransportJob: (orderId: string) => void;
  startTrip: (orderId: string) => void;
  completeDelivery: (
    orderId: string,
    verification: {
      otp: string;
      weighedKg: number;
      qualityChecked: boolean;
      gradeConfirmed: string;
      signedBy: string;
    }
  ) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [supabaseUser, setSupabaseUser] = useState<User | null>(null);
  const [supabaseSession, setSupabaseSession] = useState<Session | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState<boolean>(true);
  const [isProfileLoading, setIsProfileLoading] = useState<boolean>(false);

  // Load persisted role
  const [currentRole, setCurrentRole] = useState<UserRole>(() => {
    const saved = localStorage.getItem('agrismart_role');
    return (saved as UserRole) || 'farmer';
  });

  const [produceListings, setProduceListings] = useState<ProduceListing[]>(() => {
    const saved = localStorage.getItem('agrismart_produce');
    return saved ? JSON.parse(saved) : INITIAL_PRODUCE;
  });

  const [selectedProduce, setSelectedProduce] = useState<ProduceListing | null>(produceListings[0]);
  const [marketComparisons, setMarketComparisons] = useState<MarketComparisonItem[]>(MOCK_MARKET_COMPARISONS);
  const [selectedMarket, setSelectedMarket] = useState<MarketComparisonItem | null>(MOCK_MARKET_COMPARISONS[0]);
  const [mandiPrices, setMandiPrices] = useState<MandiPriceItem[]>(MOCK_MANDI_PRICES);
  const [priceHistory, setPriceHistory] = useState<PriceHistoryPoint[]>(MOCK_PRICE_HISTORY_POINTS);
  const [transporters] = useState<TransporterOption[]>(MOCK_TRANSPORTERS);
  const [selectedTransporter, setSelectedTransporter] = useState<TransporterOption | null>(MOCK_TRANSPORTERS[0]);

  const [negotiations, setNegotiations] = useState<NegotiationDeal[]>(() => {
    const saved = localStorage.getItem('agrismart_negotiations');
    return saved ? JSON.parse(saved) : [INITIAL_NEGOTIATION];
  });

  const [currentNegotiation, setCurrentNegotiation] = useState<NegotiationDeal | null>(negotiations[0] || null);

  const [orders, setOrders] = useState<OrderItem[]>(() => {
    const saved = localStorage.getItem('agrismart_orders');
    return saved ? JSON.parse(saved) : [INITIAL_ACTIVE_ORDER];
  });

  const [activeOrder, setActiveOrder] = useState<OrderItem | null>(orders[0] || null);

  const DEFAULT_FARMER_PROFILE: FarmerProfileData = {
    fullName: 'Ramesh Kumar',
    phone: '9845012345',
    farmLocation: 'Mysore Farm Gate 2, Plot 4A',
    village: 'Nanjangud Rural',
    district: 'Mysore',
    state: 'Karnataka',
    pincode: '570001',
    farmSize: 4.5,
    farmSizeUnit: 'Acres',
    mainCrops: ['Tomatoes', 'Onions', 'Potatoes'],
    otherCrops: 'Green Chillies, Coriander',
    farmingExperience: '12 Years',
    farmingType: 'Organic Certified',
    preferredMarkets: ['Mysore Bandipalya', 'Bangalore KR Market', 'Kolar APMC'],
    primaryMarket: 'Mysore Bandipalya',
    secondaryMarket: 'Bangalore KR Market',
    preferredSellingDistance: 'Within 50 km',
    typicalProduceQuantity: '10 - 25 Quintals',
    sellingFrequency: 'Weekly',
    preferredBuyerType: 'Wholesale Traders',
    expectedPricePreference: 28,
    minimumPricePreference: 22,
    profileCompleted: true,
    completionPercentage: 100
  };

  const DEFAULT_BUYER_PROFILE: BuyerProfileData = {
    fullName: 'Priya Sharma',
    phone: '9876543210',
    email: 'procurement@xyztraders.com',
    businessName: 'XYZ Agri Trades & Cold Storage Ltd.',
    businessType: 'Wholesaler',
    businessLocation: 'KR Market Depot 4B',
    city: 'Bangalore Central',
    district: 'Bengaluru Urban',
    state: 'Karnataka',
    pincode: '560002',
    receivingAddress: 'Depot 4B, APMC Yard, Yeshwantpur, Bengaluru',
    primaryReceivingMarket: 'Yeshwantpur APMC',
    secondaryReceivingMarket: 'KR Market',
    preferredDeliveryWindow: 'Early Morning (5 AM - 9 AM)',
    preferredVegetables: ['Tomatoes', 'Potatoes', 'Onions', 'Capsicum'],
    preferredQuantity: '20 - 50 Quintals',
    minimumOrderQuantity: '500 kg',
    typicalPurchaseQuantity: '5 Tons',
    buyingFrequency: 'Daily',
    preferredQuality: 'Grade A & Premium',
    preferredPriceRange: '₹20 - ₹45 / kg',
    preferredMarkets: ['Kolar APMC', 'Mysore APMC', 'Chikkaballapur'],
    preferredDeliveryDistance: 'Within 100 km',
    profileCompleted: true,
    completionPercentage: 100
  };

  const DEFAULT_TRANSPORTER_PROFILE: TransporterProfileData = {
    fullName: 'Manjunath Gowda',
    phone: '9741198765',
    email: 'logistics@gowdatransports.com',
    currentLocation: 'Mandya Central Bypass',
    vehicleType: '4-Wheeler Tempo Reefer (Cold Chain)',
    vehicleRegistrationNumber: 'KA-09-E-4421',
    vehicleCapacity: '4.0 Metric Tons',
    vehicleModel: 'Tata 407 LPT Reefer',
    vehicleAge: '3 Years',
    operatingLocation: 'Mysore - Bangalore Highway Corridor',
    preferredPickupAreas: ['Mysore', 'Mandya', 'Hunsur', 'Channapatna'],
    preferredDeliveryMarkets: ['Bangalore KR Market', 'Yeshwantpur APMC', 'Hosur Terminal'],
    availability: 'Available Now (GPS Active)',
    workingDays: 'All 7 Days',
    preferredPickupTime: 'Morning & Evening Dispatches',
    transportChargePerKm: 22,
    minimumTripCharge: 1800,
    additionalLoadingCharge: 350,
    profileCompleted: true,
    completionPercentage: 100
  };

  const [farmerProfile, setFarmerProfile] = useState<FarmerProfileData>(() => {
    const saved = localStorage.getItem('agrismart_farmer_profile');
    return saved ? JSON.parse(saved) : DEFAULT_FARMER_PROFILE;
  });

  const [buyerProfile, setBuyerProfile] = useState<BuyerProfileData>(() => {
    const saved = localStorage.getItem('agrismart_buyer_profile');
    return saved ? JSON.parse(saved) : DEFAULT_BUYER_PROFILE;
  });

  const [transporterProfile, setTransporterProfile] = useState<TransporterProfileData>(() => {
    const saved = localStorage.getItem('agrismart_transporter_profile');
    return saved ? JSON.parse(saved) : DEFAULT_TRANSPORTER_PROFILE;
  });

  // Load profile data from Supabase
  const loadRoleProfiles = async (userId: string, authUserMeta?: any) => {
    setIsProfileLoading(true);
    try {
      const [farmerRes, buyerRes, transpRes] = await Promise.allSettled([
        supabase.from('farmer_profiles').select('*').eq('user_id', userId).single(),
        supabase.from('buyer_profiles').select('*').eq('user_id', userId).single(),
        supabase.from('transporter_profiles').select('*').eq('user_id', userId).single()
      ]);

      const userName = authUserMeta?.full_name || authUserMeta?.name || '';
      const userPhone = authUserMeta?.phone || '';
      const userEmail = authUserMeta?.email || '';

      if (farmerRes.status === 'fulfilled' && farmerRes.value.data) {
        const d = farmerRes.value.data;
        const loaded: FarmerProfileData = {
          id: d.id,
          userId: d.user_id,
          fullName: d.full_name || userName || 'Farmer',
          phone: d.phone || userPhone || '',
          farmLocation: d.farm_location || '',
          village: d.village || '',
          district: d.district || '',
          state: d.state || 'Karnataka',
          pincode: d.pincode || '',
          latitude: d.latitude ? Number(d.latitude) : undefined,
          longitude: d.longitude ? Number(d.longitude) : undefined,
          farmSize: Number(d.farm_size) || 0,
          farmSizeUnit: d.farm_size_unit || 'Acres',
          mainCrops: d.main_crops ? d.main_crops.split(', ') : [],
          otherCrops: d.other_crops || '',
          farmingExperience: d.farming_experience || '4 - 7 Years',
          farmingType: d.farming_type || 'Organic Certified',
          preferredMarkets: d.preferred_markets ? d.preferred_markets.split(', ') : [],
          primaryMarket: d.primary_market || '',
          secondaryMarket: d.secondary_market || '',
          preferredSellingDistance: d.preferred_selling_distance || 'Within 50 km',
          typicalProduceQuantity: d.typical_produce_quantity || '',
          sellingFrequency: d.selling_frequency || 'Weekly',
          preferredBuyerType: d.preferred_buyer_type || 'Wholesale Traders',
          expectedPricePreference: d.expected_price_preference ? Number(d.expected_price_preference) : undefined,
          minimumPricePreference: d.minimum_price_preference ? Number(d.minimum_price_preference) : undefined,
          profileCompleted: Boolean(d.profile_completed),
          completionPercentage: d.completion_percentage ?? (d.profile_completed ? 100 : 25)
        };
        setFarmerProfile(loaded);
        localStorage.setItem('agrismart_farmer_profile', JSON.stringify(loaded));
      } else if (userId) {
        // User logged in but no profile saved yet
        setFarmerProfile(prev => {
          const fresh: FarmerProfileData = {
            ...prev,
            userId,
            fullName: userName || prev.fullName,
            phone: userPhone || prev.phone,
            profileCompleted: false,
            completionPercentage: 25
          };
          localStorage.setItem('agrismart_farmer_profile', JSON.stringify(fresh));
          return fresh;
        });
      }

      if (buyerRes.status === 'fulfilled' && buyerRes.value.data) {
        const d = buyerRes.value.data;
        const loaded: BuyerProfileData = {
          id: d.id,
          userId: d.user_id,
          fullName: d.full_name || userName || 'Buyer',
          phone: d.phone || userPhone || '',
          email: d.email || userEmail || '',
          businessName: d.business_name || '',
          businessType: d.business_type || 'Wholesaler',
          businessLocation: d.business_location || '',
          city: d.city || '',
          district: d.district || '',
          state: d.state || 'Karnataka',
          pincode: d.pincode || '',
          latitude: d.latitude ? Number(d.latitude) : undefined,
          longitude: d.longitude ? Number(d.longitude) : undefined,
          receivingAddress: d.receiving_address || '',
          primaryReceivingMarket: d.primary_receiving_market || '',
          secondaryReceivingMarket: d.secondary_receiving_market || '',
          preferredDeliveryWindow: d.preferred_delivery_window || 'Early Morning (5 AM - 9 AM)',
          preferredVegetables: d.preferred_vegetables ? d.preferred_vegetables.split(', ') : [],
          preferredQuantity: d.preferred_quantity || '',
          minimumOrderQuantity: d.minimum_order_quantity || '',
          typicalPurchaseQuantity: d.typical_purchase_quantity || '',
          buyingFrequency: d.buying_frequency || 'Daily',
          preferredQuality: d.preferred_quality || 'Grade A & Premium',
          preferredPriceRange: d.preferred_price_range || '',
          preferredMarkets: d.preferred_markets ? d.preferred_markets.split(', ') : [],
          preferredDeliveryDistance: d.preferred_delivery_distance || 'Within 100 km',
          profileCompleted: Boolean(d.profile_completed),
          completionPercentage: d.completion_percentage ?? (d.profile_completed ? 100 : 33)
        };
        setBuyerProfile(loaded);
        localStorage.setItem('agrismart_buyer_profile', JSON.stringify(loaded));
      } else if (userId) {
        setBuyerProfile(prev => {
          const fresh: BuyerProfileData = {
            ...prev,
            userId,
            fullName: userName || prev.fullName,
            email: userEmail || prev.email,
            phone: userPhone || prev.phone,
            profileCompleted: false,
            completionPercentage: 33
          };
          localStorage.setItem('agrismart_buyer_profile', JSON.stringify(fresh));
          return fresh;
        });
      }

      if (transpRes.status === 'fulfilled' && transpRes.value.data) {
        const d = transpRes.value.data;
        const loaded: TransporterProfileData = {
          id: d.id,
          userId: d.user_id,
          fullName: d.full_name || userName || 'Transporter',
          phone: d.phone || userPhone || '',
          email: d.email || userEmail || '',
          currentLocation: d.current_location || '',
          latitude: d.latitude ? Number(d.latitude) : undefined,
          longitude: d.longitude ? Number(d.longitude) : undefined,
          vehicleType: d.vehicle_type || '4-Wheeler Tempo Reefer (Cold Chain)',
          vehicleRegistrationNumber: d.vehicle_registration_number || '',
          vehicleCapacity: d.vehicle_capacity || '',
          vehicleModel: d.vehicle_model || '',
          vehicleAge: d.vehicle_age || '1 - 3 Years',
          operatingLocation: d.operating_location || '',
          preferredPickupAreas: d.preferred_pickup_areas ? d.preferred_pickup_areas.split(', ') : [],
          preferredDeliveryMarkets: d.preferred_delivery_markets ? d.preferred_delivery_markets.split(', ') : [],
          availability: d.availability || 'Available Now (GPS Active)',
          workingDays: d.working_days || 'All 7 Days',
          preferredPickupTime: d.preferred_pickup_time || 'Morning & Evening Dispatches',
          transportChargePerKm: d.transport_charge_per_km ? Number(d.transport_charge_per_km) : 22,
          minimumTripCharge: d.minimum_trip_charge ? Number(d.minimum_trip_charge) : 1800,
          additionalLoadingCharge: d.additional_loading_charge ? Number(d.additional_loading_charge) : 350,
          profileCompleted: Boolean(d.profile_completed),
          completionPercentage: d.completion_percentage ?? (d.profile_completed ? 100 : 25)
        };
        setTransporterProfile(loaded);
        localStorage.setItem('agrismart_transporter_profile', JSON.stringify(loaded));
      } else if (userId) {
        setTransporterProfile(prev => {
          const fresh: TransporterProfileData = {
            ...prev,
            userId,
            fullName: userName || prev.fullName,
            phone: userPhone || prev.phone,
            email: userEmail || prev.email,
            profileCompleted: false,
            completionPercentage: 25
          };
          localStorage.setItem('agrismart_transporter_profile', JSON.stringify(fresh));
          return fresh;
        });
      }
    } catch (err) {
      console.warn('Load role profiles notice:', err);
    } finally {
      setIsProfileLoading(false);
    }
  };

  // Supabase Auth Listener
  useEffect(() => {
    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setSupabaseSession(session);
        setSupabaseUser(session?.user ?? null);

        if (session?.user) {
          // Fetch main profile
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();

          if (profile?.role) {
            setCurrentRole(profile.role as UserRole);
            localStorage.setItem('agrismart_role', profile.role);
          }

          loadRoleProfiles(session.user.id, session.user.user_metadata);
        }
      } catch (err) {
        console.warn('Supabase auth getSession warning:', err);
      } finally {
        setIsAuthLoading(false);
      }
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSupabaseSession(session);
      setSupabaseUser(session?.user ?? null);

      if (session?.user) {
        try {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();

          if (profile?.role) {
            setCurrentRole(profile.role as UserRole);
            localStorage.setItem('agrismart_role', profile.role);
          }

          loadRoleProfiles(session.user.id, session.user.user_metadata);
        } catch (err) {
          console.warn('Profile fetch warning:', err);
        }
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Synchronize and load real Government Mandi Prices from Supabase
  useEffect(() => {
    let isMounted = true;

    const loadMandiData = async () => {
      try {
        const prices = await fetchMandiPricesFromSupabase();
        if (isMounted && prices && prices.length > 0) {
          setMandiPrices(prices);
        }

        const crop = selectedProduce?.cropName || 'Tomato';
        const comparisons = await fetchMarketComparisonsFromSupabase(crop);
        if (isMounted && comparisons && comparisons.length > 0) {
          setMarketComparisons(comparisons);
          if (!selectedMarket || !comparisons.some(c => c.id === selectedMarket.id)) {
            setSelectedMarket(comparisons[0]);
          }
        }

        const history = await fetchPriceHistoryFromSupabase(crop);
        if (isMounted && history && history.length > 0) {
          setPriceHistory(history);
        }
      } catch (err) {
        console.warn('Mandi data load notice:', err);
      }
    };

    loadMandiData();

    return () => {
      isMounted = false;
    };
  }, [selectedProduce?.cropName]);

  const saveFarmerProfile = async (data: Partial<FarmerProfileData>): Promise<boolean> => {
    const updated: FarmerProfileData = { ...farmerProfile, ...data };
    setFarmerProfile(updated);
    localStorage.setItem('agrismart_farmer_profile', JSON.stringify(updated));

    if (supabaseUser) {
      try {
        await supabase.from('farmer_profiles').upsert({
          user_id: supabaseUser.id,
          full_name: updated.fullName,
          phone: updated.phone,
          farm_location: updated.farmLocation,
          village: updated.village,
          district: updated.district,
          state: updated.state,
          pincode: updated.pincode,
          latitude: updated.latitude,
          longitude: updated.longitude,
          farm_size: updated.farmSize,
          farm_size_unit: updated.farmSizeUnit,
          main_crops: Array.isArray(updated.mainCrops) ? updated.mainCrops.join(', ') : updated.mainCrops,
          other_crops: updated.otherCrops,
          farming_experience: updated.farmingExperience,
          farming_type: updated.farmingType,
          preferred_markets: Array.isArray(updated.preferredMarkets) ? updated.preferredMarkets.join(', ') : updated.preferredMarkets,
          primary_market: updated.primaryMarket,
          secondary_market: updated.secondaryMarket,
          preferred_selling_distance: updated.preferredSellingDistance,
          typical_produce_quantity: updated.typicalProduceQuantity,
          selling_frequency: updated.sellingFrequency,
          preferred_buyer_type: updated.preferredBuyerType,
          expected_price_preference: updated.expectedPricePreference,
          minimum_price_preference: updated.minimumPricePreference,
          profile_completed: updated.profileCompleted,
          completion_percentage: updated.completionPercentage,
          updated_at: new Date().toISOString()
        });
      } catch (err) {
        console.warn('Farmer profile save notice:', err);
      }
    }
    return true;
  };

  const saveBuyerProfile = async (data: Partial<BuyerProfileData>): Promise<boolean> => {
    const updated: BuyerProfileData = { ...buyerProfile, ...data };
    setBuyerProfile(updated);
    localStorage.setItem('agrismart_buyer_profile', JSON.stringify(updated));

    if (supabaseUser) {
      try {
        await supabase.from('buyer_profiles').upsert({
          user_id: supabaseUser.id,
          full_name: updated.fullName,
          phone: updated.phone,
          email: updated.email,
          business_name: updated.businessName,
          business_type: updated.businessType,
          business_location: updated.businessLocation,
          city: updated.city,
          district: updated.district,
          state: updated.state,
          pincode: updated.pincode,
          latitude: updated.latitude,
          longitude: updated.longitude,
          receiving_address: updated.receivingAddress,
          primary_receiving_market: updated.primaryReceivingMarket,
          secondary_receiving_market: updated.secondaryReceivingMarket,
          preferred_delivery_window: updated.preferredDeliveryWindow,
          preferred_vegetables: Array.isArray(updated.preferredVegetables) ? updated.preferredVegetables.join(', ') : updated.preferredVegetables,
          preferred_quantity: updated.preferredQuantity,
          minimum_order_quantity: updated.minimumOrderQuantity,
          typical_purchase_quantity: updated.typicalPurchaseQuantity,
          buying_frequency: updated.buyingFrequency,
          preferred_quality: updated.preferredQuality,
          preferred_price_range: updated.preferredPriceRange,
          preferred_markets: Array.isArray(updated.preferredMarkets) ? updated.preferredMarkets.join(', ') : updated.preferredMarkets,
          preferred_delivery_distance: updated.preferredDeliveryDistance,
          profile_completed: updated.profileCompleted,
          completion_percentage: updated.completionPercentage,
          updated_at: new Date().toISOString()
        });
      } catch (err) {
        console.warn('Buyer profile save notice:', err);
      }
    }
    return true;
  };

  const saveTransporterProfile = async (data: Partial<TransporterProfileData>): Promise<boolean> => {
    const updated: TransporterProfileData = { ...transporterProfile, ...data };
    setTransporterProfile(updated);
    localStorage.setItem('agrismart_transporter_profile', JSON.stringify(updated));

    if (supabaseUser) {
      try {
        await supabase.from('transporter_profiles').upsert({
          user_id: supabaseUser.id,
          full_name: updated.fullName,
          phone: updated.phone,
          email: updated.email,
          current_location: updated.currentLocation,
          latitude: updated.latitude,
          longitude: updated.longitude,
          vehicle_type: updated.vehicleType,
          vehicle_registration_number: updated.vehicleRegistrationNumber,
          vehicle_capacity: updated.vehicleCapacity,
          vehicle_model: updated.vehicleModel,
          vehicle_age: updated.vehicleAge,
          operating_location: updated.operatingLocation,
          preferred_pickup_areas: Array.isArray(updated.preferredPickupAreas) ? updated.preferredPickupAreas.join(', ') : updated.preferredPickupAreas,
          preferred_delivery_markets: Array.isArray(updated.preferredDeliveryMarkets) ? updated.preferredDeliveryMarkets.join(', ') : updated.preferredDeliveryMarkets,
          availability: updated.availability,
          working_days: updated.workingDays,
          preferred_pickup_time: updated.preferredPickupTime,
          transport_charge_per_km: updated.transportChargePerKm,
          minimum_trip_charge: updated.minimumTripCharge,
          additional_loading_charge: updated.additionalLoadingCharge,
          profile_completed: updated.profileCompleted,
          completion_percentage: updated.completionPercentage,
          updated_at: new Date().toISOString()
        });
      } catch (err) {
        console.warn('Transporter profile save notice:', err);
      }
    }
    return true;
  };

  const isProfileComplete = (role: UserRole): boolean => {
    if (role === 'farmer') return Boolean(farmerProfile.profileCompleted);
    if (role === 'buyer') return Boolean(buyerProfile.profileCompleted);
    return Boolean(transporterProfile.profileCompleted);
  };

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem('agrismart_role', currentRole);
  }, [currentRole]);

  useEffect(() => {
    localStorage.setItem('agrismart_produce', JSON.stringify(produceListings));
  }, [produceListings]);

  useEffect(() => {
    localStorage.setItem('agrismart_negotiations', JSON.stringify(negotiations));
  }, [negotiations]);

  useEffect(() => {
    localStorage.setItem('agrismart_orders', JSON.stringify(orders));
  }, [orders]);

  // Compute currentUser (merging Supabase user metadata if available with mock persona data)
  const baseUser = INITIAL_USERS[currentRole] || INITIAL_USERS.farmer;
  const currentUser: UserProfile = supabaseUser
    ? {
        ...baseUser,
        id: supabaseUser.id,
        name:
          supabaseUser.user_metadata?.full_name ||
          supabaseUser.user_metadata?.name ||
          baseUser.name,
        email: supabaseUser.email || baseUser.email,
        avatarUrl:
          supabaseUser.user_metadata?.avatar_url ||
          supabaseUser.user_metadata?.picture ||
          baseUser.avatarUrl,
        role: currentRole
      }
    : baseUser;

  const switchRole = (role: UserRole) => {
    setCurrentRole(role);
  };

  const loginWithGoogle = async () => {
    try {
      const redirectUrl = `${window.location.origin}/auth/callback`;
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent'
          }
        }
      });
      return { error };
    } catch (err: any) {
      return { error: err };
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.warn('Sign out error:', err);
    } finally {
      setSupabaseUser(null);
      setSupabaseSession(null);
      localStorage.removeItem('agrismart_role');
      setCurrentRole('farmer');
    }
  };

  const assignRole = async (role: UserRole): Promise<boolean> => {
    setCurrentRole(role);
    localStorage.setItem('agrismart_role', role);

    if (supabaseUser) {
      try {
        const { error } = await supabase.from('profiles').upsert({
          id: supabaseUser.id,
          email: supabaseUser.email,
          full_name:
            supabaseUser.user_metadata?.full_name ||
            supabaseUser.user_metadata?.name ||
            currentUser.name,
          avatar_url:
            supabaseUser.user_metadata?.avatar_url ||
            supabaseUser.user_metadata?.picture ||
            currentUser.avatarUrl,
          role,
          updated_at: new Date().toISOString()
        });

        if (error) {
          console.warn('Could not persist profile role to Supabase:', error);
        }
      } catch (err) {
        console.warn('Upsert profile error:', err);
      }
    }
    return true;
  };

  const addProduceListing = (data: {
    cropName: string;
    variety: string;
    category: 'Vegetables' | 'Fruits' | 'Grains' | 'Pulses';
    qualityGrade: 'Grade A' | 'Grade B' | 'Organic Certified' | 'Premium';
    quantityKg: number;
    minOrderQuantityKg: number;
    pricePerKg: number;
    harvestDate: string;
    shelfLifeDays: number;
    imageUrl?: string;
    description?: string;
  }): ProduceListing => {
    const newListing: ProduceListing = {
      id: `prod_${Date.now()}`,
      farmerId: currentUser.id,
      farmerName: currentUser.name,
      farmerLocation: currentUser.location,
      farmerAvatar: currentUser.avatarUrl || FARMER_AVATAR,
      cropName: data.cropName,
      variety: data.variety,
      category: data.category,
      imageUrl: data.imageUrl || TOMATO_IMG,
      qualityGrade: data.qualityGrade,
      quantityKg: data.quantityKg,
      minOrderQuantityKg: data.minOrderQuantityKg,
      pricePerKg: data.pricePerKg,
      aiSuggestedPrice: data.pricePerKg * 0.98,
      harvestDate: data.harvestDate || 'Just now',
      shelfLifeDays: data.shelfLifeDays || 10,
      status: 'Active',
      description: data.description || 'Verified fresh produce direct from farm.'
    };

    setProduceListings(prev => [newListing, ...prev]);
    setSelectedProduce(newListing);
    return newListing;
  };

  const startNegotiationForProduce = (produce: ProduceListing): NegotiationDeal => {
    const existing = negotiations.find(n => n.produceId === produce.id && n.status !== 'DEAL_CLOSED');
    if (existing) {
      setCurrentNegotiation(existing);
      return existing;
    }

    const newDeal: NegotiationDeal = {
      id: `deal_${Date.now()}`,
      produceId: produce.id,
      cropName: produce.cropName,
      produceImage: produce.imageUrl,
      farmerId: produce.farmerId,
      farmerName: produce.farmerName,
      buyerId: INITIAL_USERS.buyer.id,
      buyerName: INITIAL_USERS.buyer.businessName || 'XYZ Traders',
      quantityKg: produce.quantityKg,
      originalPricePerKg: produce.pricePerKg,
      currentOfferPricePerKg: produce.pricePerKg * 0.95,
      lastOfferedBy: 'buyer',
      aiFairPriceMin: Number((produce.pricePerKg * 0.92).toFixed(1)),
      aiFairPriceMax: Number((produce.pricePerKg * 0.98).toFixed(1)),
      status: 'PENDING',
      messages: [
        {
          sender: 'farmer',
          text: `Listed ${produce.quantityKg}kg of ${produce.cropName} at ₹${produce.pricePerKg}/kg.`,
          timestamp: 'Just now',
          offeredPrice: produce.pricePerKg
        },
        {
          sender: 'buyer',
          text: `Hi ${produce.farmerName}, we would like to procure ${produce.quantityKg}kg. Proposing ₹${(produce.pricePerKg * 0.95).toFixed(1)}/kg for prompt pickup.`,
          timestamp: 'Just now',
          offeredPrice: produce.pricePerKg * 0.95
        },
        {
          sender: 'system',
          text: `AI Guidance: Fair market equilibrium for ${produce.cropName} is ₹${(produce.pricePerKg * 0.92).toFixed(1)} – ₹${(produce.pricePerKg * 0.98).toFixed(1)}/kg.`,
          timestamp: 'Just now'
        }
      ]
    };

    setNegotiations(prev => [newDeal, ...prev]);
    setCurrentNegotiation(newDeal);
    return newDeal;
  };

  const sendCounterOffer = (dealId: string, pricePerKg: number, message: string) => {
    setNegotiations(prev =>
      prev.map(deal => {
        if (deal.id !== dealId) return deal;
        const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const sender = currentRole === 'farmer' ? 'farmer' : 'buyer';
        const updated: NegotiationDeal = {
          ...deal,
          currentOfferPricePerKg: pricePerKg,
          lastOfferedBy: sender,
          status: 'COUNTERED',
          messages: [
            ...deal.messages,
            {
              sender,
              text: message || `Counter offered at ₹${pricePerKg}/kg`,
              timestamp: now,
              offeredPrice: pricePerKg
            }
          ]
        };
        if (currentNegotiation?.id === dealId) {
          setCurrentNegotiation(updated);
        }
        return updated;
      })
    );
  };

  const acceptDeal = (dealId: string): NegotiationDeal | null => {
    let result: NegotiationDeal | null = null;
    setNegotiations(prev =>
      prev.map(deal => {
        if (deal.id !== dealId) return deal;
        const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const updated: NegotiationDeal = {
          ...deal,
          status: 'ACCEPTED',
          messages: [
            ...deal.messages,
            {
              sender: 'system',
              text: `Deal accepted at agreed rate of ₹${deal.currentOfferPricePerKg}/kg. Proceeding to Transporter Matching.`,
              timestamp: now,
              offeredPrice: deal.currentOfferPricePerKg
            }
          ]
        };
        result = updated;
        if (currentNegotiation?.id === dealId) {
          setCurrentNegotiation(updated);
        }
        return updated;
      })
    );
    return result;
  };

  const createOrder = (
    produce: ProduceListing,
    transporter: TransporterOption,
    agreedPrice?: number
  ): OrderItem => {
    const finalPrice = agreedPrice || produce.pricePerKg;
    const produceSubtotal = produce.quantityKg * finalPrice;
    const transportCost = transporter.totalCost;
    const escrowFee = Math.round(produceSubtotal * 0.015);
    const totalAmount = produceSubtotal + transportCost + escrowFee;

    const newOrder: OrderItem = {
      id: `order_${Date.now()}`,
      orderNumber: `AG-${Math.floor(1000 + Math.random() * 9000)}`,
      produceId: produce.id,
      cropName: produce.cropName,
      variety: `${produce.variety} (${produce.qualityGrade})`,
      produceImage: produce.imageUrl,
      quantityKg: produce.quantityKg,
      agreedPricePerKg: finalPrice,
      produceSubtotal,
      transportCost,
      escrowFee,
      totalAmount,
      farmer: {
        id: produce.farmerId,
        name: produce.farmerName,
        phone: '+91 98450 12345',
        location: produce.farmerLocation,
        avatar: produce.farmerAvatar
      },
      buyer: {
        id: INITIAL_USERS.buyer.id,
        name: INITIAL_USERS.buyer.name,
        businessName: INITIAL_USERS.buyer.businessName || 'XYZ Traders',
        phone: INITIAL_USERS.buyer.phone,
        warehouseAddress: 'KR Market Depot 4B, Bangalore Central',
        avatar: INITIAL_USERS.buyer.avatarUrl
      },
      transporter,
      status: 'ORDER_PLACED',
      createdAt: 'Just now',
      estimatedDeliveryTime: 'Today, 03:45 PM',
      currentLocation: {
        lat: 12.5218,
        lng: 76.8951,
        description: `${produce.farmerLocation} Dispatch Bay`,
        speedKmh: 0,
        temperatureCelsius: 18.0
      },
      trackingSteps: [
        {
          title: 'Order Confirmed & Escrow Funded',
          description: `₹${totalAmount.toLocaleString()} held in secure AgriEscrow`,
          timestamp: 'Just now',
          isCompleted: true,
          isCurrent: true
        },
        {
          title: 'Transporter Assigned',
          description: `${transporter.name} (${transporter.vehicleType})`,
          timestamp: 'Pending Dispatch',
          isCompleted: false,
          isCurrent: false
        },
        {
          title: 'Produce Loaded at Farm',
          description: `${produce.quantityKg}kg verified at farm pickup`,
          timestamp: 'Pending Loading',
          isCompleted: false,
          isCurrent: false
        },
        {
          title: 'In Transit to Destination',
          description: 'Live GPS & Cold-Chain Telemetry active',
          timestamp: 'Pending Transit',
          isCompleted: false,
          isCurrent: false
        },
        {
          title: 'Delivered & Payment Released',
          description: 'Weighbridge inspection and buyer OTP verification',
          timestamp: 'Expected in ~3.5 hrs',
          isCompleted: false,
          isCurrent: false
        }
      ],
      routeDetails: {
        origin: produce.farmerLocation,
        destination: 'KR Market Depot 4B, Bangalore Central',
        distanceKm: transporter.distanceKm,
        durationStr: `${transporter.transitTimeHrs} hrs`,
        tollsCost: 180,
        fuelSavingPercent: 12
      },
      deliveryVerification: {
        otp: String(Math.floor(1000 + Math.random() * 9000)),
        weighedKg: produce.quantityKg,
        qualityChecked: true,
        gradeConfirmed: produce.qualityGrade
      }
    };

    setOrders(prev => [newOrder, ...prev]);
    setActiveOrder(newOrder);

    // Sync authoritative order record to Supabase
    syncOrderToSupabase(newOrder, supabaseUser?.id).catch(err =>
      console.warn('Background sync order error:', err)
    );

    return newOrder;
  };

  const updateOrderStatus = (orderId: string, newStatus: OrderStatus) => {
    setOrders(prev =>
      prev.map(order => {
        if (order.id !== orderId) return order;
        const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const updatedSteps = order.trackingSteps.map((step, idx) => {
          if (newStatus === 'TRANSPORTER_ASSIGNED' && idx <= 1) {
            return { ...step, isCompleted: true, isCurrent: idx === 1, timestamp: now };
          }
          if (newStatus === 'PICKED_UP' && idx <= 2) {
            return { ...step, isCompleted: true, isCurrent: idx === 2, timestamp: now };
          }
          if (newStatus === 'IN_TRANSIT' && idx <= 3) {
            return { ...step, isCompleted: true, isCurrent: idx === 3, timestamp: now };
          }
          if ((newStatus === 'DELIVERED' || newStatus === 'PAYMENT_RELEASED' || newStatus === 'COMPLETED') && idx <= 4) {
            return { ...step, isCompleted: true, isCurrent: idx === 4, timestamp: now };
          }
          return step;
        });

        const updated: OrderItem = {
          ...order,
          status: newStatus,
          trackingSteps: updatedSteps
        };
        if (activeOrder?.id === orderId) {
          setActiveOrder(updated);
        }
        return updated;
      })
    );

    // Update status in Supabase backend
    updateOrderStatusInSupabase(orderId, newStatus).catch(err =>
      console.warn('Background update order status error:', err)
    );
  };

  const acceptTransportJob = (orderId: string) => {
    updateOrderStatus(orderId, 'TRANSPORTER_ASSIGNED');
    // Atomically claim in Supabase
    claimTransportJobInSupabase(orderId).catch(err =>
      console.warn('Background claim transport job error:', err)
    );
  };

  const startTrip = (orderId: string) => {
    updateOrderStatus(orderId, 'IN_TRANSIT');
  };

  const completeDelivery = (
    orderId: string,
    verification: {
      otp: string;
      weighedKg: number;
      qualityChecked: boolean;
      gradeConfirmed: string;
      signedBy: string;
    }
  ) => {
    setOrders(prev =>
      prev.map(order => {
        if (order.id !== orderId) return order;
        const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const updated: OrderItem = {
          ...order,
          status: 'COMPLETED',
          deliveryVerification: {
            otp: verification.otp,
            weighedKg: verification.weighedKg,
            qualityChecked: verification.qualityChecked,
            gradeConfirmed: verification.gradeConfirmed,
            signedBy: verification.signedBy,
            deliveredAt: now
          },
          trackingSteps: order.trackingSteps.map(s => ({ ...s, isCompleted: true, isCurrent: false }))
        };
        if (activeOrder?.id === orderId) {
          setActiveOrder(updated);
        }
        return updated;
      })
    );

    // Mark completed in Supabase
    updateOrderStatusInSupabase(orderId, 'COMPLETED').catch(err =>
      console.warn('Background complete order status error:', err)
    );
  };

  return (
    <AppContext.Provider
      value={{
        currentRole,
        currentUser,
        switchRole,
        supabaseUser,
        supabaseSession,
        isAuthLoading,
        isProfileLoading,
        loginWithGoogle,
        logout,
        assignRole,
        farmerProfile,
        buyerProfile,
        transporterProfile,
        saveFarmerProfile,
        saveBuyerProfile,
        saveTransporterProfile,
        isProfileComplete,
        produceListings,
        addProduceListing,
        selectedProduce,
        setSelectedProduce,
        marketComparisons,
        selectedMarket,
        setSelectedMarket,
        mandiPrices,
        priceHistory,
        negotiations,
        currentNegotiation,
        setCurrentNegotiation,
        startNegotiationForProduce,
        sendCounterOffer,
        acceptDeal,
        transporters,
        selectedTransporter,
        setSelectedTransporter,
        orders,
        activeOrder,
        setActiveOrder,
        createOrder,
        updateOrderStatus,
        acceptTransportJob,
        startTrip,
        completeDelivery
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
