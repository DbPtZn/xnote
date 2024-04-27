import { Attribute, Commander, Keyboard, Textbus, VElement } from '@textbus/core'
import { AttributeLoader, AttributeLoaderReadResult } from '@textbus/platform-browser'

export const headingAttr = new Attribute<string>('Heading', {
  render(node: VElement, formatValue: string) {
    node.classes.add('xnote-' + formatValue)
  }
})

export const headingAttrLoader: AttributeLoader<string> = {
  match(element: HTMLElement): boolean {
    return /H[1-6]/.test(element.tagName)
  },
  read(element: HTMLElement): AttributeLoaderReadResult<string> {
    return {
      attribute: headingAttr,
      value: element.tagName.toLowerCase()
    }
  }
}

export function registerHeadingShortcut(textbus: Textbus) {
  const keyboard = textbus.get(Keyboard)
  const commander = textbus.get(Commander)

  keyboard.addShortcut({
    keymap: {
      key: '123456'.split(''),
      ctrlKey: true
    },
    action(key: string): boolean | void {
      commander.applyAttribute(headingAttr, 'h' + key)
    }
  })
}
