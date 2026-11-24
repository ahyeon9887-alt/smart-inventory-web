'use client';

import React, { useState, useMemo } from 'react';
import { ItemWithCalculations, PurchaseOrder } from '@/types/database';
import { 
  Search, 
  AlertCircle, 
  CheckCircle, 
  ShoppingCart, 
  Package, 
  DollarSign, 
  Filter,
  ArrowRight,
  TrendingDown,
  Info
} from 'lucide-react';

interface TabInventoryProps {
  items: ItemWithCalculations[];
  purchaseOrders: PurchaseOrder[];
  onOpenOrderModal: (item: ItemWithCalculations) => void;
}

export default function TabInventory({
  items,
  purchaseOrders,
  onOpenOrderModal,
}: TabInventoryProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [onlyReorderNeeded, setOnlyReorderNeeded] = useState(false);

  // 진행 중인 발주 매핑
  const pendingOrdersMap = useMemo(() => {
    const map = new Map<number, PurchaseOrder[]>();
    purchaseOrders.forEach((po) => {
      const id = Number(po.item_id);
      if (!map.has(id)) map.set(id, []);
      map.get(id)!.push(po);
    });
    return map;
  }, [purchaseOrders]);

  // 필터링된 품목 목록
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchSearch =
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.item_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.spec && item.spec.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.supplier?.name && item.supplier.name.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchReorder = onlyReorderNeeded ? item.is_reorder_needed : true;
      return matchSearch && matchReorder;
    });
  }, [items, searchTerm, onlyReorderNeeded]);

  // 요약 통계 계산
  const totalItemCount = items.length;
  const reorderNeededCount = items.filter((i) => i.is_reorder_needed).length;
  const totalStockQty = items.reduce((acc, cur) => acc + cur.current_stock, 0);
  const totalStockValuation = items.reduce((acc, cur) => acc + cur.stock_value, 0);

  return (
    <div className="space-y-6">
      {/* 4개의 핵심 요약 통계 카드 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 카드 1: 총 품목 수 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">전체 관리 품목</p>
            <h3 className="text-2xl font-black text-slate-900 mt-1">
              {totalItemCount} <span className="text-sm font-medium text-slate-400">개</span>
            </h3>
            <p className="text-xs text-slate-500 mt-1">등록된 전체 원부자재</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Package className="w-6 h-6" />
          </div>
        </div>

        {/* 카드 2: 발주 필요 품목 수 (빨간색 강조) */}
        <div className={`p-5 rounded-2xl border shadow-sm flex items-center justify-between transition-all ${
          reorderNeededCount > 0 
            ? 'bg-rose-50/70 border-rose-200 shadow-rose-100 ring-1 ring-rose-300' 
            : 'bg-white border-slate-200'
        }`}>
          <div>
            <p className="text-xs font-semibold text-rose-600 uppercase tracking-wider flex items-center space-x-1">
              <span>발주 필요 품목</span>
              {reorderNeededCount > 0 && <span className="animate-pulse">●</span>}
            </p>
            <h3 className="text-2xl font-black text-rose-700 mt-1">
              {reorderNeededCount} <span className="text-sm font-medium text-rose-500">개</span>
            </h3>
            <p className="text-xs text-rose-600/80 mt-1">
              {reorderNeededCount > 0 ? '현재 재고가 ROP 이하입니다' : '모든 품목 재고 안정권'}
            </p>
          </div>
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
            reorderNeededCount > 0 ? 'bg-rose-600 text-white shadow-md shadow-rose-500/30' : 'bg-slate-100 text-slate-400'
          }`}>
            <AlertCircle className="w-6 h-6" />
          </div>
        </div>

        {/* 카드 3: 총 보유 재고 수량 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">총 보유 재고량</p>
            <h3 className="text-2xl font-black text-slate-900 mt-1">
              {totalStockQty.toLocaleString()}
            </h3>
            <p className="text-xs text-slate-500 mt-1">기초재고 + 입고 - 출고</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle className="w-6 h-6" />
          </div>
        </div>

        {/* 카드 4: 총 재고 평가액 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">총 재고 평가액</p>
            <h3 className="text-2xl font-black text-indigo-900 mt-1">
              {totalStockValuation.toLocaleString()} <span className="text-sm font-medium text-indigo-400">원</span>
            </h3>
            <p className="text-xs text-slate-500 mt-1">현재재고 × 품목 단가 합산</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* ROP 안내 배너 */}
      <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-slate-50 border border-blue-200/70 rounded-2xl p-4 flex items-start space-x-3 text-xs text-slate-700">
        <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-blue-900">산업공학(IE) 재주문점(ROP) 산출 공식:</span>{' '}
          <code className="bg-white px-2 py-0.5 rounded border border-blue-200 font-mono text-blue-800 font-semibold">
            ROP = (일일 사용량 × 조달 리드타임) + 안전재고
          </code>
          <p className="text-slate-600 mt-1">
            현재 재고가 ROP 이하로 떨어지면 리드타임 동안 재고 고갈(Stockout)이 발생할 위험이 있으므로 즉시 발주를 집행해야 합니다.
          </p>
        </div>
      </div>

      {/* 검색 및 필터 컨트롤 바 */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* 검색 인풋 */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="품목명, 코드, 거래처, 규격 검색..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* 필터 토글: 발주 필요 품목만 보기 */}
        <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
          <button
            onClick={() => setOnlyReorderNeeded(!onlyReorderNeeded)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center space-x-2 transition-all border ${
              onlyReorderNeeded
                ? 'bg-rose-600 text-white border-rose-600 shadow-sm shadow-rose-500/20'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <Filter className="w-3.5 h-3.5" />
            <span>발주 필요 품목만 보기 ({reorderNeededCount})</span>
          </button>
        </div>
      </div>

      {/* 품목별 재고 현황 및 ROP 테이블 */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700 border-collapse">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold">
              <tr>
                <th className="py-3 px-4">품목코드</th>
                <th className="py-3 px-4">품목명 / 규격</th>
                <th className="py-3 px-4">거래처 (리드타임)</th>
                <th className="py-3 px-3 text-right">일일사용량</th>
                <th className="py-3 px-3 text-right">안전재고</th>
                <th className="py-3 px-3 text-right">재주문점(ROP)</th>
                <th className="py-3 px-4 text-right">현재 재고</th>
                <th className="py-3 px-4 text-center">발주 판정</th>
                <th className="py-3 px-4 text-right">단가 / 재고액</th>
                <th className="py-3 px-4 text-center">발주 액션</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-400">
                    <Package className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    <span>조회 조건에 맞는 품목 데이터가 없습니다.</span>
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => {
                  const itemPendingOrders = pendingOrdersMap.get(Number(item.item_id)) || [];
                  const isRedAlert = item.is_reorder_needed;

                  return (
                    <tr
                      key={item.item_id}
                      className={`hover:bg-slate-50/80 transition-colors ${
                        isRedAlert ? 'bg-rose-50/40 font-medium' : ''
                      }`}
                    >
                      {/* 품목코드 */}
                      <td className="py-3 px-4 font-mono font-bold text-slate-800">
                        {item.item_code}
                      </td>

                      {/* 품목명 / 규격 */}
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">{item.name}</div>
                        <div className="text-[11px] text-slate-400 truncate max-w-xs">{item.spec || '-'}</div>
                      </td>

                      {/* 거래처 (리드타임) */}
                      <td className="py-3 px-4">
                        <div className="font-medium text-slate-800">{item.supplier?.name || '미지정'}</div>
                        <div className="text-[11px] text-slate-400">
                          리드타임: {item.supplier?.lead_time_days ?? '-'}일
                        </div>
                      </td>

                      {/* 일일 사용량 */}
                      <td className="py-3 px-3 text-right font-medium">
                        {item.daily_usage} <span className="text-[10px] text-slate-400">{item.unit}/일</span>
                      </td>

                      {/* 안전재고 */}
                      <td className="py-3 px-3 text-right font-medium text-slate-600">
                        {item.safety_stock} <span className="text-[10px] text-slate-400">{item.unit}</span>
                      </td>

                      {/* 재주문점(ROP) */}
                      <td className="py-3 px-3 text-right font-mono font-bold text-indigo-700 bg-indigo-50/30">
                        {item.rop.toLocaleString()} <span className="text-[10px] font-normal text-indigo-400">{item.unit}</span>
                      </td>

                      {/* 현재 재고 (IN-OUT 반영) */}
                      <td className="py-3 px-4 text-right">
                        <div className={`font-mono text-sm font-extrabold ${
                          isRedAlert ? 'text-rose-600' : 'text-slate-900'
                        }`}>
                          {item.current_stock.toLocaleString()} <span className="text-xs font-medium text-slate-400">{item.unit}</span>
                        </div>
                        <div className="text-[10px] text-slate-400">
                          기초 {item.init_stock} + 입고 {item.total_in} - 출고 {item.total_out}
                        </div>
                      </td>

                      {/* 발주 판정: 현재 재고 <= ROP 이면 빨간색 강조 */}
                      <td className="py-3 px-4 text-center">
                        {isRedAlert ? (
                          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-black bg-rose-600 text-white shadow-sm shadow-rose-500/30 animate-pulse">
                            <AlertCircle className="w-3.5 h-3.5" />
                            <span>발주 필요</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle className="w-3 h-3" />
                            <span>정상</span>
                          </span>
                        )}
                      </td>

                      {/* 단가 / 재고액 */}
                      <td className="py-3 px-4 text-right">
                        <div className="font-medium text-slate-800">
                          {(item.unit_price || 0).toLocaleString()}원
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {(item.stock_value || 0).toLocaleString()}원
                        </div>
                      </td>

                      {/* 발주 액션 버튼 */}
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => onOpenOrderModal(item)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center justify-center space-x-1 transition-all mx-auto ${
                            isRedAlert
                              ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-sm shadow-rose-500/30'
                              : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                          }`}
                        >
                          <ShoppingCart className="w-3.5 h-3.5" />
                          <span>발주 요청</span>
                        </button>

                        {/* 진행 중인 발주 상태 뱃지 */}
                        {itemPendingOrders.length > 0 && (
                          <div className="mt-1 text-[10px] text-blue-600 font-medium">
                            발주 진행: {itemPendingOrders.length}건
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
