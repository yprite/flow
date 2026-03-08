export interface SeoRegion {
  slug: string
  name: string
  fullName: string
  centerLabel: string
  latitude: number
  longitude: number
  radius: number
  summary: string
  popularAreas: string[]
  driverContext: string
  averagePriceContext: string
  radiusStrategy: string
  localTips: string[]
}

export const SEO_REGIONS: SeoRegion[] = [
  {
    slug: 'seoul',
    name: '서울',
    fullName: '서울특별시',
    centerLabel: '서울시청',
    latitude: 37.5665,
    longitude: 126.978,
    radius: 3000,
    summary: '출퇴근 동선이 길고 주유소 밀집도가 높은 서울에서 빠르게 최저가를 찾기 좋습니다.',
    popularAreas: ['강남', '송파', '마포', '영등포'],
    driverContext:
      '서울은 업무지구와 주거지가 길게 연결돼 있어, 같은 생활권 안에서도 시간대에 따라 체감 이동 비용이 크게 달라집니다.',
    averagePriceContext:
      '서울에서는 전국 평균보다 몇 원 높은지보다, 출퇴근 동선 안에서 평균 이하 지점을 찾는 쪽이 실제 절약으로 이어집니다.',
    radiusStrategy:
      '도심권은 2~3km부터 시작하고, 강 건너 이동이나 상습 정체 구간이 끼는 경우에는 반경 숫자보다 진행 방향을 먼저 보는 편이 낫습니다.',
    localTips: [
      '출근길 후보와 퇴근길 후보를 따로 보는 편이 현실적입니다.',
      '강남, 마포, 영등포처럼 업무권은 같은 방향 진입 여부가 중요합니다.',
      '가격 차이가 작다면 대기 시간과 진입 편의가 더 큰 차이를 만듭니다.',
    ],
  },
  {
    slug: 'busan',
    name: '부산',
    fullName: '부산광역시',
    centerLabel: '부산시청',
    latitude: 35.1796,
    longitude: 129.0756,
    radius: 3000,
    summary: '도심과 외곽 가격 차이가 큰 부산에서 거리와 가격을 함께 비교할 수 있습니다.',
    popularAreas: ['해운대', '연제', '사상', '동래'],
    driverContext:
      '부산은 도심과 외곽의 도로 체감이 크게 다르고, 다리나 언덕을 지나는 이동은 단순 거리보다 더 비싸게 느껴질 수 있습니다.',
    averagePriceContext:
      '부산에서는 절대 최저가보다 생활권 안에서 평균보다 경쟁력 있는 지점을 찾는 방식이 더 실용적입니다.',
    radiusStrategy:
      '도심 생활권은 2km 안팎부터, 외곽이나 산업권은 4km까지 넓혀 보는 식으로 반경을 다르게 쓰는 편이 좋습니다.',
    localTips: [
      '해운대, 연제처럼 도심권은 짧은 반경부터 시작하는 편이 낫습니다.',
      '사상, 동래처럼 통과 교통이 많은 구간은 우회 여부를 같이 보세요.',
      '유턴이나 방향 전환이 크면 몇 원 차이는 쉽게 상쇄됩니다.',
    ],
  },
  {
    slug: 'incheon',
    name: '인천',
    fullName: '인천광역시',
    centerLabel: '인천시청',
    latitude: 37.4563,
    longitude: 126.7052,
    radius: 3000,
    summary: '공항고속도로와 항만권 이동이 많은 인천에서 주유비 절감 포인트를 잡기 좋습니다.',
    popularAreas: ['남동', '부평', '연수', '서구'],
    driverContext:
      '인천은 공항권, 항만권, 서울 서부 연계 이동이 섞여 있어서 출발 전 생활권과 진입 후 권역을 분리해서 보는 편이 효율적입니다.',
    averagePriceContext:
      '인천에서는 공항 이동 전 급하게 넣는 순간 선택지가 줄어들기 때문에, 평균가는 출발지 생활권의 가격대를 해석하는 기준으로 쓰는 편이 좋습니다.',
    radiusStrategy:
      '공항 이동이나 장거리 진입이 예정된 날은 먼저 생활권 3km 안으로 보고, 필요할 때만 공항권까지 넓히는 순서가 좋습니다.',
    localTips: [
      '남동, 부평처럼 생활권이 분명한 곳은 출발 전에 먼저 가격대를 보세요.',
      '연수, 서구처럼 외곽 진입이 많은 구간은 여정 시작 전 판단이 더 유리합니다.',
      '공항 가까이 가서 주유를 결정하면 시간 압박이 커질 수 있습니다.',
    ],
  },
  {
    slug: 'daegu',
    name: '대구',
    fullName: '대구광역시',
    centerLabel: '대구시청 산격청사',
    latitude: 35.8857,
    longitude: 128.5829,
    radius: 3000,
    summary: '자가용 이동 비중이 높은 대구에서 반경별 최저가를 바로 확인할 수 있습니다.',
    popularAreas: ['수성', '달서', '북구', '동구'],
    driverContext:
      '대구는 자가용 이동 비중이 높아 생활권 안에서 반복적으로 주유하는 사용자가 많고, 익숙한 루틴을 만들기 좋은 도시입니다.',
    averagePriceContext:
      '대구에서는 전국 평균보다 현재 생활권 가격대가 얼마나 높은지 낮은지를 보는 감각이 중요하고, 그 기준이 생기면 급한 주유를 줄이기 쉽습니다.',
    radiusStrategy:
      '처음에는 3km 전후로 보고, 자주 다니는 생활권이 넓다면 4km까지 확장해도 판단 부담이 크지 않은 편입니다.',
    localTips: [
      '수성, 달서처럼 생활권이 넓은 곳은 자주 가는 후보를 2~3곳만 남겨두세요.',
      '북구, 동구처럼 통과 이동이 있는 구간은 출발 방향과 같은 편인지 확인하세요.',
      '주 1회만 확인해도 지역 시세 감각을 만들기 좋습니다.',
    ],
  },
  {
    slug: 'daejeon',
    name: '대전',
    fullName: '대전광역시',
    centerLabel: '대전시청',
    latitude: 36.3504,
    longitude: 127.3845,
    radius: 3000,
    summary: '생활권이 넓은 대전에서 멀리 돌아가지 않고 싼 주유소를 찾는 데 적합합니다.',
    popularAreas: ['유성', '서구', '중구', '대덕'],
    driverContext:
      '대전은 연구단지, 주거권, 외곽 연결이 혼합돼 있어 한 번 멀어지면 돌아오는 비용이 커지는 편입니다.',
    averagePriceContext:
      '대전에서는 절대 최저가보다 생활권 안에서 평균 이하 가격을 반복적으로 찾는 방식이 더 안정적입니다.',
    radiusStrategy:
      '기본 반경은 3km로 두고, 유성이나 대덕처럼 이동이 길어지는 날만 조금 넓히는 편이 효율적입니다.',
    localTips: [
      '유성, 서구처럼 생활권이 넓은 곳은 거리순 재정렬이 특히 유용합니다.',
      '중구처럼 도심 이동은 짧은 반경으로도 충분한 경우가 많습니다.',
      '대덕, 외곽권은 장거리 이동 전 주유 판단과 같이 묶으면 좋습니다.',
    ],
  },
  {
    slug: 'gwangju',
    name: '광주',
    fullName: '광주광역시',
    centerLabel: '광주시청',
    latitude: 35.1595,
    longitude: 126.8526,
    radius: 3000,
    summary: '도심 생활권과 외곽 간 가격 차이를 비교하기 좋은 광주용 인텐트 랜딩입니다.',
    popularAreas: ['서구', '광산', '북구', '남구'],
    driverContext:
      '광주는 도심 생활권과 외곽 이동이 비교적 분명하게 나뉘어 있어, 자주 다니는 권역 기준으로 가격대를 읽는 편이 편합니다.',
    averagePriceContext:
      '광주에서는 생활권별 체감가가 다르기 때문에 전국 평균보다 내 권역의 평균 이하 지점을 찾는 쪽이 더 도움이 됩니다.',
    radiusStrategy:
      '도심 생활권은 2~3km, 외곽이나 산업권 이동이 섞이면 4km까지 넓혀 보는 식으로 쓰는 편이 좋습니다.',
    localTips: [
      '서구, 북구처럼 도심권은 짧은 반경으로도 충분히 비교됩니다.',
      '광산처럼 외곽 이동이 많은 권역은 반경을 조금 넓혀야 후보가 보입니다.',
      '생활권이 다른 날에는 비교 기준도 함께 바꾸는 편이 좋습니다.',
    ],
  },
  {
    slug: 'ulsan',
    name: '울산',
    fullName: '울산광역시',
    centerLabel: '울산시청',
    latitude: 35.5384,
    longitude: 129.3114,
    radius: 3000,
    summary: '산업단지와 장거리 운전 수요가 많은 울산에서 연료비 절감 니즈가 분명합니다.',
    popularAreas: ['남구', '중구', '북구', '울주'],
    driverContext:
      '울산은 산업단지 통근과 장거리 이동이 많아, 급하게 넣는 것보다 일정한 주유 루틴을 만드는 쪽이 더 효과적입니다.',
    averagePriceContext:
      '울산에서는 평균가를 뉴스처럼 보기보다 이번 주 생활권 가격 감각을 만드는 기준으로 써야 실제 비용 절감에 연결됩니다.',
    radiusStrategy:
      '도심권은 3km부터, 울주나 외곽 장거리 동선은 5km까지 넓혀도 의미가 있는 경우가 많습니다.',
    localTips: [
      '남구, 중구처럼 반복 통근이 있는 곳은 후보를 고정하는 편이 좋습니다.',
      '북구, 울주처럼 장거리 이동 전에는 출발 전 비교가 더 유리합니다.',
      '산업단지 출퇴근 시간대는 진입 편의가 가격 차이만큼 중요합니다.',
    ],
  },
  {
    slug: 'suwon',
    name: '수원',
    fullName: '수원시',
    centerLabel: '수원시청',
    latitude: 37.2636,
    longitude: 127.0286,
    radius: 3000,
    summary: '수원과 인접 생활권을 오가는 운전자에게 반경 기반 비교가 특히 유효합니다.',
    popularAreas: ['영통', '권선', '장안', '팔달'],
    driverContext:
      '수원은 인접 도시와의 왕복 이동이 잦아 수원 내부만 보는 것보다 생활권 경계에서 가격을 읽는 감각이 중요합니다.',
    averagePriceContext:
      '수원에서는 평균가를 기준점으로 삼되, 인접 생활권 이동을 감안한 실제 후보군을 만드는 쪽이 더 실용적입니다.',
    radiusStrategy:
      '기본은 3km로 두고, 영통이나 권선처럼 외부 생활권 연결이 강한 곳은 4km까지 넓혀보는 편이 낫습니다.',
    localTips: [
      '영통, 권선은 인접 생활권과 묶어서 보는 편이 자연스럽습니다.',
      '장안, 팔달처럼 도심권은 거리순과 가격순을 함께 보세요.',
      '출퇴근 경계 구간에서는 생활권 바깥 주유소가 더 유리할 때도 있습니다.',
    ],
  },
]

export function getSeoRegion(slug: string) {
  return SEO_REGIONS.find((region) => region.slug === slug)
}
