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

  // 모달 상태
  const [orderModalItem, setOrderModalItem] = useState<ItemWithCalculations | null>(null);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);

  // 시스템 피드백 알림 배너
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

  // 1. Supabase 데이터 로드
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

      // 만약 Supabase DB에 아직 데이터가 전혀 없다면 초기 예제 데이터를 자동으로 적재
      if (isInitial && dbSuppliers.length === 0 && dbItems.length === 0) {
        console.log('Supabase DB is empty. Loading default IE demo dataset...');
        setSuppliers(initialSuppliers);
        setItems(initialItems);
        setTransactions(initialTransactions);
        setPurchaseOrders(initialPurchaseOrders);
        showToast(
          'info',
          'IE 스마트 재고관리 시스템 준비 완료',
          'Supabase 연결 완료! 시연을 위해 산업공학(IE) 표준 품목 및 거래처 샘플 데이터가 기본 적용되었습니다.'
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
      showToast('error', '데이터 로드 실패', 'Supabase에서 데이터를 가져오지 못했습니다.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData(true);
  }, [loadData]);

  // 2. 비즈니스 로직(현재재고, ROP, 발주판정) 계산값 결합
  const enrichedItems = useMemo(() => {
    return enrichItemsWithCalculations(items, suppliers, transactions);
  }, [items, suppliers, transactions]);

  // 발주 필요 품목 수
  const reorderNeededCount = useMemo(() => {
    return enrichedItems.filter((i) => i.is_reorder_needed).length;
  }, [enrichedItems]);

  // 3. 샘플 데이터 로드 버튼 핸들러
  const handleLoadSampleData = async () => {
    if (confirm('산업공학(IE) 표준 서보모터, 베어링, 센서 등 10개 품목과 5개 거래처 샘플 데이터를 로드하시겠습니까?')) {
      setSuppliers(initialSuppliers);
      setItems(initialItems);
      setTransactions(initialTransactions);
      setPurchaseOrders(initialPurchaseOrders);

      // Supabase에도 비동기로 배치 저장 시도
      try {
        await supabase.from('supplier').insert(initialSuppliers);
        await supabase.from('item').insert(initialItems);
        await supabase.from('stock_tx').insert(initialTransactions);
        await supabase.from('purchase_order').insert(initialPurchaseOrders);
      } catch (e) {
        console.warn('Note: Supabase direct batch insert skipped if RLS is restricted:', e);
      }

      showToast('success', '샘플 데이터 로드 완료', 'ABC 분석 및 ROP 발주 알림을 바로 확인할 수 있습니다.');
    }
  };

  // 4. 거래처 등록 핸들러
  const handleAddSupplier = async (suppData: { name: string; contact?: string; lead_time_days: number }): Promise<boolean> => {
    const { data, error } = await dbService.addSupplier(suppData);

    if (error) {
      console.warn('Supabase insert error (likely RLS):', error.message);
      // RLS 또는 정책 문제 시에도 사용자 경험을 위해 로컬 상태에 즉시 반영
      const newSupp: Supplier = {
        supplier_id: Date.now(),
        name: suppData.name,
        contact: suppData.contact || null,
        lead_time_days: suppData.lead_time_days,
      };
      setSuppliers((prev) => [...prev, newSupp]);
      showToast(
        'warning',
        '거래처 등록 완료 (로컬 반영)',
        `거래처 '${suppData.name}'이(가) 등록되었습니다. (Supabase RLS가 활성화된 경우 Supabase SQL Editor에서 'ALTER TABLE supplier DISABLE ROW LEVEL SECURITY;'를 실행하세요.)`
      );
      return true;
    }

    if (data) {
      setSuppliers((prev) => [...prev, data]);
      showToast('success', '거래처 등록 성공', `'${data.name}' 거래처가 Supabase DB에 정상 저장되었습니다.`);
      return true;
    }
    return false;
  };

  // 5. 품목 등록 핸들러
  const handleAddItem = async (itemData: {
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
        item_id: Date.now(),
        ...itemData,
      };
      setItems((prev) => [...prev, newItem]);
      showToast(
        'warning',
        '품목 등록 완료 (로컬 반영)',
        `[${itemData.item_code}] ${itemData.name} 품목이 등록되었습니다.`
      );
      return true;
    }

    if (data) {
      setItems((prev) => [...prev, data]);
      showToast('success', '품목 등록 성공', `[${data.item_code}] ${data.name} 품목이 Supabase DB에 저장되었습니다.`);
      return true;
    }
    return false;
  };

  // 6. 입출고 트랜잭션 등록 핸들러
  const handleSubmitTransaction = async (
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
        tx_id: Date.now(),
        ...newTxPayload,
      };
      setTransactions((prev) => [localTx, ...prev]);
      showToast(
        'warning',
        `${txType === 'IN' ? '입고' : '출고'} 등록 완료 (로컬 반영)`,
        `수량 ${qty.toLocaleString()}개가 처리되어 현재 재고에 즉시 반영되었습니다.`
      );
      return true;
    }

    if (data) {
      setTransactions((prev) => [data, ...prev]);
      showToast(
        'success',
        `${txType === 'IN' ? '입고' : '출고'} 등록 완료`,
        `Supabase DB(stock_tx)에 기록되었으며 현재 재고가 갱신되었습니다.`
      );
      return true;
    }
    return false;
  };

  // 7. 발주 요청(Purchase Order) 등록 핸들러
  const handleSubmitOrder = async (
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
        po_id: Date.now(),
        ...newPoPayload,
      };
      setPurchaseOrders((prev) => [localPo, ...prev]);
      showToast(
        'warning',
        '발주 요청 완료 (로컬 반영)',
        `수량 ${orderQty.toLocaleString()}건의 발주 요청이 등록되었습니다.`
      );
      return true;
    }

    if (data) {
      setPurchaseOrders((prev) => [data, ...prev]);
      showToast(
        'success',
        '발주 요청 등록 완료',
        `Supabase DB(purchase_order)에 발주 데이터가 등록되었습니다.`
      );
      return true;
    }
    return false;
  };

  // 발주 모달 열기
  const handleOpenOrderModal = (item: ItemWithCalculations) => {
    setOrderModalItem(item);
    setIsOrderModalOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* 글로벌 네비게이션 헤더 */}
      <Navbar
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        reorderNeededCount={reorderNeededCount}
        onRefresh={() => loadData(false)}
        isLoading={isLoading}
        onLoadSampleData={handleLoadSampleData}
        isDbConnected={isDbConnected}
      />

      {/* 시스템 알림 토스트 */}
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

      {/* 메인 콘텐츠 영역 */}
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

      {/* 발주 요청 팝업 모달 */}
      <OrderModal
        item={orderModalItem}
        isOpen={isOrderModalOpen}
        onClose={() => {
          setIsOrderModalOpen(false);
          setOrderModalItem(null);
        }}
        onSubmit={handleSubmitOrder}
      />

      {/* 푸터 */}
      <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4">
          <p className="font-medium text-slate-700">스마트 재고관리 시스템 (Smart Inventory Manager)</p>
          <p className="mt-1 text-slate-400">
            Next.js App Router · TypeScript · Tailwind CSS · Supabase · Vercel Ready
          </p>
        </div>
      </footer>
    </div>
  );
}
