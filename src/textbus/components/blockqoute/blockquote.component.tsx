import {
  ComponentInitData,
  ComponentInstance,
  ContentType, createVNode,
  defineComponent,
  Slot,
  useSlots,
} from '@textbus/core'
import { ComponentLoader, DomAdapter, SlotParser } from '@textbus/platform-browser'
import { ViewComponentProps } from '@textbus/adapter-viewfly'
import { inject, Injector } from '@viewfly/core'

import './blockquote.component.scss'

export const blockquoteComponent = defineComponent({
  type: ContentType.BlockComponent,
  name: 'BlockquoteComponent',
  zenCoding: {
    key: ' ',
    match: /^>$/,
    generateInitData() {
      return {
        slots: [new Slot([
          ContentType.Text,
          ContentType.InlineComponent,
          ContentType.BlockComponent
        ])]
      }
    }
  },
  setup(data?: ComponentInitData) {
    const slots = useSlots(data?.slots || [new Slot([
      ContentType.Text,
      ContentType.InlineComponent,
      ContentType.BlockComponent
    ])])
    if (!slots.length) {
      slots.push(new Slot([
        ContentType.Text,
        ContentType.InlineComponent,
        ContentType.BlockComponent
      ]))
    }
  }
})

export function Blockquote(props: ViewComponentProps<typeof blockquoteComponent>) {
  const adapter = inject(DomAdapter)
  return () => {
    const slot = props.component.slots.first!
    return adapter.slotRender(slot, children => {
      return createVNode('div', {
        class: 'xnote-blockquote',
        ref: props.rootRef
      }, children)
    })
  }
}

export const blockquoteComponentLoader: ComponentLoader = {
  match(element: HTMLElement): boolean {
    return element.tagName === 'BLOCKQUOTE'
  },
  read(element: HTMLElement, injector: Injector, slotParser: SlotParser): ComponentInstance {
    const slot = slotParser(new Slot([
      ContentType.Text,
      ContentType.BlockComponent,
      ContentType.InlineComponent
    ]), element)
    return blockquoteComponent.createInstance(injector, {
      slots: [slot]
    })
  },
}
