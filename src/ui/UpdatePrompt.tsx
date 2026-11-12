import { useRegisterSW } from 'virtual:pwa-register/react'

/**
 * Registers the service worker and tells the player two things: the game can
 * now be played offline, and a newer version is waiting. The new version only
 * takes over when the player asks, so a reload never surprises a game in
 * progress (the save carries over either way).
 */
export function UpdatePrompt() {
  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW()

  if (!offlineReady && !needRefresh) return null

  return (
    <div className="update-toast" role="status" aria-live="polite">
      <p>
        {needRefresh
          ? 'A new version of the game is ready.'
          : 'Ready to play offline.'}
      </p>
      <div className="update-actions">
        {needRefresh ? (
          <button
            className="btn small primary"
            onClick={() => updateServiceWorker(true)}
            type="button"
          >
            Reload
          </button>
        ) : null}
        <button
          className="btn small"
          onClick={() => {
            setOfflineReady(false)
            setNeedRefresh(false)
          }}
          type="button"
        >
          {needRefresh ? 'Later' : 'OK'}
        </button>
      </div>
    </div>
  )
}
