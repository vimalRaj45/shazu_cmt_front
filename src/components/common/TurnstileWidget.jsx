import React, { useEffect, useRef } from 'react';
import { Box, Typography } from '@mui/material';

const DEFAULT_SITE_KEY = '0x4AAAAAAEhK_CLNNa0heFKc';

export default function TurnstileWidget({
  sitekey = DEFAULT_SITE_KEY,
  action = 'submit',
  onVerify,
  onExpire,
  onError,
  theme = 'light',
  size = 'normal',
}) {
  const containerRef = useRef(null);
  const widgetIdRef = useRef(null);

  useEffect(() => {
    let isMounted = true;
    let checkInterval = null;

    const renderWidget = () => {
      if (!containerRef.current || !window.turnstile || widgetIdRef.current !== null) {
        return;
      }

      try {
        widgetIdRef.current = window.turnstile.render(containerRef.current, {
          sitekey,
          action,
          theme,
          size,
          callback: (token) => {
            if (isMounted && onVerify) {
              onVerify(token);
            }
          },
          'expired-callback': () => {
            if (isMounted && onExpire) {
              onExpire();
            }
          },
          'error-callback': (err) => {
            if (isMounted && onError) {
              onError(err);
            }
          },
        });
      } catch (e) {
        console.warn('[TurnstileWidget] Render error:', e);
      }
    };

    if (window.turnstile) {
      renderWidget();
    } else {
      checkInterval = setInterval(() => {
        if (window.turnstile) {
          clearInterval(checkInterval);
          renderWidget();
        }
      }, 200);
    }

    return () => {
      isMounted = false;
      if (checkInterval) clearInterval(checkInterval);
      if (widgetIdRef.current !== null && window.turnstile) {
        try {
          window.turnstile.remove(widgetIdRef.current);
        } catch (e) {
          // ignore cleanup error
        }
        widgetIdRef.current = null;
      }
    };
  }, [sitekey, action, theme, size]);

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
      <div ref={containerRef} className="cf-turnstile" />
    </Box>
  );
}
