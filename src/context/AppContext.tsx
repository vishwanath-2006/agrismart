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
  OrderStatus
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

interface AppContextType {
  currentRole: UserRole;
  currentUser: UserProfile;
  switchRole: (role: UserRole) => void;

  // Supabase Auth
  supabaseUser: User | null;
  supabaseSession: Session | null;
  isAuthLoading: boolean;
  loginWithGoogle: () => Promise<{ error: Error | null }>;
  logout: () => Promise<void>;
  assignRole: (role: UserRole) => Promise<boolean>;

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
  const [marketComparisons] = useState<MarketComparisonItem[]>(MOCK_MARKET_COMPARISONS);
  const [selectedMarket, setSelectedMarket] = useState<MarketComparisonItem | null>(MOCK_MARKET_COMPARISONS[0]);
  const [mandiPrices] = useState<MandiPriceItem[]>(MOCK_MANDI_PRICES);
  const [priceHistory] = useState<PriceHistoryPoint[]>(MOCK_PRICE_HISTORY_POINTS);
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

  // Supabase Auth Listener
  useEffect(() => {
    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setSupabaseSession(session);
        setSupabaseUser(session?.user ?? null);

        if (session?.user) {
          // Fetch profile
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();

          if (profile?.role) {
            setCurrentRole(profile.role as UserRole);
            localStorage.setItem('agrismart_role', profile.role);
          }
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
        } catch (err) {
          console.warn('Profile fetch warning:', err);
        }
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

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
  };

  const acceptTransportJob = (orderId: string) => {
    updateOrderStatus(orderId, 'TRANSPORTER_ASSIGNED');
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
        loginWithGoogle,
        logout,
        assignRole,
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
