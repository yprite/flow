import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import LandingHeroCopyExperiment from '../landing-hero-copy-experiment'

describe('LandingHeroCopyExperiment', () => {
  beforeEach(() => {
    localStorage.clear()
    jest.restoreAllMocks()

    ;(global as { fetch: jest.Mock }).fetch = jest.fn().mockResolvedValue({ ok: true })
    Object.defineProperty(window, 'crypto', {
      value: { randomUUID: () => 'hero-uuid' },
      configurable: true,
    })
  })

  it('대조군 카피를 렌더링한다', async () => {
    jest.spyOn(Math, 'random').mockReturnValue(0.2)

    render(
      <LandingHeroCopyExperiment
        slug="bitcoin-address-lookup"
        defaultTitle="Default title"
        defaultDescription="Default description"
      />
    )

    expect(await screen.findByText('히어로 대조군')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Default title' })).toBeInTheDocument()
    expect(screen.getByText('Default description')).toBeInTheDocument()
  })

  it('실험군 카피를 렌더링한다', async () => {
    jest.spyOn(Math, 'random').mockReturnValue(0.9)

    render(
      <LandingHeroCopyExperiment
        slug="bitcoin-address-lookup"
        defaultTitle="Default title"
        defaultDescription="Default description"
      />
    )

    expect(await screen.findByText('히어로 실험군')).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { name: '질문하면 바로 비트코인 온체인 답을 받으세요' })
    ).toBeInTheDocument()
    expect(screen.getByTestId('hero-signup-cta')).toHaveTextContent('무료로 바로 시작하기')
  })

  it('CTA 클릭 시 signup_completed 이벤트를 전송한다', async () => {
    jest.spyOn(Math, 'random').mockReturnValue(0.9)
    const fetchMock = global.fetch as jest.Mock

    render(
      <LandingHeroCopyExperiment
        slug="bitcoin-fee-estimator"
        defaultTitle="Default title"
        defaultDescription="Default description"
      />
    )

    fireEvent.click(await screen.findByTestId('hero-signup-cta'))

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1))
    const requestBody = fetchMock.mock.calls[0][1].body as string
    const payload = JSON.parse(requestBody)

    expect(payload.eventName).toBe('signup_completed')
    expect(payload.properties.channel).toBe('seo')
    expect(payload.properties.plan).toBe('free')
    expect(payload.properties.variant).toBe('value_copy')
  })
})
