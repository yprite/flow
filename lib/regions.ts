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
  },
]

export function getSeoRegion(slug: string) {
  return SEO_REGIONS.find((region) => region.slug === slug)
}
