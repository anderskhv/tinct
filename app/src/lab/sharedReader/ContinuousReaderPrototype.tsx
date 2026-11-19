import type * as React from 'react'
import { LabPassage } from '../LabPassage'
import { continuousReaderWindow, type ContinuousReaderAnchor, type ContinuousReaderLimits } from './continuousReaderWindow'

type PassageProps = React.ComponentProps<typeof LabPassage>
type StructuralProps = Pick<PassageProps, 'chapterTitle' | 'paragraphs'> & Partial<Pick<PassageProps,
  'chapterNumber' | 'footnotes' | 'onFootnote' | 'onOpenFigure' | 'highlights' | 'selectingRange' | 'onSelectRange'
>>

export interface ContinuousReaderPrototypeProps {
  passage: StructuralProps
  anchor: ContinuousReaderAnchor
  limits?: ContinuousReaderLimits
}

/** Isolated one-chapter layout experiment; its parent owns source registration and all persistence. */
export function ContinuousReaderPrototype({ passage, anchor, limits }: ContinuousReaderPrototypeProps) {
  const window = continuousReaderWindow(passage.paragraphs, anchor, limits)
  if (!window) return null
  return <div data-testid="continuous-reader-prototype" data-window-first={window.firstParagraph} data-window-last={window.lastParagraph}>
    <LabPassage
      {...passage}
      readingPage={window.page}
      compareParagraphs={[]}
      compare={false}
      mode="reading"
      follow={{ kind: 'none' }}
      followParagraphs={[]}
      markedIndexes={new Set<number>()}
      desktopSpread={false}
      plannedHyphens={false}
      tapZones="none"
    />
  </div>
}
