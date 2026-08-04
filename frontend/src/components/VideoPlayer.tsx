import { useEffect, useRef, useState, useCallback } from 'react'
import { formatClock } from '@/lib/format'

interface Props {
  src: string
  poster?: string | null
  startAt?: number
  onProgress?: (positionSeconds: number, durationSeconds: number) => void
}

const SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 2]

export default function VideoPlayer({ src, poster, startAt = 0, onProgress }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const controlsTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)
  const lastReported = useRef(0)

  const [playing, setPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [muted, setMuted] = useState(false)
  const [fullscreen, setFullscreen] = useState(false)
  const [showControls, setShowControls] = useState(true)
  const [speed, setSpeed] = useState(1)
  const [showSpeedMenu, setShowSpeedMenu] = useState(false)
  const [resumeApplied, setResumeApplied] = useState(false)

  const togglePlay = useCallback(() => {
    const v = videoRef.current
    if (!v) return
    if (v.paused) v.play()
    else v.pause()
  }, [])

  useEffect(() => {
    const v = videoRef.current
    if (!v) return

    const onLoadedMeta = () => {
      setDuration(v.duration)
      if (startAt > 0 && !resumeApplied) {
        v.currentTime = startAt
        setResumeApplied(true)
      }
    }
    const onTimeUpdate = () => {
      setProgress(v.currentTime)
      if (v.currentTime - lastReported.current > 10) {
        lastReported.current = v.currentTime
        onProgress?.(Math.floor(v.currentTime), Math.floor(v.duration || 0))
      }
    }
    const onEnded = () => onProgress?.(Math.floor(v.duration), Math.floor(v.duration))

    v.addEventListener('loadedmetadata', onLoadedMeta)
    v.addEventListener('timeupdate', onTimeUpdate)
    v.addEventListener('play', () => setPlaying(true))
    v.addEventListener('pause', () => setPlaying(false))
    v.addEventListener('ended', onEnded)

    return () => {
      v.removeEventListener('loadedmetadata', onLoadedMeta)
      v.removeEventListener('timeupdate', onTimeUpdate)
      v.removeEventListener('ended', onEnded)
    }
  }, [startAt, resumeApplied, onProgress])

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (!containerRef.current?.contains(document.activeElement) && document.activeElement !== document.body) return
      const v = videoRef.current
      if (!v) return
      if (e.code === 'Space') {
        e.preventDefault()
        togglePlay()
      } else if (e.code === 'ArrowRight') {
        v.currentTime += 10
      } else if (e.code === 'ArrowLeft') {
        v.currentTime -= 10
      } else if (e.code === 'KeyM') {
        setMuted((m) => !m)
      } else if (e.code === 'KeyF') {
        toggleFullscreen()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [togglePlay])

  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen()
      setFullscreen(true)
    } else {
      document.exitFullscreen()
      setFullscreen(false)
    }
  }

  function togglePip() {
    const v = videoRef.current
    if (!v) return
    if (document.pictureInPictureElement) {
      document.exitPictureInPicture()
    } else if (document.pictureInPictureEnabled) {
      v.requestPictureInPicture()
    }
  }

  function onSeek(e: React.ChangeEvent<HTMLInputElement>) {
    const v = videoRef.current
    if (!v) return
    v.currentTime = Number(e.target.value)
    setProgress(Number(e.target.value))
  }

  function onVolumeChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = Number(e.target.value)
    setVolume(val)
    if (videoRef.current) videoRef.current.volume = val
    setMuted(val === 0)
  }

  function changeSpeed(s: number) {
    setSpeed(s)
    if (videoRef.current) videoRef.current.playbackRate = s
    setShowSpeedMenu(false)
  }

  function resetControlsTimer() {
    setShowControls(true)
    if (controlsTimeout.current) clearTimeout(controlsTimeout.current)
    controlsTimeout.current = setTimeout(() => {
      if (playing) setShowControls(false)
    }, 2800)
  }

  return (
    <div
      ref={containerRef}
      className="group/player relative aspect-video w-full overflow-hidden bg-black"
      onMouseMove={resetControlsTimer}
      onTouchStart={resetControlsTimer}
      onClick={(e) => {
        if (e.target === videoRef.current) togglePlay()
      }}
    >
      <video
        ref={videoRef}
        src={src}
        poster={poster ?? undefined}
        muted={muted}
        playsInline
        className="h-full w-full"
      />

      {!playing && (
        <button
          onClick={togglePlay}
          className="absolute inset-0 grid place-items-center bg-black/20 transition"
          aria-label="Play"
        >
          <div className="grid h-16 w-16 place-items-center rounded-full bg-white/90 text-black">
            <svg viewBox="0 0 24 24" fill="currentColor" className="ml-1 h-7 w-7"><path d="M8 5v14l11-7z" /></svg>
          </div>
        </button>
      )}

      <div
        className={`absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent px-3 pb-2 pt-8 transition-opacity duration-300 sm:px-4 ${
          showControls ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <input
          type="range"
          min={0}
          max={duration || 0}
          value={progress}
          onChange={onSeek}
          className="mb-2 h-1.5 w-full cursor-pointer accent-[#ffb020]"
        />

        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-3 sm:gap-4">
            <button onClick={togglePlay} aria-label="Play/Pause">
              {playing ? (
                <svg viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6 text-white"><path d="M6 5h4v14H6zM14 5h4v14h-4z" /></svg>
              ) : (
                <svg viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6 text-white"><path d="M8 5v14l11-7z" /></svg>
              )}
            </button>

            <div className="hidden items-center gap-1.5 sm:flex">
              <button onClick={() => setMuted((m) => !m)} aria-label="Mute">
                {muted || volume === 0 ? (
                  <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5 text-white"><path d="M16.5 12A4.5 4.5 0 0 0 14 8v2.2l2.45 2.45c.03-.2.05-.43.05-.65zM19 12c0 .94-.2 1.82-.54 2.64l1.51 1.51A8.91 8.91 0 0 0 21 12c0-4.28-3-7.87-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3 3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06a8.99 8.99 0 0 0 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4 9.91 6.09 12 8.18V4z" /></svg>
                ) : (
                  <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5 text-white"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3A4.5 4.5 0 0 0 14 8v8a4.5 4.5 0 0 0 2.5-4zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4-.91 7-4.49 7-8.77s-3-7.86-7-8.77z" /></svg>
                )}
              </button>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={muted ? 0 : volume}
                onChange={onVolumeChange}
                className="h-1 w-20 cursor-pointer accent-[#ffb020]"
              />
            </div>

            <span className="text-xs text-white/90 sm:text-sm">
              {formatClock(progress)} / {formatClock(duration)}
            </span>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            <div className="relative">
              <button onClick={() => setShowSpeedMenu((s) => !s)} className="text-xs font-semibold text-white sm:text-sm">
                {speed}x
              </button>
              {showSpeedMenu && (
                <div className="absolute bottom-8 right-0 w-20 rounded-md border border-line bg-ink-soft py-1 shadow-xl">
                  {SPEEDS.map((s) => (
                    <button
                      key={s}
                      onClick={() => changeSpeed(s)}
                      className={`block w-full px-3 py-1.5 text-left text-xs ${s === speed ? 'text-marigold' : 'text-white/80'} hover:bg-white/5`}
                    >
                      {s}x
                    </button>
                  ))}
                </div>
              )}
            </div>

            {document.pictureInPictureEnabled && (
              <button onClick={togglePip} aria-label="Picture in picture" className="hidden sm:block">
                <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5 text-white"><path d="M19 7H9a2 2 0 0 0-2 2v.5h2V9h10v10H9v-1.5H7V19a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2zM3 5h12v2H5v10H3V5zm8 8h6v4h-6v-4z" /></svg>
              </button>
            )}

            <button onClick={toggleFullscreen} aria-label="Fullscreen">
              {fullscreen ? (
                <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5 text-white"><path d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z" /></svg>
              ) : (
                <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5 text-white"><path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z" /></svg>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
