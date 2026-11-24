'use client';

import React, { useState } from 'react';
import { ItemWithCalculations, StockTx, TxType } from '@/types/database';
import { 
  ArrowDownLeft, 
  ArrowUpRight, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Calendar,
  FileText,
  Boxes
} from 'lucide-react';

interface TabTransactionsProps {
  items: ItemWithCalculations[];
  transactions: StockTx[];
  onSubmitTransaction: (
    itemId: number,
    txType: TxType,
    qty: number,
    txDate: string,
    memo: string
  ) => Promise<boolean>;
}

export default function TabTransactions({
  items,
  transactions,
  onSubmitTransaction,
}: TabTransactionsProps) {
  const [selectedItemId, setSelectedItemId] = useState<number | ''>(
    items.length > 0 ? Number(items[0].item_id) : ''
  );
  const [txType, setTxType] = useState<TxType>('IN');
  const [qty, setQty] = useState<number | ''>('');
  const [txDate, setTxDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [memo, setMemo] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 현재 선택된 품목 객체
  const selectedItem = items.find((i) => Number(i.item_id) === Number(selectedItemId));

  // 품목 ID 별 품목 맵 (이력 표시용)
  const itemMap = new Map<number, ItemWithCalculations>();
  items.forEach((i) => itemMap.set(Number(i.item_id), i));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!selectedItemId || !selectedItem) {
      setErrorMessage('입출고를 진행할 품목을 선택해 주세요.');
      return;
    }

    const numericQty = Number(qty);

    // 1. 수량 유효성 검증: 수량 <= 0 차단
    if (!numericQty || numericQty <= 0) {
      setErrorMessage('입출고 수량은 0보다 큰 양수여야 합니다. (수량 <= 0 등록 불가)');
      return;
    }

    // 2. 출고 시 유효성 검증: 출고 수량 > 현재 재고 차단
    if (txType === 'OUT' && numericQty > selectedItem.current_stock) {
      setErrorMessage(
        `[출고 불가] 요청 출고 수량(${numericQty.toLocaleString()} ${selectedItem.unit})이 현재 보유 재고(${selectedItem.current_stock.toLocaleString()} ${selectedItem.unit})를 초과합니다! 재고가 부족합니다.`
      );
      return;
    }

    setIsSubmitting(true);
    const success = await onSubmitTransaction(
      Number(selectedItemId),
      txType,
      numericQty,
      txDate,
      memo
    );
    setIsSubmitting(false);

    if (success) {
      setSuccessMessage(
        `${selectedItem.name} ${numericQty.toLocaleString()}${selectedItem.unit} ${
          txType === 'IN' ? '입고' : '출고'
        } 처리가 정상적으로 완료되었습니다.`
      );
      setQty('');
      setMemo('');
      // 3초 후 성공 메시지 초기화
      setTimeout(() => setSuccessMessage(null), 4000);
    }
  };

  return (
    <div className="space-y-6">
      {/* 상단: 입출고 등록 폼 */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <div className="flex items-center space-x-2.5 pb-4 mb-4 border-b border-slate-100">
          <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
            <Boxes className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">신규 입출고 등록</h2>
            <p className="text-xs text-slate-500">
              품목의 실물 입고(IN) 또는 생산/출하 출고(OUT) 트랜잭션을 stock_tx에 기록합니다
            </p>
          </div>
        </div>

        {/* 에러 경고 배너 */}
        {errorMessage && (
          <div className="mb-4 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start space-x-2.5 animate-shake">
            <AlertTriangle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">입출고 등록 차단</p>
              <p className="mt-0.5">{errorMessage}</p>
            </div>
          </div>
        )}

        {/* 성공 배너 */}
        {successMessage && (
          <div className="mb-4 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center space-x-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <div>
              <p className="font-bold">등록 완료</p>
              <p className="mt-0.5">{successMessage}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* 1. 품목 선택 */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                품목 선택 <span className="text-rose-500">*</span>
              </label>
              <select
                value={selectedItemId}
                onChange={(e) => {
                  setSelectedItemId(e.target.value ? Number(e.target.value) : '');
                  setErrorMessage(null);
                }}
                required
                className="w-full px-3 py-2.5 text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white font-medium"
              >
                <option value="">-- 품목을 선택하세요 --</option>
                {items.map((i) => (
                  <option key={i.item_id} value={i.item_id}>
                    [{i.item_code}] {i.name} (현재 재고: {i.current_stock.toLocaleString()} {i.unit})
                  </option>
                ))}
              </select>

              {/* 선택된 품목 실시간 재고 프리뷰 카드 */}
              {selectedItem && (
                <div className="mt-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-slate-800">{selectedItem.name}</span>
                    <p className="text-slate-500 text-[11px]">{selectedItem.spec || '규격 없음'}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-[11px] text-slate-400 block">현재 보유 재고</span>
                    <span className="font-mono font-bold text-sm text-blue-700">
                      {selectedItem.current_stock.toLocaleString()} {selectedItem.unit}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* 2. 구분: 입고(IN) / 출고(OUT) */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                입/출고 구분 <span className="text-rose-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setTxType('IN');
                    setErrorMessage(null);
                  }}
                  className={`py-2.5 px-4 rounded-xl border text-sm font-bold flex items-center justify-center space-x-2 transition-all ${
                    txType === 'IN'
                      ? 'bg-blue-600 text-white border-blue-600 shadow-sm shadow-blue-500/20'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <ArrowDownLeft className="w-4 h-4" />
                  <span>입고 (IN)</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setTxType('OUT');
                    setErrorMessage(null);
                  }}
                  className={`py-2.5 px-4 rounded-xl border text-sm font-bold flex items-center justify-center space-x-2 transition-all ${
                    txType === 'OUT'
                      ? 'bg-amber-600 text-white border-amber-600 shadow-sm shadow-amber-500/20'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <ArrowUpRight className="w-4 h-4" />
                  <span>출고 (OUT)</span>
                </button>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                {txType === 'IN'
                  ? '입고 시 현재 재고가 증가합니다.'
                  : '출고 시 현재 재고가 차감되며, 현재 재고를 초과할 수 없습니다.'}
              </p>
            </div>

            {/* 3. 수량 입력 */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                수량 ({selectedItem?.unit || 'EA'}) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                min="1"
                placeholder="수량을 입력하세요 (양수)"
                required
                value={qty}
                onChange={(e) => {
                  const val = e.target.value === '' ? '' : parseInt(e.target.value, 10);
                  setQty(val);
                  setErrorMessage(null);
                }}
                className="w-full px-3 py-2.5 text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono font-bold"
              />
            </div>

            {/* 4. 날짜 입력 */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                입/출고 일자 <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="date"
                  required
                  value={txDate}
                  onChange={(e) => setTxDate(e.target.value)}
                  className="w-full px-3 py-2.5 text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* 5. 메모 입력 */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              비고 / 메모
            </label>
            <input
              type="text"
              placeholder="예: 정기 구매 입고, 2라인 생산 투입, 긴급 보수용 출고 등"
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* 등록 버튼 */}
          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`px-6 py-2.5 rounded-xl text-white font-bold text-sm shadow-md transition-all flex items-center space-x-2 ${
                txType === 'IN'
                  ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/20'
                  : 'bg-amber-600 hover:bg-amber-700 shadow-amber-500/20'
              } disabled:opacity-50`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isSubmitting ? '처리 중...' : `${txType === 'IN' ? '입고' : '출고'} 등록 실행`}</span>
            </button>
          </div>
        </form>
      </div>

      {/* 하단: 최근 입출고 이력 테이블 */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4 text-slate-500" />
            <h3 className="text-sm font-bold text-slate-900">최근 입출고 이력 (stock_tx)</h3>
          </div>
          <span className="text-xs text-slate-500">총 {transactions.length}건 기록</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700 border-collapse">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold">
              <tr>
                <th className="py-3 px-4">번호 (ID)</th>
                <th className="py-3 px-4">일자</th>
                <th className="py-3 px-4 text-center">구분</th>
                <th className="py-3 px-4">품목코드</th>
                <th className="py-3 px-4">품목명</th>
                <th className="py-3 px-4 text-right">수량</th>
                <th className="py-3 px-4">메모</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <Clock className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    <span>아직 등록된 입출고 이력이 없습니다.</span>
                  </td>
                </tr>
              ) : (
                transactions.map((tx) => {
                  const item = itemMap.get(Number(tx.item_id));
                  const isIN = tx.tx_type === 'IN';

                  return (
                    <tr key={tx.tx_id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 font-mono text-slate-400">#{tx.tx_id}</td>
                      <td className="py-3 px-4 font-mono font-medium text-slate-600">
                        {tx.tx_date}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                            isIN
                              ? 'bg-blue-50 text-blue-700 border border-blue-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}
                        >
                          {isIN ? <ArrowDownLeft className="w-3 h-3" /> : <ArrowUpRight className="w-3 h-3" />}
                          <span>{isIN ? '입고 (IN)' : '출고 (OUT)'}</span>
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono font-semibold text-slate-800">
                        {item?.item_code || '-'}
                      </td>
                      <td className="py-3 px-4 font-medium text-slate-900">
                        {item?.name || `품목 #${tx.item_id}`}
                      </td>
                      <td className={`py-3 px-4 text-right font-mono font-bold text-sm ${
                        isIN ? 'text-blue-600' : 'text-amber-600'
                      }`}>
                        {isIN ? '+' : '-'}{Number(tx.qty).toLocaleString()} <span className="text-xs font-normal text-slate-400">{item?.unit || 'EA'}</span>
                      </td>
                      <td className="py-3 px-4 text-slate-600 max-w-xs truncate">
                        {tx.memo || '-'}
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
