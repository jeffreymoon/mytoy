# 스도쿠 구현 계획

## 아키텍처 결정

| 결정 | 선택 | 이유 |
|---|---|---|
| 퍼즐 고유성 | 미보장 (MVP) | spec 미요구. 힌트가 원본 solution을 참조하므로 고유성 없어도 정답은 유효 |
| 단서 수 허용 범위 | ±2 | spec의 "≈" 표현을 결정론적 테스트를 위해 ±2로 확정 |
| 충돌 판정 타이밍 | 매 입력마다 전체 보드 재계산 | 불변 규칙: 다른 셀 삭제 시 연동 셀 색상도 즉시 갱신 |
| 게임 단계 관리 | 단일 상태 머신 (`useSudokuGame` 훅) | 분산 상태 대신 single guard로 cleared 시 모든 인터랙션 차단 |
| 셀 색상 토큰 | `globals.css` CSS variables (`--cell-valid`, `--cell-conflict`, `--cell-hint`) | shadcn-guard 우선순위 3 (CSS variable 조정), 다크모드 자동 지원 |
| 화면 구조 | `app/page.tsx`를 스도쿠 엔트리로 교체 | "신규 프로젝트" — 기존 ComponentExample은 스도쿠로 대체 |

## 인프라 리소스

None

## 데이터 모델

### Cell
- `value: number | null`
- `status: 'clue' | 'empty' | 'user-valid' | 'user-conflict' | 'hint'`

### GameState
- `phase: 'home' | 'difficulty' | 'playing' | 'cleared'`
- `difficulty: 'easy' | 'normal' | 'hard' | null`
- `board: Cell[][]` (9×9 — status는 매 입력마다 engine이 재계산)
- `solution: number[][]` (9×9 원본 정답)
- `selectedCell: [row, col] | null`

## 필요 스킬

| 스킬 | 적용 Task | 용도 |
|---|---|---|
| shadcn | Task 2, 3 | Button, Card 활용; 레지스트리 사전 확인 |
| vercel-react-best-practices | Task 4 | 키보드 이벤트 리스너 passive 설정 |
| next-best-practices | Task 2 | `"use client"` 디렉티브 판단 |

## 영향 받는 파일

| 파일 경로 | 변경 유형 | 관련 Task |
|---|---|---|
| `types/sudoku.ts` | New | Task 1 |
| `lib/sudoku/engine.ts` | New | Task 1 |
| `lib/sudoku/engine.test.ts` | New | Task 1 |
| `hooks/useSudokuGame.ts` | New | Task 1 |
| `hooks/useSudokuGame.test.ts` | New | Task 1 |
| `app/globals.css` | Modify | Task 2 |
| `app/page.tsx` | Modify | Task 2 |
| `components/sudoku/HomeScreen.tsx` | New | Task 2 |
| `components/sudoku/DifficultyScreen.tsx` | New | Task 2 |
| `components/sudoku/SudokuBoard.tsx` | New | Task 2, 3 |
| `components/sudoku/SudokuCell.tsx` | New | Task 3 |
| `components/sudoku/NumPad.tsx` | New | Task 4 |
| `components/sudoku/GameControls.tsx` | New | Task 5 |
| `components/sudoku/GameClearBanner.tsx` | New | Task 6 |
| `components/sudoku/ThemeToggle.tsx` | New | Task 7 |

---

## Tasks

### ✅ Task 1: 스도쿠 엔진 + 게임 훅 (Foundation)

> **주의**: 이 Task는 순수 로직 레이어다. 사용자가 직접 관찰 가능한 UI slice가 없다 — 수직 슬라이스 원칙의 실용적 예외다. Task 2+의 수직 슬라이스는 이 기반에 의존한다.

- **담당 시나리오**: Scenario 2 (clue count 검증), 불변 규칙 (conflict 재계산)
- **크기**: M (5 파일)
- **의존성**: None
- **참조**:
  - vercel-react-best-practices — js-index-maps (board lookup 최적화)
- **구현 대상**:
  - `types/sudoku.ts`
  - `lib/sudoku/engine.ts`
  - `lib/sudoku/engine.test.ts`
  - `hooks/useSudokuGame.ts`
  - `hooks/useSudokuGame.test.ts`
- **구현 내용**:
  - `engine.ts`: `generateBoard()` (백트래킹), `maskByDifficulty(board, difficulty)` → clue Cell[][] 반환, `computeStatuses(board, solution)` → 전체 보드 status 재계산 (불변 규칙 핵심), `isBoardCleared(board)` → 빨강 없이 모두 채워졌는지
  - `useSudokuGame.ts`: 상태 머신 훅 — `phase`, `startGame()`, `selectDifficulty(d)`, `selectCell(r,c)`, `inputNumber(n)`, `eraseCell()`, `useHint()`, `newGame()`. `inputNumber`/`eraseCell`마다 `computeStatuses` 호출
  - `types/sudoku.ts`: Cell, GameState, Difficulty, GamePhase 타입
- **수용 기준**:
  - [ ] `generateBoard()`가 반환하는 9×9 배열은 모든 행·열·3×3 박스에 1~9가 중복 없이 존재한다
  - [ ] `maskByDifficulty(board, 'easy')` → 단서 셀 수 38~42개 (≈40 ±2)
  - [ ] `maskByDifficulty(board, 'normal')` → 단서 셀 수 30~34개 (≈32 ±2)
  - [ ] `maskByDifficulty(board, 'hard')` → 단서 셀 수 22~26개 (≈24 ±2)
  - [ ] `computeStatuses` — 두 빈 셀에 같은 숫자 입력 → 둘 다 `user-conflict`; 하나 지우면 → 나머지 `user-valid`로 재계산 (불변 규칙)
  - [ ] `isBoardCleared` — 전체 값 있음 + conflict 없음 → true; 빨강 셀 존재 시 → false
  - [ ] `useSudokuGame`: `selectCell`로 clue 셀 선택 시도 → selectedCell 변화 없음
  - [ ] `useSudokuGame`: cleared 상태에서 `inputNumber` / `eraseCell` / `useHint` 호출 → 상태 변화 없음 (단일 guard)
- **검증**: `bun run test -- engine` + `bun run test -- useSudokuGame`

---

### ✅ Task 2: 홈 → 난이도 선택 → 퍼즐 화면 진입 (Scenarios 1, 2)

- **담당 시나리오**: Scenario 1 (full), Scenario 2 (full)
- **크기**: M (5 파일 + globals.css)
- **의존성**: Task 1 (useSudokuGame, engine)
- **참조**:
  - shadcn — Button, Card 확인 (`npx shadcn@latest search`로 사전 확인), next-best-practices — `"use client"` 디렉티브
- **구현 대상**:
  - `app/globals.css` (Modify — `--cell-valid`, `--cell-conflict`, `--cell-hint` CSS vars 추가, dark: 대응)
  - `components/sudoku/HomeScreen.tsx`
  - `components/sudoku/DifficultyScreen.tsx`
  - `components/sudoku/SudokuBoard.tsx` (기본 렌더링 — clue/empty 셀 시각 구분, 상호작용 없음)
  - `app/page.tsx` (Modify — SudokuGame 조합 컴포넌트로 교체)
- **구현 내용**:
  - `HomeScreen`: "스도쿠" 타이틀 + "게임 시작" 버튼
  - `DifficultyScreen`: Easy / Normal / Hard 카드 3개 (shadcn Card + Button 활용), 현재 난이도 배지 (`app bar` — wireframe Screen 2의 pill 배지)
  - `SudokuBoard`: 9×9 그리드 렌더링, clue 셀 굵음+회색 배경, empty 셀 일반 스타일; 보드 하단 범례 행 (단서·유효·충돌·힌트 시각 표현 설명 — wireframe Screen 2 하단)
  - `globals.css`: `--cell-valid: #3b82f6`, `--cell-conflict: #ef4444`, `--cell-hint` (파랑+밑줄, wireframe 기준) 정의 + `.dark` 오버라이드
- **수용 기준**:
  - [ ] "게임 시작" 클릭 → Easy / Normal / Hard 선택지가 표시된다
  - [ ] Easy 선택 → 단서 셀이 38~42개 표시된다
  - [ ] Normal 선택 → 단서 셀이 30~34개 표시된다
  - [ ] Hard 선택 → 단서 셀이 22~26개 표시된다
  - [ ] 단서 셀은 일반 입력 셀과 시각적으로 구별된다 (굵음 + 배경색)
  - [ ] 게임 진행 화면 하단에 단서·유효입력·충돌입력·힌트 범례가 표시된다
- **검증**:
  - `bun run build`
  - Browser MCP — 홈 화면 로드 → "게임 시작" 클릭 → 난이도 화면 확인 → Easy 클릭 → 보드 렌더 + 단서 셀 수 카운트. 증거 `artifacts/sudoku/evidence/task-2.png`

---

### Checkpoint: Tasks 1-2 이후
- [ ] 모든 테스트 통과: `bun run test`
- [ ] 빌드 성공: `bun run build`
- [ ] 홈 → 난이도 선택 → 9×9 퍼즐 렌더링까지 end-to-end 동작 (Browser MCP)

---

### ✅ Task 3: 셀 선택 (Scenario 3)

- **담당 시나리오**: Scenario 3 (full)
- **크기**: S (2 파일)
- **의존성**: Task 2 (SudokuBoard)
- **참조**:
  - vercel-react-best-practices — rendering-conditional-render
- **구현 대상**:
  - `components/sudoku/SudokuCell.tsx` (New — SudokuBoard에서 셀 로직 추출, 선택 상태 추가)
  - `components/sudoku/SudokuBoard.tsx` (Modify — SudokuCell 사용)
- **구현 내용**:
  - `SudokuCell`: selected 상태 하이라이트, clue 셀은 onClick 무시
  - `SudokuBoard`: `useSudokuGame`의 `selectCell` 연결
- **수용 기준**:
  - [ ] 빈 셀 클릭 → 해당 셀이 선택 표시(하이라이트)된다
  - [ ] 단서 셀 클릭 → 선택되지 않고 아무 변화 없다
  - [ ] 이미 선택된 셀 외 다른 빈 셀 클릭 → 선택이 새 셀로 이동한다
- **검증**:
  - `bun run test -- SudokuCell`
  - Browser MCP — 셀 클릭 → 하이라이트 확인, 단서 셀 클릭 → 변화 없음 확인. 증거 `artifacts/sudoku/evidence/task-3.png`

---

### ✅ Task 4: 숫자 입력 + 색상 피드백 + 불변 규칙 (Scenarios 4, 5)

- **담당 시나리오**: Scenario 4 (full), Scenario 5 (full)
- **크기**: M (2 파일 + hook 수정)
- **의존성**: Task 3 (SudokuCell, selectCell)
- **참조**:
  - vercel-react-best-practices — client-passive-event-listeners (keydown 핸들러)
  - shadcn — Button (`data-icon` 없이 숫자만)
- **구현 대상**:
  - `components/sudoku/NumPad.tsx` (New — 1~9 버튼 그리드)
  - `hooks/useSudokuGame.ts` (Modify — `inputNumber` 구현, `computeStatuses` 연결)
- **구현 내용**:
  - `NumPad`: 9개 Button, 클릭 시 `inputNumber(n)` 호출
  - 키보드 핸들러: `SudokuBoard` 또는 최상위 컴포넌트에서 `1~9` keydown → `inputNumber`
  - `inputNumber`: selected 셀에 값 설정 → `computeStatuses` 전체 보드 재계산 → board 업데이트
- **수용 기준**:
  - [ ] 빈 셀에 중복 없는 숫자 입력 → 해당 셀에 파란색 숫자가 표시된다
  - [ ] 화면 버튼 클릭으로 입력해도 동일하게 파란색으로 표시된다
  - [ ] 파란색 숫자가 있는 셀에 중복 없는 다른 숫자 입력 → 새 숫자로 파란색 교체된다
  - [ ] 빨간색 숫자가 있는 셀에 중복 없는 숫자 입력 → 새 숫자로 파란색 교체된다
  - [ ] 같은 행에 중복된 숫자 입력 → 빨간색으로 표시된다
  - [ ] 같은 열에 중복된 숫자 입력 → 빨간색으로 표시된다
  - [ ] 같은 3×3 박스에 중복된 숫자 입력 → 빨간색으로 표시된다
  - [ ] 파란색 숫자가 있는 셀에 중복된 숫자 입력 → 새 숫자로 빨간색 교체된다
  - [ ] **불변 규칙**: 두 셀에 같은 숫자 입력 → 둘 다 빨강. 하나 삭제 → 나머지 파랑으로 즉시 전환된다
- **검증**:
  - `bun run test -- useSudokuGame` (불변 규칙 포함)
  - Browser MCP — 파랑/빨강 색상 확인 + 불변 규칙 재계산 확인. 증거 `artifacts/sudoku/evidence/task-4.png`

---

### Checkpoint: Tasks 3-4 이후
- [ ] 모든 테스트 통과: `bun run test`
- [ ] 빌드 성공: `bun run build`
- [ ] 셀 선택 + 숫자 입력(키보드·화면 버튼) + 파랑/빨강 피드백 + 불변 규칙 end-to-end 동작

---

### ✅ Task 5: 지우기 + 힌트 (Scenarios 6, 7)

- **담당 시나리오**: Scenario 6 (full), Scenario 7 (full)
- **크기**: M (2 파일 + hook 수정)
- **의존성**: Task 4 (inputNumber, board)
- **참조**:
  - shadcn — Button, icons.md (lucide `Eraser`, `Lightbulb` — `data-icon` 사용)
- **구현 대상**:
  - `components/sudoku/GameControls.tsx` (New — 지우기 + 힌트 버튼)
  - `hooks/useSudokuGame.ts` (Modify — `eraseCell`, `useHint` 구현)
- **구현 내용**:
  - `GameControls`: `지우기` (Eraser 아이콘), `힌트` (Lightbulb 아이콘) 버튼
  - Backspace/Delete keydown → `eraseCell()` (키보드 핸들러 확장)
  - `eraseCell`: clue/hint 셀은 무시, 그 외 → value=null, status='empty', computeStatuses 재계산
  - `useHint`: 빈/빨강 셀에만 적용, `status='hint'` + `value=solution[r][c]` 설정, 이후 `inputNumber`/`eraseCell`에서 `hint` 셀은 guard로 차단
- **수용 기준**:
  - [ ] 파란색 숫자가 있는 셀에서 Backspace → 셀이 비워진다
  - [ ] 빨간색 숫자가 있는 셀에서 Delete → 셀이 비워진다
  - [ ] 단서 셀에서 지우기 시도 → 변화 없다
  - [ ] 빈 셀 선택 후 힌트 클릭 → 해당 셀에 파란색 정답 숫자가 채워진다
  - [ ] 빨간색 숫자가 있는 셀 선택 후 힌트 클릭 → 정답 숫자로 덮어쓰여지고 파란색이 된다
  - [ ] 파란색 숫자가 있는 셀 선택 후 힌트 클릭 → 변화 없다
  - [ ] 힌트로 채워진 셀 클릭 후 숫자 입력 시도 → 변화 없다
  - [ ] 힌트로 채워진 셀 클릭 후 지우기 시도 → 변화 없다
  - [ ] 셀이 선택되지 않은 상태에서 힌트 클릭 → 아무 일도 일어나지 않는다
- **검증**:
  - `bun run test -- useSudokuGame`
  - Browser MCP — 힌트 클릭 → 밑줄 파랑 확인, 이후 입력/지우기 무반응 확인. 증거 `artifacts/sudoku/evidence/task-5.png`

---

### ✅ Task 6: 게임 클리어 + 새 게임 (Scenarios 8, 9)

- **담당 시나리오**: Scenario 8 (full), Scenario 9 (full)
- **크기**: M (3 파일)
- **의존성**: Task 5 (eraseCell, useHint, hook guard)
- **참조**:
  - shadcn — Button (새 게임), icons.md (lucide `CircleCheck`)
- **구현 대상**:
  - `components/sudoku/GameClearBanner.tsx` (New — 클리어 배너 + 새 게임 버튼)
  - `hooks/useSudokuGame.ts` (Modify — `inputNumber` 후 `isBoardCleared` 체크 → phase='cleared')
  - `app/page.tsx` (Modify — cleared phase 시 GameClearBanner 렌더)
- **구현 내용**:
  - `GameClearBanner`: CircleCheck 아이콘 + "게임 클리어!" + "새 게임" 버튼 (→ `newGame()`)
  - `newGame()`: phase='difficulty'로 재설정, board/solution/selectedCell 초기화
  - cleared 상태 guard는 Task 1에서 이미 `inputNumber`/`eraseCell`/`useHint`에 적용됨
- **수용 기준**:
  - [ ] 모든 셀 채움 + 규칙 위반 없음 → "게임 클리어" 메시지가 표시된다
  - [ ] "게임 클리어" 상태에서 "새 게임" 버튼이 보인다
  - [ ] 빨간색 셀이 남아 있는 상태에서 나머지 셀을 모두 채워도 → 클리어 메시지가 표시되지 않는다
  - [ ] 클리어 후 셀 클릭 → 선택되지 않는다
  - [ ] 클리어 후 숫자 키 입력 → 보드에 변화 없다
  - [ ] "새 게임" 클릭 → Easy / Normal / Hard 선택 화면이 표시된다
  - [ ] 난이도 선택 후 → 이전 게임의 입력이 없는 새 퍼즐이 표시된다
  - [ ] "게임 클리어" 메시지가 사라진다
- **검증**:
  - `bun run test -- useSudokuGame` (cleared 상태 guard 포함)
  - Browser MCP — 보드 완성 → 클리어 배너 확인 → 새 게임 → 난이도 화면. 증거 `artifacts/sudoku/evidence/task-6.png`

---

### ✅ Task 7: 다크모드 토글 (Scenario 10)

- **담당 시나리오**: Scenario 10 (full)
- **크기**: S (1 파일)
- **의존성**: 없음 (ThemeProvider는 기존 `app/layout.tsx`에 이미 존재 — 신규 의존 불필요)
- **참조**:
  - shadcn — Button, icons.md (lucide `Moon`, `Sun`)
  - next-best-practices — `"use client"` 디렉티브 (useTheme 사용)
- **구현 대상**:
  - `components/sudoku/ThemeToggle.tsx` (New — Moon/Sun 아이콘 토글 버튼)
- **구현 내용**:
  - `useTheme`에서 `theme` + `setTheme` 사용 (next-themes)
  - `attribute="class"` 방식이므로 `dark` 클래스가 `<html>`에 토글됨
  - `globals.css`의 `.dark` 블록에서 `--cell-valid` 등 이미 정의됨 (Task 2)
- **수용 기준**:
  - [ ] 라이트 모드에서 토글 클릭 → 배경이 어두운 색으로 전환된다
  - [ ] 다크 모드에서 토글 클릭 → 배경이 밝은 색으로 전환된다
- **검증**:
  - Browser MCP — 토글 클릭 → 배경색 전환 확인 (라이트→다크→라이트). 증거 `artifacts/sudoku/evidence/task-7.png`

---

### Checkpoint: Tasks 5-7 이후 (Final)
- [ ] 모든 테스트 통과: `bun run test`
- [ ] 빌드 성공: `bun run build`
- [ ] 전체 게임 플로우 end-to-end: 홈 → 난이도 → 퍼즐 → 입력(파랑/빨강) → 지우기 → 힌트 → 클리어 → 새 게임 → 다크모드 전환

---

## 미결정 항목

없음
