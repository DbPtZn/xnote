import {
  ComponentInstance,
  ContentType,
  defineComponent, fromEvent,
  Injector,
  onBreak, onCompositionStart,
  onContentInsert, onDestroy,
  onSlotRemove, onViewInit, Renderer,
  Selection,
  Slot, Subscription,
  useContext, useRef, useSelf,
  useSlots
} from '@textbus/core'
import { ComponentLoader, SlotParser } from '@textbus/platform-browser'

import './root.component.scss'
import { paragraphComponent } from '@/textbus/components/paragraph/paragraph.component'
import { LeftToolbarService } from '@/services/left-toolbar.service'

export const rootComponent = defineComponent({
  name: 'RootComponent',
  type: ContentType.BlockComponent,
  setup() {
    const injector = useContext()
    const selection = injector.get(Selection)
    const slots = useSlots([
      new Slot([
        ContentType.Text
      ]),
      new Slot([
        ContentType.BlockComponent,
        ContentType.InlineComponent,
        ContentType.Text
      ])
    ])

    onSlotRemove(ev => {
      ev.preventDefault()
    })

    onBreak(ev => {
      if (ev.target === slots.get(0)!) {
        const afterContentDelta = ev.target.cut(ev.data.index).toDelta()
        const p = paragraphComponent.createInstance(injector)
        const slot = p.slots.get(0)!
        slot.insertDelta(afterContentDelta)
        const body = slots.get(1)!
        body.retain(0)
        body.insert(p)
        selection.setPosition(slot, 0)
        ev.preventDefault()
      }
    })

    onContentInsert(ev => {
      if (ev.target === slots.get(1) && (typeof ev.data.content === 'string' || ev.data.content.type !== ContentType.BlockComponent)) {
        const p = paragraphComponent.createInstance(injector)
        const slot = p.slots.get(0)!
        slot.insert(ev.data.content)
        ev.target.insert(p)
        selection.setPosition(slot, slot.index)
        ev.preventDefault()
      }
    })

    const titleRef = useRef<HTMLElement>()
    const contentRef = useRef<HTMLElement>()
    onCompositionStart(ev => {
      if (ev.target === slots.get(0)) {
        titleRef.current!.dataset.placeholder = ''
      } else {
        contentRef.current!.dataset.placeholder = ''
      }
    })

    const subscription = new Subscription()
    const renderer = injector.get(Renderer)
    const leftToolbarService = injector.get(LeftToolbarService)
    const self = useSelf()
    onViewInit(() => {
      subscription.add(
        fromEvent<MouseEvent>(contentRef.current!, 'mousemove').subscribe((ev) => {
          let currentNode = ev.target as Node | null
          while (currentNode) {
            const locationByNativeNode = renderer.getLocationByNativeNode(currentNode)
            const componentInstance = locationByNativeNode?.slot.parent
            if (componentInstance) {
              leftToolbarService.updateActivatedComponent(componentInstance === self ? null : componentInstance)
              break
            }
            currentNode = currentNode.parentNode
          }
        })
      )
    })

    onDestroy(() => {
      subscription.unsubscribe()
    })

    return {
      render(slotRender) {
        return (
          <div class="xnote-root">
            {
              slotRender(slots.get(0)!, children => {
                return (
                  <div ref={titleRef as any}
                       class="xnote-title"
                       data-placeholder={slots.get(0)?.isEmpty ? '请输入标题' : ''}
                  >{children}</div>
                )
              })
            }
            {
              slotRender(slots.get(1)!, children => {
                return (
                  <div ref={contentRef as any}
                       class="xnote-content"
                       data-placeholder={slots.get(1)?.isEmpty ? '请输入内容' : ''}
                  >{children}</div>
                )
              })
            }
          </div>
        )
      }
    }
  }
})

export const rootComponentLoader: ComponentLoader = {
  match(element: HTMLElement): boolean {
    return true
  },
  read(element: HTMLElement, injector: Injector, slotParser: SlotParser): ComponentInstance | Slot {
    return rootComponent.createInstance(injector)
  }
}
