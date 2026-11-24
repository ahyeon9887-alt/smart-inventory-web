import { Item, Supplier, StockTx, ItemWithCalculations, ABCAnalysisItem, ABCSummary } from '@/types/database';

/**
 * 현재 재고 계산:
 * init_stock + 총 입고량(IN) - 총 출고량(OUT)
 */
export function calculateCurrentStock(
  initStock: number,
  transactions: StockTx[]
): { totalIn: number; totalOut: number; currentStock: number } {
  let totalIn = 0;
  let totalOut = 0;

  for (const tx of transactions) {
    const qty = Number(tx.qty) || 0;
    if (tx.tx_type === 'IN') {
      totalIn += qty;
    } else if (tx.tx_type === 'OUT') {
      totalOut += qty;
    }
  }

  const currentStock = (Number(initStock) || 0) + totalIn - totalOut;
  return { totalIn, totalOut, currentStock };
}

/**
 * 재주문점(ROP, Reorder Point) 계산:
 * daily_usage × supplier.lead_time_days + safety_stock
 */
export function calculateROP(
  dailyUsage: number,
  leadTimeDays: number,
  safetyStock: number
): number {
  const usage = Number(dailyUsage) || 0;
  const leadTime = Number(leadTimeDays) || 0;
  const safety = Number(safetyStock) || 0;
  return Math.round((usage * leadTime + safety) * 100) / 100;
}

/**
 * 발주 판정:
 * 현재 재고 <= ROP 이면 '발주 필요'
 */
export function isReorderNeeded(currentStock: number, rop: number): boolean {
  return currentStock <= rop;
}

/**
 * 품목 목록에 재고, ROP 및 상태 계산값 병합
 */
export function enrichItemsWithCalculations(
  items: Item[],
  suppliers: Supplier[],
  transactions: StockTx[]
): ItemWithCalculations[] {
  const supplierMap = new Map<number, Supplier>();
  suppliers.forEach((s) => supplierMap.set(Number(s.supplier_id), s));

  // 그룹화된 트랜잭션
  const txMap = new Map<number, StockTx[]>();
  transactions.forEach((tx) => {
    const itemId = Number(tx.item_id);
    if (!txMap.has(itemId)) {
      txMap.set(itemId, []);
    }
    txMap.get(itemId)!.push(tx);
  });

  return items.map((item) => {
    const itemId = Number(item.item_id);
    const itemTxs = txMap.get(itemId) || [];
    const { totalIn, totalOut, currentStock } = calculateCurrentStock(item.init_stock, itemTxs);
    
    const supplier = item.supplier_id ? supplierMap.get(Number(item.supplier_id)) || null : null;
    const leadTime = supplier?.lead_time_days ?? 0;
    const rop = calculateROP(item.daily_usage, leadTime, item.safety_stock);
    const needOrder = isReorderNeeded(currentStock, rop);
    const stockValue = currentStock * (Number(item.unit_price) || 0);

    return {
      ...item,
      supplier,
      total_in: totalIn,
      total_out: totalOut,
      current_stock: currentStock,
      rop,
      is_reorder_needed: needOrder,
      stock_value: stockValue,
    };
  });
}

/**
 * 탭 4: [IE 재고 분석] ABC 분석 계산
 * - 연간 사용금액 = daily_usage × 365 × unit_price
 * - 연간 사용금액 기준 내림차순 정렬
 * - 누적 비중 70% 이하: A등급 (핵심 관리)
 * - 누적 비중 90% 이하: B등급 (중점 관리)
 * - 나머지: C등급 (일반 관리)
 */
export function performABCAnalysis(
  enrichedItems: ItemWithCalculations[]
): {
  abcItems: ABCAnalysisItem[];
  summaries: ABCSummary[];
  totalAnnualValue: number;
} {
  if (enrichedItems.length === 0) {
    return {
      abcItems: [],
      summaries: [
        { grade: 'A', item_count: 0, item_share_pct: 0, total_annual_value: 0, value_share_pct: 0, description: '상위 70% 금액 차지 - 정밀 관리, 엄격한 재고 통제' },
        { grade: 'B', item_count: 0, item_share_pct: 0, total_annual_value: 0, value_share_pct: 0, description: '중위 20% 금액 차지 - 정기 발주 및 표준 재고 통제' },
        { grade: 'C', item_count: 0, item_share_pct: 0, total_annual_value: 0, value_share_pct: 0, description: '하위 10% 금액 차지 - 간이 관리, 대량/2상자 발주 방식' },
      ],
      totalAnnualValue: 0,
    };
  }

  // 1. 품목별 연간 사용량 및 사용금액 계산
  const itemsWithValue = enrichedItems.map((item) => {
    const annualQty = (Number(item.daily_usage) || 0) * 365;
    const annualValue = annualQty * (Number(item.unit_price) || 0);
    return {
      item,
      annualQty,
      annualValue,
    };
  });

  // 2. 연간 사용금액 기준 내림차순 정렬
  itemsWithValue.sort((a, b) => b.annualValue - a.annualValue);

  // 3. 전체 연간 사용금액 총합
  const totalAnnualValue = itemsWithValue.reduce((acc, cur) => acc + cur.annualValue, 0);

  // 4. 누적 계산 및 등급 부여
  let cumulativeValue = 0;
  const abcItems: ABCAnalysisItem[] = itemsWithValue.map((entry, index) => {
    cumulativeValue += entry.annualValue;
    const sharePct = totalAnnualValue > 0 ? (entry.annualValue / totalAnnualValue) * 100 : 0;
    const cumulativePct = totalAnnualValue > 0 ? (cumulativeValue / totalAnnualValue) * 100 : 0;

    // A등급: 누적 비중 70% 이하 (또는 첫 번째 항목이 70% 초과하더라도 첫 항목은 A)
    let grade: 'A' | 'B' | 'C' = 'C';
    if (cumulativePct <= 70 || index === 0) {
      grade = 'A';
    } else if (cumulativePct <= 90) {
      grade = 'B';
    } else {
      grade = 'C';
    }

    return {
      rank: index + 1,
      item_id: Number(entry.item.item_id),
      item_code: entry.item.item_code,
      name: entry.item.name,
      spec: entry.item.spec || '-',
      unit: entry.item.unit || 'EA',
      unit_price: Number(entry.item.unit_price) || 0,
      daily_usage: Number(entry.item.daily_usage) || 0,
      annual_usage_qty: entry.annualQty,
      annual_usage_value: Math.round(entry.annualValue),
      share_pct: Math.round(sharePct * 100) / 100,
      cumulative_value: Math.round(cumulativeValue),
      cumulative_pct: Math.round(cumulativePct * 100) / 100,
      grade,
      current_stock: entry.item.current_stock,
      rop: entry.item.rop,
    };
  });

  // 5. 등급별 요약 통계 집계
  const grades: ('A' | 'B' | 'C')[] = ['A', 'B', 'C'];
  const totalItemsCount = abcItems.length;

  const descriptions: Record<'A' | 'B' | 'C', string> = {
    A: '누적 사용금액 70% 이하의 핵심 품목군 (엄격한 ROP 관리, 최소 안전재고, 정밀 발주 통제)',
    B: '누적 사용금액 70~90% 구간의 중점 품목군 (정기 점검 및 표준 재고 관리 규칙 적용)',
    C: '누적 사용금액 90% 초과의 일반 관리 품목군 (대량 발주, 2-Bin 방식 등 관리 비용 최소화)',
  };

  const summaries: ABCSummary[] = grades.map((g) => {
    const groupItems = abcItems.filter((i) => i.grade === g);
    const count = groupItems.length;
    const groupValue = groupItems.reduce((acc, cur) => acc + cur.annual_usage_value, 0);
    const itemSharePct = totalItemsCount > 0 ? (count / totalItemsCount) * 100 : 0;
    const valueSharePct = totalAnnualValue > 0 ? (groupValue / totalAnnualValue) * 100 : 0;

    return {
      grade: g,
      item_count: count,
      item_share_pct: Math.round(itemSharePct * 10) / 10,
      total_annual_value: groupValue,
      value_share_pct: Math.round(valueSharePct * 10) / 10,
      description: descriptions[g],
    };
  });

  return {
    abcItems,
    summaries,
    totalAnnualValue,
  };
}
