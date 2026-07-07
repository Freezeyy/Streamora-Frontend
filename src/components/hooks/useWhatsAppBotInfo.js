import { useState, useEffect } from 'react';

import { API_BASE } from '../../config/api';

let cachedBot = null;
let fetchPromise = null;

async function loadBotInfo() {
  if (cachedBot) return cachedBot;

  if (!fetchPromise) {
    fetchPromise = fetch(`${API_BASE}/whatsapp-bot`)
      .then((res) => res.json())
      .then((data) => {
        cachedBot = data;
        return data;
      })
      .catch(() => {
        cachedBot = { number: null, display: 'SNOW Events Bot', waLink: null };
        return cachedBot;
      })
      .finally(() => {
        fetchPromise = null;
      });
  }

  return fetchPromise;
}

const useWhatsAppBotInfo = (initialBot) => {
  const [bot, setBot] = useState(initialBot || cachedBot);
  const [loading, setLoading] = useState(!initialBot && !cachedBot);

  useEffect(() => {
    if (initialBot) {
      cachedBot = initialBot;
      setBot(initialBot);
      setLoading(false);
      return undefined;
    }

    let active = true;
    loadBotInfo().then((data) => {
      if (active) {
        setBot(data);
        setLoading(false);
      }
    });

    return () => {
      active = false;
    };
  }, [initialBot]);

  return { bot, loading };
};

export default useWhatsAppBotInfo;
