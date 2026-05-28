# sudoku learnings

---
category: task-ordering
applied: not-yet
---
## Foundation 레이어를 수직 슬라이스 예외로 분리하는 것이 맞았다

**상황**: Step 2, Task 1 설계 시 engine+hook을 pure logic layer로 묶어 수직 슬라이스 원칙의 예외로 명시적 처리.
**판단**: plan.md에 "수직 슬라이스 원칙의 실용적 예외"라고 주석을 달고 진행했다. Task 2부터 진짜 수직 슬라이스가 가능했다. 대안(engine + HomeScreen + Board를 Task 1에 몰아넣기)은 L-size task가 되어 plan 규칙 위반이었다.
**다시 마주칠 가능성**: 높음 — 순수 로직 기반(state machine, engine)이 있는 게임/도메인 feature라면 동일 패턴 발생.

---
category: code-review
applied: not-yet
---
## computeStatuses에 solution 파라미터를 넣었다가 제거

**상황**: Step 4 코드 리뷰, Suggestion #7. 초기 설계 시 "solution 기반 검증"을 추가할 수 있다고 보고 파라미터를 미리 넣었으나 실제로 사용하지 않았다.
**판단**: 미사용 파라미터 제거. CLAUDE.md 원칙 "가설적 미래 요구사항을 위한 설계 금지"를 위반한 사례.
**다시 마주칠 가능성**: 중간 — 함수 설계 시 "나중에 쓸 것 같아서" 파라미터를 미리 추가하는 습관.

---
category: code-review
applied: not-yet
---
## 힌트 적용 후 selectedCell을 초기화하지 않으면 hint 스타일이 즉시 보이지 않는다

**상황**: Step 4 코드 리뷰, Important #2. useHint 이후 selectedCell이 hint 셀을 가리키면 isSelected 분기가 hint 색상을 덮어써서 사용자가 다른 셀을 클릭하기 전까지 hint 스타일이 보이지 않는다.
**판단**: useHint 완료 시 selectedCell = null로 초기화. 직관적인 UX 원칙 — 셀의 상태가 바뀌었으면 선택 해제가 자연스럽다.
**다시 마주칠 가능성**: 높음 — "상태 변경 후 선택 해제" 패턴은 다른 interactive 컴포넌트(색상 선택, 버튼 토글 등)에서도 동일하게 적용된다.

---
category: code-review
applied: not-yet
---
## cleared 가드 테스트가 실제로 cleared state를 만들지 않았다

**상황**: Step 4 코드 리뷰, Important #1. 테스트 내부에서 setState를 직접 조작하려다 실패하고 dead code가 남았다.
**판단**: 모든 빈 셀에 정답을 채워 cleared 상태로 진입하는 공개 API 경로를 사용해 수정. Hook의 내부 상태를 직접 건드리는 테스트는 구현에 결합된다 — public API만 사용해야 한다.
**다시 마주칠 가능성**: 높음 — Hook 테스트에서 특정 상태(error, cleared, loading) 도달이 어려울 때 내부 조작을 시도하는 패턴이 반복될 수 있다.

---
category: tooling
applied: not-yet
---
## vitest.config.ts가 e2e/ 디렉토리를 exclude하지 않아 Playwright 테스트 파일이 vitest에 잡혔다

**상황**: Step 3(Task 4) bun run test 실행 시 e2e/smoke.spec.ts가 vitest에서 실패.
**판단**: vitest.config.ts의 exclude에 "e2e/**" 추가. 초기 프로젝트 설정의 누락.
**다시 마주칠 가능성**: 낮음 — 해결됨. 단, 새 프로젝트 setup 시 e2e exclude 확인 체크리스트 항목으로 기억할 것.
