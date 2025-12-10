// User Types
export interface User {
  userID: number
  username: string
  fullName?: string
  email: string
  phoneNumber?: string
  address?: string
  role: 'ADMIN' | 'CUSTOMER' | 'STAFF'
  authProvider: 'LOCAL' | 'GOOGLE' | 'FACEBOOK'
  token?: string
  refreshToken?: string
  storeLocationId?: number
  storeLocation?: StoreLocation
}

export interface LoginRequest {
  username: string
  password: string
}

export interface RegisterRequest {
  username: string
  password: string
  confirmPassword: string
  email: string
  phoneNumber?: string
  address?: string
}

// Product Types
export interface Product {
  id?: number
  productID?: number
  productName: string
  price: number
  imageURL: string
  briefDescription: string
  brand?: Brand
  category?: Category
  active?: boolean
  createdAt?: string
  updatedAt?: string
}

export interface ProductDetail {
  id: number
  productName: string
  slug?: string
  sku?: string
  briefDescription: string
  fullDescription: string
  technicalSpecifications: string
  price: number
  imageURL: string
  brand: Brand
  category: Category
  // New fields from updated Product entity
  powerWatt?: number // Công suất (W)
  bladeDiameterCm?: number // Đường kính cánh quạt (cm)
  colorDefault?: string // Màu sắc mặc định
  warrantyMonths?: number // Bảo hành (tháng)
  quantity?: number // Số lượng sản phẩm
  // Technical specifications
  voltage?: string // Điện áp sử dụng: "220V / 50Hz"
  windSpeedLevels?: string // Tốc độ gió: "3 mức" hoặc "Điều chỉnh vô cấp"
  airflow?: number // Lưu lượng gió: m³/phút
  bladeMaterial?: string // Chất liệu cánh quạt: "Nhựa ABS" / "Kim loại"
  bodyMaterial?: string // Chất liệu thân quạt: "Nhựa cao cấp" / "Thép sơn tĩnh điện"
  bladeCount?: number // Số lượng cánh: 3 / 5
  noiseLevel?: number // Mức độ ồn: dB
  motorSpeed?: number // Tốc độ quay motor: vòng/phút
  weight?: number // Trọng lượng: kg
  adjustableHeight?: string // Chiều cao điều chỉnh: "1.1 – 1.4 m"
  // Features
  remoteControl?: boolean // Điều khiển từ xa
  timer?: string // Hẹn giờ tắt: "1 – 4 giờ"
  naturalWindMode?: boolean // Chế độ gió tự nhiên
  sleepMode?: boolean // Chế độ ngủ
  oscillation?: boolean // Đảo chiều gió
  heightAdjustable?: boolean // Điều chỉnh độ cao
  autoShutoff?: boolean // Ngắt điện tự động khi quá tải
  temperatureSensor?: boolean // Cảm biến nhiệt
  energySaving?: boolean // Tiết kiệm điện
  // Other information
  safetyStandards?: string // Tiêu chuẩn an toàn: "TCVN / IEC / RoHS"
  manufacturingYear?: number // Năm sản xuất: 2025
  accessories?: string // Phụ kiện đi kèm: "Điều khiển / Pin / HDSD"
  energyRating?: string // Mức tiết kiệm điện năng: "5 sao"
}

export interface Brand {
  brandID: number
  name: string
  imageURL?: string
}

export interface BrandManagement {
  brandID: number
  name: string
  country: string
  description: string
  imageURL?: string
  active: boolean
}

export interface Category {
  id: number
  name: string
}

export interface CategoryManagement {
  categoryID: number
  categoryName: string
  active: boolean
}

export interface ProductRequest {
  productName: string
  // SKU and Slug are auto-generated, not accepted from request
  briefDescription: string
  fullDescription: string
  technicalSpecifications: string
  price: number
  imageURL: string
  brandID: number
  categoryID: number
  // New fields from updated Product entity
  powerWatt?: number // Công suất (W)
  bladeDiameterCm?: number // Đường kính cánh quạt (cm)
  colorDefault?: string // Legacy field, keep for backward compatibility
  warrantyMonths?: number // Legacy field, keep for backward compatibility
  
  // Technical specifications
  voltage?: string // Điện áp sử dụng: "220V / 50Hz"
  windSpeedLevels?: string // Tốc độ gió: "3 mức" hoặc "Điều chỉnh vô cấp"
  airflow?: number // Lưu lượng gió: m³/phút
  bladeMaterial?: string // Chất liệu cánh quạt: "Nhựa ABS" / "Kim loại"
  bodyMaterial?: string // Chất liệu thân quạt: "Nhựa cao cấp" / "Thép sơn tĩnh điện"
  bladeCount?: number // Số lượng cánh: 3 / 5
  noiseLevel?: number // Mức độ ồn: dB
  motorSpeed?: number // Tốc độ quay motor: vòng/phút
  weight?: number // Trọng lượng: kg
  adjustableHeight?: string // Chiều cao điều chỉnh: "1.1 – 1.4 m"
  
  // Features
  remoteControl?: boolean // Điều khiển từ xa
  timer?: string // Hẹn giờ tắt: "1 – 4 giờ"
  naturalWindMode?: boolean // Chế độ gió tự nhiên
  sleepMode?: boolean // Chế độ ngủ
  oscillation?: boolean // Đảo chiều gió
  heightAdjustable?: boolean // Điều chỉnh độ cao
  autoShutoff?: boolean // Ngắt điện tự động khi quá tải
  temperatureSensor?: boolean // Cảm biến nhiệt
  energySaving?: boolean // Tiết kiệm điện
  
  // Other information
  safetyStandards?: string // Tiêu chuẩn an toàn: "TCVN / IEC / RoHS"
  manufacturingYear?: number // Năm sản xuất: 2025
  accessories?: string // Phụ kiện đi kèm: "Điều khiển / Pin / HDSD"
  energyRating?: string // Mức tiết kiệm điện năng: "5 sao"
  
  // New relationship fields
  colorIds?: number[] // List of color IDs
  warrantyId?: number // Warranty ID
  // Quantity field
  quantity?: number // Số lượng sản phẩm
  // Warehouse field (optional - if specified, add product to this warehouse instead of first main warehouse)
  warehouseId?: number // ID của kho tổng để thêm sản phẩm
}

export interface Color {
  id: number
  name: string
  hexCode?: string
  description?: string
}

export interface Warranty {
  id: number
  name: string
  durationMonths: number
  description?: string
  termsAndConditions?: string
  coverage?: string
}

// ProductDTO is an alias for Product for consistency with backend
export type ProductDTO = Product

// Cart Types
export interface CartItem {
  cartItemID: number
  quantity: number
  price: number
  cart: Cart
  product: Product
}

export interface Cart {
  cartID: number
  totalPrice: number
  status: string
  user: User
  cartItems: CartItem[]
}

export interface AddToCartRequest {
  productId: number
  quantity: number
  userName: string
}

// API Response Types
export interface ApiResponse<T> {
  statusCode: number
  message: string
  data: T
  dateTime: string
}

export interface Pagination {
  page: number
  size: number
  totalPages: number
  totalElements: number
}

export interface HomepageResponse {
  filters?: {
    selectedCategory: string
    selectedBrand: string
    sortOption: string
  }
  categories: Category[]
  brands: Brand[]
  products: Product[]
  pagination: Pagination
}

// Payment Types
export interface VNPayResponse {
  code: string
  message: string
  paymentUrl: string
}

// Notification Types
export interface Notification {
  notificationID: number
  message: string
  isRead: boolean
  createdAt: string
  user: User
}

// Chat Types
export interface ChatMessage {
  chatMessageID: number
  message: string
  sentAt: string
  updatedAt: string
  attachmentUrl?: string
  attachmentType?: string
  replyToMessageId?: string
  metadata?: string
  sender: User
  receiver: User
}

export interface ChatRoomManagement {
  roomId: string
  participants: Record<string, boolean>
  lastMessage: string
  lastMessageTime: string
  customerName: string
  customerAvatar?: string
  isOnline: boolean
  unreadCount: number
}

// Store Location Types
export interface StoreLocation {
  locationID: number
  latitude: number
  longitude: number
  address: string
}

// Vietnam Address Types (API v2)
export interface VietnamProvince {
  code: number
  name: string
  nameEn: string
  fullName: string
  fullNameEn: string
  codeName: string
  divisionType: string
  phoneCode: number
  wards: VietnamWard[]
}

export interface VietnamDistrict {
  code: number
  name: string
  nameEn: string
  fullName: string
  fullNameEn: string
  codeName: string
  divisionType: string
  provinceCode: number
  wards: VietnamWard[]
}

export interface VietnamWard {
  code: number
  name: string
  nameEn: string
  fullName: string
  fullNameEn: string
  codeName: string
  divisionType: string
  provinceCode: number
  districtCode?: number
}

// Checkout Types
export interface CheckoutInfo {
  deliveryType: 'pickup' | 'delivery'
  // Pickup fields
  provincePickup?: number
  wardPickup?: string // Changed from districtPickup - after merger, only wards exist
  storePickup?: number
  notePickup?: string
  // Delivery fields
  recipientName?: string
  recipientPhone?: string
  provinceDelivery?: number
  wardDelivery?: string // Changed from districtDelivery - after merger, only wards exist
  homeAddress?: string
  noteDelivery?: string
  useDefaultAddress?: boolean
  showNewAddress?: boolean
}
