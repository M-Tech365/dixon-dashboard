export interface BCSalesOrder {
  SystemId: string;
  No: string;
  SellToCustomerNo: string;
  SellToCustomerName: string;
  BillToName: string;
  OrderDate: string;
  DocumentDate: string;
  RequestedDeliveryDate: string;
  ShipmentDate: string;
  Status: string;
  OrderStatus: string;
  Priority: string;
  LocationCode: string;
  CFIDeliveryNotes: string;
  CFIInternalNotes: string;
  CFIExternalNotes: string;
  TotalInclTax: number;
  AssignedUserID: string;
  YourReference: string;
  ShipToName: string;
  ShipToCity: string;
  ShipToCounty: string;
}

export interface SalesOrder {
  id: string;
  customerName: string;
  billToName: string;
  orderNumber: string;
  priority: 'P1' | 'P2' | 'P3' | 'P4';
  createdDate: string;
  requestedDeliveryDate?: string;
  cfiDeliveryNotes: string;
  reference?: string;
  shipToCity?: string;
  shipToState?: string;
}

export interface DashboardFilters {
  priorities: string[];
  searchTerm: string;
}