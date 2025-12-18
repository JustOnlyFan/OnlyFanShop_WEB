import { apiClient as api } from '@/lib/api';

// Enums
export enum ShipmentType {
  CUSTOMER_DELIVERY = 'CUSTOMER_DELIVERY',
  INTERNAL_TRANSFER = 'INTERNAL_TRANSFER'
}

export enum ShipmentStatus {
  PENDING = 'PENDING',
  READY_TO_PICK = 'READY_TO_PICK',
  PICKING = 'PICKING',
  PICKED = 'PICKED',
  STORING = 'STORING',
  IN_TRANSIT = 'IN_TRANSIT',
  DELIVERING = 'DELIVERING',
  DELIVERED = 'DELIVERED',
  DELIVERY_FAIL = 'DELIVERY_FAIL',
  WAITING_TO_RETURN = 'WAITING_TO_RETURN',
  RETURN = 'RETURN',
  RETURNED = 'RETURNED',
  CANCEL = 'CANCEL',
  EXCEPTION = 'EXCEPTION'
}

export enum ShippingCarrier {
  GHN = 'GHN',
  GHTK = 'GHTK',
  VIETTEL_POST = 'VIETTEL_POST',
  VNPOST = 'VNPOST',
  JT_EXPRESS = 'JT_EXPRESS',
  BEST_EXPRESS = 'BEST_EXPRESS',
  NINJA_VAN = 'NINJA_VAN',
  OTHER = 'OTHER'
}

// Interfaces
export interface ShipmentDTO {
  id: number;
  shipmentType: ShipmentType;
  orderId?: number;
  inventoryRequestId?: number;
  carrier: ShippingCarrier;
  trackingNumber?: string;
  carrierOrderCode?: string;
  status: ShipmentStatus;
  fromName?: string;
  fromPhone?: string;
  fromAddress?: string;
  fromWardCode?: string;
  fromDistrictId?: number;
  toName: string;
  toPhone: string;
  toAddress: string;
  toWardCode?: string;
  toDistrictId?: number;
  weight?: number;
  length?: number;
  width?: number;
  height?: number;
  codAmount?: number;
  insuranceValue?: number;
  shippingFee?: number;
  serviceTypeId?: number;
  paymentTypeId?: number;
  note?: string;
  requiredNote?: string;
  expectedDeliveryTime?: string;
  pickedAt?: string;
  deliveredAt?: string;
  createdAt?: string;
  fromStoreId?: number;
}

export interface CreateShipmentRequest {
  shipmentType: ShipmentType;
  orderId?: number;
  inventoryRequestId?: number;
  carrier?: ShippingCarrier;
  fromName?: string;
  fromPhone?: string;
  fromAddress?: string;
  fromWardCode?: string;
  fromDistrictId?: number;
  fromStoreId?: number;
  toName: string;
  toPhone: string;
  toAddress: string;
  toWardCode?: string;
  toDistrictId?: number;
  weight?: number;
  length?: number;
  width?: number;
  height?: number;
  codAmount?: number;
  insuranceValue?: number;
  serviceTypeId?: number;
  paymentTypeId?: number;
  note?: string;
  requiredNote?: string;
  items?: ShipmentItem[];
}

export interface ShipmentItem {
  name: string;
  code?: string;
  quantity: number;
  price: number;
  weight?: number;
}

export interface CalculateFeeRequest {
  fromDistrictId: number;
  fromWardCode: string;
  serviceTypeId: number;
  toDistrictId: number;
  toWardCode: string;
  weight: number;
  length?: number;
  width?: number;
  height?: number;
  insuranceValue?: number;
  codValue?: number;
}

export interface CalculateFeeResponse {
  total: number;
  serviceFee: number;
  insuranceFee: number;
  codFee: number;
}

export interface GHNProvince {
  ProvinceID: number;
  ProvinceName: string;
  Code: string;
}

export interface GHNDistrict {
  DistrictID: number;
  ProvinceID: number;
  DistrictName: string;
  Code: string;
}

export interface GHNWard {
  WardCode: string;
  DistrictID: number;
  WardName: string;
}

// API Functions
export const shipmentService = {
  // Tạo shipment mới
  createShipment: async (request: CreateShipmentRequest): Promise<ShipmentDTO> => {
    const response = await api.post('/api/shipments', request);
    return response.data;
  },

  // Lấy shipment theo ID
  getShipmentById: async (id: number): Promise<ShipmentDTO> => {
    const response = await api.get(`/api/shipments/${id}`);
    return response.data;
  },

  // Lấy shipment theo order ID
  getShipmentByOrderId: async (orderId: number): Promise<ShipmentDTO> => {
    const response = await api.get(`/api/shipments/order/${orderId}`);
    return response.data;
  },

  // Lấy shipment theo inventory request ID
  getShipmentByInventoryRequestId: async (inventoryRequestId: number): Promise<ShipmentDTO> => {
    const response = await api.get(`/api/shipments/inventory-request/${inventoryRequestId}`);
    return response.data;
  },

  // Lấy shipment theo tracking number
  getShipmentByTrackingNumber: async (trackingNumber: string): Promise<ShipmentDTO> => {
    const response = await api.get(`/api/shipments/tracking/${trackingNumber}`);
    return response.data;
  },

  // Lấy danh sách shipments
  getShipments: async (params: {
    type?: ShipmentType;
    status?: ShipmentStatus;
    page?: number;
    size?: number;
  }): Promise<{ content: ShipmentDTO[]; totalElements: number; totalPages: number }> => {
    const response = await api.get('/api/shipments', { params });
    return response.data;
  },

  // Hủy shipment
  cancelShipment: async (id: number): Promise<{ success: boolean; message: string }> => {
    const response = await api.post(`/api/shipments/${id}/cancel`);
    return response.data;
  },

  // Đồng bộ trạng thái từ GHN
  syncStatus: async (id: number): Promise<void> => {
    await api.post(`/api/shipments/${id}/sync`);
  },

  // Tính phí vận chuyển
  calculateFee: async (request: CalculateFeeRequest): Promise<CalculateFeeResponse> => {
    const response = await api.post('/api/shipments/calculate-fee', request);
    return response.data;
  },

  // Lấy danh sách tỉnh/thành phố
  getProvinces: async (): Promise<GHNProvince[]> => {
    const response = await api.get('/api/shipments/ghn/provinces');
    return response.data;
  },

  // Lấy danh sách quận/huyện
  getDistricts: async (provinceId: number): Promise<GHNDistrict[]> => {
    const response = await api.get('/api/shipments/ghn/districts', {
      params: { provinceId }
    });
    return response.data;
  },

  // Lấy danh sách phường/xã
  getWards: async (districtId: number): Promise<GHNWard[]> => {
    const response = await api.get('/api/shipments/ghn/wards', {
      params: { districtId }
    });
    return response.data;
  }
};

// Helper functions
export const getStatusLabel = (status: ShipmentStatus): string => {
  const labels: Record<ShipmentStatus, string> = {
    [ShipmentStatus.PENDING]: 'Chờ xử lý',
    [ShipmentStatus.READY_TO_PICK]: 'Sẵn sàng lấy hàng',
    [ShipmentStatus.PICKING]: 'Đang lấy hàng',
    [ShipmentStatus.PICKED]: 'Đã lấy hàng',
    [ShipmentStatus.STORING]: 'Đang lưu kho',
    [ShipmentStatus.IN_TRANSIT]: 'Đang vận chuyển',
    [ShipmentStatus.DELIVERING]: 'Đang giao hàng',
    [ShipmentStatus.DELIVERED]: 'Đã giao hàng',
    [ShipmentStatus.DELIVERY_FAIL]: 'Giao hàng thất bại',
    [ShipmentStatus.WAITING_TO_RETURN]: 'Chờ trả hàng',
    [ShipmentStatus.RETURN]: 'Đang trả hàng',
    [ShipmentStatus.RETURNED]: 'Đã trả hàng',
    [ShipmentStatus.CANCEL]: 'Đã hủy',
    [ShipmentStatus.EXCEPTION]: 'Ngoại lệ'
  };
  return labels[status] || status;
};

export const getStatusColor = (status: ShipmentStatus): string => {
  const colors: Record<ShipmentStatus, string> = {
    [ShipmentStatus.PENDING]: 'bg-gray-100 text-gray-800',
    [ShipmentStatus.READY_TO_PICK]: 'bg-blue-100 text-blue-800',
    [ShipmentStatus.PICKING]: 'bg-blue-100 text-blue-800',
    [ShipmentStatus.PICKED]: 'bg-indigo-100 text-indigo-800',
    [ShipmentStatus.STORING]: 'bg-purple-100 text-purple-800',
    [ShipmentStatus.IN_TRANSIT]: 'bg-yellow-100 text-yellow-800',
    [ShipmentStatus.DELIVERING]: 'bg-orange-100 text-orange-800',
    [ShipmentStatus.DELIVERED]: 'bg-green-100 text-green-800',
    [ShipmentStatus.DELIVERY_FAIL]: 'bg-red-100 text-red-800',
    [ShipmentStatus.WAITING_TO_RETURN]: 'bg-pink-100 text-pink-800',
    [ShipmentStatus.RETURN]: 'bg-pink-100 text-pink-800',
    [ShipmentStatus.RETURNED]: 'bg-gray-100 text-gray-800',
    [ShipmentStatus.CANCEL]: 'bg-red-100 text-red-800',
    [ShipmentStatus.EXCEPTION]: 'bg-red-100 text-red-800'
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
};

export const getCarrierLabel = (carrier: ShippingCarrier): string => {
  const labels: Record<ShippingCarrier, string> = {
    [ShippingCarrier.GHN]: 'Giao Hàng Nhanh',
    [ShippingCarrier.GHTK]: 'Giao Hàng Tiết Kiệm',
    [ShippingCarrier.VIETTEL_POST]: 'Viettel Post',
    [ShippingCarrier.VNPOST]: 'Vietnam Post',
    [ShippingCarrier.JT_EXPRESS]: 'J&T Express',
    [ShippingCarrier.BEST_EXPRESS]: 'Best Express',
    [ShippingCarrier.NINJA_VAN]: 'Ninja Van',
    [ShippingCarrier.OTHER]: 'Khác'
  };
  return labels[carrier] || carrier;
};

export default shipmentService;
