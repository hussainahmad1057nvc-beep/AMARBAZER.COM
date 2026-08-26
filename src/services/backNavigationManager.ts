/**
 * Comprehensive Android Hardware & Browser Back Button Manager for AmarBazar.
 * Handles single-step back navigation for:
 * 1. Product Detail Modal
 * 2. Cart Drawer
 * 3. Payment / Checkout Modal
 * 4. Auth & Biometric Modals
 * 5. AI Assistant & Order Tracking Modals
 * 6. Product Share & Media Modals
 * 7. Mobile Chat Active Thread
 * 8. Search Queries & Category Filters
 * 9. Sub-panels (Seller, Admin, Profile, Settings, etc.)
 * 10. Double-tap to exit on Root Storefront with Toast notification.
 */

export interface BackHandler {
  id: string;
  priority: number; // Higher number = higher priority
  handler: () => boolean; // Return true if handled, false to delegate down
}

type ToastCallback = (message: string, durationMs?: number) => void;

class BackNavigationManager {
  private handlers: BackHandler[] = [];
  private lastBackPressTime = 0;
  private isInitialized = false;
  private isPoppingProgrammatically = false;
  private toastCallback: ToastCallback | null = null;
  private currentLanguage: string = 'bn';
  private exitToastTimeout: any = null;

  public setLanguage(lang: string) {
    this.currentLanguage = lang;
  }

  public setToastCallback(cb: ToastCallback | null) {
    this.toastCallback = cb;
  }

  /**
   * Register a custom back-button handler (e.g. from an inner modal or component)
   */
  public registerHandler(id: string, handler: () => boolean, priority = 10): () => void {
    // Remove if already exists
    this.handlers = this.handlers.filter(h => h.id !== id);
    this.handlers.push({ id, priority, handler });
    // Sort descending by priority
    this.handlers.sort((a, b) => b.priority - a.priority);

    return () => {
      this.unregisterHandler(id);
    };
  }

  public unregisterHandler(id: string) {
    this.handlers = this.handlers.filter(h => h.id !== id);
  }

  /**
   * Push a history step to the browser's history stack so Android back button triggers popstate
   */
  public pushStep(stepName: string, metadata?: any) {
    try {
      const state = {
        amarbazar: true,
        step: stepName,
        meta: metadata || {},
        time: Date.now()
      };
      window.history.pushState(state, '');
    } catch (e) {
      console.warn('History pushState error:', e);
    }
  }

  /**
   * Programmatically revert history state when user clicks on-screen (✕) close button
   */
  public popStep() {
    try {
      this.isPoppingProgrammatically = true;
      window.history.back();
      setTimeout(() => {
        this.isPoppingProgrammatically = false;
      }, 100);
    } catch (e) {
      this.isPoppingProgrammatically = false;
    }
  }

  /**
   * Main dispatcher executed when Hardware / Virtual Back Button or Browser Back is triggered
   */
  public handleBackAction(): boolean {
    // 1. Run through registered custom handlers (highest priority first)
    for (const item of this.handlers) {
      try {
        const handled = item.handler();
        if (handled) {
          return true;
        }
      } catch (err) {
        console.warn(`Error in back handler ${item.id}:`, err);
      }
    }

    // 2. If nothing was handled, we are at root storefront
    const now = Date.now();
    if (now - this.lastBackPressTime < 2500) {
      // User pressed back again within 2.5 seconds -> allow exit
      return false;
    } else {
      this.lastBackPressTime = now;
      const msg = this.currentLanguage === 'bn' 
        ? 'ওয়েবসাইট / অ্যাপ থেকে বের হতে আরেকবার ব্যাক বাটন চাপুন' 
        : 'Press BACK again to exit';
      
      if (this.toastCallback) {
        this.toastCallback(msg, 2500);
      }

      // Re-push state so user doesn't accidentally exit on the first press
      try {
        window.history.pushState({ amarbazar: true, step: 'root_guard', time: Date.now() }, '');
      } catch (e) {}

      return true;
    }
  }

  /**
   * Initialize Popstate listener for Mobile & Desktop Web Browsers
   */
  public initBrowserBackHandling() {
    if (this.isInitialized) return;
    this.isInitialized = true;

    // Initialize root guard state so initial page has a back buffer
    try {
      if (!window.history.state || !window.history.state.amarbazar) {
        window.history.replaceState({ amarbazar: true, step: 'root', time: Date.now() }, '');
        window.history.pushState({ amarbazar: true, step: 'main', time: Date.now() }, '');
      }
    } catch (e) {}

    window.addEventListener('popstate', (event) => {
      if (this.isPoppingProgrammatically) {
        this.isPoppingProgrammatically = false;
        return;
      }

      const wasHandled = this.handleBackAction();
      if (!wasHandled) {
        // Allow native back / exit
        try {
          window.history.back();
        } catch (e) {}
      }
    });
  }
}

export const backNavigationManager = new BackNavigationManager();
