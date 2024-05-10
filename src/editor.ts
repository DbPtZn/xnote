import { Adapter } from '@textbus/adapter-viewfly'
import { createApp } from '@viewfly/platform-browser'
import { BrowserModule, Parser } from '@textbus/platform-browser'
import { CollaborateConfig, CollaborateModule } from '@textbus/collaborate'
import { Component, ContentType, Module, Slot, Textbus } from '@textbus/core'

import {
  BlockquoteView,
  blockquoteComponentLoader,
  HighlightBoxView,
  highlightBoxComponentLoader,
  ListComponentView,
  ParagraphView,
  paragraphComponentLoader,
  RootView,
  rootComponentLoader,
  SourceCodeView,
  sourceCodeComponentLoader,
  tableComponentLoader,
  TableComponentView,
  TodolistView,
  todolistComponentLoader,
  listComponentLoader,
  ParagraphComponent,
  RootComponent,
  BlockquoteComponent,
  TodolistComponent,
  SourceCodeComponent,
  TableComponent,
  HighlightBoxComponent,
  ListComponent,
  ImageComponent,
  ImageView,
  imageComponentLoader, videoComponentLoader, VideoComponent, VideoView
} from './textbus/components/_api'
import { ToolbarPlugin } from './plugins/_api'
import { LeftToolbarService } from './services/_api'
import {
  backgroundColorFormatLoader,
  backgroundColorFormatter,
  boldFormatLoader,
  boldFormatter,
  codeFormatLoader,
  codeFormatter,
  colorFormatLoader,
  colorFormatter,
  fontFamilyFormatLoader,
  fontFamilyFormatter,
  fontSizeFormatLoader,
  fontSizeFormatter,
  italicFormatLoader,
  italicFormatter,
  linkFormatLoader,
  linkFormatter,
  registerBoldShortcut,
  registerCodeShortcut,
  registerItalicShortcut,
  registerStrikeThroughShortcut,
  registerUnderlineShortcut,
  strikeThroughFormatLoader,
  strikeThroughFormatter,
  underlineFormatLoader,
  underlineFormatter
} from './textbus/formatters/_api'
import './textbus/doc.scss'
import { headingAttr, headingAttrLoader, registerHeadingShortcut } from './textbus/attributes/heading.attr'
import { registerTextAlignShortcut, textAlignAttr, textAlignAttrLoader } from './textbus/attributes/text-align.attr'
import { registerTextIndentShortcut, textIndentAttr, textIndentAttrLoader } from './textbus/attributes/text-indent.attr'

export interface XNoteConfig {
  content?: string,
  collaborateConfig?: CollaborateConfig
}

export async function createXNote(host: HTMLElement, config: XNoteConfig = {}) {
  const adapter = new Adapter({
    [ParagraphComponent.componentName]: ParagraphView,
    [RootComponent.componentName]: RootView,
    [BlockquoteComponent.componentName]: BlockquoteView,
    [TodolistComponent.componentName]: TodolistView,
    [SourceCodeComponent.componentName]: SourceCodeView,
    [TableComponent.componentName]: TableComponentView,
    [HighlightBoxComponent.componentName]: HighlightBoxView,
    [ListComponent.componentName]: ListComponentView,
    [ImageComponent.componentName]: ImageView,
    [VideoComponent.componentName]: VideoView
  }, (host, root) => {
    const app = createApp(root, {
      context: textbus
    }).mount(host)
    return () => {
      app.destroy()
    }
  })
  const browserModule = new BrowserModule({
    renderTo(): HTMLElement {
      return host
    },
    adapter,
    componentLoaders: [
      highlightBoxComponentLoader,
      blockquoteComponentLoader,
      paragraphComponentLoader,
      sourceCodeComponentLoader,
      todolistComponentLoader,
      tableComponentLoader,
      listComponentLoader,
      imageComponentLoader,
      videoComponentLoader
    ],
    formatLoaders: [
      backgroundColorFormatLoader,
      boldFormatLoader,
      codeFormatLoader,
      colorFormatLoader,
      fontFamilyFormatLoader,
      fontSizeFormatLoader,
      italicFormatLoader,
      linkFormatLoader,
      strikeThroughFormatLoader,
      underlineFormatLoader
    ],
    attributeLoaders: [
      headingAttrLoader,
      textAlignAttrLoader,
      textIndentAttrLoader
    ]
  })

  const modules: Module[] = [browserModule]
  if(config.collaborateConfig) {
    modules.push(new CollaborateModule(config.collaborateConfig))
  }

  const textbus = new Textbus({
    zenCoding: true,
    imports: modules,
    components: [
      ImageComponent,
      ParagraphComponent,
      RootComponent,
      BlockquoteComponent,
      TodolistComponent,
      SourceCodeComponent,
      TableComponent,
      HighlightBoxComponent,
      ListComponent,
      VideoComponent
    ],
    formatters: [
      backgroundColorFormatter,
      boldFormatter,
      codeFormatter,
      colorFormatter,
      fontFamilyFormatter,
      fontSizeFormatter,
      italicFormatter,
      linkFormatter,
      strikeThroughFormatter,
      underlineFormatter
    ],
    attributes: [
      headingAttr,
      textAlignAttr,
      textIndentAttr
    ],
    providers: [
      LeftToolbarService
    ],
    plugins: [
      // new LeftToolbarPlugin(),
      new ToolbarPlugin(),
    ],
    onAfterStartup(textbus: Textbus) {
      registerBoldShortcut(textbus)
      registerCodeShortcut(textbus)
      registerItalicShortcut(textbus)
      registerStrikeThroughShortcut(textbus)
      registerUnderlineShortcut(textbus)

      registerHeadingShortcut(textbus)
      registerTextAlignShortcut(textbus)
      registerTextIndentShortcut(textbus)
    }
  })
  let rootComp: Component
  if (config.content) {
    const parser = textbus.get(Parser)
    const doc = parser.parseDoc(config.content, rootComponentLoader)
    rootComp = doc instanceof Component ? doc : new RootComponent(textbus, {
      heading: new Slot([ContentType.Text]),
      content: doc as Slot
    })
  } else {
    rootComp = new RootComponent(textbus, {
      heading: new Slot([ContentType.Text]),
      content: new Slot([ContentType.Text, ContentType.InlineComponent, ContentType.BlockComponent])
    })
  }
  await textbus.render(rootComp)
  console.log(rootComp)
  return textbus
}
