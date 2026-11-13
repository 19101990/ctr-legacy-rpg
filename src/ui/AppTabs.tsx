import { useRef } from 'react'
import type { KeyboardEvent } from 'react'
import type { AppTab } from './constants'
import { BROTHER_COLORS, PANEL_ID, tabId } from './constants'
import { nextTab } from './helpers'
import type { BrotherId } from '../engine/types'

/**
 * The game sections as an ARIA tab list: one tab stop, arrow keys (and
 * Home/End) move between tabs, and the selected tab controls the panel.
 */
export function AppTabs({
  tabs,
  active,
  onSelect,
}: {
  tabs: readonly (readonly [AppTab, string])[]
  active: AppTab
  onSelect: (tab: AppTab) => void
}) {
  const refs = useRef<Partial<Record<AppTab, HTMLButtonElement | null>>>({})
  const order = tabs.map(([tab]) => tab)

  function onKeyDown(event: KeyboardEvent) {
    const target = nextTab(order, active, event.key)
    if (!target) return
    event.preventDefault()
    onSelect(target)
    refs.current[target]?.focus()
  }

  return (
    <div className="app-tabs" role="tablist" aria-label="Game sections" onKeyDown={onKeyDown}>
      {tabs.map(([tab, label]) => (
        <button
          aria-controls={PANEL_ID}
          aria-selected={active === tab}
          className={`app-tab${active === tab ? ' active' : ''}${tab === 'rules' ? ' app-tab-end' : ''}${tab in BROTHER_COLORS ? ` ${BROTHER_COLORS[tab as BrotherId]}` : ''}`}
          id={tabId(tab)}
          key={tab}
          onClick={() => onSelect(tab)}
          ref={(node) => {
            refs.current[tab] = node
          }}
          role="tab"
          tabIndex={active === tab ? 0 : -1}
          type="button"
        >
          {label}
        </button>
      ))}
    </div>
  )
}
