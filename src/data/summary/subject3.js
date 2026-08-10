export default {
  no: 3,
  title: '데이터베이스 구축',
  topics: [
    {
      id: 'normalization',
      title: '정규화 & 이상현상',
      tag: '빈출',
      blocks: [
        {
          type: 'table',
          headers: ['이상현상', '설명'],
          rows: [
            ['삽입 이상(Insertion Anomaly)', '데이터 삽입 시 불필요한 데이터도 함께 입력해야 하는 문제'],
            ['삭제 이상(Deletion Anomaly)', '튜플 삭제 시 필요한 데이터까지 함께 삭제되는 문제'],
            ['갱신 이상(Update Anomaly)', '중복 데이터 중 일부만 수정되어 데이터가 불일치하는 문제'],
          ],
        },
        {
          type: 'order',
          label: '정규화 단계',
          items: ['1NF', '2NF', '3NF', 'BCNF', '4NF', '5NF'],
        },
        {
          type: 'table',
          headers: ['단계', '조건'],
          rows: [
            ['1NF', '모든 속성 값이 원자값(Atomic)일 것'],
            ['2NF', '1NF를 만족하고, 기본키에 **완전 함수 종속**(부분 함수 종속 제거)'],
            ['3NF', '2NF를 만족하고, **이행 함수 종속** 제거'],
            ['BCNF', '3NF를 만족하고, 모든 결정자가 후보키일 것'],
            ['4NF', 'BCNF를 만족하고, **다치 종속** 제거'],
            ['5NF', '4NF를 만족하고, **조인 종속** 제거'],
          ],
        },
        {
          type: 'list',
          items: [
            '완전 함수 종속: 기본키 전체에 종속 (부분키에는 종속되지 않음)',
            '부분 함수 종속: 기본키의 일부에만 종속',
            '이행 함수 종속: A→B, B→C이면 A→C가 성립하는 관계',
          ],
        },
        {
          type: 'tip',
          value: '정규화 단계별 제거 대상 암기: **"도부이결다조"** (도메인원자화-1NF, 부분종속제거-2NF, 이행종속제거-3NF, 결정자함수종속-BCNF, 다치종속제거-4NF, 조인종속제거-5NF)',
        },
      ],
    },
    {
      id: 'key-types',
      title: '키 종류',
      blocks: [
        {
          type: 'table',
          headers: ['키', '정의'],
          rows: [
            ['기본키(Primary Key)', '후보키 중 대표로 선택된 키'],
            ['후보키(Candidate Key)', '유일성과 최소성을 모두 만족하는 키'],
            ['슈퍼키(Super Key)', '유일성은 만족하지만 최소성은 만족하지 않는 키'],
            ['대체키(Alternate Key)', '후보키 중 기본키로 선택되지 않은 키'],
            ['외래키(Foreign Key)', '다른 테이블의 기본키를 참조하는 속성'],
          ],
        },
        {
          type: 'table',
          headers: ['키', '유일성', '최소성'],
          rows: [
            ['슈퍼키', 'O', 'X'],
            ['후보키', 'O', 'O'],
            ['기본키', 'O', 'O'],
            ['대체키', 'O', 'O'],
          ],
        },
      ],
    },
    {
      id: 'relational-algebra-calculus',
      title: '관계대수 & 관계해석',
      blocks: [
        {
          type: 'table',
          headers: ['순수 관계 연산자', '기호', '의미'],
          rows: [
            ['셀렉트(Select)', 'σ', '조건을 만족하는 튜플(행) 추출'],
            ['프로젝트(Project)', 'π', '지정한 속성(열)만 추출'],
            ['조인(Join)', '⋈', '공통 속성을 기준으로 두 릴레이션 결합'],
            ['디비전(Division)', '÷', '두 릴레이션 간 나눗셈 연산'],
          ],
        },
        {
          type: 'list',
          items: ['합집합(∪)', '교집합(∩)', '차집합(-)', '카티션 프로덕트(×)'],
        },
        {
          type: 'text',
          value: '관계대수는 **절차적**(어떻게 구할지 명시)이고, 관계해석은 **비절차적**(원하는 결과만 명시)이다.',
        },
      ],
    },
    {
      id: 'sql',
      title: 'SQL',
      tag: '빈출',
      blocks: [
        {
          type: 'table',
          headers: ['분류', '설명', '명령어'],
          rows: [
            ['DDL(정의어)', '테이블/스키마 구조 정의', 'CREATE, ALTER, DROP, RENAME'],
            ['DML(조작어)', '데이터 조회/조작', 'SELECT, INSERT, UPDATE, DELETE'],
            ['DCL(제어어)', '권한 부여/회수', 'GRANT, REVOKE'],
            ['TCL(트랜잭션 제어어)', '트랜잭션 처리', 'COMMIT, ROLLBACK, SAVEPOINT'],
          ],
        },
        {
          type: 'table',
          headers: ['JOIN 종류', '설명'],
          rows: [
            ['INNER JOIN', '양쪽 테이블에 모두 일치하는 행만 반환'],
            ['LEFT JOIN', '왼쪽 테이블 전체 + 일치하는 오른쪽 행'],
            ['RIGHT JOIN', '오른쪽 테이블 전체 + 일치하는 왼쪽 행'],
            ['FULL JOIN', '양쪽 테이블의 모든 행(합집합)'],
            ['CROSS JOIN', '두 테이블의 모든 조합(카티션 곱)'],
            ['SELF JOIN', '같은 테이블을 자기 자신과 조인'],
          ],
        },
        {
          type: 'list',
          items: [
            'GROUP BY: 지정한 열 기준으로 그룹화',
            'HAVING: 그룹화된 결과에 대한 조건(WHERE는 그룹화 전 조건)',
            '서브쿼리: 쿼리 안에 포함된 또 다른 SELECT문',
          ],
        },
        {
          type: 'table',
          headers: ['함수', '기능'],
          rows: [
            ['COUNT', '행의 개수'],
            ['SUM', '합계'],
            ['AVG', '평균'],
            ['MAX', '최댓값'],
            ['MIN', '최솟값'],
          ],
        },
        {
          type: 'list',
          items: [
            'SELECT DEPT, AVG(SAL) FROM EMP GROUP BY DEPT HAVING AVG(SAL) >= 3000;',
            'SELECT NAME FROM EMP WHERE SAL > (SELECT AVG(SAL) FROM EMP);',
          ],
        },
      ],
    },
    {
      id: 'transaction-concurrency',
      title: '트랜잭션 & 병행제어',
      tag: '빈출',
      blocks: [
        {
          type: 'table',
          headers: ['특성', '설명'],
          rows: [
            ['원자성(Atomicity)', '트랜잭션은 전부 실행되거나 전혀 실행되지 않아야 함'],
            ['일관성(Consistency)', '트랜잭션 수행 후에도 데이터베이스는 일관된 상태 유지'],
            ['고립성(Isolation)', '동시 실행되는 트랜잭션은 서로 영향을 주지 않아야 함'],
            ['지속성(Durability)', '커밋된 결과는 영구적으로 반영되어야 함'],
          ],
        },
        {
          type: 'order',
          label: '트랜잭션 상태 흐름 (정상 종료)',
          items: ['활동(Active)', '부분완료(Partially Committed)', '완료(Committed)'],
        },
        {
          type: 'order',
          label: '트랜잭션 상태 흐름 (비정상 종료)',
          items: ['활동(Active)', '실패(Failed)', '철회(Aborted)'],
        },
        {
          type: 'list',
          items: ['실패(Failed): 오류로 중단된 상태', '철회(Aborted): 롤백되어 원래 상태로 복구된 상태'],
        },
        {
          type: 'table',
          headers: ['락(Lock)', '설명'],
          rows: [
            ['공유 락(Shared Lock)', '읽기만 가능, 다른 트랜잭션도 공유 락 획득 가능'],
            ['배타 락(Exclusive Lock)', '읽기/쓰기 모두 가능, 다른 트랜잭션은 접근 불가'],
          ],
        },
        {
          type: 'list',
          items: [
            '2PL(Two-Phase Locking): 확장 단계(락 획득만 가능) → 축소 단계(락 반납만 가능)',
            '교착상태 발생 조건: 상호배제, 점유와 대기, 비선점, 순환대기 (4가지 모두 성립 시 발생)',
            '교착상태 해결: 예방(자원 선점 방식), 회피(은행원 알고리즘), 발견 후 회복',
            '타임스탬프 기법: 트랜잭션 시작 시각을 기준으로 순서를 부여해 직렬성 보장',
          ],
        },
      ],
    },
    {
      id: 'integrity-constraint',
      title: '무결성 제약',
      blocks: [
        {
          type: 'table',
          headers: ['무결성', '설명'],
          rows: [
            ['개체 무결성', '기본키는 NULL이 될 수 없고 중복될 수 없음'],
            ['참조 무결성', '외래키는 참조하는 테이블의 기본키로 존재하거나 NULL이어야 함'],
            ['도메인 무결성', '속성 값은 정의된 도메인(데이터 타입/범위)을 따라야 함'],
          ],
        },
        {
          type: 'table',
          headers: ['참조무결성 옵션', '동작'],
          rows: [
            ['CASCADE', '부모 삭제/수정 시 자식도 함께 삭제/수정'],
            ['SET NULL', '부모 삭제/수정 시 자식의 외래키를 NULL로 설정'],
            ['RESTRICT', '자식 레코드가 있으면 부모의 삭제/수정을 제한'],
            ['NO ACTION', '기본 동작, 참조 무결성 위반 시 처리를 거부'],
          ],
        },
      ],
    },
    {
      id: 'er-diagram',
      title: 'E-R 다이어그램',
      blocks: [
        {
          type: 'table',
          headers: ['기호', '의미'],
          rows: [
            ['사각형(□)', '개체(Entity)'],
            ['마름모(◇)', '관계(Relationship)'],
            ['타원(○)', '속성(Attribute)'],
            ['밑줄 타원', '기본키 속성'],
            ['선(—)', '개체와 속성, 개체와 관계를 연결'],
          ],
        },
        {
          type: 'list',
          items: [
            '1:1 — 한 개체가 다른 개체와 하나씩만 대응',
            '1:N — 한 개체가 다른 개체 여러 개와 대응',
            'N:M — 양쪽 개체가 서로 여러 개씩 대응',
          ],
        },
      ],
    },
    {
      id: 'index-view-denormalization',
      title: '인덱스 · 뷰 · 반정규화',
      blocks: [
        {
          type: 'table',
          headers: ['인덱스 종류', '설명'],
          rows: [
            ['클러스터드 인덱스', '데이터를 인덱스 순서대로 물리적으로 정렬, 테이블당 1개'],
            ['넌클러스터드 인덱스', '데이터와 별도 구조로 저장, 여러 개 생성 가능'],
            ['B-Tree 인덱스', '가장 일반적인 인덱스, 범위 검색에 유리'],
            ['해시 인덱스', '동등 비교(=) 검색에 유리, 범위 검색 불가'],
          ],
        },
        {
          type: 'table',
          headers: ['뷰(View)', '내용'],
          rows: [
            ['장점', '보안성 향상, 논리적 독립성 제공, 복잡한 쿼리 단순화'],
            ['단점', '독자적인 인덱스 생성 불가, 삽입/삭제/갱신에 제약 있음'],
          ],
        },
        {
          type: 'list',
          items: [
            '테이블 병합/분할(수직/수평 분할)',
            '중복 컬럼 추가',
            '파생 컬럼(계산된 값) 추가',
            '중복 테이블 추가(이력 테이블 등)',
          ],
        },
        {
          type: 'list',
          items: ['범위 파티셔닝(Range)', '해시 파티셔닝(Hash)', '리스트 파티셔닝(List)', '컴포지트 파티셔닝(Composite)'],
        },
      ],
    },
    {
      id: 'db-basics',
      title: '데이터베이스 기본',
      blocks: [
        {
          type: 'list',
          items: [
            '외부 스키마: 사용자/응용프로그램 관점의 스키마 (여러 개 존재 가능)',
            '개념 스키마: 조직 전체의 통합된 논리적 데이터 구조',
            '내부 스키마: 물리적 저장 장치 관점의 스키마',
          ],
        },
        {
          type: 'table',
          headers: ['데이터 독립성', '설명'],
          rows: [
            ['논리적 독립성', '개념 스키마 변경이 외부 스키마(응용 프로그램)에 영향 없음'],
            ['물리적 독립성', '내부 스키마 변경이 개념 스키마에 영향 없음'],
          ],
        },
        {
          type: 'list',
          items: [
            '정의 기능(Definition): 데이터의 형(type)과 구조, 제약조건 정의',
            '조작 기능(Manipulation): 데이터 검색/삽입/삭제/갱신 처리',
            '제어 기능(Control): 무결성, 보안, 권한, 병행제어 유지',
          ],
        },
      ],
    },
  ],
}
