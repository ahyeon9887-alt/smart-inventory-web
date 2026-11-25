'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Navbar, { TabType } from '@/components/Navbar';
import TabInventory from '@/components/TabInventory';
import TabTransactions from '@/components/TabTransactions';
import TabManagement from '@/components/TabManagement';
import TabAnalysis from '@/components/TabAnalysis';
import OrderModal from '@/components/OrderModal';
import { Supplier, Item, StockTx, PurchaseOrder, ItemWithCalculations, TxType } from '@/types/database';
import { dbService, supabase } from '@/lib/supabase';
import { enrichItemsWithCalculations } from '@/lib/calculations';
import { initialSuppliers, initialItems, initialTransactions, initialPurchaseOrders } from '@/lib/sampleData';
import { AlertCircle, CheckCircle2, Info, X, ShieldAlert } from 'lucide-react';

export default function Home() {
  const [currentTab, setCurrentTab] = useState<TabType>('inventory');
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [transactions, setTransactions] = useState<StockTx[]>([]);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDbConnected, setIsDbConnected] = useState(false);

  // 紐⑤떖 ?곹깭
  const [orderModalItem, setOrderModalItem] = useState<ItemWithCalculations | null>(null);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);

  // ?쒖뒪???쇰뱶諛??뚮┝ 諛곕꼫
  const [toast, setToast] = useState<{
    type: 'success' | 'error' | 'info' | 'warning';
    title: string;
    message: string;
  } | null>(null);

  const showToast = (type: 'success' | 'error' | 'info' | 'warning', title: string, message: string) => {
    setToast({ type, title, message });
    setTimeout(() => {
      setToast(null);
    }, 6000);
  };

  // 1. Supabase ?곗씠??濡쒕뱶
  const loadData = useCallback(async (isInitial = false) => {
    setIsLoading(true);
    try {
      const [dbSuppliers, dbItems, dbTxs, dbOrders] = await Promise.all([
        dbService.getSuppliers(),
        dbService.getItems(),
        dbService.getTransactions(),
        dbService.getPurchaseOrders(),
      ]);

      setIsDbConnected(true);

      // 留뚯빟 Supabase DB???꾩쭅 ?곗씠?곌? ?꾪? ?녿떎硫?珥덇린 ?덉젣 ?곗씠?곕? ?먮룞?쇰줈 ?곸옱
      if (isInitial && dbSuppliers.length === 0 && dbItems.length === 0) {
        console.log('Supabase DB is empty. Loading default IE demo dataset...');
        setSuppliers(initialSuppliers);
        setItems(initialItems);
        setTransactions(initialTransactions);
        setPurchaseOrders(initialPurchaseOrders);
        showToast(
          'info',
          'IE ?ㅻ쭏???ш퀬愿由??쒖뒪??以鍮??꾨즺',
          'Supabase ?곌껐 ?꾨즺! ?쒖뿰???꾪빐 ?곗뾽怨듯븰(IE) ?쒖? ?덈ぉ 諛?嫄곕옒泥??섑뵆 ?곗씠?곌? 湲곕낯 ?곸슜?섏뿀?듬땲??'
        );
      } else {
        setSuppliers(dbSuppliers);
        setItems(dbItems);
        setTransactions(dbTxs);
        setPurchaseOrders(dbOrders);
      }
    } catch (err) {
      console.error('Error fetching Supabase data:', err);
      setIsDbConnected(false);
      showToast('error', '?곗씠??濡쒕뱶 ?ㅽ뙣', 'Supabase?먯꽌 ?곗씠?곕? 媛?몄삤吏 紐삵뻽?듬땲??');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData(true);
  }, [loadData]);

  // 2. 鍮꾩쫰?덉뒪 濡쒖쭅(?꾩옱?ш퀬, ROP, 諛쒖＜?먯젙) 怨꾩궛媛?寃고빀
  const enrichedItems = useMemo(() => {
    return enrichItemsWithCalculations(items, suppliers, transactions);
  }, [items, suppliers, transactions]);

  // 諛쒖＜ ?꾩슂 ?덈ぉ ??  const reorderNeededCount = useMemo(() => {
    return enrichedItems.filter((i) => i.is_reorder_needed).length;
  }, [enrichedItems]);

  // 3. ?섑뵆 ?곗씠??濡쒕뱶 踰꾪듉 ?몃뱾??  const handleLoadSampleData = async () => {
    if (confirm('?곗뾽怨듯븰(IE) ?쒖? ?쒕낫紐⑦꽣, 踰좎뼱留? ?쇱꽌 ??10媛??덈ぉ怨?5媛?嫄곕옒泥??섑뵆 ?곗씠?곕? 濡쒕뱶?섏떆寃좎뒿?덇퉴?')) {
      setSuppliers(initialSuppliers);
      setItems(initialItems);
      setTransactions(initialTransactions);
      setPurchaseOrders(initialPurchaseOrders);

      // Supabase?먮룄 鍮꾨룞湲곕줈 諛곗튂 ????쒕룄
      try {
        await supabase.from('supplier').insert(initialSuppliers);
        await supabase.from('item').insert(initialItems);
        await supabase.from('stock_tx').insert(initialTransactions);
        await supabase.from('purchase_order').insert(initialPurchaseOrders);
      } catch (e) {
        console.warn('Note: Supabase direct batch insert skipped if RLS is restricted:', e);
      }

      showToast('success', '?섑뵆 ?곗씠??濡쒕뱶 ?꾨즺', 'ABC 遺꾩꽍 諛?ROP 諛쒖＜ ?뚮┝??諛붾줈 ?뺤씤?????덉뒿?덈떎.');
    }
  };

  // 4. 嫄곕옒泥??깅줉 ?몃뱾??  const handleAddSupplier = async (suppData: { name: string; contact?: string; lead_time_days: number }): Promise<boolean> => {
    const { data, error } = await dbService.addSupplier(suppData);

    if (error) {
      console.warn('Supabase insert error (likely RLS):', error.message);
      // RLS ?먮뒗 ?뺤콉 臾몄젣 ?쒖뿉???ъ슜??寃쏀뿕???꾪빐 濡쒖뺄 ?곹깭??利됱떆 諛섏쁺
      const newSupp: Supplier = {
        
        name: suppData.name,
        contact: suppData.contact || null,
        lead_time_days: suppData.lead_time_days,
      };
      setSuppliers((prev) => [...prev, newSupp]);
      showToast(
        'warning',
        '嫄곕옒泥??깅줉 ?꾨즺 (濡쒖뺄 諛섏쁺)',
        `嫄곕옒泥?'${suppData.name}'??媛) ?깅줉?섏뿀?듬땲?? (Supabase RLS媛 ?쒖꽦?붾맂 寃쎌슦 Supabase SQL Editor?먯꽌 'ALTER TABLE supplier DISABLE ROW LEVEL SECURITY;'瑜??ㅽ뻾?섏꽭??)`
      );
      return true;
    }

    if (data) {
      setSuppliers((prev) => [...prev, data]);
      showToast('success', '嫄곕옒泥??깅줉 ?깃났', `'${data.name}' 嫄곕옒泥섍? Supabase DB???뺤긽 ??λ릺?덉뒿?덈떎.`);
      return true;
    }
    return false;
  };

  // 5. ?덈ぉ ?깅줉 ?몃뱾??  const handleAddItem = async (itemData: {
    supplier_id: number | null;
    item_code: string;
    name: string;
    spec?: string;
    unit?: string;
    init_stock: number;
    safety_stock: number;
    daily_usage: number;
    unit_price: number;
  }): Promise<boolean> => {
    const { data, error } = await dbService.addItem(itemData);

    if (error) {
      console.warn('Supabase insert item error (likely RLS):', error.message);
      const newItem: Item = {
        
        ...itemData,
      };
      setItems((prev) => [...prev, newItem]);
      showToast(
        'warning',
        '?덈ぉ ?깅줉 ?꾨즺 (濡쒖뺄 諛섏쁺)',
        `[${itemData.item_code}] ${itemData.name} ?덈ぉ???깅줉?섏뿀?듬땲??`
      );
      return true;
    }

    if (data) {
      setItems((prev) => [...prev, data]);
      showToast('success', '?덈ぉ ?깅줉 ?깃났', `[${data.item_code}] ${data.name} ?덈ぉ??Supabase DB????λ릺?덉뒿?덈떎.`);
      return true;
    }
    return false;
  };

  // 6. ?낆텧怨??몃옖??뀡 ?깅줉 ?몃뱾??  const handleSubmitTransaction = async (
    itemId: number,
    txType: TxType,
    qty: number,
    txDate: string,
    memo: string
  ): Promise<boolean> => {
    const newTxPayload = {
      item_id: itemId,
      tx_type: txType,
      qty,
      tx_date: txDate,
      memo: memo || null,
    };

    const { data, error } = await dbService.addTransaction(newTxPayload);

    if (error) {
      console.warn('Supabase insert stock_tx error (likely RLS):', error.message);
      const localTx: StockTx = {
        
        ...newTxPayload,
      };
      setTransactions((prev) => [localTx, ...prev]);
      showToast(
        'warning',
        `${txType === 'IN' ? '?낃퀬' : '異쒓퀬'} ?깅줉 ?꾨즺 (濡쒖뺄 諛섏쁺)`,
        `?섎웾 ${qty.toLocaleString()}媛쒓? 泥섎━?섏뼱 ?꾩옱 ?ш퀬??利됱떆 諛섏쁺?섏뿀?듬땲??`
      );
      return true;
    }

    if (data) {
      setTransactions((prev) => [data, ...prev]);
      showToast(
        'success',
        `${txType === 'IN' ? '?낃퀬' : '異쒓퀬'} ?깅줉 ?꾨즺`,
        `Supabase DB(stock_tx)??湲곕줉?섏뿀?쇰ŉ ?꾩옱 ?ш퀬媛 媛깆떊?섏뿀?듬땲??`
      );
      return true;
    }
    return false;
  };

  // 7. 諛쒖＜ ?붿껌(Purchase Order) ?깅줉 ?몃뱾??  const handleSubmitOrder = async (
    itemId: number,
    orderQty: number,
    orderDate: string,
    status: string
  ): Promise<boolean> => {
    const newPoPayload = {
      item_id: itemId,
      order_qty: orderQty,
      order_date: orderDate,
      status,
    };

    const { data, error } = await dbService.addPurchaseOrder(newPoPayload);

    if (error) {
      console.warn('Supabase insert purchase_order error (likely RLS):', error.message);
      const localPo: PurchaseOrder = {
        
        ...newPoPayload,
      };
      setPurchaseOrders((prev) => [localPo, ...prev]);
      showToast(
        'warning',
        '諛쒖＜ ?붿껌 ?꾨즺 (濡쒖뺄 諛섏쁺)',
        `?섎웾 ${orderQty.toLocaleString()}嫄댁쓽 諛쒖＜ ?붿껌???깅줉?섏뿀?듬땲??`
      );
      return true;
    }

    if (data) {
      setPurchaseOrders((prev) => [data, ...prev]);
      showToast(
        'success',
        '諛쒖＜ ?붿껌 ?깅줉 ?꾨즺',
        `Supabase DB(purchase_order)??諛쒖＜ ?곗씠?곌? ?깅줉?섏뿀?듬땲??`
      );
      return true;
    }
    return false;
  };

  // 諛쒖＜ 紐⑤떖 ?닿린
  const handleOpenOrderModal = (item: ItemWithCalculations) => {
    setOrderModalItem(item);
    setIsOrderModalOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* 湲濡쒕쾶 ?ㅻ퉬寃뚯씠???ㅻ뜑 */}
      <Navbar
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        reorderNeededCount={reorderNeededCount}
        onRefresh={() => loadData(false)}
        isLoading={isLoading}
        onLoadSampleData={handleLoadSampleData}
        isDbConnected={isDbConnected}
      />

      {/* ?쒖뒪???뚮┝ ?좎뒪??*/}
      {toast && (
        <div className="fixed top-20 right-4 z-50 max-w-md animate-slideIn">
          <div className={`p-4 rounded-2xl shadow-xl border flex items-start space-x-3 ${
            toast.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : toast.type === 'warning'
              ? 'bg-amber-50 border-amber-200 text-amber-900'
              : toast.type === 'error'
              ? 'bg-rose-50 border-rose-200 text-rose-900'
              : 'bg-blue-50 border-blue-200 text-blue-900'
          }`}>
            {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />}
            {toast.type === 'warning' && <ShieldAlert className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />}
            {toast.type === 'error' && <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />}
            {toast.type === 'info' && <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />}
            <div className="flex-1 text-xs">
              <p className="font-bold text-sm">{toast.title}</p>
              <p className="mt-0.5 leading-relaxed opacity-90">{toast.message}</p>
            </div>
            <button
              onClick={() => setToast(null)}
              className="text-slate-400 hover:text-slate-600 p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* 硫붿씤 肄섑뀗痢??곸뿭 */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentTab === 'inventory' && (
          <TabInventory
            items={enrichedItems}
            purchaseOrders={purchaseOrders}
            onOpenOrderModal={handleOpenOrderModal}
          />
        )}

        {currentTab === 'transactions' && (
          <TabTransactions
            items={enrichedItems}
            transactions={transactions}
            onSubmitTransaction={handleSubmitTransaction}
          />
        )}

        {currentTab === 'management' && (
          <TabManagement
            suppliers={suppliers}
            items={enrichedItems}
            onAddSupplier={handleAddSupplier}
            onAddItem={handleAddItem}
          />
        )}

        {currentTab === 'analysis' && (
          <TabAnalysis items={enrichedItems} />
        )}
      </main>

      {/* 諛쒖＜ ?붿껌 ?앹뾽 紐⑤떖 */}
      <OrderModal
        item={orderModalItem}
        isOpen={isOrderModalOpen}
        onClose={() => {
          setIsOrderModalOpen(false);
          setOrderModalItem(null);
        }}
        onSubmit={handleSubmitOrder}
      />

      {/* ?명꽣 */}
      <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4">
          <p className="font-medium text-slate-700">?ㅻ쭏???ш퀬愿由??쒖뒪??(Smart Inventory Manager)</p>
          <p className="mt-1 text-slate-400">
            Next.js App Router 쨌 TypeScript 쨌 Tailwind CSS 쨌 Supabase 쨌 Vercel Ready
          </p>
        </div>
      </footer>
    </div>
  );
}


