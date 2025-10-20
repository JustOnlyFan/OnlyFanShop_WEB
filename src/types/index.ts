// User Types
export interface User {
  userID: number
  username: string
  email: string
  phoneNumber?: string
  address?: string
  role: 'ADMIN' | 'CUSTOMER'
  authProvider: 'LOCAL' | 'GOOGLE' | 'FACEBOOK'
  token?: string
}

export interface LoginRequest {
  email: string
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
  id: number
  productName: string
  price: number
  imageURL: string
  briefDescription: string
  brand: Brand
  category: Category
}

export interface ProductDetail {
  id: number
  productName: string
  briefDescription: string
  fullDescription: string
  technicalSpecifications: string
  price: number
  imageURL: string
  brand: Brand
  category: Category
}

export interface Brand {
  brandID: number
  name: string
}

export interface Category {
  id: number
  name: string
}

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
  filters: {
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

// Store Location Types
export interface StoreLocation {
  locationID: number
  latitude: number
  longitude: number
  address: string
}
