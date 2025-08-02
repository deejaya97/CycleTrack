import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Download, X } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

const InstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Check if it's iOS
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(isIOSDevice);

    // Listen for the beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // For iOS, show install prompt if not in standalone mode
    if (isIOSDevice && !window.matchMedia('(display-mode: standalone)').matches) {
      setShowPrompt(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
      }
      setShowPrompt(false);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('installPromptDismissed', 'true');
  };

  // Don't show if user previously dismissed or if already installed
  if (!showPrompt || 
      localStorage.getItem('installPromptDismissed') === 'true' ||
      window.matchMedia('(display-mode: standalone)').matches) {
    return null;
  }

  return (
    <Card className="fixed bottom-20 left-4 right-4 z-50 shadow-lg border-period-primary bg-period-light">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3 flex-1">
            <Download className="w-6 h-6 text-period-primary flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-gray-800 text-sm">Install Luna</h3>
              {isIOS ? (
                <p className="text-xs text-gray-600 mt-1">
                  Tap <span className="font-medium">Share</span> → <span className="font-medium">Add to Home Screen</span> to install
                </p>
              ) : (
                <p className="text-xs text-gray-600 mt-1">
                  Install Luna for a better experience
                </p>
              )}
            </div>
          </div>
          <div className="flex space-x-2 ml-2">
            {!isIOS && deferredPrompt && (
              <Button 
                size="sm" 
                onClick={handleInstallClick}
                className="bg-period-primary hover:bg-period-primary/90 text-xs px-3 py-1 h-auto"
              >
                Install
              </Button>
            )}
            <Button 
              size="sm" 
              variant="ghost" 
              onClick={handleDismiss}
              className="text-gray-500 hover:text-gray-700 p-1 h-auto"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default InstallPrompt;