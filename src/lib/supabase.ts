import { createClient } from '@supabase/supabase-js';
import { Supplier, Item, StockTx, PurchaseOrder } from '@/types/database';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://eqczepnksmlcwxmdcjdl.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_hNISYhZOnYKGyi_6SLnKcQ_dysLrYSl';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Supabase DB 접근 API
 */
export const dbService = {
  // 거래처 목록 조회
  async getSuppliers(): Promise<Supplier[]> {
    const { data, error } = await supabase
      .from('supplier')
      .select('*')
      .order('supplier_id', { ascending: true });

    if (error) {
      console.warn('Error fetching suppliers from Supabase:', error.message);
      return [];
    }
    return data || [];
  },

  // 거래처 등록
  async addSupplier(supplier: Omit<Supplier, 'supplier_id' | 'created_at'>): Promise<{ data: Supplier | null; error: Error | null }> {
    const { data, error } = await supabase
      .from('supplier')
      .insert([supplier])
      .select()
      .single();

    if (error) {
      return { data: null, error: new Error(error.message) };
    }
    return { data, error: null };
  },

  // 품목 목록 조회
  async getItems(): Promise<Item[]> {
    const { data, error } = await supabase
      .from('item')
      .select('*')
      .order('item_id', { ascending: true });

    if (error) {
      console.warn('Error fetching items from Supabase:', error.message);
      return [];
    }
    return data || [];
  },

  // 품목 등록
  async addItem(item: Omit<Item, 'item_id' | 'created_at'>): Promise<{ data: Item | null; error: Error | null }> {
    const { data, error } = await supabase
      .from('item')
      .insert([item])
      .select()
      .single();

    if (error) {
      return { data: null, error: new Error(error.message) };
    }
    return { data, error: null };
  },

  // 입출고 트랜잭션 목록 조회
  async getTransactions(): Promise<StockTx[]> {
    const { data, error } = await supabase
      .from('stock_tx')
      .select('*')
      .order('tx_id', { ascending: false });

    if (error) {
      console.warn('Error fetching stock_tx from Supabase:', error.message);
      return [];
    }
    return data || [];
  },

  // 입출고 트랜잭션 등록
  async addTransaction(tx: Omit<StockTx, 'tx_id' | 'created_at'>): Promise<{ data: StockTx | null; error: Error | null }> {
    const { data, error } = await supabase
      .from('stock_tx')
      .insert([tx])
      .select()
      .single();

    if (error) {
      return { data: null, error: new Error(error.message) };
    }
    return { data, error: null };
  },

  // 발주 주문 목록 조회
  async getPurchaseOrders(): Promise<PurchaseOrder[]> {
    const { data, error } = await supabase
      .from('purchase_order')
      .select('*')
      .order('po_id', { ascending: false });

    if (error) {
      console.warn('Error fetching purchase_order from Supabase:', error.message);
      return [];
    }
    return data || [];
  },

  // 발주 요청 등록
  async addPurchaseOrder(po: Omit<PurchaseOrder, 'po_id' | 'created_at'>): Promise<{ data: PurchaseOrder | null; error: Error | null }> {
    const { data, error } = await supabase
      .from('purchase_order')
      .insert([po])
      .select()
      .single();

    if (error) {
      return { data: null, error: new Error(error.message) };
    }
    return { data, error: null };
  },
};
