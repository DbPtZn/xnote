import { withScopedCSS } from '@viewfly/scoped-css'
import { ButtonHTMLAttributes } from '@viewfly/platform-browser'
import { inject, onUnmounted, Props, useSignal } from '@viewfly/core'

import css from './button.scoped.scss'
import { DropdownService } from '../dropdown/dropdown'

export interface ButtonProps extends Props, ButtonHTMLAttributes<HTMLButtonElement> {
  highlight: boolean
  arrow?: boolean
}

export function Button(props: ButtonProps) {
  const dropdownService = inject(DropdownService, null)
  const isActive = useSignal(dropdownService?.isOpen || false)
  if (dropdownService) {
    const subscription = dropdownService.onOpenStateChange.subscribe(b => {
      isActive.set(b)
    })

    onUnmounted(() => {
      subscription.unsubscribe()
    })
  }
  return withScopedCSS(css, () => {
    return (
      <button type="button" class={[
        'btn',
        {
          active: isActive()
        }
      ]} {...props}>
        <span>
          {props.children}
        </span>
        {
          props.arrow && <span class={['btn-arrow', 'xnote-icon-arrow-bottom']}/>
        }
      </button>
    )
  })
}
