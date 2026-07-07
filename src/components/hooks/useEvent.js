import { useState, useEffect, useCallback } from 'react';

import { API_BASE } from '../../config/api';

function authHeaders() {
  return {
    Authorization: `Bearer ${localStorage.getItem('token')}`,
    'Content-Type': 'application/json',
  };
}

const useEvent = ({ limit } = {}) => {
  const [event, setEvent] = useState(null);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [needsWhatsAppLink, setNeedsWhatsAppLink] = useState(false);
  const [whatsappLinked, setWhatsappLinked] = useState(false);
  const [whatsappError, setWhatsappError] = useState(null);
  const [snowCount, setSnowCount] = useState(0);
  const [whatsappCount, setWhatsappCount] = useState(0);
  const [saving, setSaving] = useState(false);
  const [bot, setBot] = useState(null);

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    setError(null);
    setWhatsappError(null);

    const query = limit ? `?limit=${limit}` : '';
    const url = `${API_BASE}/api/events/calendar${query}`;

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: authHeaders(),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.message || 'Failed to fetch events');
      }

      setEvent(data.events || []);
      setGroups(data.groups || []);
      setNeedsWhatsAppLink(Boolean(data.needsWhatsAppLink));
      setWhatsappLinked(Boolean(data.whatsappLinked));
      setWhatsappError(data.whatsappError || null);
      setSnowCount(data.snowCount ?? 0);
      setWhatsappCount(data.whatsappCount ?? 0);
      setBot(data.bot || null);
    } catch (err) {
      setError(err.message);
      setEvent([]);
      setGroups([]);
    } finally {
      setLoading(false);
    }
  }, [limit]);

  const createEvent = useCallback(async (payload) => {
    setSaving(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE}/api/events`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.message || 'Failed to create event');
      }

      await fetchEvents();
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setSaving(false);
    }
  }, [fetchEvents]);

  const updateEvent = useCallback(async (snowId, payload) => {
    setSaving(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE}/api/events/${snowId}`, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.message || 'Failed to update event');
      }

      await fetchEvents();
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setSaving(false);
    }
  }, [fetchEvents]);

  const deleteEvent = useCallback(async (snowId) => {
    setSaving(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE}/api/events/${snowId}`, {
        method: 'DELETE',
        headers: authHeaders(),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.message || 'Failed to delete event');
      }

      await fetchEvents();
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setSaving(false);
    }
  }, [fetchEvents]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  return {
    event,
    groups,
    loading,
    error,
    needsWhatsAppLink,
    whatsappLinked,
    whatsappError,
    snowCount,
    whatsappCount,
    saving,
    bot,
    refetch: fetchEvents,
    createEvent,
    updateEvent,
    deleteEvent,
  };
};

export default useEvent;
