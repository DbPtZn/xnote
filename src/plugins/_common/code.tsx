import { useProduce } from '@viewfly/hooks'
import { inject, onUnmounted } from '@viewfly/core'
import { Commander, Query, QueryStateType } from '@textbus/core'

import { Button } from '../../components/button/button'
import { RefreshService } from '../../services/refresh.service'
import { codeFormatter } from '../../textbus/formatters/_api'

export function Code() {
  const query = inject(Query)
  const refreshService = inject(RefreshService)
  const commander = inject(Commander)

  const [viewModel, update] = useProduce({
    highlight: false,
    disabled: false,
  })

  function toggle() {
    const state = query.queryFormat(codeFormatter)

    if (state.state === QueryStateType.Normal) {
      commander.applyFormat(codeFormatter, true)
    } else {
      commander.unApplyFormat(codeFormatter)
    }
  }

  const sub = refreshService.onRefresh.subscribe(() => {
    const state = query.queryFormat(codeFormatter)
    update(draft => {
      draft.highlight = state.state === QueryStateType.Enabled
    })
  })

  onUnmounted(() => {
    sub.unsubscribe()
  })

  return () => {
    const vm = viewModel()
    return <Button highlight={vm.highlight} disabled={vm.disabled} onClick={toggle}><span class="xnote-icon-code"></span></Button>
  }
}
