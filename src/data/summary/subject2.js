export default {
  no: 2,
  title: '소프트웨어 개발',
  topics: [
    {
      id: 'tree-traversal',
      title: '트리 순회',
      tag: '계산',
      blocks: [
        {
          type: 'table',
          headers: ['순회', '순서', '방문 순서(루트 기준)'],
          rows: [
            ['전위(Preorder)', '루트 → 왼쪽 → 오른쪽', 'Root-Left-Right'],
            ['중위(Inorder)', '왼쪽 → 루트 → 오른쪽', 'Left-Root-Right'],
            ['후위(Postorder)', '왼쪽 → 오른쪽 → 루트', 'Left-Right-Root'],
          ],
        },
        {
          type: 'text',
          value: '손으로 풀 때는 서브트리를 통째로 괄호로 묶고, 그 괄호 안에서 같은 규칙을 재귀적으로 적용하면 실수가 줄어든다.',
        },
        {
          type: 'tree',
          caption: '예제 트리',
          root: { v: 'A', l: { v: 'B', l: { v: 'D' }, r: { v: 'E' } }, r: { v: 'C' } },
        },
        {
          type: 'list',
          items: [
            '**전위**: A B D E C',
            '**중위**: D B E A C',
            '**후위**: D E B C A',
          ],
        },
        {
          type: 'tree',
          caption: '수식트리 (A+B)*C',
          root: { v: '*', l: { v: '+', l: { v: 'A' }, r: { v: 'B' } }, r: { v: 'C' } },
        },
        {
          type: 'list',
          items: [
            '전위(Prefix) 표기 = 전위 순회 결과 → * + A B C',
            '중위(Infix) 표기 = 중위 순회 결과 → A + B * C',
            '후위(Postfix) 표기 = 후위 순회 결과 → A B + C *',
          ],
        },
        {
          type: 'tip',
          value: '전위 표기(Prefix)는 연산자가 **맨 앞**, 후위 표기(Postfix)는 연산자가 **맨 뒤**로 이동한다고 기억하면 빠르다.',
        },
      ],
    },
    {
      id: 'sorting',
      title: '정렬 알고리즘',
      tag: '빈출',
      blocks: [
        {
          type: 'table',
          headers: ['알고리즘', '평균', '최악'],
          rows: [
            ['버블 정렬', 'O(n²)', 'O(n²)'],
            ['선택 정렬', 'O(n²)', 'O(n²)'],
            ['삽입 정렬', 'O(n²)', 'O(n²)'],
            ['퀵 정렬', 'O(n log n)', 'O(n²)'],
            ['힙 정렬', 'O(n log n)', 'O(n log n)'],
            ['병합 정렬', 'O(n log n)', 'O(n log n)'],
            ['쉘 정렬', 'O(n^1.5) 근사', 'O(n²)'],
          ],
        },
        {
          type: 'list',
          items: [
            '버블: 인접한 두 값을 비교해 교환을 반복',
            '선택: 최솟값을 찾아 맨 앞과 교환',
            '삽입: 정렬된 부분에 다음 값을 적절한 위치에 삽입',
            '퀵: 피벗을 기준으로 분할 후 재귀 정렬',
            '힙: 힙 자료구조를 이용해 최댓값/최솟값을 반복 추출',
            '병합: 반으로 분할 후 정렬된 두 부분을 병합',
            '쉘: 일정 간격(gap)으로 그룹을 나눠 삽입 정렬 반복',
          ],
        },
        {
          type: 'cells',
          caption: '버블 정렬 1회전 (오름차순)',
          rows: [
            { label: '초기', values: ['5', '3', '8', '1', '9', '2'] },
            { label: '5·3 교환', values: ['3', '5', '8', '1', '9', '2'], mark: [0, 1] },
            { label: '8·1 교환', values: ['3', '5', '1', '8', '9', '2'], mark: [2, 3] },
            { label: '9·2 교환', values: ['3', '5', '1', '8', '2', '9'], mark: [4, 5] },
            { label: '1회전 결과', values: ['3', '5', '1', '8', '2', '9'], mark: [5] },
          ],
        },
        {
          type: 'cells',
          caption: '선택 정렬 1회전 (오름차순)',
          rows: [
            { label: '초기', values: ['5', '3', '8', '1', '9', '2'] },
            { label: '결과', values: ['1', '3', '8', '5', '9', '2'], mark: [0] },
          ],
        },
        {
          type: 'cells',
          caption: '삽입 정렬 1회전 (오름차순)',
          rows: [
            { label: '초기', values: ['5', '3', '8', '1', '9', '2'] },
            { label: '결과', values: ['3', '5', '8', '1', '9', '2'], mark: [0, 1] },
          ],
        },
        {
          type: 'tip',
          value: '선택 정렬 1회전: 남은 구간에서 최솟값을 찾아 맨 앞과 교환한다. 버블 정렬 1회전: 첫 원소부터 인접 비교/교환하며 끝까지 진행하면 최댓값이 맨 뒤로 이동한다.',
        },
      ],
    },
    {
      id: 'search-hashing',
      title: '검색 & 해싱',
      blocks: [
        {
          type: 'text',
          value: '이진 탐색(Binary Search)은 **정렬된 배열**에서만 가능하며 시간복잡도는 O(log n)이다.',
        },
        {
          type: 'list',
          items: [
            '제산법(Division): 키를 테이블 크기로 나눈 나머지 사용',
            '제곱법(Mid-Square): 키를 제곱한 값의 중간 부분 사용',
            '폴딩법(Folding): 키를 여러 부분으로 나누어 합산',
            '기수변환법(Radix): 진법을 변환하여 주소 산출',
          ],
        },
        {
          type: 'table',
          headers: ['오버플로우 해결법', '설명'],
          rows: [
            ['개방주소법(Open Addressing)', '충돌 시 다른 빈 버킷을 찾아 저장 (선형조사, 이차조사, 이중해싱)'],
            ['체이닝(Chaining)', '동일 버킷에 연결 리스트로 연결하여 저장'],
          ],
        },
        {
          type: 'list',
          items: [
            '버킷(Bucket): 하나의 주소가 가리키는 저장 공간(여러 슬롯 포함 가능)',
            '슬롯(Slot): 버킷 내 하나의 레코드 저장 단위',
            '시노님(Synonym): 서로 다른 키가 같은 해시 주소로 충돌한 상태',
            '충돌(Collision): 서로 다른 키의 해시값이 같은 경우',
          ],
        },
      ],
    },
    {
      id: 'data-structure',
      title: '자료구조',
      blocks: [
        {
          type: 'table',
          headers: ['분류', '종류'],
          rows: [
            ['선형 구조', '리스트, 스택, 큐, 데크'],
            ['비선형 구조', '트리, 그래프'],
          ],
        },
        {
          type: 'table',
          headers: ['구조', '특징'],
          rows: [
            ['스택(Stack)', '**후입선출(LIFO)**, 삽입/삭제가 한쪽 끝(top)에서만 발생'],
            ['큐(Queue)', '**선입선출(FIFO)**, 삽입은 rear, 삭제는 front'],
            ['데크(Deque)', '양쪽 끝에서 모두 삽입/삭제 가능'],
          ],
        },
        {
          type: 'cells',
          caption: '스택(Stack) — 후입선출(LIFO)',
          vertical: true,
          rows: [
            { label: '', values: ['A', 'B', 'C'] },
          ],
          pointers: [{ index: 2, label: 'top' }],
        },
        {
          type: 'text',
          value: 'push 는 top 위로 쌓고, pop 은 top 에서부터 꺼낸다 — 나중에 넣은 값(C)이 가장 먼저 나간다.',
        },
        {
          type: 'cells',
          caption: '큐(Queue) — 선입선출(FIFO)',
          rows: [
            { label: '', values: ['A', 'B', 'C', 'D'] },
          ],
          pointers: [{ index: 0, label: 'front' }, { index: 3, label: 'rear' }],
        },
        {
          type: 'text',
          value: '**스택의 주요 응용**',
        },
        {
          type: 'list',
          items: ['함수 호출(콜스택)', '후위 표기식 계산', '괄호 짝 검사', '재귀 호출 처리', '수식의 괄호 제거(중위→후위 변환)'],
        },
        {
          type: 'table',
          headers: ['그래프 종류', '최대 간선 수(정점 n개)'],
          rows: [
            ['무방향 그래프', 'n(n-1)/2'],
            ['방향 그래프', 'n(n-1)'],
          ],
        },
        {
          type: 'graph',
          caption: '무방향 그래프 (정점 4개, 최대 간선 수 = 4×3/2 = 6)',
          directed: false,
          nodes: [
            { id: 'A', x: 0, y: 0 },
            { id: 'B', x: 2, y: 0 },
            { id: 'C', x: 0, y: 1 },
            { id: 'D', x: 2, y: 1 },
          ],
          edges: [['A', 'B'], ['A', 'C'], ['B', 'D'], ['C', 'D'], ['A', 'D']],
        },
        {
          type: 'list',
          items: [
            '중위→후위 변환 절차: ① 연산자 우선순위 스택 이용 ② 피연산자는 즉시 출력 ③ 스택 top보다 우선순위 낮은/같은 연산자는 pop 후 push ④ 여는 괄호는 push, 닫는 괄호는 여는 괄호까지 pop',
            '예제: A+B*C → 후위 표기: A B C * +',
          ],
        },
      ],
    },
    {
      id: 'test-technique',
      title: '테스트 기법',
      tag: '빈출',
      blocks: [
        {
          type: 'table',
          headers: ['화이트박스 테스트', '설명'],
          rows: [
            ['기초 경로 검사', '독립적인 실행 경로를 모두 테스트'],
            ['조건 검사', '논리적 조건식의 참/거짓을 모두 테스트'],
            ['결정(분기) 검사', '분기(if 등)의 모든 실행 경로를 테스트'],
            ['루프 검사', '반복문의 경계(0회, 1회, 최대회 등)를 테스트'],
          ],
        },
        {
          type: 'table',
          headers: ['블랙박스 테스트', '설명'],
          rows: [
            ['동등 분할(Equivalence Partitioning)', '입력 값을 유효/무효 클래스로 나누어 대표값 테스트'],
            ['경계값 분석(Boundary Value Analysis)', '입력 범위의 경계값을 테스트'],
            ['원인-결과 그래프', '입력 조건과 결과의 인과관계를 그래프로 표현'],
            ['오류 예측(Error Guessing)', '경험을 바탕으로 오류 발생 가능 부분을 예측'],
            ['비교 테스트(Comparison Testing)', '여러 버전에 동일 입력을 넣어 결과 비교'],
          ],
        },
        {
          type: 'tip',
          value: '순환복잡도(McCabe) 계산식: **V(G) = E - N + 2** (E: 화살표 수, N: 노드 수). 판단 노드(조건문) 수 + 1로도 계산 가능하다.',
        },
      ],
    },
    {
      id: 'test-stage',
      title: '테스트 단계 & 통합',
      blocks: [
        {
          type: 'order',
          label: '테스트 단계',
          items: ['단위 테스트', '통합 테스트', '시스템 테스트', '인수 테스트'],
        },
        {
          type: 'table',
          headers: ['단계', '목적'],
          rows: [
            ['단위 테스트', '개별 모듈/함수 단위의 기능 검증'],
            ['통합 테스트', '모듈 간 인터페이스와 상호작용 검증'],
            ['시스템 테스트', '전체 시스템이 요구사항을 만족하는지 검증'],
            ['인수 테스트', '사용자 관점에서 실제 사용 여부를 검증'],
          ],
        },
        {
          type: 'table',
          headers: ['통합 방식', '필요 도구', '특징'],
          rows: [
            ['하향식(Top-Down)', '테스트 스텁(Stub)', '상위 모듈부터 통합, 하위 모듈은 스텁으로 대체'],
            ['상향식(Bottom-Up)', '테스트 드라이버(Driver)', '하위 모듈부터 통합, 상위 모듈은 드라이버로 대체'],
          ],
        },
        {
          type: 'list',
          items: [
            '알파 테스트: 개발자 환경(사내)에서 사용자가 참관하여 테스트',
            '베타 테스트: 실제 사용자가 실 환경에서 직접 테스트',
            '회귀 테스트(Regression Test): 변경/수정 후 기존 기능에 영향이 없는지 재검증',
          ],
        },
      ],
    },
    {
      id: 'configuration-management',
      title: '형상관리',
      blocks: [
        {
          type: 'order',
          label: '형상관리 절차',
          items: ['형상 식별', '형상 통제', '형상 감사', '형상 기록(상태 보고)'],
        },
        {
          type: 'table',
          headers: ['도구', '특징'],
          rows: [
            ['CVS', '중앙집중형, 파일 단위 버전관리, 가장 오래된 방식'],
            ['SVN(Subversion)', '중앙집중형, 디렉토리 구조까지 버전관리'],
            ['Git', '분산형, 로컬에서도 커밋 가능, 브랜치 관리에 강함'],
          ],
        },
        {
          type: 'list',
          items: [
            '체크아웃(Checkout): 저장소에서 소스를 작업 공간으로 가져옴',
            '체크인(Checkin): 수정한 소스를 저장소에 반영',
            '커밋(Commit): 변경 사항을 저장소에 기록',
            '롤백(Rollback): 이전 버전으로 되돌림',
          ],
        },
      ],
    },
    {
      id: 'algorithm-complexity',
      title: '알고리즘 복잡도',
      tag: '계산',
      blocks: [
        {
          type: 'table',
          headers: ['빅오 표기', '이름', '예시'],
          rows: [
            ['O(1)', '상수 시간', '배열 인덱스 접근'],
            ['O(log n)', '로그 시간', '이진 탐색'],
            ['O(n)', '선형 시간', '단순 순차 탐색'],
            ['O(n log n)', '로그 선형 시간', '퀵/힙/병합 정렬'],
            ['O(n²)', '제곱 시간', '버블/선택/삽입 정렬'],
            ['O(2ⁿ)', '지수 시간', '피보나치 완전 재귀'],
          ],
        },
        {
          type: 'order',
          label: '시간복잡도 증가 순서 (빠름 → 느림)',
          items: ['O(1)', 'O(log n)', 'O(n)', 'O(n log n)', 'O(n²)', 'O(2ⁿ)'],
        },
      ],
    },
    {
      id: 'packaging-drm-cleancode',
      title: '패키징 · DRM · 클린코드',
      blocks: [
        {
          type: 'list',
          items: [
            '패키징 대상 파악 → 배포 단위(모듈)로 구성 → 빌드 진행 → 사용자 환경 고려한 매뉴얼 작성 → 배포',
          ],
        },
        {
          type: 'table',
          headers: ['DRM 구성요소', '역할'],
          rows: [
            ['콘텐츠 제공자(Content Provider)', '콘텐츠를 제공하는 저작권자'],
            ['클리어링 하우스(Clearing House)', '키 관리 및 라이선스 발급, 사용료 정산'],
            ['패키저(Packager)', '콘텐츠를 암호화하여 패키징'],
            ['DRM 컨트롤러', '배포된 콘텐츠의 이용 권한 통제'],
            ['보안 컨테이너(Security Container)', '원본을 안전하게 유통하기 위한 배포 단위'],
          ],
        },
        {
          type: 'list',
          items: [
            '그대로 실행 가능한(Executable) 코드처럼 명확하게 작성',
            '중복을 최소화(DRY)',
            '함수/클래스는 작고 하나의 책임만 갖도록 작성',
            '읽는 사람이 이해하기 쉽게 명명(Naming)',
          ],
        },
        {
          type: 'text',
          value: '리팩토링(Refactoring)의 목적은 **외부 동작은 그대로 유지**하면서 내부 구조를 개선해 유지보수성을 높이는 것이다.',
        },
        {
          type: 'list',
          items: [
            'ISO/IEC 25010 품질 특성: 기능 적합성, 성능 효율성, 호환성, 사용성, 신뢰성, 보안성, 유지보수성, 이식성',
          ],
        },
      ],
    },
  ],
}
