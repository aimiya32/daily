export default {
  no: 4,
  title: '프로그래밍 언어 활용',
  topics: [
    {
      id: 'c-language',
      title: 'C 언어 핵심',
      tag: '빈출',
      blocks: [
        {
          type: 'table',
          headers: ['구분', '설명'],
          rows: [
            ['배열명', '배열의 첫 원소 주소처럼 쓰이지만 배열명 자체는 상수(재대입 불가), sizeof는 배열 전체 크기'],
            ['포인터 연산', '포인터+n은 **자료형 크기만큼** 주소 이동 (int*는 +4바이트)'],
            ['문자열', '문자 배열의 끝은 반드시 **\\0**(널문자)로 종료'],
            ['scanf 문자열', '%s는 & 없이 배열명 그대로 사용 (배열명=주소)'],
            ['2차원 배열', 'arr[i][j] == *(*(arr+i)+j)'],
          ],
        },
        {
          type: 'order',
          label: '연산자 우선순위(높은→낮은)',
          items: [
            '() [] ++(후위) --(후위)',
            '++(전위) --(전위) ! ~ (형변환) *(포인터) &(주소)',
            '* / %',
            '+ -',
            '<< >>',
            '< <= > >=',
            '== !=',
            '& / ^ / |',
            '&& / ||',
            '?:',
            '= += -= 등 대입',
            ',',
          ],
        },
        {
          type: 'tip',
          value: '증감연산자: **전위(++i)**는 먼저 증가 후 사용, **후위(i++)**는 먼저 사용 후 증가',
        },
        {
          type: 'code',
          lang: 'c',
          value: 'int arr[5] = {10, 20, 30, 40, 50};\nint *p = arr;\nprintf("%d", *(p + 2));',
          note: '출력: 30 (포인터+2 = arr[2], int가 4바이트이므로 주소는 8바이트 이동)',
        },
        {
          type: 'code',
          lang: 'c',
          value: 'char str[] = "hello";\nchar *p = str;\nwhile (*p) {\n  putchar(*p);\n  p++;\n}',
          note: '출력: hello (널문자를 만나기 전까지 순회)',
        },
        {
          type: 'code',
          lang: 'c',
          value: 'int fact(int n) {\n  if (n <= 1) return 1;\n  return n * fact(n - 1);\n}\nint main() {\n  printf("%d", fact(4));\n}',
          note: '출력: 24 (4*3*2*1). 재귀는 반드시 종료조건 필요',
        },
      ],
    },
    {
      id: 'java-basics',
      title: 'Java 핵심',
      tag: '빈출',
      blocks: [
        {
          type: 'table',
          headers: ['구분', '오버라이딩(Overriding)', '오버로딩(Overloading)'],
          rows: [
            ['정의', '상속받은 메서드를 재정의', '같은 이름, 다른 매개변수로 메서드 여러 개 정의'],
            ['관계', '부모-자식 클래스 간', '같은 클래스 내'],
            ['시그니처', '매개변수/반환형 동일', '매개변수 개수·타입이 다름'],
            ['바인딩', '동적 바인딩(런타임 결정)', '정적 바인딩(컴파일타임 결정)'],
          ],
        },
        {
          type: 'table',
          headers: ['제어자', '같은 클래스', '같은 패키지', '자식 클래스', '전체'],
          rows: [
            ['public', 'O', 'O', 'O', 'O'],
            ['protected', 'O', 'O', 'O', 'X'],
            ['default', 'O', 'O', 'X', 'X'],
            ['private', 'O', 'X', 'X', 'X'],
          ],
        },
        {
          type: 'list',
          items: [
            '**static**: 클래스 전체가 공유하는 멤버, 객체 생성 없이 접근 가능',
            '**final**: 변수는 상수화, 메서드는 오버라이딩 금지, 클래스는 상속 금지',
          ],
        },
        {
          type: 'code',
          lang: 'java',
          value: 'class Animal {\n  void sound() { System.out.println("동물 소리"); }\n}\nclass Dog extends Animal {\n  void sound() { System.out.println("멍멍"); }\n}\npublic class Main {\n  public static void main(String[] args) {\n    Animal a = new Dog();\n    a.sound();\n  }\n}',
          note: '출력: 멍멍 (참조형은 Animal이지만 실제 객체 Dog의 메서드 호출 - 동적 바인딩)',
        },
        {
          type: 'code',
          lang: 'java',
          value: 'public class Main {\n  public static void main(String[] args) {\n    int[] arr = {1, 2, 3, 4, 5};\n    int sum = 0;\n    for (int x : arr) sum += x;\n    System.out.println(sum);\n  }\n}',
          note: '출력: 15 (향상된 for문으로 배열 합계)',
        },
      ],
    },
    {
      id: 'python-basics',
      title: 'Python 핵심',
      tag: '빈출',
      blocks: [
        {
          type: 'table',
          headers: ['표현', '의미'],
          rows: [
            ['a[start:end]', 'start 이상 end 미만'],
            ['a[start:end:step]', 'step 간격으로 슬라이싱'],
            ['a[:n]', '처음부터 n-1까지'],
            ['a[n:]', 'n부터 끝까지'],
            ['a[-1]', '마지막 원소(음수 인덱스는 끝에서부터)'],
            ['a[::-1]', '전체를 역순으로'],
          ],
        },
        {
          type: 'table',
          headers: ['자료형', '기호', '순서', '중복', '변경 가능'],
          rows: [
            ['list', '[ ]', 'O', 'O', 'O (mutable)'],
            ['tuple', '( )', 'O', 'O', 'X (immutable)'],
            ['set', '{ }', 'X', 'X (자동 제거)', 'O'],
            ['dict', '{k:v}', 'O (입력 순서)', 'key 중복 불가', 'O'],
          ],
        },
        {
          type: 'code',
          lang: 'python',
          value: 'a = [10, 20, 30, 40, 50]\nprint(a[1:4])\nprint(a[::-1])\nprint(a[-2:])',
          note: '출력: [20, 30, 40] / [50, 40, 30, 20, 10] / [40, 50]',
        },
        {
          type: 'code',
          lang: 'python',
          value: 'nums = [1, 2, 3, 4, 5]\nresult = [x * 2 for x in nums if x % 2 == 0]\nprint(result)',
          note: '출력: [4, 8] (짝수만 골라 2배로 만드는 리스트 컴프리헨션)',
        },
        {
          type: 'list',
          items: [
            '**list/dict는 mutable**: 함수 기본 인자로 쓰면 호출마다 값이 유지되는 함정 주의',
            '**range(start, end, step)**도 end는 미포함',
          ],
        },
      ],
    },
    {
      id: 'osi-7layer',
      title: 'OSI 7계층',
      tag: '빈출',
      blocks: [
        {
          type: 'table',
          headers: ['계층', '기능', '주요 프로토콜', '장비', 'PDU'],
          rows: [
            ['7 응용(Application)', '사용자 인터페이스 제공', 'HTTP, FTP, SMTP, DNS', '-', '메시지'],
            ['6 표현(Presentation)', '인코딩·암호화·압축', 'JPEG, SSL', '-', '메시지'],
            ['5 세션(Session)', '연결 설정·유지·종료', 'NetBIOS, RPC', '-', '메시지'],
            ['4 전송(Transport)', '종단간 신뢰성 있는 전송', 'TCP, UDP', '게이트웨이', '세그먼트'],
            ['3 네트워크(Network)', '경로설정(라우팅), 주소지정', 'IP, ICMP, ARP', '라우터', '패킷'],
            ['2 데이터링크(Data Link)', '오류·흐름제어, MAC 주소', 'Ethernet, PPP', '스위치, 브리지', '프레임'],
            ['1 물리(Physical)', '전기적 신호 전송', 'RS-232', '허브, 리피터', '비트'],
          ],
        },
        {
          type: 'order',
          label: '계층 순서(하위→상위)',
          items: ['물리', '데이터링크', '네트워크', '전송', '세션', '표현', '응용'],
        },
        {
          type: 'tip',
          value: '암기법(7→1): **아파서티내다물** = 아(**A**pplication 응용) - 파(**P**resentation 표현) - 서(**S**ession 세션) - 티(**T**ransport 전송) - 내(**N**etwork 네트워크) - 다(**D**ata Link 데이터링크) - 물(**P**hysical 물리)',
        },
      ],
    },
    {
      id: 'tcpip-protocol',
      title: 'TCP/IP 4계층 & 프로토콜',
      blocks: [
        {
          type: 'table',
          headers: ['TCP/IP 계층', '대응 OSI 계층', '프로토콜 예'],
          rows: [
            ['응용(Application)', '응용+표현+세션', 'HTTP, FTP, SMTP, DNS, TELNET'],
            ['전송(Transport)', '전송', 'TCP, UDP'],
            ['인터넷(Internet)', '네트워크', 'IP, ICMP, IGMP, ARP'],
            ['네트워크 액세스(Network Access)', '데이터링크+물리', 'Ethernet, PPP'],
          ],
        },
        {
          type: 'table',
          headers: ['구분', 'TCP', 'UDP'],
          rows: [
            ['연결방식', '연결지향 (3-way handshake)', '비연결지향'],
            ['신뢰성', '높음 (오류·흐름제어)', '낮음 (단순 전송)'],
            ['순서보장', 'O', 'X'],
            ['속도', '상대적으로 느림', '빠름'],
            ['활용', '파일전송, 웹(HTTP)', '스트리밍, DNS 질의'],
          ],
        },
        {
          type: 'table',
          headers: ['프로토콜', '설명'],
          rows: [
            ['HTTP', '웹 페이지 전송 (80포트)'],
            ['FTP', '파일 전송 (20/21포트)'],
            ['SMTP', '메일 발송 (25포트)'],
            ['DNS', '도메인명 ↔ IP 변환 (53포트)'],
            ['ARP', 'IP주소 → MAC주소 변환'],
            ['RARP', 'MAC주소 → IP주소 변환'],
            ['ICMP', '오류 메시지/상태 확인 (ping)'],
            ['IGMP', '멀티캐스트 그룹 관리'],
          ],
        },
      ],
    },
    {
      id: 'ip-subnetting',
      title: 'IP 주소 & 서브넷팅',
      tag: '계산',
      blocks: [
        {
          type: 'table',
          headers: ['클래스', '첫 옥텟 범위', '용도'],
          rows: [
            ['A', '0 ~ 127', '대규모 네트워크'],
            ['B', '128 ~ 191', '중규모 네트워크'],
            ['C', '192 ~ 223', '소규모 네트워크'],
            ['D', '224 ~ 239', '멀티캐스트'],
            ['E', '240 ~ 255', '실험용'],
          ],
        },
        {
          type: 'table',
          headers: ['클래스', '사설 IP 대역'],
          rows: [
            ['A', '10.0.0.0 ~ 10.255.255.255'],
            ['B', '172.16.0.0 ~ 172.31.255.255'],
            ['C', '192.168.0.0 ~ 192.168.255.255'],
          ],
        },
        {
          type: 'table',
          headers: ['CIDR', '서브넷마스크', '호스트 수(-2)'],
          rows: [
            ['/24', '255.255.255.0', '254'],
            ['/25', '255.255.255.128', '126'],
            ['/26', '255.255.255.192', '62'],
            ['/27', '255.255.255.224', '30'],
            ['/28', '255.255.255.240', '14'],
          ],
        },
        {
          type: 'order',
          label: '서브넷팅 계산 절차',
          items: [
            '필요한 서브넷 수 확인 → 2^n ≥ 서브넷 수인 n 찾기',
            '기존 마스크에 n비트 추가 (예: /24 + 2 = /26)',
            '블록 크기(2^호스트비트)만큼 네트워크 주소를 증가시키며 나열',
            '호스트 수 = 2^호스트비트 - 2, 브로드캐스트 = 다음 네트워크주소 - 1',
          ],
        },
        {
          type: 'table',
          headers: ['서브넷', '네트워크 주소', '사용가능 호스트', '브로드캐스트'],
          rows: [
            ['1', '192.168.1.0/26', '192.168.1.1 ~ .62 (62개)', '192.168.1.63'],
            ['2', '192.168.1.64/26', '192.168.1.65 ~ .126 (62개)', '192.168.1.127'],
            ['3', '192.168.1.128/26', '192.168.1.129 ~ .190 (62개)', '192.168.1.191'],
            ['4', '192.168.1.192/26', '192.168.1.193 ~ .254 (62개)', '192.168.1.255'],
          ],
        },
        {
          type: 'list',
          items: [
            '**128비트** 주소 (IPv4 32비트의 4배), 16비트씩 8부분을 콜론(:)으로 구분',
            '헤더 간소화로 처리 속도 향상, **IPSec** 기본 내장(보안)',
            '유니캐스트/멀티캐스트/**애니캐스트**(IPv4 브로드캐스트 대체) 지원',
            'Plug and Play 지원(자동 주소설정)',
          ],
        },
      ],
    },
    {
      id: 'process-scheduling',
      title: '프로세스 스케줄링',
      tag: '계산',
      blocks: [
        {
          type: 'table',
          headers: ['구분', '선점(Preemptive)', '비선점(Non-preemptive)'],
          rows: [
            ['특징', '실행 중인 프로세스의 CPU를 뺏을 수 있음', '종료·대기 전까지 CPU 계속 점유'],
            ['예시', 'RR, SRT, 선점형 우선순위, MLQ', 'FCFS, SJF, HRN, 비선점형 우선순위'],
            ['장단점', '응답성 좋음, 문맥교환 오버헤드 큼', '구현 단순, 대기시간 편차 큼'],
          ],
        },
        {
          type: 'table',
          headers: ['알고리즘', '방식', '설명'],
          rows: [
            ['FCFS', '비선점', '도착 순서대로 처리(선입선출)'],
            ['SJF', '비선점', 'burst time이 짧은 것 우선(콘보이 효과 감소)'],
            ['SRT', '선점', 'SJF의 선점형, 남은 시간이 짧은 프로세스 우선'],
            ['RR', '선점', '타임 슬라이스로 순환 처리(대화식 시스템 적합)'],
            ['우선순위', '선점/비선점', '우선순위 높은 것 먼저(에이징으로 기아 방지)'],
            ['HRN', '비선점', '응답률 높은 순서(대기 오래된 프로세스 우대)'],
          ],
        },
        {
          type: 'tip',
          value: '**HRN 우선순위 = (대기시간 + 서비스시간) ÷ 서비스시간** — 값이 클수록 우선순위 높음',
        },
        {
          type: 'table',
          headers: ['프로세스', '도착시간', '실행시간(Burst)'],
          rows: [
            ['P1', '0', '5'],
            ['P2', '1', '3'],
            ['P3', '2', '8'],
            ['P4', '3', '6'],
          ],
        },
        {
          type: 'order',
          label: 'FCFS 실행 순서(간트차트)',
          items: ['P1 (0~5)', 'P2 (5~8)', 'P3 (8~16)', 'P4 (16~22)'],
        },
        {
          type: 'list',
          items: [
            '대기시간 = 시작시간 - 도착시간: P1=0, P2=5-1=4, P3=8-2=6, P4=16-3=13',
            '**평균 대기시간 = (0+4+6+13) ÷ 4 = 5.75**',
          ],
        },
      ],
    },
    {
      id: 'page-replacement',
      title: '페이지 교체 알고리즘',
      tag: '계산',
      blocks: [
        {
          type: 'table',
          headers: ['알고리즘', '설명'],
          rows: [
            ['FIFO', '가장 먼저 들어온 페이지를 교체'],
            ['LRU', '가장 오래 사용 안 된(Least Recently Used) 페이지를 교체'],
            ['LFU', '참조 횟수가 가장 적은(Least Frequently Used) 페이지를 교체'],
            ['NUR', '최근 미사용(Not Used Recently) 페이지 교체, 참조·변형 비트 이용'],
            ['OPT', '앞으로 가장 오래 사용되지 않을 페이지 교체(이상적, 실제 구현 불가)'],
          ],
        },
        {
          type: 'text',
          value: '참조열: 1,2,3,4,1,2,5,1,2,3,4,5 / 프레임 3개일 때 FIFO와 LRU의 폴트 수를 비교하면 다음과 같다.',
        },
        {
          type: 'table',
          headers: ['알고리즘', '폴트 수', '히트 수'],
          rows: [
            ['FIFO', '9', '3'],
            ['LRU', '10', '2'],
          ],
        },
        {
          type: 'list',
          items: [
            '**스래싱(Thrashing)**: 페이지 교체가 과도해 CPU 이용률이 급격히 떨어지는 현상',
            '**워킹셋(Working Set)**: 프로세스가 일정 시간 동안 실제 참조하는 페이지 집합',
            '**구역성(Locality)**: 시간 구역성(최근 참조한 데이터 재참조), 공간 구역성(인접 데이터 참조)',
          ],
        },
      ],
    },
    {
      id: 'memory-deadlock',
      title: '메모리 관리 & 교착상태',
      tag: '빈출',
      blocks: [
        {
          type: 'table',
          headers: ['구분', '페이징(Paging)', '세그먼테이션(Segmentation)'],
          rows: [
            ['분할 방식', '고정 크기(페이지)', '가변 크기(논리적 단위)'],
            ['단편화', '내부 단편화 발생', '외부 단편화 발생'],
            ['주소 변환', '페이지 테이블', '세그먼트 테이블'],
          ],
        },
        {
          type: 'list',
          items: [
            '**내부 단편화**: 할당된 공간이 필요량보다 커서 남는 공간이 낭비됨(페이징)',
            '**외부 단편화**: 사용 가능한 공간이 여러 조각으로 흩어져 활용 못함(세그먼테이션)',
          ],
        },
        {
          type: 'table',
          headers: ['전략', '설명'],
          rows: [
            ['최초적합(First Fit)', '처음 발견한, 크기가 맞는 공간에 배치'],
            ['최적적합(Best Fit)', '가장 작은 남는 공간에 배치(단편화 심화 우려)'],
            ['최악적합(Worst Fit)', '가장 큰 남는 공간에 배치'],
          ],
        },
        {
          type: 'text',
          value: '예: 빈 공간이 10K→4K→8K 순서일 때 7K 요청 → 최초적합: 10K, 최적적합: 8K, 최악적합: 10K',
        },
        {
          type: 'table',
          headers: ['조건', '설명'],
          rows: [
            ['상호배제(Mutual Exclusion)', '자원을 한 번에 한 프로세스만 사용'],
            ['점유와 대기(Hold and Wait)', '자원을 점유한 채 다른 자원을 기다림'],
            ['비선점(No Preemption)', '다른 프로세스의 자원을 강제로 뺏을 수 없음'],
            ['환형대기(Circular Wait)', '프로세스들이 원형으로 자원을 요청·대기'],
          ],
        },
        {
          type: 'list',
          items: [
            '**예방(Prevention)**: 4대 조건 중 하나를 제거',
            "**회피(Avoidance)**: 은행원 알고리즘(Banker's Algorithm) - 안전상태를 유지하며 자원 할당",
            '**발견(Detection)**: 교착상태 발생 여부를 주기적으로 검사',
            '**회복(Recovery)**: 프로세스 종료 또는 자원 선점으로 복구',
          ],
        },
      ],
    },
    {
      id: 'language-features',
      title: '언어 특징 & 기타',
      blocks: [
        {
          type: 'table',
          headers: ['분류', '설명', '예'],
          rows: [
            ['절차형(Procedural)', '순차적 명령 수행 중심', 'C, Fortran'],
            ['객체지향(Object-Oriented)', '객체 단위로 캡슐화·상속·다형성', 'Java, C++, Python'],
            ['스크립트(Script)', '인터프리터 방식, 간단한 자동화', 'Python, JavaScript, Shell'],
            ['선언형(Declarative)', '원하는 결과를 선언(How보다 What)', 'SQL, Prolog, Haskell'],
          ],
        },
        {
          type: 'list',
          items: [
            '**지역변수**: 함수·블록 내에서만 유효, 스택에 저장',
            '**전역변수**: 프로그램 전체에서 유효, 데이터 영역에 저장',
            '**정적변수(static)**: 함수 종료 후에도 값 유지, 프로그램 종료 시까지 존재',
            '기억클래스: auto(자동), static(정적), extern(외부참조), register(레지스터)',
          ],
        },
        {
          type: 'table',
          headers: ['언어', '구문'],
          rows: [
            ['C++/Java', 'try { } catch(예외) { } finally { }'],
            ['Python', 'try: / except 예외: / finally:'],
          ],
        },
        {
          type: 'table',
          headers: ['구분', 'C', 'Java', 'Python'],
          rows: [
            ['표준(내장)', 'stdio.h, stdlib.h, string.h', 'java.lang, java.util, java.io', 'os, sys, math, re'],
            ['외부', '없음(별도 SDK)', 'Spring, Apache Commons 등', 'numpy, pandas, requests 등'],
          ],
        },
      ],
    },
  ],
}
