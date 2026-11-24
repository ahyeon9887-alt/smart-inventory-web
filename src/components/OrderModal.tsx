'use client';

import React, { useState } from 'react';
import { ItemWithCalculations } from '@/types/database';
import { X, ShoppingCart, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface OrderModalProps {
  item: ItemWithCalculations | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (itemId: number, orderQty: number, orderDate: string, status: string) => Promise<boolean>;
}

export default function OrderModal({
  item,
  isOpen,
  onClose,
  onSubmit,
}: OrderModalProps) {
  if (!isOpen || !item) return null;

  // 권장 발주량: (ROP - 현재재고) + 안전재고 or 최소 일일사용량 * 10
  const recommendedQty = Math.max(
    1,
    Math.ceil(Math.max(0, item.rop - item.current_stock) + item.safety_stock)
  );

  const [orderQty, setOrderQty] = useState<number>(recommendedQty);
  const [orderDate, setOrderDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [status, setStatus] = useState<string>('발주요청');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (orderQty <= 0) {
      setErrorMsg('발주 수량은 1개 이상이어야 합니다.');
      return;
    }
    setErrorMsg(null);
    setIsSubmitting(true);
    const success = await onSubmit(Number(item.item_id), orderQty, orderDate, status);
    setIsSubmitting(false);
    if (success) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-lg overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
              <ShoppingCart className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">구매 발주 요청 등록</h2>
              <p className="text-xs text-slate-500">purchase_order 테이블에 발주 데이터를 저장합니다</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Item Info Summary */}
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                  {item.item_code}
                </span>
                <h3 className="font-bold text-sm text-slate-900 mt-1">{item.name}</h3>
                <p className="text-xs text-slate-500">{item.spec || '규격 미기재'}</p>
              </div>
              <div className="text-right">
                <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                  item.is_reorder_needed
                    ? 'bg-rose-100 text-rose-700'
                    : 'bg-emerald-100 text-emerald-700'
                }`}>
                  {item.is_reorder_needed ? '발주 필요' : '재고 정상'}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-200/60 text-center">
              <div className="bg-white p-2 rounded-lg border border-slate-100">
                <p className="text-[11px] text-slate-400">현재 재고</p>
                <p className={`text-sm font-bold ${item.is_reorder_needed ? 'text-rose-600' : 'text-slate-800'}`}>
                  {item.current_stock.toLocaleString()} <span className="text-xs font-normal text-slate-400">{item.unit}</span>
                </p>
              </div>
              <div className="bg-white p-2 rounded-lg border border-slate-100">
                <p className="text-[11px] text-slate-400">재주문점(ROP)</p>
                <p className="text-sm font-bold text-indigo-600">
                  {item.rop.toLocaleString()} <span className="text-xs font-normal text-slate-400">{item.unit}</span>
                </p>
              </div>
              <div className="bg-white p-2 rounded-lg border border-slate-100">
                <p className="text-[11px] text-slate-400">거래처 리드타임</p>
                <p className="text-sm font-bold text-slate-700">
                  {item.supplier?.lead_time_days ?? '-'} <span className="text-xs font-normal text-slate-400">일</span>
                </p>
              </div>
            </div>
          </div>

          {/* Form Inputs */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              발주 요청 수량 ({item.unit || 'EA'})
            </label>
            <div className="relative">
              <input
                type="number"
                min="1"
                required
                value={orderQty}
                onChange={(e) => setOrderQty(Math.max(1, parseInt(e.target.value) || 0))}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-semibold"
              />
              <span className="absolute right-3 top-2.5 text-xs text-slate-400">
                (권장량: {recommendedQty})
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              예상 발주 금액: {(orderQty * (item.unit_price || 0)).toLocaleString()}원 (개당 {(item.unit_price || 0).toLocaleString()}원)
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                발주 일자
              </label>
              <input
                type="date"
                required
                value={orderDate}
                onChange={(e) => setOrderDate(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                발주 상태
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
              >
                <option value="발주요청">발주요청 (PENDING)</option>
                <option value="발주완료">발주완료 (ORDERED)</option>
                <option value="입고대기">입고대기 (WAITING)</option>
              </select>
            </div>
          </div>

          {/* Action buttons */}
          <div className="pt-2 flex items-center justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 text-sm font-medium transition-colors"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold shadow-sm shadow-blue-500/30 flex items-center space-x-1.5 transition-colors disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isSubmitting ? '저장 중...' : '발주서 등록'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
