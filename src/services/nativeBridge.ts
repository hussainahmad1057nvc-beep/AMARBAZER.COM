import { Capacitor } from '@capacitor/core';
import { App as CapApp } from '@capacitor/app';
import { StatusBar, Style } from '@capacitor/status-bar';
import { SplashScreen } from '@capacitor/splash-screen';
import { backNavigationManager } from './backNavigationManager';

export interface NativeBridgeContext {
  closeAnyOpenModal?: () => boolean;
  navigateToHome?: () => boolean;
  canGoBack?: () => boolean;
}

class NativeBridgeService {
  private isInitialized = false;

  /**
   * Check if running on Android native platform (Capacitor)
   */
  public isNative(): boolean {
    return Capacitor.isNativePlatform();
  }

  public getPlatform(): 'android' | 'ios' | 'web' {
    return Capacitor.getPlatform() as 'android' | 'ios' | 'web';
  }

  /**
   * Resolve API base URL for both Web and Android app.
   * On Web: defaults to '' (relative paths like /api/*).
   * On Android standalone APK/AAB: uses configured backend host or env variable.
   */
  public getApiBaseUrl(): string {
    const customUrl = localStorage.getItem('amarbazar_api_endpoint');
    if (customUrl && customUrl.trim().length > 0) {
      return customUrl.replace(/\/$/, '');
    }

    const metaEnv = (import.meta as any)?.env;
    if (metaEnv && metaEnv.VITE_API_URL) {
      return (metaEnv.VITE_API_URL as string).replace(/\/$/, '');
    }

    // Default to relative for Web and same-origin reverse proxies
    return '';
  }

  /**
   * Initialize native Android features (Status bar, Splash screen, Back button listener)
   */
  public async initNativeFeatures(callbacks?: NativeBridgeContext) {
    if (this.isInitialized) return;
    this.isInitialized = true;

    // Initialize Web / Browser popstate back button interceptor as well
    backNavigationManager.initBrowserBackHandling();

    if (this.isNative()) {
      try {
        // 1. Hide Splash Screen after React initializes
        await SplashScreen.hide();
      } catch (err) {
        console.warn('Native splash hide warning:', err);
      }

      try {
        // 2. Configure Android Status Bar
        await StatusBar.setStyle({ style: Style.Dark });
        await StatusBar.setBackgroundColor({ color: '#0f172a' });
      } catch (err) {
        console.warn('Native status bar setup warning:', err);
      }

      try {
        // 3. Setup Android Hardware Back Button via backNavigationManager
        CapApp.addListener('backButton', () => {
          const wasHandled = backNavigationManager.handleBackAction();
          if (!wasHandled) {
            // Exit native app on second back press
            CapApp.exitApp();
          }
        });
      } catch (err) {
        console.warn('Native backButton listener warning:', err);
      }
    }
  }
}

export const nativeBridge = new NativeBridgeService();

