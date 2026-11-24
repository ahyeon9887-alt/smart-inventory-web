# 스마트 재고관리 시스템 (Smart Inventory Manager)

Next.js(App Router, TypeScript, Tailwind CSS)와 Supabase DB를 연동하여 구축된 산업공학(IE) 기반 재고관리 웹 애플리케이션입니다. Vercel에 손쉽게 1-클릭 배포할 수 있도록 구성되어 있습니다.

---

## 🌟 주요 기능 및 4대 탭 UI

### 1. 탭 1 [재고 현황 · 발주 알림]
- **실시간 현재 재고 산출**: `기초 재고(init_stock) + 총 입고량(IN) - 총 출고량(OUT)`
- **산업공학(IE) 재주문점(ROP) 자동 계산**:
  $$\text{ROP} = (\text{daily\_usage} \times \text{supplier.lead\_time\_days}) + \text{safety\_stock}$$
- **발주 필요 자동 판정**: 현재 재고 $\le$ ROP 조건 만족 시 **빨간색 펄스 뱃지('발주 필요')**로 시각적 경고
- **검색 및 필터**: 품목명, 품목코드, 규격, 거래처 검색 및 '발주 필요 품목만 보기' 토글 필터
- **핵심 요약 카드 4종**: 전체 관리 품목 수, 발주 필요 품목 수, 총 보유 재고량, 총 재고 평가액(원)
- **발주 요청 원클릭 모달**: 권장 발주량 자동 계산 및 `purchase_order` 테이블 등록

### 2. 탭 2 [입출고 등록]
- **입출고 등록 폼**: 품목 선택(실시간 재고 프리뷰), 입고(IN)/출고(OUT) 구분, 수량, 일자, 메모
- **철저한 유효성 검증**:
  - `수량 <= 0`: 등록 차단 및 경고 알림
  - `출고(OUT) 시 수량 > 현재 재고`: 재고 부족 방지를 위해 **등록 절대 차단 및 경고 배너** 표시
- **최근 입출고 이력**: `stock_tx` 테이블에 기록된 최근 입출고 내역 실시간 테이블 표시 (입고: 파란색, 출고: 주황색)

### 3. 탭 3 [품목 · 거래처 관리]
- **품목(item) 등록 및 목록 조회**: 품목코드, 품목명, 규격, 단위, 거래처 매핑, 기초재고, 안전재고, 일일사용량, 단가 등록
- **거래처(supplier) 등록 및 목록 조회**: 거래처명, 연락처/담당자, 조달 리드타임(일수) 등록 및 관리

### 4. 탭 4 [IE 재고 분석]
- **산업공학 ABC 중점 재고관리 기법**:
  - 품목별 연간 사용금액: $\text{daily\_usage} \times 365 \times \text{unit\_price}$
  - 연간 사용금액 기준 내림차순 정렬 및 파레토(Pareto) 누적 비중 곡선 산출
  - **A등급 (누적 비중 $\le 70\%$)**: 핵심 관리 품목 (일일 실사, 정밀 ROP 관리, 안전재고 최소화)
  - **B등급 (누적 비중 $70\% \sim 90\%$)**: 중점 관리 품목 (정기 발주 점검, 표준 재고 통제)
  - **C등급 (누적 비중 $> 90\%$)**: 일반 관리 품목 (대량 일괄 발주, Two-bin 간이 통제)
- **요약 통계 및 파레토 차트 바**: 등급별 품목 수 비중(%), 금액 점유 비중(%), 연간 총 사용금액 통계 제공

---

## 🗄️ Supabase 데이터베이스 구조

본 애플리케이션은 기존 Supabase 데이터베이스의 4개 테이블을 그대로 사용합니다:

1. `supplier`
   - `supplier_id` (PK)
   - `name` (거래처명)
   - `contact` (연락처)
   - `lead_time_days` (조달 리드타임 일수)
2. `item`
   - `item_id` (PK)
   - `supplier_id` (FK -> supplier)
   - `item_code` (품목 식별 코드)
   - `name` (품목명)
   - `spec` (규격/사양)
   - `unit` (단위: EA, SET, BOX 등)
   - `init_stock` (기초 재고량)
   - `safety_stock` (안전 재고량)
   - `daily_usage` (일일 소요량)
   - `unit_price` (품목 단가)
3. `stock_tx`
   - `tx_id` (PK)
   - `item_id` (FK -> item)
   - `tx_type` ('IN' | 'OUT')
   - `qty` (수량)
   - `tx_date` (거래 일자)
   - `memo` (비고 메모)
4. `purchase_order`
   - `po_id` (PK)
   - `item_id` (FK -> item)
   - `order_qty` (발주 요청 수량)
   - `order_date` (발주 일자)
   - `status` (발주 상태)

> [!TIP]
> **Supabase RLS(행 수준 보안) 설정 팁**:
> Supabase 생성 시 기본적으로 RLS가 켜져 있어 익명(anon) 쓰기가 제한될 수 있습니다. 웹 클라이언트에서 직접 쓰기를 허용하려면 Supabase Dashboard -> **SQL Editor**에서 아래 쿼리를 한 번 실행해 주세요:
> ```sql
> ALTER TABLE supplier DISABLE ROW LEVEL SECURITY;
> ALTER TABLE item DISABLE ROW LEVEL SECURITY;
> ALTER TABLE stock_tx DISABLE ROW LEVEL SECURITY;
> ALTER TABLE purchase_order DISABLE ROW LEVEL SECURITY;
> ```
> *(RLS가 켜져 있더라도 웹 앱 내에서는 로컬 캐싱을 통해 모든 기능과 계산이 중단 없이 정상 작동합니다.)*

---

## 🚀 로컬 실행 방법

```bash
# 1. 의존성 설치
npm install

# 2. 로컬 개발 서버 구동
npm run dev
# 브라우저에서 http://localhost:3000 접속

# 3. 프로덕션 빌드 검증
npm run build
```

---

## 🌐 Vercel 배포 가이드

1. GitHub 레포지토리에 프로젝트를 푸시합니다.
2. [Vercel](https://vercel.com) 대시보드에서 **New Project**를 선택하고 레포지토리를 가져옵니다.
3. **Environment Variables**에 `.env.local`의 환경변수 2개를 입력합니다:
   - `NEXT_PUBLIC_SUPABASE_URL`: `https://eqczepnksmlcwxmdcjdl.supabase.co`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: `sb_publishable_hNISYhZOnYKGyi_6SLnKcQ_dysLrYSl`
4. **Deploy** 버튼을 누르면 수 초 내로 프로덕션 웹 애플리케이션이 전 세계 CDN에 배포됩니다.
