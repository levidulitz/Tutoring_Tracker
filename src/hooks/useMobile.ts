import { useState, useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import { App } from '@capacitor/app';
import { StatusBar, Style } from '@capacitor/status-bar';
import { Keyboard } from '@capacitor/keyboard';
import { Haptics, ImpactStyle } from '@capacitor/haptics';

export const useMobile = () => {
  const [isNative, setIsNative] = useState(false);
  const [platform, setPlatform] = useState<'web' | 'ios' | 'android'>('web');

  useEffect(() => {
    const native = Capacitor.isNativePlatform();
    const currentPlatform = Capacitor.getPlatform() as 'web' | 'ios' | 'android';
    
    setIsNative(native);
    setPlatform(currentPlatform);

    if (native) {
      // Set up status bar
      StatusBar.setStyle({ style: Style.Light });
      
      // Handle app state changes
      App.addListener('appStateChange', ({ isActive }) => {
        console.log('App state changed. Is active?', isActive);
      });

      // Handle back button on Android
      App.addListener('backButton', ({ canGoBack }) => {
        if (!canGoBack) {
          App.exitApp();
        } else {
          window.history.back();
        }
      });

      // Handle keyboard events
      Keyboard.addListener('keyboardWillShow', info => {
        document.body.style.transform = `translateY(-${info.keyboardHeight / 4}px)`;
      });

      Keyboard.addListener('keyboardWillHide', () => {
        document.body.style.transform = 'translateY(0px)';
      });
    }

    return () => {
      if (native) {
        App.removeAllListeners();
        Keyboard.removeAllListeners();
      }
    };
  }, []);

  const hapticFeedback = (style: ImpactStyle = ImpactStyle.Medium) => {
    if (isNative) {
      Haptics.impact({ style });
    }
  };

  const exitApp = () => {
    if (isNative) {
      App.exitApp();
    }
  };

  return {
    isNative,
    platform,
    hapticFeedback,
    exitApp
  };
};