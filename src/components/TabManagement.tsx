'use client';

import React, { useState } from 'react';
import { Supplier, ItemWithCalculations } from '@/types/database';
import { 
  Building2, 
  PackagePlus, 
  Layers, 
  CheckCircle2, 
  AlertTriangle,
  Plus,
  Users,
  Clock,
  DollarSign
} from 'lucide-react';

interface TabManagementProps {
  suppliers: Supplier[];
  items: ItemWithCalculations[];
  onAddSupplier: (supplier: { name: string; contact?: string; lead_time_days: number }) => Promise<boolean>;
  onAddItem: (item: {
    supplier_id: number | null;
    item_code: string;
    name: string;
    spec?: string;
    unit?: string;
    init_stock: number;
    safety_stock: number;
    daily_usage: number;
    unit_price: number;
  }) => Promise<boolean>;
}

export default function TabManagement({
  suppliers,
  items,
  onAddSupplier,
  onAddItem,
}: TabManagementProps) {
  const [activeSubTab, setActiveSubTab] = useState<'item' | 'supplier'>('item');

  // 거래처 등록 폼 상태
  const [suppName, setSuppName] = useState('');
  const [suppContact, setSuppContact] = useState('');
  const [suppLeadTime, setSuppLeadTime] = useState<number | ''>(7);
  const [suppIsSubmitting, setSuppIsSubmitting] = useState(false);
  const [suppSuccess, setSuppSuccess] = useState<string | null>(null);

  // 품목 등록 폼 상태
  const [itemSupplierId, setItemSupplierId] = useState<number | ''>(
    suppliers.length > 0 ? Number(suppliers[0].supplier_id) : ''
  );
  const [itemCode, setItemCode] = useState('');
  const [itemName, setItemName] = useState('');
  const [itemSpec, setItemSpec] = useState('');
  const [itemUnit, setItemUnit] = useState('EA');
  const [initStock, setInitStock] = useState<number | ''>(100);
  const [safetyStock, setSafetyStock] = useState<number | ''>(30);
  const [dailyUsage, setDailyUsage] = useState<number | ''>(5);
  const [unitPrice, setUnitPrice] = useState<number | ''>(10000);
  const [itemIsSubmitting, setItemIsSubmitting] = useState(false);
  const [itemSuccess, setItemSuccess] = useState<string | null>(null);

  // 거래처 등록 제출
  const handleSupplierSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!suppName.trim()) return;

    setSuppIsSubmitting(true);
    const success = await onAddSupplier({
      name: suppName.trim(),
      contact: suppContact.trim() || undefined,
      lead_time_days: Number(suppLeadTime) || 0,
    });
    setSuppIsSubmitting(false);

    if (success) {
      setSuppSuccess(`거래처 '${suppName}'이(가) 등록되었습니다.`);
      setSuppName('');
      setSuppContact('');
      setSuppLeadTime(7);
      setTimeout(() => setSuppSuccess(null), 3000);
    }
  };

  // 품목 등록 제출
  const handleItemSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemCode.trim() || !itemName.trim()) return;

    setItemIsSubmitting(true);
    const success = await onAddItem({
      supplier_id: itemSupplierId ? Number(itemSupplierId) : null,
      item_code: itemCode.trim().toUpperCase(),
      name: itemName.trim(),
      spec: itemSpec.trim() || undefined,
      unit: itemUnit.trim() || 'EA',
      init_stock: Number(initStock) || 0,
      safety_stock: Number(safetyStock) || 0,
      daily_usage: Number(dailyUsage) || 0,
      unit_price: Number(unitPrice) || 0,
    });
    setItemIsSubmitting(false);

    if (success) {
      setItemSuccess(`품목 '[${itemCode}] ${itemName}'이(가) 등록되었습니다.`);
      setItemCode('');
      setItemName('');
      setItemSpec('');
      setTimeout(() => setItemSuccess(null), 3000);
    }
  };

  return (
    <div className="space-y-6">
      {/* 서브 탭 토글 */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setActiveSubTab('item')}
          className={`py-3 px-6 text-sm font-bold border-b-2 flex items-center space-x-2 transition-all ${
            activeSubTab === 'item'
              ? 'border-blue-600 text-blue-600 bg-white'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <PackagePlus className="w-4 h-4" />
          <span>품목(Item) 등록 및 목록 ({items.length})</span>
        </button>
        <button
          onClick={() => setActiveSubTab('supplier')}
          className={`py-3 px-6 text-sm font-bold border-b-2 flex items-center space-x-2 transition-all ${
            activeSubTab === 'supplier'
              ? 'border-blue-600 text-blue-600 bg-white'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>거래처(Supplier) 등록 및 목록 ({suppliers.length})</span>
        </button>
      </div>

      {/* =================================== */}
      {/* 1. 품목(Item) 관리 섹션 */}
      {/* =================================== */}
      {activeSubTab === 'item' && (
        <div className="space-y-6">
          {/* 품목 추가 폼 카드 */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <div className="flex items-center space-x-2.5 pb-4 mb-4 border-b border-slate-100">
              <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
                <Plus className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">신규 품목 추가 (item)</h3>
                <p className="text-xs text-slate-500">
                  원부자재 품목 정보, 조달 거래처, 안전재고 및 일일소요량을 설정합니다
                </p>
              </div>
            </div>

            {itemSuccess && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>{itemSuccess}</span>
              </div>
            )}

            <form onSubmit={handleItemSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* 품목코드 */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    품목 코드 <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="예: MOT-750W, BRG-6204"
                    value={itemCode}
                    onChange={(e) => setItemCode(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono"
                  />
                </div>

                {/* 품목명 */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    품목명 <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="예: 서보모터 750W, 볼베어링 6204ZZ"
                    value={itemName}
                    onChange={(e) => setItemName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* 조달 거래처 선택 */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    조달 거래처 (Supplier)
                  </label>
                  <select
                    value={itemSupplierId}
                    onChange={(e) => setItemSupplierId(e.target.value ? Number(e.target.value) : '')}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                  >
                    <option value="">-- 거래처 미지정 --</option>
                    {suppliers.map((s) => (
                      <option key={s.supplier_id} value={s.supplier_id}>
                        {s.name} (L/T: {s.lead_time_days}일)
                      </option>
                    ))}
                  </select>
                </div>

                {/* 규격 */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">규격 / 사양</label>
                  <input
                    type="text"
                    placeholder="예: 750W AC 220V 3000RPM, M6x25L SUS304"
                    value={itemSpec}
                    onChange={(e) => setItemSpec(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* 단위 */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">단위</label>
                  <input
                    type="text"
                    placeholder="EA, SET, BOX, KG, M"
                    value={itemUnit}
                    onChange={(e) => setItemUnit(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* 단가 */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">단가 (원)</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="단가 입력"
                    value={unitPrice}
                    onChange={(e) => setUnitPrice(e.target.value === '' ? '' : parseInt(e.target.value, 10))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono"
                  />
                </div>

                {/* 기초재고 */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">기초 재고량 (init_stock)</label>
                  <input
                    type="number"
                    min="0"
                    value={initStock}
                    onChange={(e) => setInitStock(e.target.value === '' ? '' : parseInt(e.target.value, 10))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono"
                  />
                </div>

                {/* 안전재고 */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">안전 재고량 (safety_stock)</label>
                  <input
                    type="number"
                    min="0"
                    value={safetyStock}
                    onChange={(e) => setSafetyStock(e.target.value === '' ? '' : parseInt(e.target.value, 10))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono"
                  />
                </div>

                {/* 일일사용량 */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">일일 소요량 (daily_usage)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    value={dailyUsage}
                    onChange={(e) => setDailyUsage(e.target.value === '' ? '' : parseFloat(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={itemIsSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-sm shadow-blue-500/20 flex items-center space-x-1.5 transition-colors disabled:opacity-50"
                >
                  <Plus className="w-4 h-4" />
                  <span>{itemIsSubmitting ? '저장 중...' : '신규 품목 저장'}</span>
                </button>
              </div>
            </form>
          </div>

          {/* 품목 목록 테이블 */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h4 className="text-sm font-bold text-slate-900">등록된 전체 품목 목록</h4>
              <span className="text-xs text-slate-500">총 {items.length}개 품목</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700 border-collapse">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold">
                  <tr>
                    <th className="py-3 px-4">ID</th>
                    <th className="py-3 px-4">품목코드</th>
                    <th className="py-3 px-4">품목명</th>
                    <th className="py-3 px-4">규격</th>
                    <th className="py-3 px-3">단위</th>
                    <th className="py-3 px-4">거래처</th>
                    <th className="py-3 px-3 text-right">단가</th>
                    <th className="py-3 px-3 text-right">기초재고</th>
                    <th className="py-3 px-3 text-right">안전재고</th>
                    <th className="py-3 px-3 text-right">일일사용</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {items.map((item) => (
                    <tr key={item.item_id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 font-mono text-slate-400">#{item.item_id}</td>
                      <td className="py-3 px-4 font-mono font-bold text-blue-700">{item.item_code}</td>
                      <td className="py-3 px-4 font-bold text-slate-900">{item.name}</td>
                      <td className="py-3 px-4 text-slate-500 max-w-xs truncate">{item.spec || '-'}</td>
                      <td className="py-3 px-3 font-medium text-slate-600">{item.unit || 'EA'}</td>
                      <td className="py-3 px-4 text-slate-700 font-medium">{item.supplier?.name || '-'}</td>
                      <td className="py-3 px-3 text-right font-mono font-medium">{(item.unit_price || 0).toLocaleString()}원</td>
                      <td className="py-3 px-3 text-right font-mono font-medium">{item.init_stock}</td>
                      <td className="py-3 px-3 text-right font-mono font-medium text-amber-700">{item.safety_stock}</td>
                      <td className="py-3 px-3 text-right font-mono font-medium text-indigo-700">{item.daily_usage}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* =================================== */}
      {/* 2. 거래처(Supplier) 관리 섹션 */}
      {/* =================================== */}
      {activeSubTab === 'supplier' && (
        <div className="space-y-6">
          {/* 거래처 추가 폼 카드 */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <div className="flex items-center space-x-2.5 pb-4 mb-4 border-b border-slate-100">
              <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center">
                <Building2 className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">신규 거래처 추가 (supplier)</h3>
                <p className="text-xs text-slate-500">
                  원부자재를 공급하는 협력업체 및 조달 리드타임(Lead Time Days)을 등록합니다
                </p>
              </div>
            </div>

            {suppSuccess && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>{suppSuccess}</span>
              </div>
            )}

            <form onSubmit={handleSupplierSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    거래처명 <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="예: (주)대현정밀, 삼원베어링"
                    value={suppName}
                    onChange={(e) => setSuppName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    담당자 및 연락처
                  </label>
                  <input
                    type="text"
                    placeholder="예: 02-888-1234 (김영호 과장)"
                    value={suppContact}
                    onChange={(e) => setSuppContact(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    조달 리드타임 (일) <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min="1"
                      required
                      placeholder="리드타임 일수 (ROP 계산에 필수)"
                      value={suppLeadTime}
                      onChange={(e) => setSuppLeadTime(e.target.value === '' ? '' : parseInt(e.target.value, 10))}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono font-bold"
                    />
                    <span className="absolute right-3 top-2 text-xs text-slate-400">일</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={suppIsSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-sm shadow-indigo-500/20 flex items-center space-x-1.5 transition-colors disabled:opacity-50"
                >
                  <Plus className="w-4 h-4" />
                  <span>{suppIsSubmitting ? '저장 중...' : '거래처 등록'}</span>
                </button>
              </div>
            </form>
          </div>

          {/* 거래처 목록 테이블 */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h4 className="text-sm font-bold text-slate-900">등록된 협력 거래처 목록</h4>
              <span className="text-xs text-slate-500">총 {suppliers.length}개사</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700 border-collapse">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold">
                  <tr>
                    <th className="py-3 px-4">거래처 ID</th>
                    <th className="py-3 px-4">거래처명</th>
                    <th className="py-3 px-4">연락처 / 담당자</th>
                    <th className="py-3 px-4 text-center">조달 리드타임 (Days)</th>
                    <th className="py-3 px-4 text-right">매핑 품목 수</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {suppliers.map((s) => {
                    const mappedCount = items.filter((i) => Number(i.supplier_id) === Number(s.supplier_id)).length;

                    return (
                      <tr key={s.supplier_id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-4 font-mono text-slate-400">#{s.supplier_id}</td>
                        <td className="py-3 px-4 font-bold text-slate-900">{s.name}</td>
                        <td className="py-3 px-4 text-slate-600">{s.contact || '-'}</td>
                        <td className="py-3 px-4 text-center font-mono font-bold text-indigo-700">
                          <span className="px-2.5 py-1 bg-indigo-50 border border-indigo-200 rounded-lg">
                            {s.lead_time_days} 일
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right font-medium text-slate-600">
                          {mappedCount}개 품목
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
