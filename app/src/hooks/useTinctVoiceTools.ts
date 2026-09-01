import { useCallback, useRef } from 'react'
import { TINCT_VOICE_TOOLS, TinctVoiceToolController, type TinctVoiceToolAdapter } from '../voice/tinctTools'
import type { VoiceApplicationToolHandler } from '../voice/types'

export function useTinctVoiceTools<ViewSnapshot>(adapter: TinctVoiceToolAdapter<ViewSnapshot>) {
  const adapterRef = useRef(adapter)
  adapterRef.current = adapter
  const controllerRef = useRef<TinctVoiceToolController<ViewSnapshot> | null>(null)
  if (!controllerRef.current) {
    controllerRef.current = new TinctVoiceToolController<ViewSnapshot>({
      getViewSnapshot: () => adapterRef.current.getViewSnapshot(),
      openView: view => adapterRef.current.openView(view),
      restoreView: snapshot => adapterRef.current.restoreView(snapshot),
      getTheme: () => adapterRef.current.getTheme(),
      setTheme: theme => adapterRef.current.setTheme(theme),
      getFontSize: () => adapterRef.current.getFontSize(),
      setFontSize: size => adapterRef.current.setFontSize(size),
      getAudioSpeed: () => adapterRef.current.getAudioSpeed(),
      setAudioSpeed: speed => adapterRef.current.setAudioSpeed(speed),
      getReadingHistory: (period, bookQuery) => adapterRef.current.getReadingHistory(period, bookQuery),
    })
  }

  const onTool: VoiceApplicationToolHandler = useCallback((name, args, callId) => {
    return controllerRef.current!.execute(name, args, callId)
  }, [])
  const resetUndo = useCallback(() => controllerRef.current!.resetUndo(), [])

  return { tools: TINCT_VOICE_TOOLS, onTool, resetUndo }
}
