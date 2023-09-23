import { useProduce } from '@viewfly/hooks'
import { inject, onUnmounted } from '@viewfly/core'
import { Commander, Query, QueryStateType } from '@textbus/core'

import { Button } from '../../components/button/button'
import { RefreshService } from '../../services/refresh.service'
import { italicFormatter } from '../../textbus/formatters/_api'

export function ItalicTool() {
  const query = inject(Query)
  const refreshService = inject(RefreshService)
  const commander = inject(Commander)

  const [viewModel, update] = useProduce({
    highlight: false,
    disabled: false,
  })

  function toggle() {
    const state = query.queryFormat(italicFormatter)

    if (state.state === QueryStateType.Normal) {
      commander.applyFormat(italicFormatter, true)
    } else {
      commander.unApplyFormat(italicFormatter)
    }
  }

  const sub = refreshService.onRefresh.subscribe(() => {
    const state = query.queryFormat(italicFormatter)
    update(draft => {
      draft.highlight = state.state === QueryStateType.Enabled
    })
  })

  onUnmounted(() => {
    sub.unsubscribe()
  })

  return () => {
    const vm = viewModel()
    return <Button highlight={vm.highlight} disabled={vm.disabled} onClick={toggle}><span class="xnote-icon-italic"></span></Button>
  }
}
