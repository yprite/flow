import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import RecommendedQuestionsExperiment from '../recommended-questions-experiment'

const SAMPLE_SLUG = 'bitcoin-fee-estimator'
const SAMPLE_QUESTIONS = [
  'Q1',
  'Q2',
  'Q3',
  'Q4',
  'Q5',
]

describe('RecommendedQuestionsExperiment', () => {
  beforeEach(() => {
    localStorage.clear()
    jest.restoreAllMocks()

    ;(global as { fetch: jest.Mock }).fetch = jest.fn().mockResolvedValue({
      ok: true,
    })

    Object.defineProperty(window, 'crypto', {
      value: { randomUUID: () => 'uuid-test' },
      configurable: true,
    })

    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: jest.fn().mockResolvedValue(undefined) },
      configurable: true,
    })
  })

  it('랜덤 분기가 대조군이면 추천 질문을 노출하지 않는다', async () => {
    jest.spyOn(Math, 'random').mockReturnValue(0.2)

    render(
      <RecommendedQuestionsExperiment
        slug={SAMPLE_SLUG}
        recommendedQuestions={SAMPLE_QUESTIONS}
      />
    )

    expect(await screen.findByText('대조군')).toBeInTheDocument()
    expect(screen.queryAllByTestId('recommended-question-button')).toHaveLength(0)
    expect(screen.getByText(/기본 랜딩\(대조군\)/)).toBeInTheDocument()
  })

  it('랜덤 분기가 실험군이면 추천 질문 5개를 노출한다', async () => {
    jest.spyOn(Math, 'random').mockReturnValue(0.9)

    render(
      <RecommendedQuestionsExperiment
        slug={SAMPLE_SLUG}
        recommendedQuestions={SAMPLE_QUESTIONS}
      />
    )

    expect(await screen.findByText('실험군')).toBeInTheDocument()
    await waitFor(() =>
      expect(screen.getAllByTestId('recommended-question-button')).toHaveLength(5)
    )
  })

  it('첫 질문 클릭 시 first_query_completed 이벤트를 기록한다', async () => {
    jest.spyOn(Math, 'random').mockReturnValue(0.9)
    const fetchMock = global.fetch as jest.Mock

    render(
      <RecommendedQuestionsExperiment
        slug={SAMPLE_SLUG}
        recommendedQuestions={SAMPLE_QUESTIONS}
      />
    )

    const buttons = await screen.findAllByTestId('recommended-question-button')
    fireEvent.click(buttons[0])

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2))

    const clickCallBody = fetchMock.mock.calls[1][1].body as string
    const clickPayload = JSON.parse(clickCallBody)

    expect(clickPayload.eventName).toBe('first_query_completed')
    expect(clickPayload.properties.queryType).toBe(`${SAMPLE_SLUG}-recommended-q1`)
    expect(clickPayload.properties.experimentId).toBe('w1_p0_recommended_questions_5')
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('Q1')
  })
})
