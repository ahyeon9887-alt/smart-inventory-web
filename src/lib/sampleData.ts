import { Supplier, Item, StockTx, PurchaseOrder } from '@/types/database';

export const initialSuppliers: Supplier[] = [
  { supplier_id: 1, name: '(주)대현정밀', contact: '02-888-1234 (김영호 부장)', lead_time_days: 5 },
  { supplier_id: 2, name: '삼원베어링', contact: '031-456-7890 (이정민 과장)', lead_time_days: 10 },
  { supplier_id: 3, name: '한국센서테크', contact: '054-921-3344 (박상우 팀장)', lead_time_days: 14 },
  { supplier_id: 4, name: '제일특수금속', contact: '052-234-5678 (최진철 대리)', lead_time_days: 7 },
  { supplier_id: 5, name: '한빛전자부품', contact: '032-678-9012 (황미경 실장)', lead_time_days: 21 },
];

export const initialItems: Item[] = [
  // Class A 후보군 (고가 핵심 부품, 높은 연간 소요액)
  {
    item_id: 1,
    supplier_id: 1,
    item_code: 'MOT-750W',
    name: '산업용 고성능 서보모터 750W',
    spec: '750W AC 220V 3000RPM',
    unit: 'SET',
    init_stock: 45,
    safety_stock: 20,
    daily_usage: 4, // ROP: 4 * 5 + 20 = 40
    unit_price: 380000,
  },
  {
    item_id: 2,
    supplier_id: 5,
    item_code: 'INV-400A',
    name: '스마트 인버터 드라이브 모듈',
    spec: '3-Phase 380V 5.5kW Vector',
    unit: 'EA',
    init_stock: 35,
    safety_stock: 25,
    daily_usage: 2, // ROP: 2 * 21 + 25 = 67 -> 발주 필요 상태 유도
    unit_price: 520000,
  },
  {
    item_id: 3,
    supplier_id: 3,
    item_code: 'SNS-LASER-01',
    name: '초정밀 레이저 변위 센서',
    spec: '측정범위 50mm 분해능 0.1um',
    unit: 'EA',
    init_stock: 60,
    safety_stock: 15,
    daily_usage: 3, // ROP: 3 * 14 + 15 = 57
    unit_price: 290000,
  },

  // Class B 후보군 (중가 규격 부품)
  {
    item_id: 4,
    supplier_id: 2,
    item_code: 'BRG-6204ZZ',
    name: '정밀 볼베어링 6204ZZ',
    spec: '내경 20mm 외경 47mm 두께 14mm',
    unit: 'EA',
    init_stock: 250,
    safety_stock: 100,
    daily_usage: 25, // ROP: 25 * 10 + 100 = 350 -> 발주 필요 상태 유도
    unit_price: 18500,
  },
  {
    item_id: 5,
    supplier_id: 4,
    item_code: 'LM-GUIDE-H25',
    name: 'LM 가이드 블록 & 레일 세트',
    spec: 'HSR25R 길이 1000mm',
    unit: 'SET',
    init_stock: 80,
    safety_stock: 30,
    daily_usage: 6, // ROP: 6 * 7 + 30 = 72
    unit_price: 75000,
  },
  {
    item_id: 6,
    supplier_id: 3,
    item_code: 'SNS-PROX-M12',
    name: '방수형 근접센서 M12',
    spec: 'DC 3선식 NPN NO 검출거리 4mm',
    unit: 'EA',
    init_stock: 150,
    safety_stock: 50,
    daily_usage: 12, // ROP: 12 * 14 + 50 = 218 -> 발주 필요
    unit_price: 24000,
  },

  // Class C 후보군 (저가 대량 소모성 체결/배선 자재)
  {
    item_id: 7,
    supplier_id: 1,
    item_code: 'BLT-HEX-M6-25',
    name: 'SUS304 육각 렌치 볼트 M6x25',
    spec: 'M6 x 25L SUS304 전나사',
    unit: 'BOX(500)',
    init_stock: 120,
    safety_stock: 30,
    daily_usage: 5, // ROP: 5 * 5 + 30 = 55
    unit_price: 12000,
  },
  {
    item_id: 8,
    supplier_id: 4,
    item_code: 'NUT-NYLON-M6',
    name: 'SUS304 나일론 풀림방지 너트 M6',
    spec: 'M6 DIN985 스테인리스',
    unit: 'BOX(1000)',
    init_stock: 80,
    safety_stock: 20,
    daily_usage: 4, // ROP: 4 * 7 + 20 = 48
    unit_price: 9500,
  },
  {
    item_id: 9,
    supplier_id: 5,
    item_code: 'CBL-TIE-200',
    name: '난연성 나일론 케이블 타이',
    spec: '폭 4.8mm 길이 200mm 백색',
    unit: 'PACK(100)',
    init_stock: 300,
    safety_stock: 80,
    daily_usage: 15, // ROP: 15 * 21 + 80 = 395 -> 발주 필요
    unit_price: 3500,
  },
  {
    item_id: 10,
    supplier_id: 2,
    item_code: 'ORING-NBR-P20',
    name: '내유성 NBR O-링 패킹 P-20',
    spec: '내경 19.8mm 두께 2.4mm JIS B2401',
    unit: 'EA',
    init_stock: 800,
    safety_stock: 200,
    daily_usage: 30, // ROP: 30 * 10 + 200 = 500
    unit_price: 450,
  },
];

export const initialTransactions: StockTx[] = [
  { tx_id: 1, item_id: 1, tx_type: 'IN', qty: 10, tx_date: '2026-11-15', memo: '정기 입고 검수 완료' },
  { tx_id: 2, item_id: 1, tx_type: 'OUT', qty: 8, tx_date: '2026-11-18', memo: '생산 1라인 투입' },
  { tx_id: 3, item_id: 2, tx_type: 'OUT', qty: 12, tx_date: '2026-11-20', memo: '인버터 불량 교체 및 조립 투입' },
  { tx_id: 4, item_id: 4, tx_type: 'OUT', qty: 50, tx_date: '2026-11-21', memo: '베어링 하우징 조립' },
  { tx_id: 5, item_id: 6, tx_type: 'OUT', qty: 30, tx_date: '2026-11-22', memo: '자동화 라인 센서 설치' },
  { tx_id: 6, item_id: 7, tx_type: 'IN', qty: 50, tx_date: '2026-11-23', memo: '대량 구매 입고' },
  { tx_id: 7, item_id: 9, tx_type: 'OUT', qty: 100, tx_date: '2026-11-24', memo: '제어반 배선 정리용 출고' },
];

export const initialPurchaseOrders: PurchaseOrder[] = [
  { po_id: 1, item_id: 2, order_qty: 30, order_date: '2026-11-24', status: '발주요청' },
  { po_id: 2, item_id: 4, order_qty: 200, order_date: '2026-11-24', status: '발주요청' },
];
