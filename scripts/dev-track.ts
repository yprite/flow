#!/usr/bin/env npx tsx

/**
 * Development Track CLI Tool
 *
 * This CLI allows Claude to manage development track tasks directly.
 * Safety: Only dev-* tasks can be modified. Preparation track is protected.
 *
 * Usage:
 *   npx tsx scripts/dev-track.ts <command> [args]
 *
 * Commands:
 *   list                              - List all development tasks
 *   status <task-id> <status>         - Update task status
 *   add "<title>" "<category>"        - Add new task
 *   milestone <phase-id> <milestone-id> - Complete a milestone
 *   help                              - Show this help
 */

import path from 'path'
import {
  loadData,
  saveData,
  updateDevTaskStatus,
  addDevTask,
  updateMilestoneStatus,
  getDevTrackSummary,
} from '../lib/cli-data-service'
import { TaskStatus } from '../lib/validation'

const BASE_PATH = path.resolve(__dirname, '..')

const STATUS_ICONS: Record<string, string> = {
  completed: '[x]',
  in_progress: '[>]',
  blocked: '[!]',
  pending: '[ ]',
}

const VALID_STATUSES: TaskStatus[] = ['pending', 'in_progress', 'completed', 'blocked']

function printHelp(): void {
  console.log(`
Development Track CLI - Claude의 개발 태스크 관리 도구

Usage:
  npx tsx scripts/dev-track.ts <command> [args]

Commands:
  list                                    개발 태스크 목록 조회
  status <task-id> <status>               태스크 상태 변경
    - status: pending, in_progress, completed, blocked
    - 예: status dev-1 completed

  add "<title>" "<category>" [options]    새 태스크 추가
    --blocked-by <id>                     의존성 설정
    --notes "<notes>"                     메모 추가
    - 예: add "OAuth 구현" "core-features"

  milestone <phase-id> <milestone-id>     마일스톤 완료
    - 예: milestone phase-1 m1

  help                                    도움말 표시

Examples:
  npx tsx scripts/dev-track.ts list
  npx tsx scripts/dev-track.ts status dev-1 in_progress
  npx tsx scripts/dev-track.ts status dev-1 completed
  npx tsx scripts/dev-track.ts add "카카오 로그인" "core-features"
  npx tsx scripts/dev-track.ts milestone phase-1 m2
`)
}

function printList(): void {
  const data = loadData(BASE_PATH)
  const summary = getDevTrackSummary(data)

  console.log(`\n=== Development Track ===`)
  console.log(`Progress: ${summary.completed}/${summary.total} (${summary.progress}%)`)
  console.log(`Status: ${summary.completed} completed, ${summary.inProgress} in_progress, ${summary.blocked} blocked, ${summary.pending} pending\n`)

  console.log('Tasks:')
  data.tracks.development.tasks.forEach(task => {
    const icon = STATUS_ICONS[task.status]
    const blockedInfo = task.blockedBy ? ` [blocked by: ${task.blockedBy}]` : ''
    console.log(`  ${icon} ${task.id}: ${task.title} (${task.category})${blockedInfo}`)
  })

  console.log('\nPhases:')
  data.phases.forEach(phase => {
    const completedCount = phase.milestones.filter(m => m.status === 'completed').length
    console.log(`  ${phase.id}: ${phase.name} (${completedCount}/${phase.milestones.length})`)
    phase.milestones.forEach(m => {
      const icon = m.status === 'completed' ? '[x]' : '[ ]'
      console.log(`    ${icon} ${m.id}: ${m.title}`)
    })
  })

  console.log('')
}

function updateStatus(taskId: string, status: string): void {
  if (!VALID_STATUSES.includes(status as TaskStatus)) {
    console.error(`ERROR: Invalid status "${status}". Valid: ${VALID_STATUSES.join(', ')}`)
    process.exit(1)
  }

  try {
    let data = loadData(BASE_PATH)
    data = updateDevTaskStatus(data, taskId, status as TaskStatus)
    saveData(data, BASE_PATH)

    // Reload to get accurate progress
    const savedData = loadData(BASE_PATH)
    const summary = getDevTrackSummary(savedData)
    console.log(`\nSUCCESS: Task ${taskId} status updated to '${status}'`)
    console.log(`Current progress: Development Track ${summary.completed}/${summary.total} (${summary.progress}%)\n`)
  } catch (error) {
    console.error(`ERROR: ${(error as Error).message}`)
    process.exit(1)
  }
}

function addTask(args: string[]): void {
  if (args.length < 2) {
    console.error('ERROR: Missing required arguments. Usage: add "<title>" "<category>"')
    process.exit(1)
  }

  const title = args[0]
  const category = args[1]
  let blockedBy: string | undefined
  let notes: string | undefined

  // Parse optional flags
  for (let i = 2; i < args.length; i++) {
    if (args[i] === '--blocked-by' && args[i + 1]) {
      blockedBy = args[i + 1]
      i++
    } else if (args[i] === '--notes' && args[i + 1]) {
      notes = args[i + 1]
      i++
    }
  }

  try {
    let data = loadData(BASE_PATH)
    data = addDevTask(data, { title, category, blockedBy, notes })
    saveData(data, BASE_PATH)

    // Reload to get accurate data
    const savedData = loadData(BASE_PATH)
    const newTask = savedData.tracks.development.tasks[savedData.tracks.development.tasks.length - 1]
    const summary = getDevTrackSummary(savedData)

    console.log(`\nSUCCESS: Added task ${newTask.id} "${title}" (${category})`)
    if (blockedBy) console.log(`  Blocked by: ${blockedBy}`)
    if (notes) console.log(`  Notes: ${notes}`)
    console.log(`Current progress: Development Track ${summary.completed}/${summary.total} (${summary.progress}%)\n`)
  } catch (error) {
    console.error(`ERROR: ${(error as Error).message}`)
    process.exit(1)
  }
}

function completeMilestone(phaseId: string, milestoneId: string): void {
  try {
    let data = loadData(BASE_PATH)
    data = updateMilestoneStatus(data, phaseId, milestoneId, 'completed')
    saveData(data, BASE_PATH)

    const phase = data.phases.find(p => p.id === phaseId)
    const milestone = phase?.milestones.find(m => m.id === milestoneId)

    console.log(`\nSUCCESS: Milestone "${milestone?.title}" marked as completed`)
    console.log(`Phase: ${phase?.name}\n`)
  } catch (error) {
    console.error(`ERROR: ${(error as Error).message}`)
    process.exit(1)
  }
}

// Main entry point
const args = process.argv.slice(2)
const command = args[0]

switch (command) {
  case 'list':
    printList()
    break

  case 'status':
    if (args.length < 3) {
      console.error('ERROR: Missing arguments. Usage: status <task-id> <status>')
      process.exit(1)
    }
    updateStatus(args[1], args[2])
    break

  case 'add':
    addTask(args.slice(1))
    break

  case 'milestone':
    if (args.length < 3) {
      console.error('ERROR: Missing arguments. Usage: milestone <phase-id> <milestone-id>')
      process.exit(1)
    }
    completeMilestone(args[1], args[2])
    break

  case 'help':
  case '--help':
  case '-h':
    printHelp()
    break

  default:
    if (command) {
      console.error(`ERROR: Unknown command "${command}"`)
    }
    printHelp()
    process.exit(command ? 1 : 0)
}
