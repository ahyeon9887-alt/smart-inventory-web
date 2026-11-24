'use client';

import React, { useMemo } from 'react';
import { ItemWithCalculations } from '@/types/database';
import { performABCAnalysis } from '@/lib/calculations';
import { 
  BarChart3, 
  PieChart, 
  TrendingUp, 
  ShieldCheck, 
  AlertCircle, 
  Award,
  Layers,
  Sparkles,
  Info
} from 'lucide-react';

interface TabAnalysisProps {
  items: ItemWithCalculations[];
}

export default function TabAnalysis({ items }: TabAnalysisProps) {
  // ABC 분석 수행
  const { abcItems, summaries, totalAnnualValue } = useMemo(() => {
    return performABCAnalysis(items);
  }, [items]);

  const summaryA = summaries.find((s) => s.grade === 'A');
  const summaryB = summaries.find((s) => s.grade === 'B');
  const summaryC = summaries.find((s) => s.grade === 'C');

  return (
    <div className="space-y-6">
      {/* 산업공학 ABC 분석 개요 헤더 카드 */}
      <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-blue-900 rounded-2xl text-white p-6 shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-indigo-300 text-xs font-bold uppercase tracking-wider mb-1">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Industrial Engineering Inventory Management</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight">
              품목별 ABC 중점 재고관리 분석
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
              파레토 법칙(80/20 법칙)에 따라 품목별 <strong className="text-white">연간 소요금액(일일사용량 × 365 × 단가)</strong>을 기준으로 A·B·C 등급을 차등 부여하여 한정된 관리 자원을 핵심 품목에 집중 투입합니다.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md px-5 py-3.5 rounded-xl border border-white/10 text-right">
            <span className="text-xs text-slate-300 block">전체 연간 사용 예상금액</span>
            <span className="text-xl sm:text-2xl font-black font-mono text-emerald-400">
              {totalAnnualValue.toLocaleString()} <span className="text-sm font-normal text-slate-300">원/년</span>
            </span>
          </div>
        </div>

        {/* 파레토 누적 비중 시각화 바 */}
        <div className="mt-6 pt-5 border-t border-white/10">
          <div className="flex justify-between text-xs text-slate-300 font-semibold mb-2">
            <span>등급별 금액 점유 비중</span>
            <span>
              A등급: {summaryA?.value_share_pct ?? 0}% | B등급: {summaryB?.value_share_pct ?? 0}% | C등급: {summaryC?.value_share_pct ?? 0}%
            </span>
          </div>
          <div className="h-4 w-full bg-white/10 rounded-full overflow-hidden flex shadow-inner">
            <div
              style={{ width: `${summaryA?.value_share_pct ?? 0}%` }}
              className="bg-gradient-to-r from-rose-500 to-amber-500 transition-all duration-500"
              title={`A등급: ${summaryA?.value_share_pct}%`}
            />
            <div
              style={{ width: `${summaryB?.value_share_pct ?? 0}%` }}
              className="bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-500"
              title={`B등급: ${summaryB?.value_share_pct}%`}
            />
            <div
              style={{ width: `${summaryC?.value_share_pct ?? 0}%` }}
              className="bg-emerald-500 transition-all duration-500"
              title={`C등급: ${summaryC?.value_share_pct}%`}
            />
          </div>
        </div>
      </div>

      {/* ABC 3대 등급별 요약 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* A 등급 카드 */}
        <div className="bg-white rounded-2xl border-2 border-rose-200/80 p-5 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/5 rounded-bl-full pointer-events-none" />
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <span className="w-8 h-8 rounded-xl bg-rose-600 text-white font-black text-sm flex items-center justify-center shadow-md shadow-rose-500/30">
                A
              </span>
              <div>
                <h3 className="font-bold text-sm text-slate-900">A등급 (핵심 관리 품목)</h3>
                <span className="text-[11px] text-rose-600 font-semibold">누적 사용금액 70% 이하</span>
              </div>
            </div>
            <Award className="w-5 h-5 text-rose-500" />
          </div>

          <div className="space-y-2 mt-4 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">품목 수 (비중)</span>
              <span className="font-bold text-slate-900">
                {summaryA?.item_count}개 ({summaryA?.item_share_pct}%)
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">연간 사용금액</span>
              <span className="font-bold font-mono text-rose-700">
                {summaryA?.total_annual_value.toLocaleString()}원
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">금액 점유율</span>
              <span className="font-black font-mono text-rose-600 text-sm">
                {summaryA?.value_share_pct}%
              </span>
            </div>
          </div>

          <div className="mt-4 p-2.5 bg-rose-50/60 rounded-xl text-[11px] text-rose-900 leading-relaxed">
            <strong>IE 관리 방안:</strong> 최고 수준의 정밀 통제, 일일 재고 실사, 안전재고 최소화, 엄격한 ROP 관리 및 공급사와 JIT/VMI 협력.
          </div>
        </div>

        {/* B 등급 카드 */}
        <div className="bg-white rounded-2xl border-2 border-indigo-200/80 p-5 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-bl-full pointer-events-none" />
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <span className="w-8 h-8 rounded-xl bg-indigo-600 text-white font-black text-sm flex items-center justify-center shadow-md shadow-indigo-500/30">
                B
              </span>
              <div>
                <h3 className="font-bold text-sm text-slate-900">B등급 (중점 관리 품목)</h3>
                <span className="text-[11px] text-indigo-600 font-semibold">누적 사용금액 70~90%</span>
              </div>
            </div>
            <Layers className="w-5 h-5 text-indigo-500" />
          </div>

          <div className="space-y-2 mt-4 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">품목 수 (비중)</span>
              <span className="font-bold text-slate-900">
                {summaryB?.item_count}개 ({summaryB?.item_share_pct}%)
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">연간 사용금액</span>
              <span className="font-bold font-mono text-indigo-700">
                {summaryB?.total_annual_value.toLocaleString()}원
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">금액 점유율</span>
              <span className="font-black font-mono text-indigo-600 text-sm">
                {summaryB?.value_share_pct}%
              </span>
            </div>
          </div>

          <div className="mt-4 p-2.5 bg-indigo-50/60 rounded-xl text-[11px] text-indigo-900 leading-relaxed">
            <strong>IE 관리 방안:</strong> 주간/월간 정기 발주 점검, 표준 안전재고 산정 및 ROP 규칙 자동화 적용, 주기적 재고 실사.
          </div>
        </div>

        {/* C 등급 카드 */}
        <div className="bg-white rounded-2xl border-2 border-emerald-200/80 p-5 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-bl-full pointer-events-none" />
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <span className="w-8 h-8 rounded-xl bg-emerald-600 text-white font-black text-sm flex items-center justify-center shadow-md shadow-emerald-500/30">
                C
              </span>
              <div>
                <h3 className="font-bold text-sm text-slate-900">C등급 (일반 관리 품목)</h3>
                <span className="text-[11px] text-emerald-600 font-semibold">누적 사용금액 90% 초과</span>
              </div>
            </div>
            <ShieldCheck className="w-5 h-5 text-emerald-500" />
          </div>

          <div className="space-y-2 mt-4 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">품목 수 (비중)</span>
              <span className="font-bold text-slate-900">
                {summaryC?.item_count}개 ({summaryC?.item_share_pct}%)
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">연간 사용금액</span>
              <span className="font-bold font-mono text-emerald-700">
                {summaryC?.total_annual_value.toLocaleString()}원
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">금액 점유율</span>
              <span className="font-black font-mono text-emerald-600 text-sm">
                {summaryC?.value_share_pct}%
              </span>
            </div>
          </div>

          <div className="mt-4 p-2.5 bg-emerald-50/60 rounded-xl text-[11px] text-emerald-900 leading-relaxed">
            <strong>IE 관리 방안:</strong> 관리 비용 최소화, 2-상자법(Two-bin system) 또는 대량 일괄 발주로 발주 횟수 축소 및 결품 방지.
          </div>
        </div>
      </div>

      {/* ABC 분석 상세 테이블 */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <BarChart3 className="w-4 h-4 text-blue-600" />
            <h3 className="text-sm font-bold text-slate-900">
              품목별 ABC 분석표 (연간 사용금액 내림차순 정렬)
            </h3>
          </div>
          <span className="text-xs text-slate-500">전체 {abcItems.length}개 품목</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700 border-collapse">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold">
              <tr>
                <th className="py-3 px-3 text-center">순위</th>
                <th className="py-3 px-3 text-center">ABC 등급</th>
                <th className="py-3 px-4">품목코드</th>
                <th className="py-3 px-4">품목명 / 규격</th>
                <th className="py-3 px-3 text-right">일일사용량</th>
                <th className="py-3 px-3 text-right">연간사용량(365일)</th>
                <th className="py-3 px-3 text-right">단가</th>
                <th className="py-3 px-4 text-right">연간 사용금액</th>
                <th className="py-3 px-3 text-right">금액 비중</th>
                <th className="py-3 px-3 text-right">누적 비중</th>
                <th className="py-3 px-4">IE 관리 가이드</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {abcItems.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-12 text-center text-slate-400">
                    분석할 품목 데이터가 없습니다. 품목을 먼저 등록해 주세요.
                  </td>
                </tr>
              ) : (
                abcItems.map((item) => {
                  let badgeBg = 'bg-slate-100 text-slate-700';
                  let rowBg = '';
                  if (item.grade === 'A') {
                    badgeBg = 'bg-rose-100 text-rose-700 border-rose-200';
                    rowBg = 'bg-rose-50/20';
                  } else if (item.grade === 'B') {
                    badgeBg = 'bg-indigo-100 text-indigo-700 border-indigo-200';
                    rowBg = 'bg-indigo-50/10';
                  } else {
                    badgeBg = 'bg-emerald-100 text-emerald-700 border-emerald-200';
                  }

                  return (
                    <tr key={item.item_id} className={`hover:bg-slate-50/80 transition-colors ${rowBg}`}>
                      {/* 순위 */}
                      <td className="py-3 px-3 text-center font-mono font-bold text-slate-500">
                        {item.rank}
                      </td>

                      {/* 등급 뱃지 */}
                      <td className="py-3 px-3 text-center">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-black border ${badgeBg}`}>
                          {item.grade}등급
                        </span>
                      </td>

                      {/* 품목코드 */}
                      <td className="py-3 px-4 font-mono font-bold text-slate-800">
                        {item.item_code}
                      </td>

                      {/* 품목명 */}
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">{item.name}</div>
                        <div className="text-[11px] text-slate-400 truncate max-w-xs">{item.spec}</div>
                      </td>

                      {/* 일일 사용량 */}
                      <td className="py-3 px-3 text-right font-mono font-medium">
                        {item.daily_usage} <span className="text-[10px] text-slate-400">{item.unit}</span>
                      </td>

                      {/* 연간 사용량 */}
                      <td className="py-3 px-3 text-right font-mono font-medium text-slate-600">
                        {item.annual_usage_qty.toLocaleString()} <span className="text-[10px] text-slate-400">{item.unit}</span>
                      </td>

                      {/* 단가 */}
                      <td className="py-3 px-3 text-right font-mono font-medium">
                        {item.unit_price.toLocaleString()}원
                      </td>

                      {/* 연간 사용금액 */}
                      <td className="py-3 px-4 text-right font-mono font-black text-slate-900 bg-slate-50/50">
                        {item.annual_usage_value.toLocaleString()}원
                      </td>

                      {/* 구성비 */}
                      <td className="py-3 px-3 text-right font-mono font-semibold text-slate-600">
                        {item.share_pct}%
                      </td>

                      {/* 누적 비중 */}
                      <td className="py-3 px-3 text-right font-mono font-black text-indigo-700">
                        {item.cumulative_pct}%
                      </td>

                      {/* IE 관리 코멘트 */}
                      <td className="py-3 px-4 text-slate-600 text-[11px]">
                        {item.grade === 'A' && (
                          <span className="text-rose-700 font-semibold">정밀 통제 / 일일 점검 / ROP 엄수</span>
                        )}
                        {item.grade === 'B' && (
                          <span className="text-indigo-700 font-semibold">정기 점검 / 표준 발주점 관리</span>
                        )}
                        {item.grade === 'C' && (
                          <span className="text-emerald-700 font-semibold">간이 관리 / 대량 및 2-Bin 발주</span>
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
