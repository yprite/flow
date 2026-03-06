export interface IntentFaq {
  question: string
  answer: string
}

export interface SeoIntentPage {
  slug: string
  title: string
  description: string
  primaryKeyword: string
  keywordCluster: string[]
  useCases: string[]
  recommendedQuestions: string[]
  faqs: IntentFaq[]
}

export const SEO_INTENT_PAGES: SeoIntentPage[] = [
  {
    slug: 'bitcoin-address-lookup',
    title: 'Bitcoin Address Lookup',
    description: 'Analyze any Bitcoin address balance, inflow/outflow, and transaction activity with real-time on-chain data.',
    primaryKeyword: 'bitcoin address lookup',
    keywordCluster: [
      'btc wallet lookup',
      'bitcoin address balance checker',
      'on-chain wallet activity',
    ],
    useCases: [
      'Track wallet accumulation and spending behavior.',
      'Review inbound/outbound transaction velocity.',
      'Flag unusual wallet movements for investigation.',
    ],
    recommendedQuestions: [
      '이 주소의 최근 30일 유입/유출 추세를 요약해줘',
      '이 주소와 상호작용이 많은 상위 5개 주소를 보여줘',
      '대규모 출금 패턴이 있는지 위험 신호를 알려줘',
      '최근 거래 중 수수료가 비정상적으로 높은 건을 찾아줘',
      '이 주소의 잔액 변동을 주간 기준으로 정리해줘',
    ],
    faqs: [
      {
        question: 'How often is address data updated?',
        answer: 'The index refreshes continuously as new blocks are confirmed, with near-real-time deltas.',
      },
      {
        question: 'Can I monitor multiple addresses?',
        answer: 'Yes. You can track watchlists and compare flow patterns across addresses.',
      },
    ],
  },
  {
    slug: 'bitcoin-fee-estimator',
    title: 'Bitcoin Fee Estimator',
    description: 'Estimate optimal sat/vB fees from mempool pressure and confirmation-time targets.',
    primaryKeyword: 'bitcoin fee estimator',
    keywordCluster: [
      'btc transaction fee',
      'sat vbyte calculator',
      'bitcoin fee prediction',
    ],
    useCases: [
      'Choose low/medium/high urgency fee lanes.',
      'Avoid overpaying during high congestion periods.',
      'Backtest fee policy against historical mempool states.',
    ],
    recommendedQuestions: [
      '지금 30분 내 확인 목표일 때 권장 수수료를 계산해줘',
      '최근 24시간 대비 현재 수수료가 높은지 비교해줘',
      '수수료를 절약하면서 2시간 내 확인되는 전략을 제안해줘',
      '혼잡 급등 구간에서 과지불을 피하는 기준을 알려줘',
      '내 거래 크기 기준 예상 총 수수료를 sat와 USD로 보여줘',
    ],
    faqs: [
      {
        question: 'What confirmation targets are available?',
        answer: 'Fast, standard, and economy targets are all mapped to dynamic sat/vB ranges.',
      },
      {
        question: 'Does the estimator account for sudden spikes?',
        answer: 'Yes. It uses current and trailing mempool state to reduce stale-fee recommendations.',
      },
    ],
  },
  {
    slug: 'mempool-congestion-tracker',
    title: 'Bitcoin Mempool Congestion Tracker',
    description: 'Monitor unconfirmed transaction backlog, fee buckets, and throughput pressure in one view.',
    primaryKeyword: 'bitcoin mempool tracker',
    keywordCluster: [
      'btc pending transactions',
      'mempool congestion chart',
      'bitcoin throughput monitoring',
    ],
    useCases: [
      'Detect backlog expansion before fee spikes.',
      'Track block-space demand by fee bucket.',
      'Set alerts for congestion threshold breaches.',
    ],
    recommendedQuestions: [
      '현재 mempool 혼잡도를 3단계(낮음/보통/높음)로 평가해줘',
      '고수수료 버킷 증가 속도가 급격한지 알려줘',
      '혼잡 완화 예상 시점을 최근 블록 추세로 추정해줘',
      '지금 전송하면 예상 확인 시간대를 요약해줘',
      '지난 7일 대비 오늘 혼잡 패턴 차이를 설명해줘',
    ],
    faqs: [
      {
        question: 'What metrics indicate congestion the best?',
        answer: 'Pending transaction count, high-fee bucket growth, and confirmation delays are primary indicators.',
      },
      {
        question: 'Can I export mempool snapshots?',
        answer: 'Yes. You can export snapshots for reporting and downstream analytics.',
      },
    ],
  },
  {
    slug: 'bitcoin-transaction-tracker',
    title: 'Bitcoin Transaction Tracker',
    description: 'Track a Bitcoin transaction in real time with confirmation progress, fee position, and mempool replacement risk signals.',
    primaryKeyword: 'bitcoin transaction tracker',
    keywordCluster: [
      'btc tx tracker',
      'bitcoin transaction status',
      'tx confirmation checker',
    ],
    useCases: [
      'Monitor confirmation progress by fee tier and block cadence.',
      'Detect stuck or replacement-risk transactions early.',
      'Share transaction status updates with support workflows.',
    ],
    recommendedQuestions: [
      '이 tx 해시의 현재 확인 상태와 예상 완료 시간을 알려줘',
      '수수료 기준으로 이 거래가 지연될 가능성이 높은지 평가해줘',
      'RBF/CPFP 관점에서 가속이 필요한지 판단해줘',
      '최근 블록 패턴을 반영한 확인 시간 시나리오를 보여줘',
      '동일 시점 유사 수수료 거래 대비 상대 위치를 비교해줘',
    ],
    faqs: [
      {
        question: 'How do you estimate confirmation timing?',
        answer: 'We combine current mempool fee distribution, recent block cadence, and transaction fee position.',
      },
      {
        question: 'Can I track replacement-risk transactions?',
        answer: 'Yes. The tracker highlights RBF candidates and fee-competition risk windows.',
      },
    ],
  },
  {
    slug: 'bitcoin-whale-alerts',
    title: 'Bitcoin Whale Alerts',
    description: 'Detect high-value transfers and recurring whale behavior with threshold and entity-aware tracking.',
    primaryKeyword: 'bitcoin whale alerts',
    keywordCluster: [
      'large bitcoin transactions',
      'btc whale tracker',
      'on-chain transfer alerts',
    ],
    useCases: [
      'Alert on transfers above configurable BTC thresholds.',
      'Track recurring wallets with large movements.',
      'Correlate whale events with market volatility windows.',
    ],
    recommendedQuestions: [
      '최근 24시간 1,000 BTC 이상 이동 내역을 시간순으로 보여줘',
      '반복적으로 대량 이동하는 고래 주소를 식별해줘',
      '거래소 입금/출금으로 추정되는 대규모 트랜잭션을 분류해줘',
      '고래 이동 직후 가격 변동 패턴을 요약해줘',
      '알림 임계값을 시장 변동성 기반으로 추천해줘',
    ],
    faqs: [
      {
        question: 'Can I customize alert thresholds?',
        answer: 'Yes. Set BTC amount, counterparty labels, and time windows per alert policy.',
      },
      {
        question: 'Do alerts include transaction context?',
        answer: 'Each alert includes tx hash, value, fee, direction, and recent wallet behavior summary.',
      },
    ],
  },
]

export function getSeoIntentBySlug(slug: string): SeoIntentPage | undefined {
  return SEO_INTENT_PAGES.find(page => page.slug === slug)
}
