// Google Identity Services (GSI) integration
// Free alternative to Firebase Auth

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: GoogleIdConfiguration) => void;
          prompt: (momentListener?: (notification: PromptMomentNotification) => void) => void;
          renderButton: (parent: HTMLElement, options: GsiButtonConfiguration) => void;
          disableAutoSelect: () => void;
          revoke: (email: string, callback: () => void) => void;
        };
      };
    };
  }
}

interface GoogleIdConfiguration {
  client_id: string;
  callback: (response: CredentialResponse) => void;
  auto_select?: boolean;
  cancel_on_tap_outside?: boolean;
  context?: 'signin' | 'signup' | 'use';
}

interface CredentialResponse {
  credential: string;
  select_by: string;
}

interface PromptMomentNotification {
  isDisplayMoment: () => boolean;
  isDisplayed: () => boolean;
  isNotDisplayed: () => boolean;
  getNotDisplayedReason: () => string;
  isSkippedMoment: () => boolean;
  getSkippedReason: () => string;
  isDismissedMoment: () => boolean;
  getDismissedReason: () => string;
  getMomentType: () => string;
}

interface GsiButtonConfiguration {
  type?: 'standard' | 'icon';
  theme?: 'outline' | 'filled_blue' | 'filled_black';
  size?: 'large' | 'medium' | 'small';
  text?: 'signin_with' | 'signup_with' | 'continue_with' | 'signin';
  shape?: 'rectangular' | 'pill' | 'circle' | 'square';
  logo_alignment?: 'left' | 'center';
  width?: number;
  locale?: string;
}

export interface GoogleUser {
  email: string;
  name: string;
  picture?: string;
  sub: string; // Google user ID
}

// Decode JWT token from Google
export function parseJwt(token: string): GoogleUser {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Error parsing JWT:', error);
    throw new Error('Invalid token');
  }
}

// Initialize Google Sign-In
export function initializeGoogleSignIn(
  clientId: string,
  onSuccess: (user: GoogleUser) => void,
  onError?: (error: Error) => void
) {
  if (!window.google) {
    console.error('Google Identity Services not loaded');
    onError?.(new Error('Google Identity Services not loaded'));
    return;
  }

  window.google.accounts.id.initialize({
    client_id: clientId,
    callback: (response: CredentialResponse) => {
      try {
        const user = parseJwt(response.credential);
        onSuccess(user);
      } catch (error) {
        console.error('Google Sign-In error:', error);
        onError?.(error as Error);
      }
    },
    auto_select: false,
    cancel_on_tap_outside: true,
  });
}

// Render Google Sign-In button
export function renderGoogleButton(
  elementId: string,
  options?: GsiButtonConfiguration
) {
  const element = document.getElementById(elementId);
  if (!element || !window.google) {
    console.error('Element or Google Identity Services not found');
    return;
  }

  window.google.accounts.id.renderButton(element, {
    type: 'standard',
    theme: 'outline',
    size: 'large',
    text: 'signin_with',
    shape: 'rectangular',
    logo_alignment: 'left',
    width: 350,
    ...options,
  });
}

// Show One Tap prompt
export function showOneTap() {
  if (!window.google) {
    console.error('Google Identity Services not loaded');
    return;
  }
  window.google.accounts.id.prompt();
}

// Load Google Identity Services script
export function loadGoogleScript(clientId: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.google) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Google Identity Services'));
    document.head.appendChild(script);
  });
}
