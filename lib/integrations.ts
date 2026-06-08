export type IntegrationCategory = 
  | "payment" 
  | "delivery" 
  | "fintech" 
  | "banking" 
  | "business" 
  | "cloud" 
  | "crm" 
  | "erp" 
  | "development"

export type IntegrationStatus = "connected" | "available" | "beta" | "coming-soon"

export interface Integration {
  id: string
  name: string
  category: IntegrationCategory
  status: IntegrationStatus
  description: string
  icon?: string
  features?: string[]
}

// Helper to generate Simple Icons URL
const simpleIcon = (name: string, color: string = "#6366f1") => 
  `https://cdn.simpleicons.org/${encodeURIComponent(name.toLowerCase())}/${color.replace("#", "")}`

// Brand color map
const brandColors: Record<string, string> = {
  // Payment
  stripe: "#635BFF",
  paypal: "#003087",
  square: "#5E5E5E",
  razorpay: "#0C6DFF",
  billplz: "#00B9E8",
  touchngo: "#00A3E0",
  grabpay: "#00B14F",
  boost: "#F05A28",
  shopeepay: "#EE4D2D",
  wechatpay: "#2B9C2E",
  alipay: "#1677FF",
  applepay: "#000000",
  googlepay: "#4285F4",
  // Delivery
  lalamove: "#00C3F3",
  grabfood: "#00B14F",
  foodpanda: "#D70F64",
  dhl: "#FFCC00",
  fedex: "#4D148C",
  ups: "#351C15",
  ninjavan: "#E21E2E",
  jtexpress: "#0B4EA2",
  posmalaysia: "#1A3E82",
  // Fintech
  adyen: "#0ABF53",
  checkoutdotcom: "#00B3A1",
  airwallex: "#254B8C",
  revolut: "#F5383D",
  wise: "#00B9A3",
  nium: "#1F2A3E",
  rapyd: "#3F7E9C",
  thunes: "#00A3E0",
  moneygram: "#FF6600",
  westernunion: "#FFB800",
  // Banking (using fallback colors)
  maybank: "#D62828",
  cimb: "#003D6B",
  publicbank: "#D32F2F",
  rhb: "#003153",
  hongleong: "#004B87",
  ocbc: "#003366",
  uob: "#1E8C3A",
  bankislam: "#00843D",
  bankrakyat: "#E31E24",
  affinbank: "#004B87",
}

export const integrations: Integration[] = [
  // PAYMENT PROVIDERS
  {
    id: "stripe",
    name: "Stripe",
    category: "payment",
    status: "connected",
    description: "Payment processing, subscriptions, and fraud prevention.",
    icon: simpleIcon("stripe", brandColors.stripe),
  },
  {
    id: "paypal",
    name: "PayPal",
    category: "payment",
    status: "connected",
    description: "Digital payments for global transactions.",
    icon: simpleIcon("paypal", brandColors.paypal),
  },
  {
    id: "square",
    name: "Square",
    category: "payment",
    status: "available",
    description: "POS and online payment solutions.",
    icon: simpleIcon("square", brandColors.square),
  },
  {
    id: "razorpay",
    name: "Razorpay",
    category: "payment",
    status: "available",
    description: "Payment gateway for businesses.",
    icon: simpleIcon("razorpay", brandColors.razorpay),
  },
  {
    id: "billplz",
    name: "Billplz",
    category: "payment",
    status: "connected",
    description: "Malaysian online payment gateway.",
    icon: simpleIcon("billplz", brandColors.billplz),
  },
  {
    id: "tng",
    name: "Touch 'n Go",
    category: "payment",
    status: "available",
    description: "Digital wallet and payment services.",
    icon: simpleIcon("touchngo", brandColors.touchngo),
  },
  {
    id: "grabpay",
    name: "GrabPay",
    category: "payment",
    status: "available",
    description: "E-wallet and payment solutions.",
    icon: simpleIcon("grabpay", brandColors.grabpay),
  },
  {
    id: "boost",
    name: "Boost",
    category: "payment",
    status: "beta",
    description: "AIA-backed e-wallet and payments.",
    icon: simpleIcon("boost", brandColors.boost),
  },
  {
    id: "shopeepay",
    name: "ShopeePay",
    category: "payment",
    status: "available",
    description: "E-wallet integrated with Shopee.",
    icon: simpleIcon("shopeepay", brandColors.shopeepay),
  },
  {
    id: "wechatpay",
    name: "WeChat Pay",
    category: "payment",
    status: "coming-soon",
    description: "Chinese digital payment platform.",
    icon: simpleIcon("wechatpay", brandColors.wechatpay),
  },
  {
    id: "alipay",
    name: "Alipay",
    category: "payment",
    status: "coming-soon",
    description: "Global digital payment platform.",
    icon: simpleIcon("alipay", brandColors.alipay),
  },
  {
    id: "applepay",
    name: "Apple Pay",
    category: "payment",
    status: "beta",
    description: "Apple's mobile payment service.",
    icon: simpleIcon("applepay", brandColors.applepay),
  },
  {
    id: "googlepay",
    name: "Google Pay",
    category: "payment",
    status: "beta",
    description: "Google's digital wallet platform.",
    icon: simpleIcon("googlepay", brandColors.googlepay),
  },

  // DELIVERY PROVIDERS
  {
    id: "lalamove",
    name: "Lalamove",
    category: "delivery",
    status: "connected",
    description: "On-demand delivery and logistics.",
    icon: simpleIcon("lalamove", brandColors.lalamove),
  },
  {
    id: "grabfood",
    name: "GrabExpress",
    category: "delivery",
    status: "available",
    description: "Instant parcel delivery service.",
    icon: simpleIcon("grabfood", brandColors.grabfood),
  },
  {
    id: "foodpanda",
    name: "foodpanda",
    category: "delivery",
    status: "available",
    description: "Food and grocery delivery.",
    icon: simpleIcon("foodpanda", brandColors.foodpanda),
  },
  {
    id: "dhl",
    name: "DHL",
    category: "delivery",
    status: "available",
    description: "International express shipping.",
    icon: simpleIcon("dhl", brandColors.dhl),
  },
  {
    id: "fedex",
    name: "FedEx",
    category: "delivery",
    status: "available",
    description: "Global courier delivery services.",
    icon: simpleIcon("fedex", brandColors.fedex),
  },
  {
    id: "ups",
    name: "UPS",
    category: "delivery",
    status: "coming-soon",
    description: "Worldwide package delivery.",
    icon: simpleIcon("ups", brandColors.ups),
  },
  {
    id: "ninjavan",
    name: "Ninja Van",
    category: "delivery",
    status: "available",
    description: "Last-mile logistics in SE Asia.",
    icon: simpleIcon("ninjavan", brandColors.ninjavan),
  },
  {
    id: "jtexpress",
    name: "J&T Express",
    category: "delivery",
    status: "available",
    description: "E-commerce logistics partner.",
    icon: simpleIcon("jtexpress", brandColors.jtexpress),
  },
  {
    id: "posmalaysia",
    name: "Pos Malaysia",
    category: "delivery",
    status: "beta",
    description: "National postal service.",
    icon: simpleIcon("posmalaysia", brandColors.posmalaysia),
  },

  // FINTECH PROVIDERS
  {
    id: "adyen",
    name: "Adyen",
    category: "fintech",
    status: "available",
    description: "End-to-end payment platform.",
    icon: simpleIcon("adyen", brandColors.adyen),
  },
  {
    id: "checkout",
    name: "Checkout.com",
    category: "fintech",
    status: "available",
    description: "Global payment solutions.",
    icon: simpleIcon("checkoutdotcom", brandColors.checkoutdotcom),
  },
  {
    id: "airwallex",
    name: "Airwallex",
    category: "fintech",
    status: "beta",
    description: "Cross-border payment platform.",
    icon: simpleIcon("airwallex", brandColors.airwallex),
  },
  {
    id: "revolut",
    name: "Revolut",
    category: "fintech",
    status: "coming-soon",
    description: "Digital banking and payments.",
    icon: simpleIcon("revolut", brandColors.revolut),
  },
  {
    id: "wise",
    name: "Wise",
    category: "fintech",
    status: "available",
    description: "International money transfers.",
    icon: simpleIcon("wise", brandColors.wise),
  },
  {
    id: "nium",
    name: "Nium",
    category: "fintech",
    status: "beta",
    description: "Real-time cross-border payments.",
    icon: simpleIcon("nium", brandColors.nium),
  },
  {
    id: "rapyd",
    name: "Rapyd",
    category: "fintech",
    status: "coming-soon",
    description: "Fintech-as-a-service platform.",
    icon: simpleIcon("rapyd", brandColors.rapyd),
  },
  {
    id: "thunes",
    name: "Thunes",
    category: "fintech",
    status: "beta",
    description: "Cross-border payment network.",
    icon: simpleIcon("thunes", brandColors.thunes),
  },
  {
    id: "moneygram",
    name: "MoneyGram",
    category: "fintech",
    status: "available",
    description: "Global money transfer service.",
    icon: simpleIcon("moneygram", brandColors.moneygram),
  },
  {
    id: "westernunion",
    name: "Western Union",
    category: "fintech",
    status: "available",
    description: "International payment services.",
    icon: simpleIcon("westernunion", brandColors.westernunion),
  },

  // BANKING PROVIDERS
  {
    id: "maybank",
    name: "Maybank",
    category: "banking",
    status: "connected",
    description: "Malaysia's largest bank. FPX and API integration.",
    icon: simpleIcon("maybank", brandColors.maybank),
  },
  {
    id: "cimb",
    name: "CIMB Bank",
    category: "banking",
    status: "available",
    description: "ASEAN banking group with API access.",
    icon: simpleIcon("cimb", brandColors.cimb),
  },
  {
    id: "publicbank",
    name: "Public Bank",
    category: "banking",
    status: "available",
    description: "Online banking and payment integration.",
    icon: simpleIcon("publicbank", brandColors.publicbank),
  },
  {
    id: "rhb",
    name: "RHB Bank",
    category: "banking",
    status: "beta",
    description: "Digital banking solutions.",
    icon: simpleIcon("rhb", brandColors.rhb),
  },
  {
    id: "hongleong",
    name: "Hong Leong Bank",
    category: "banking",
    status: "beta",
    description: "Connect banking services.",
    icon: simpleIcon("hongleong", brandColors.hongleong),
  },
  {
    id: "ocbc",
    name: "OCBC Bank",
    category: "banking",
    status: "coming-soon",
    description: "Singaporean banking services.",
    icon: simpleIcon("ocbc", brandColors.ocbc),
  },
  {
    id: "uob",
    name: "UOB",
    category: "banking",
    status: "coming-soon",
    description: "United Overseas Bank integration.",
    icon: simpleIcon("uob", brandColors.uob),
  },
  {
    id: "bankislam",
    name: "Bank Islam",
    category: "banking",
    status: "beta",
    description: "Islamic banking services.",
    icon: simpleIcon("bankislam", brandColors.bankislam),
  },
  {
    id: "bankrakyat",
    name: "Bank Rakyat",
    category: "banking",
    status: "beta",
    description: "Cooperative banking solutions.",
    icon: simpleIcon("bankrakyat", brandColors.bankrakyat),
  },
  {
    id: "affin",
    name: "Affin Bank",
    category: "banking",
    status: "coming-soon",
    description: "Digital banking platform.",
    icon: simpleIcon("affinbank", brandColors.affinbank),
  },
]

// Helper functions
export function getIntegrationsByCategory(category: IntegrationCategory): Integration[] {
  return integrations.filter(i => i.category === category)
}

export function getIntegrationsByStatus(status: IntegrationStatus): Integration[] {
  return integrations.filter(i => i.status === status)
}

export function searchIntegrations(query: string): Integration[] {
  const lowerQuery = query.toLowerCase()
  return integrations.filter(i => 
    i.name.toLowerCase().includes(lowerQuery) ||
    i.description.toLowerCase().includes(lowerQuery)
  )
}
