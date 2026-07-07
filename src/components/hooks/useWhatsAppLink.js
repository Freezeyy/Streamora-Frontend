import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { API_BASE } from '../../config/api';

const getAuthHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem('token')}`,
  'Content-Type': 'application/json',
});

const useWhatsAppLink = () => {
  const userId = localStorage.getItem("user`s Id");
  const [phone, setPhone] = useState('');
  const [whatsappJid, setWhatsappJid] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const fetchLink = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`${API_BASE}/api/user/${userId}`, {
        headers: getAuthHeaders(),
      });
      setPhone(response.data.phone || '');
      setWhatsappJid(response.data.whatsapp_jid || '');
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchLink();
  }, [fetchLink]);

  const saveWhatsAppLink = async (input) => {
    if (!userId) return false;

    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const payload = input.includes('@')
        ? { whatsapp_jid: input }
        : { phone: input };

      await axios.post(
        `${API_BASE}/api/user/${userId}`,
        payload,
        { headers: getAuthHeaders() },
      );

      await fetchLink();
      setSuccess(true);
      return true;
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.message || err.message);
      return false;
    } finally {
      setSaving(false);
    }
  };

  return {
    phone,
    whatsappJid,
    loading,
    saving,
    error,
    success,
    saveWhatsAppLink,
    refetch: fetchLink,
  };
};

export default useWhatsAppLink;
