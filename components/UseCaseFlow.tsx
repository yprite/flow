'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  MessageSquare,
  User,
  Users,
  Server,
  Database,
  ChevronDown,
  ArrowRight,
  ArrowDown,
  Smartphone,
  UserPlus,
  Calendar,
  CheckCircle,
  List,
  Workflow,
} from 'lucide-react'

type Actor = 'technician' | 'customer' | 'kakao' | 'api' | 'database' | 'openai'

interface FlowStep {
  from: Actor
  to: Actor
  message: string
  highlight?: boolean
  note?: string
}

interface UseCase {
  id: string
  title: string
  icon: React.ElementType
  description: string
  steps: FlowStep[]
  result: string
}

const actorConfig: Record<Actor, { label: string; color: string; bg: string; icon: React.ElementType }> = {
  technician: { label: '기사', color: 'text-blue-600', bg: 'bg-blue-100', icon: User },
  customer: { label: '고객', color: 'text-green-600', bg: 'bg-green-100', icon: Users },
  kakao: { label: '카카오', color: 'text-yellow-600', bg: 'bg-yellow-100', icon: MessageSquare },
  api: { label: 'API', color: 'text-purple-600', bg: 'bg-purple-100', icon: Server },
  database: { label: 'DB', color: 'text-slate-600', bg: 'bg-slate-100', icon: Database },
  openai: { label: 'OpenAI', color: 'text-emerald-600', bg: 'bg-emerald-100', icon: Workflow },
}

const useCases: UseCase[] = [
  {
    id: 'onboarding',
    title: '기사 온보딩',
    icon: UserPlus,
    description: '신규 기사가 카카오 채널을 통해 가입하는 플로우',
    steps: [
      { from: 'technician', to: 'kakao', message: '채널 추가 / 첫 메시지' },
      { from: 'kakao', to: 'api', message: 'webhook 전송' },
      { from: 'api', to: 'database', message: '기사 조회 (없음)' },
      { from: 'api', to: 'kakao', message: '"성함을 입력해주세요"' },
      { from: 'technician', to: 'kakao', message: '"홍길동"' },
      { from: 'api', to: 'kakao', message: '"서비스 종류는?"' },
      { from: 'technician', to: 'kakao', message: '"에어컨청소"' },
      { from: 'api', to: 'kakao', message: '"휴대폰 번호는?"' },
      { from: 'technician', to: 'kakao', message: '"010-1234-5678"' },
      { from: 'api', to: 'database', message: 'INSERT technician', highlight: true },
      { from: 'api', to: 'kakao', message: '"가입 완료! 🎉"', highlight: true },
    ],
    result: 'technician 레코드 생성, trial 상태로 시작',
  },
  {
    id: 'register',
    title: '고객 등록',
    icon: Smartphone,
    description: '기사가 고객 전화번호와 서비스를 입력하여 예약 시작',
    steps: [
      { from: 'technician', to: 'kakao', message: '"010-9876-5432 에어컨청소"' },
      { from: 'kakao', to: 'api', message: 'webhook (intake)' },
      { from: 'api', to: 'database', message: '기사 확인' },
      { from: 'api', to: 'database', message: '고객 생성/조회' },
      { from: 'api', to: 'database', message: '예약 생성 (collecting)', highlight: true },
      { from: 'api', to: 'kakao', message: '"신규 고객 등록 완료! 📱"' },
      { from: 'kakao', to: 'customer', message: '"일정을 알려주세요"', highlight: true, note: '알림톡 발송' },
    ],
    result: 'customer + booking 레코드 생성, 고객에게 알림톡 발송',
  },
  {
    id: 'schedule',
    title: '고객 일정 입력',
    icon: Calendar,
    description: '고객이 자연어로 희망 일정을 입력하면 LLM이 파싱',
    steps: [
      { from: 'customer', to: 'kakao', message: '"내일 오후 2시, 모레 오전 10시"' },
      { from: 'kakao', to: 'api', message: 'webhook (schedule)' },
      { from: 'api', to: 'database', message: '고객/예약 조회' },
      { from: 'api', to: 'openai', message: 'LLM 파싱 요청', highlight: true, note: 'gpt-4o-mini' },
      { from: 'openai', to: 'api', message: 'slots: [2/1 14:00, 2/2 10:00]' },
      { from: 'api', to: 'database', message: '예약 업데이트 (confirming)', highlight: true },
      { from: 'api', to: 'kakao', message: '"일정 확인! 기사님께 전달 중"' },
      { from: 'kakao', to: 'technician', message: '"📅 새 예약 요청\\n1. 2/1 14:00\\n2. 2/2 10:00"', highlight: true, note: '알림톡' },
    ],
    result: 'proposed_slots 저장, 기사에게 선택 요청',
  },
  {
    id: 'confirm',
    title: '기사 확정',
    icon: CheckCircle,
    description: '기사가 번호를 선택하여 예약 확정',
    steps: [
      { from: 'technician', to: 'kakao', message: '"1번"' },
      { from: 'kakao', to: 'api', message: 'webhook (confirm)' },
      { from: 'api', to: 'database', message: '기사/예약 조회' },
      { from: 'api', to: 'database', message: '예약 업데이트 (confirmed)', highlight: true },
      { from: 'api', to: 'kakao', message: '"예약 확정! 📅 2/1 14:00"' },
      { from: 'kakao', to: 'customer', message: '"🎉 예약 확정!\\n2/1(토) 14:00\\n홍길동 기사님"', highlight: true, note: '확정 알림톡' },
    ],
    result: 'confirmed_slot 저장, 양측에 확정 알림',
  },
  {
    id: 'command',
    title: '목록 조회',
    icon: List,
    description: '기사가 오늘 일정이나 예약 목록 조회',
    steps: [
      { from: 'technician', to: 'kakao', message: '"오늘 일정"' },
      { from: 'kakao', to: 'api', message: 'webhook (command)' },
      { from: 'api', to: 'database', message: '기사 확인' },
      { from: 'api', to: 'database', message: '오늘 예약 조회 (confirmed)', highlight: true },
      { from: 'api', to: 'kakao', message: '"📅 오늘 일정 (3건)\\n1. 09:00 김철수\\n2. 14:00 이영희..."', highlight: true },
    ],
    result: '예약 리스트 반환',
  },
]

export default function UseCaseFlow() {
  const [activeCase, setActiveCase] = useState<string | null>(null)

  return (
    <div className="bg-white rounded-3xl shadow-soft border border-slate-100 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-cyan-500 to-teal-500 p-5">
        <div className="flex items-center gap-3 text-white">
          <Workflow className="w-6 h-6" />
          <div>
            <h2 className="font-bold text-lg">서비스 플로우</h2>
            <p className="text-white/80 text-sm">유즈케이스별 시퀀스 다이어그램</p>
          </div>
        </div>
      </div>

      {/* Actor Legend */}
      <div className="p-4 border-b border-slate-100 bg-slate-50/50">
        <div className="flex flex-wrap gap-2 justify-center">
          {Object.entries(actorConfig).map(([key, config]) => {
            const Icon = config.icon
            return (
              <div key={key} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full ${config.bg}`}>
                <Icon className={`w-3.5 h-3.5 ${config.color}`} />
                <span className={`text-xs font-medium ${config.color}`}>{config.label}</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Use Cases */}
      <div className="divide-y divide-slate-100">
        {useCases.map((useCase) => {
          const Icon = useCase.icon
          const isActive = activeCase === useCase.id

          return (
            <div key={useCase.id}>
              {/* Accordion Header */}
              <button
                onClick={() => setActiveCase(isActive ? null : useCase.id)}
                className="w-full p-4 flex items-center gap-3 hover:bg-slate-50 transition-colors text-left"
              >
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-100 to-teal-100 flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5 text-teal-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-slate-800">{useCase.title}</h3>
                  <p className="text-sm text-slate-500 truncate">{useCase.description}</p>
                </div>
                <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${isActive ? 'rotate-180' : ''}`} />
              </button>

              {/* Accordion Content */}
              <AnimatePresence>
                {isActive && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 pb-4">
                      {/* Flow Diagram */}
                      <div className="bg-slate-50 rounded-2xl p-4 space-y-2">
                        {useCase.steps.map((step, index) => (
                          <FlowStepItem
                            key={index}
                            step={step}
                            index={index}
                            total={useCase.steps.length}
                          />
                        ))}
                      </div>

                      {/* Result */}
                      <div className="mt-3 p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                          <span className="text-sm text-emerald-700 font-medium">결과:</span>
                          <span className="text-sm text-emerald-600">{useCase.result}</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )
        })}
      </div>

      {/* State Diagram */}
      <div className="p-4 border-t border-slate-100 bg-slate-50/50">
        <h4 className="text-sm font-semibold text-slate-600 mb-3 text-center">예약 상태 전이도</h4>
        <div className="flex items-center justify-center gap-2 flex-wrap">
          <StatusBadge status="collecting" label="일정수집" />
          <ArrowRight className="w-4 h-4 text-slate-400" />
          <StatusBadge status="confirming" label="기사확인" />
          <ArrowRight className="w-4 h-4 text-slate-400" />
          <StatusBadge status="confirmed" label="확정" />
          <ArrowRight className="w-4 h-4 text-slate-400" />
          <StatusBadge status="completed" label="완료" />
        </div>
        <p className="text-xs text-slate-400 text-center mt-2">※ 각 단계에서 타임아웃 시 → cancelled</p>
      </div>
    </div>
  )
}

function FlowStepItem({ step, index, total }: { step: FlowStep; index: number; total: number }) {
  const fromConfig = actorConfig[step.from]
  const toConfig = actorConfig[step.to]
  const FromIcon = fromConfig.icon
  const ToIcon = toConfig.icon

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      className={`
        flex items-center gap-2 p-2 rounded-xl
        ${step.highlight ? 'bg-amber-50 border border-amber-200' : 'bg-white border border-slate-100'}
      `}
    >
      {/* From Actor */}
      <div className={`flex items-center gap-1 px-2 py-1 rounded-lg ${fromConfig.bg} shrink-0`}>
        <FromIcon className={`w-3 h-3 ${fromConfig.color}`} />
        <span className={`text-xs font-medium ${fromConfig.color}`}>{fromConfig.label}</span>
      </div>

      {/* Arrow */}
      <ArrowRight className={`w-4 h-4 shrink-0 ${step.highlight ? 'text-amber-500' : 'text-slate-300'}`} />

      {/* To Actor */}
      <div className={`flex items-center gap-1 px-2 py-1 rounded-lg ${toConfig.bg} shrink-0`}>
        <ToIcon className={`w-3 h-3 ${toConfig.color}`} />
        <span className={`text-xs font-medium ${toConfig.color}`}>{toConfig.label}</span>
      </div>

      {/* Message */}
      <div className="flex-1 min-w-0 ml-2">
        <span className={`text-sm ${step.highlight ? 'text-amber-800 font-medium' : 'text-slate-600'}`}>
          {step.message}
        </span>
        {step.note && (
          <span className="ml-2 text-xs text-slate-400">({step.note})</span>
        )}
      </div>

      {/* Step Number */}
      <span className="text-xs text-slate-400 shrink-0">{index + 1}/{total}</span>
    </motion.div>
  )
}

function StatusBadge({ status, label }: { status: string; label: string }) {
  const colors: Record<string, string> = {
    collecting: 'bg-amber-100 text-amber-700 border-amber-200',
    confirming: 'bg-blue-100 text-blue-700 border-blue-200',
    confirmed: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    completed: 'bg-slate-100 text-slate-700 border-slate-200',
  }

  return (
    <span className={`px-3 py-1.5 rounded-lg text-xs font-medium border ${colors[status]}`}>
      {label}
    </span>
  )
}
