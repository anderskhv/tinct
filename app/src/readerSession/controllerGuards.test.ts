import { describe, expect, it } from 'vitest'
import type { ReadingPosition } from '../types'
import {
  getCloudRestoreWinner,
  getLocalFirstCloudAdoption,
  isCloudPositionConfirmedLocally,
  paragraphTargetFromPosition,
  pickLatestPosition,
  shouldApplyRemotePosition,
  shouldHoldReaderForCloudRestore,
} from './controllerGuards'

function position(patch: Partial<ReadingPosition> = {}): ReadingPosition {
  return {
    bookId: 'war-and-peace',
    chapterNumber: 10,
    currentPage: 3,
    totalPages: 12,
    scrollFraction: 0.42,
    updatedAt: 1_777_300_000_000,
    lastParagraphIndex: 18,
    ...patch,
  }
}

describe('shouldHoldReaderForCloudRestore', () => {
  it('holds all readers until storage is ready', () => {
    expect(shouldHoldReaderForCloudRestore({
      storageReady: false,
      isSignedIn: false,
      cloudRestoreSettled: true,
    })).toBe(true)
  })

  it('keeps signed-in startup on the loading shell until cloud restore settles', () => {
    expect(shouldHoldReaderForCloudRestore({
      storageReady: true,
      isSignedIn: true,
      cloudRestoreSettled: false,
    })).toBe(true)
  })

  it('allows anonymous readers once local storage is ready', () => {
    expect(shouldHoldReaderForCloudRestore({
      storageReady: true,
      isSignedIn: false,
      cloudRestoreSettled: false,
    })).toBe(false)
  })

  it('allows signed-in readers after cloud restore settles', () => {
    expect(shouldHoldReaderForCloudRestore({
      storageReady: true,
      isSignedIn: true,
      cloudRestoreSettled: true,
    })).toBe(false)
  })
})

describe('isCloudPositionConfirmedLocally', () => {
  it('confirms late cloud restore when local-first state is already at the same book and position', () => {
    expect(isCloudPositionConfirmedLocally({
      localPos: position({ scrollFraction: 0.4204 }),
      cloudPos: position({ scrollFraction: 0.42 }),
      currentBookId: 'war-and-peace',
      targetBookId: 'war-and-peace',
    })).toBe(true)
  })

  it('requires cloud correction when local-first rendered the same chapter too far away', () => {
    expect(isCloudPositionConfirmedLocally({
      localPos: position({ scrollFraction: 0.39 }),
      cloudPos: position({ scrollFraction: 0.42 }),
      currentBookId: 'war-and-peace',
      targetBookId: 'war-and-peace',
    })).toBe(false)
  })

  it('requires cloud correction when the current book is still stale', () => {
    expect(isCloudPositionConfirmedLocally({
      localPos: position(),
      cloudPos: position(),
      currentBookId: 'anna-karenina',
      targetBookId: 'war-and-peace',
    })).toBe(false)
  })

  it('requires cloud correction when local position belongs to another book', () => {
    expect(isCloudPositionConfirmedLocally({
      localPos: position({ bookId: 'anna-karenina' }),
      cloudPos: position(),
      currentBookId: 'war-and-peace',
      targetBookId: 'war-and-peace',
    })).toBe(false)
  })
})

describe('getLocalFirstCloudAdoption', () => {
  it('does nothing until a cloud position exists', () => {
    expect(getLocalFirstCloudAdoption({
      localPos: position(),
      cloudPos: null,
      currentBookId: 'war-and-peace',
      targetBookId: 'war-and-peace',
    })).toEqual({ kind: 'none' })
  })

  it('confirms when late cloud matches the local-first reader state', () => {
    const cloudPos = position()
    expect(getLocalFirstCloudAdoption({
      localPos: position({ scrollFraction: 0.4204 }),
      cloudPos,
      currentBookId: 'war-and-peace',
      targetBookId: 'war-and-peace',
    })).toEqual({ kind: 'confirmed', position: cloudPos })
  })

  it('corrects when late cloud differs from local-first reader state', () => {
    const cloudPos = position({ chapterNumber: 12, scrollFraction: 0.7 })
    expect(getLocalFirstCloudAdoption({
      localPos: position({ chapterNumber: 10, scrollFraction: 0.42 }),
      cloudPos,
      currentBookId: 'war-and-peace',
      targetBookId: 'war-and-peace',
    })).toEqual({ kind: 'corrected', position: cloudPos })
  })
})

describe('getCloudRestoreWinner', () => {
  it('chooses cloud when it is newer than local', () => {
    const localPos = position({ chapterNumber: 8, updatedAt: 100 })
    const cloudPos = position({ chapterNumber: 10, updatedAt: 200 })
    expect(getCloudRestoreWinner({ localPos, cloudPos })).toBe(cloudPos)
  })

  it('chooses local when it is newer than cloud', () => {
    const localPos = position({ chapterNumber: 11, updatedAt: 300 })
    const cloudPos = position({ chapterNumber: 10, updatedAt: 200 })
    expect(getCloudRestoreWinner({ localPos, cloudPos })).toBe(localPos)
  })

  it('falls back to the furthest chapter when timestamps are missing', () => {
    const localPos = position({ chapterNumber: 11, updatedAt: undefined })
    const cloudPos = position({ chapterNumber: 10, updatedAt: undefined })
    expect(pickLatestPosition(localPos, cloudPos)).toBe(localPos)
  })
})

describe('paragraphTargetFromPosition', () => {
  it('uses positive paragraph anchors for cross-device adoption', () => {
    expect(paragraphTargetFromPosition(position({ lastParagraphIndex: 18 }))).toBe(18)
  })

  it('ignores missing, zero, and negative paragraph anchors', () => {
    expect(paragraphTargetFromPosition(position({ lastParagraphIndex: undefined }))).toBeUndefined()
    expect(paragraphTargetFromPosition(position({ lastParagraphIndex: 0 }))).toBeUndefined()
    expect(paragraphTargetFromPosition(position({ lastParagraphIndex: -1 }))).toBeUndefined()
  })
})

describe('shouldApplyRemotePosition', () => {
  it('applies same-book remote positions', () => {
    expect(shouldApplyRemotePosition({
      remoteBookId: 'war-and-peace',
      currentBookId: 'war-and-peace',
    })).toBe(true)
  })

  it('rejects stale remote positions from the previous book', () => {
    expect(shouldApplyRemotePosition({
      remoteBookId: 'war-and-peace',
      currentBookId: 'anna-karenina',
    })).toBe(false)
  })

  it('rejects malformed remote positions without a book id', () => {
    expect(shouldApplyRemotePosition({
      remoteBookId: undefined,
      currentBookId: 'war-and-peace',
    })).toBe(false)
  })
})
