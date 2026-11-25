import { createClient } from '@supabase/supabase-js';
import { Supplier, Item, StockTx, PurchaseOrder } from '@/types/database';

const supabaseUrl = 'https://eqczepnksmlcwxmdcjdl.supabase.co';
const supabaseAnonKey = 'sb_publishable_hNISYhZOnYKGyi_6SLnKcQ_dysLrYSl';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Supabase DB ?묎렐 API
 */
export const dbService = {
  // 嫄곕옒泥?紐⑸줉 議고쉶
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

  // 嫄곕옒泥??깅줉
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

  // ?덈ぉ 紐⑸줉 議고쉶
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

  // ?덈ぉ ?깅줉
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

  // ?낆텧怨??몃옖??뀡 紐⑸줉 議고쉶
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

  // ?낆텧怨??몃옖??뀡 ?깅줉
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

  // 諛쒖＜ 二쇰Ц 紐⑸줉 議고쉶
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

  // 諛쒖＜ ?붿껌 ?깅줉
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



