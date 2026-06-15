import { Component, type ErrorInfo, type ReactNode } from 'react'
import { StarLogo } from './Brand'

interface State {
  hasError: boolean
  message?: string
}

/**
 * Filet de sécurité : capture toute erreur de rendu pour éviter l'écran blanc.
 * Les réponses en cours sont autosauvegardées localement : un rechargement
 * restaure la session (tant que la durée n'est pas dépassée).
 */
export class ErrorBoundary extends Component<{ children: ReactNode }, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(err: unknown): State {
    return { hasError: true, message: err instanceof Error ? err.message : String(err) }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // Journalise pour diagnostic (console uniquement, aucune donnée envoyée).
    console.error('ErrorBoundary:', error, info.componentStack)
  }

  render() {
    if (!this.state.hasError) return this.props.children
    return (
      <div className="grid min-h-screen place-items-center bg-eb-cream p-6">
        <div className="eb-card w-full max-w-md p-8 text-center">
          <span className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-xl bg-navy">
            <StarLogo size={26} />
          </span>
          <h1 className="text-[20px] font-semibold text-navy">Une erreur est survenue</h1>
          <p className="mt-2 text-[14px] text-eb-muted">
            Vos réponses sont sauvegardées sur cet appareil. Rechargez la page pour reprendre l'examen là où vous en
            étiez.
          </p>
          <button onClick={() => window.location.reload()} className="eb-btn-primary mx-auto mt-5">
            Recharger la page
          </button>
          {this.state.message && (
            <p className="mt-4 break-words font-mono text-[11px] text-eb-muted/70">{this.state.message}</p>
          )}
        </div>
      </div>
    )
  }
}
