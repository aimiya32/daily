export default {
  no: 6,
  tabTop: '암기',
  title: '두문자 모음',
  topics: [
    {
      id: 'must-know',
      title: '제일 많이 나오는 것부터',
      tag: '빈출',
      blocks: [
        {
          type: 'table',
          headers: ['두문자', '풀이', '대상'],
          rows: [
            ['"우논시절교순기"', '우연-논리-시간-절차-교환(=통신)-순차-기능 (교환적은 통신적이라고도 하므로 "우논시절통순기"로도 외운다)', '응집도 (약 → 강)'],
            ['"자스제외공내"', '자료-스탬프-제어-외부-공통-내용', '결합도 (약 → 강)'],
            ['"내공외제스자"', '내용-공통-외부-제어-스탬프-자료', '결합도 (강 → 약, 위 순서를 거꾸로 읽은 것)'],
            ['"도부이결다조"', '도메인원자값-부분함수종속제거-이행함수종속제거-결정자-다치종속-조인종속', '정규화 단계 (1NF → 5NF)'],
            ['"아파서티내다물"', '아(Application·응용)-파(Presentation·표현)-서(Session·세션)-티(Transport·전송)-내(Network·네트워크)-다(Data Link·데이터링크)-물(Physical·물리)', 'OSI 7계층 (7 → 1)'],
            ['ACID', '원자성(Atomicity)-일관성(Consistency)-고립성(Isolation)-지속성(Durability)', '트랜잭션의 4대 특성'],
            ['CIA', '기밀성(Confidentiality)-무결성(Integrity)-가용성(Availability)', '정보보안 3요소'],
            ['V(G) = E - N + 2', '화살표(Edge) 수 - 노드(Node) 수 + 2', '순환복잡도(맥케이브) 계산 공식'],
          ],
        },
        {
          type: 'order',
          label: '응집도(Cohesion) 약함 → 강함',
          items: ['우연적', '논리적', '시간적', '절차적', '교환적(통신적)', '순차적', '기능적'],
        },
        {
          type: 'order',
          label: '결합도(Coupling) 약함 → 강함',
          items: ['자료', '스탬프', '제어', '외부', '공통', '내용'],
        },
        {
          type: 'order',
          label: 'OSI 7계층 순서 (하위 → 상위)',
          items: ['물리', '데이터링크', '네트워크', '전송', '세션', '표현', '응용'],
        },
        {
          type: 'tip',
          value: '좋은 설계는 응집도는 **높게**, 결합도는 **낮게**. "자스제외공내"(약→강)와 "내공외제스자"(강→약)는 같은 순서를 양쪽에서 읽은 것뿐이다.',
        },
      ],
    },
    {
      id: 'subject1-mnemonic',
      title: '1과목 · 소프트웨어 설계',
      tag: '암기',
      blocks: [
        {
          type: 'table',
          headers: ['두문자', '풀이', '대상'],
          rows: [
            ['"우논시절교순기"', '우연-논리-시간-절차-교환(통신)-순차-기능', '응집도 (약 → 강)'],
            ['"자스제외공내"', '자료-스탬프-제어-외부-공통-내용', '결합도 (약 → 강)'],
            ['"내공외제스자"', '내용-공통-외부-제어-스탬프-자료', '결합도 (강 → 약)'],
            ['SOLID', 'S(Single Responsibility·단일책임)-O(Open-Closed·개방폐쇄)-L(Liskov Substitution·리스코프치환)-I(Interface Segregation·인터페이스분리)-D(Dependency Inversion·의존관계역전)', '객체지향 설계 5원칙'],
            ['"연집포일의"', '연관-집합-포함-일반화-의존', 'UML 클래스 관계 5종'],
            ['"프흐저단"', '프로세스(원)-자료흐름(화살표)-자료저장소(두 줄)-단말(사각형)', 'DFD 구성요소 4가지'],
          ],
        },
        {
          type: 'order',
          label: '요구공학 프로세스',
          items: ['도출(Elicitation)', '분석(Analysis)', '명세(Specification)', '확인(Validation)'],
        },
        {
          type: 'tip',
          value: '교환적(Exchange) 응집도는 **통신적(Communication)** 응집도라고도 불러 "우논시절통순기"로도 외운다 — "우논시절교순기"와 완전히 같은 순서다.',
        },
        {
          type: 'tip',
          value: '집합(Aggregation)은 **빈 마름모**, 포함(Composition)은 **채운 마름모**. 포함 관계는 전체가 사라지면 부분도 함께 사라진다.',
        },
      ],
    },
    {
      id: 'subject2-mnemonic',
      title: '2과목 · 소프트웨어 개발',
      tag: '암기',
      blocks: [
        {
          type: 'table',
          headers: ['두문자', '풀이', '대상'],
          rows: [
            ['NLR / LNR / LRN', 'Node-Left-Right(전위) / Left-Node-Right(중위) / Left-Right-Node(후위)', '트리 순회 3종'],
            ['"단통시인"', '단위-통합-시스템-인수', '테스트 단계 순서'],
            ['"식통감기"', '형상식별-형상통제-형상감사-형상기록(상태보고)', '형상관리 절차'],
            ['"버선삽"', '버블-선택-삽입', 'O(n²) 단순 정렬 3종'],
            ['"퀵힙합"', '퀵정렬-힙정렬-병합정렬', 'O(n log n) 정렬 3종'],
          ],
        },
        {
          type: 'order',
          label: '테스트 단계',
          items: ['단위 테스트', '통합 테스트', '시스템 테스트', '인수 테스트'],
        },
        {
          type: 'order',
          label: '형상관리 절차',
          items: ['형상 식별', '형상 통제', '형상 감사', '형상 기록(상태 보고)'],
        },
        {
          type: 'order',
          label: '시간복잡도 증가 순서 (빠름 → 느림)',
          items: ['O(1)', 'O(log n)', 'O(n)', 'O(n log n)', 'O(n²)', 'O(2ⁿ)'],
        },
        {
          type: 'tip',
          value: '순환복잡도(McCabe) 계산식: **V(G) = E - N + 2** (E: 화살표 수, N: 노드 수). 판단 노드(조건문) 수 + 1로도 계산 가능하다.',
        },
        {
          type: 'tip',
          value: '전위 표기(Prefix)는 연산자가 **맨 앞**, 후위 표기(Postfix)는 연산자가 **맨 뒤**로 이동한다고 기억하면 빠르다.',
        },
      ],
    },
    {
      id: 'subject3-mnemonic',
      title: '3과목 · 데이터베이스 구축',
      tag: '암기',
      blocks: [
        {
          type: 'table',
          headers: ['두문자', '풀이', '대상'],
          rows: [
            ['"도부이결다조"', '도메인원자값-부분함수종속제거-이행함수종속제거-결정자-다치종속-조인종속', '정규화 단계 (1NF → 5NF)'],
            ['"개참도"', '개체무결성-참조무결성-도메인무결성', '무결성 제약 3종'],
            ['CADR', 'CREATE-ALTER-DROP-RENAME', 'DDL(정의어) 명령어'],
            ['SIUD', 'SELECT-INSERT-UPDATE-DELETE', 'DML(조작어) 명령어'],
            ['GR', 'GRANT-REVOKE', 'DCL(제어어) 명령어'],
            ['CRS', 'COMMIT-ROLLBACK-SAVEPOINT', 'TCL(트랜잭션 제어어) 명령어'],
            ['ACID', '원자성-일관성-고립성-지속성', '트랜잭션의 4대 특성'],
            ['"활부완" / "활실철"', '정상: 활동-부분완료-완료 / 비정상: 활동-실패(Failed)-철회(Aborted)', '트랜잭션 5가지 상태'],
          ],
        },
        {
          type: 'order',
          label: '정규화 단계',
          items: ['1NF', '2NF', '3NF', 'BCNF', '4NF', '5NF'],
        },
        {
          type: 'order',
          label: '트랜잭션 상태 흐름 (정상 / 비정상)',
          items: ['활동(Active)', '부분완료 → 완료', '또는 실패 → 철회'],
        },
        {
          type: 'tip',
          value: '정규화 단계별 제거 대상: **"도부이결다조"** (도메인원자화-1NF, 부분종속제거-2NF, 이행종속제거-3NF, 결정자함수종속-BCNF, 다치종속제거-4NF, 조인종속제거-5NF)',
        },
      ],
    },
    {
      id: 'subject4-mnemonic',
      title: '4과목 · 프로그래밍 언어 활용',
      tag: '암기',
      blocks: [
        {
          type: 'table',
          headers: ['두문자', '풀이', '대상'],
          rows: [
            ['"아파서티내다물"', '아(Application·응용)-파(Presentation·표현)-서(Session·세션)-티(Transport·전송)-내(Network·네트워크)-다(Data Link·데이터링크)-물(Physical·물리)', 'OSI 7계층 (7 → 1)'],
            ['"상점비환"', '상호배제-점유와대기-비선점-환형대기', '교착상태 발생 4대 조건'],
            ['FIFO / LRU / LFU / NUR / OPT', '선입선출-최근미사용-최소빈도사용-최근미사용(참조·변형비트)-최적(이상적)', '페이지 교체 알고리즘 5종'],
            ['SYN → SYN/ACK → ACK', '연결 요청 → 요청 수락+확인 → 최종 확인', 'TCP 3-way handshake 순서'],
            ['RR·SRT·MLQ / FCFS·SJF·HRN', '선점형 스케줄링 / 비선점형 스케줄링', 'CPU 스케줄링 알고리즘 분류'],
          ],
        },
        {
          type: 'order',
          label: 'OSI 7계층 순서 (하위 → 상위)',
          items: ['물리', '데이터링크', '네트워크', '전송', '세션', '표현', '응용'],
        },
        {
          type: 'order',
          label: '접근제어자 범위 (넓음 → 좁음)',
          items: ['public', 'protected', 'default', 'private'],
        },
        {
          type: 'tip',
          value: '**HRN 우선순위 = (대기시간 + 서비스시간) ÷ 서비스시간** — 값이 클수록 우선순위 높음',
        },
        {
          type: 'tip',
          value: '증감연산자: **전위(++i)**는 먼저 증가 후 사용, **후위(i++)**는 먼저 사용 후 증가',
        },
      ],
    },
    {
      id: 'subject5-mnemonic',
      title: '5과목 · 정보시스템 구축관리',
      tag: '암기',
      blocks: [
        {
          type: 'table',
          headers: ['두문자', '풀이', '대상'],
          rows: [
            ['"계위개고"', '계획수립-위험분석-개발및검증-고객평가', '나선형(Spiral) 모델 4단계'],
            ['CIA', '기밀성(Confidentiality)-무결성(Integrity)-가용성(Availability)', '정보보안 3요소'],
            ['NRU/NWD ↔ NRD/NWU', '벨-라파듈라(No Read Up/No Write Down, 기밀성) ↔ 비바(No Read Down/No Write Up, 무결성)', '접근통제 보안모델 비교'],
            ['DAC / MAC / RBAC', '임의적(소유자 기준) / 강제적(시스템 기준) / 역할기반', '접근통제 모델 3종'],
            ['IaaS / PaaS / SaaS', '인프라형 → 플랫폼형 → 소프트웨어형 (추상화 수준이 높아지는 순서)', '클라우드 서비스 모델 3단계'],
            ['3V', 'Volume(규모)-Velocity(속도)-Variety(다양성)', '빅데이터의 3대 특성'],
          ],
        },
        {
          type: 'order',
          label: '나선형(Spiral) 모델 4단계',
          items: ['계획 수립(Planning)', '위험 분석(Risk Analysis)', '개발 및 검증(Engineering)', '고객 평가(Evaluation)'],
        },
        {
          type: 'order',
          label: 'CMMI 성숙도 5단계',
          items: ['초기(Initial)', '관리(Managed)', '정의(Defined)', '정량적 관리(Quantitatively Managed)', '최적화(Optimizing)'],
        },
        {
          type: 'order',
          label: '클라우드 서비스 추상화 수준 (낮음 → 높음)',
          items: ['IaaS', 'PaaS', 'SaaS'],
        },
        {
          type: 'tip',
          value: '**LOC 공식**: 예측 노력(인월) = LOC ÷ 1인당 월평균 생산 LOC, 개발기간 = 노력(인월) ÷ 투입 인원',
        },
        {
          type: 'tip',
          value: "**브룩스의 법칙(Brooks' Law)**: 지연되는 프로젝트에 인력을 추가 투입하면 적응·의사소통 비용 때문에 오히려 더 지연된다",
        },
      ],
    },
  ],
}
