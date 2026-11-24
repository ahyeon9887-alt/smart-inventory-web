export interface Supplier {
  supplier_id: number;
  name: string;
  contact?: string | null;
  lead_time_days: number;
  created_at?: string;
}

export interface Item {
  item_id: number;
  supplier_id: number | null;
  item_code: string;
  name: string;
  spec?: string | null;
  unit?: string | null;
  init_stock: number;
  safety_stock: number;
  daily_usage: number;
  unit_price: number;
  created_at?: string;
}

export type TxType = 'IN' | 'OUT';

export interface StockTx {
  tx_id: number;
  item_id: number;
  tx_type: TxType;
  qty: number;
  tx_date: string;
  memo?: string | null;
  created_at?: string;
}

export interface PurchaseOrder {
  po_id: number;
  item_id: number;
  order_qty: number;
  order_date: string;
  status: string; // e.g. 'PENDING', 'ORDERED', 'RECEIVED'
  created_at?: string;
}

export interface ItemWithCalculations extends Item {
  supplier?: Supplier | null;
  total_in: number;
  total_out: number;
  current_stock: number;
  rop: number;
  is_reorder_needed: boolean;
  stock_value: number;
}

export interface ABCAnalysisItem {
  rank: number;
  item_id: number;
  item_code: string;
  name: string;
  spec: string;
  unit: string;
  unit_price: number;
  daily_usage: number;
  annual_usage_qty: number;
  annual_usage_value: number;
  share_pct: number;
  cumulative_value: number;
  cumulative_pct: number;
  grade: 'A' | 'B' | 'C';
  current_stock: number;
  rop: number;
}

export interface ABCSummary {
  grade: 'A' | 'B' | 'C';
  item_count: number;
  item_share_pct: number;
  total_annual_value: number;
  value_share_pct: number;
  description: string;
}
