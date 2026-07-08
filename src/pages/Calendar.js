import React, { useState } from "react";
import Layout from "../components/Layout";
import useEvent from "../components/hooks/useEvent";
import useWhatsAppLink from "../components/hooks/useWhatsAppLink";
import WhatsAppEventsGuide from "../components/WhatsAppEventsGuide";
import { formatEventCreator, shouldShowEventCreator } from "../utils/eventCreator";
import "../components/css/WhatsAppEventsGuide.css";

const EMPTY_FORM = { eventTitle: "", date: "", eventTime: "", notes: "" };

const SourceBadge = ({ source }) => {
  if (source === "whatsapp") {
    return (
      <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-green-100 text-green-800">
        WhatsApp
      </span>
    );
  }
  return (
    <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
      SNOW
    </span>
  );
};

const Calendar = () => {
  const {
    event,
    loading,
    error,
    needsWhatsAppLink,
    whatsappLinked,
    whatsappError,
    saving,
    bot,
    createEvent,
    updateEvent,
    deleteEvent,
  } = useEvent();

  const { whatsappJid } = useWhatsAppLink();

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);

  const resetForm = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setShowForm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.eventTitle.trim() || !form.date) return;

    const payload = {
      eventTitle: form.eventTitle.trim(),
      date: form.date,
      eventTime: form.eventTime.trim() || "All day",
      notes: form.notes.trim() || null,
    };

    if (editingId) {
      await updateEvent(editingId, payload);
    } else {
      await createEvent(payload);
    }

    resetForm();
  };

  const startEdit = (item) => {
    setEditingId(item.snowId);
    setForm({
      eventTitle: item.eventTitle,
      date: item.date,
      eventTime: item.eventTime === "All day" ? "" : item.eventTime,
      notes: item.notes || "",
    });
    setShowForm(true);
  };

  const handleDelete = async (item) => {
    if (!window.confirm(`Delete "${item.eventTitle}"?`)) return;
    await deleteEvent(item.snowId);
    if (editingId === item.snowId) resetForm();
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <h1 className="snow-page-title mb-0">Your Calendar</h1>
          {!showForm && (
            <button
              type="button"
              onClick={() => setShowForm(true)}
              className="px-4 py-2 text-sm font-medium rounded-lg bg-blue-500 text-white hover:bg-blue-600"
            >
              + New event
            </button>
          )}
        </div>

        {needsWhatsAppLink && (
          <WhatsAppEventsGuide variant="banner" bot={bot} className="ice-card" />
        )}

        {whatsappLinked && !needsWhatsAppLink && (
          <p className="text-sm text-gray-500 ice-card p-3 mb-4">
            Showing SNOW events and WhatsApp events synced from your linked account.
            Create more in WhatsApp with <code className="wa-guide-inline-code">#event</code> in any group where the bot is added.
          </p>
        )}

        {whatsappError && (
          <p className="text-amber-700 ice-card p-4 mb-4">
            Could not load WhatsApp events: {whatsappError}. Your SNOW events are still shown below.
          </p>
        )}

        {showForm && (
          <form onSubmit={handleSubmit} className="ice-card p-4 mb-4 space-y-3">
            <h2 className="font-semibold text-gray-800">
              {editingId ? "Edit event" : "Create SNOW event"}
            </h2>

            <input
              type="text"
              className="w-full glass-input px-3 py-2"
              placeholder="Event title"
              value={form.eventTitle}
              onChange={(e) => setForm({ ...form, eventTitle: e.target.value })}
              required
            />

            <div className="flex gap-3">
              <input
                type="date"
                className="flex-1 glass-input px-3 py-2"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                required
              />
              <input
                type="text"
                className="flex-1 glass-input px-3 py-2"
                placeholder="Time (optional)"
                value={form.eventTime}
                onChange={(e) => setForm({ ...form, eventTime: e.target.value })}
              />
            </div>

            <textarea
              className="w-full glass-input px-3 py-2"
              placeholder="Notes (optional)"
              rows={2}
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
            />

            <div className="flex gap-2">
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2 text-sm font-medium rounded-lg bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50"
              >
                {saving ? "Saving…" : editingId ? "Save changes" : "Create event"}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 text-sm font-medium rounded-lg text-gray-600 hover:bg-gray-100"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {loading && <p className="text-gray-600 ice-card p-4">Loading events...</p>}
        {error && <p className="text-red-500 ice-card p-4">{error}</p>}

        {!loading && Array.isArray(event) && event.length === 0 && (
          <p className="text-gray-600 ice-card p-4 mb-4">
            No upcoming events yet. Tap <strong>+ New event</strong> to add one in SNOW,
            or use <code className="wa-guide-inline-code">#event</code> in WhatsApp after adding the bot to a group.
          </p>
        )}

        <ul className="space-y-4">
          {!loading && Array.isArray(event) && event.map((item) => (
            <li
              key={item.id}
              className="ice-card p-4 flex gap-4 items-start"
            >
              <div className="flex flex-col items-center flex-shrink-0">
                <div className="bg-blue-500 text-white text-xs font-semibold w-16 py-1 rounded-t-lg text-center">
                  {new Date(item.date).toLocaleString("en-US", { month: "short" })}
                </div>
                <div className="bg-blue-50 w-16 py-2 rounded-b-lg text-center text-xl font-bold text-gray-800">
                  {new Date(item.date).getDate()}
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="font-semibold text-gray-800">{item.eventTitle}</h2>
                  <SourceBadge source={item.source} />
                </div>
                <p className="text-sm text-gray-500">{item.eventTime}</p>
                {item.groupName && (
                  <p className="text-sm text-blue-700 mt-1">{item.groupName}</p>
                )}
                {(shouldShowEventCreator(item, whatsappJid)) && (
                  <p className="text-xs text-gray-500 mt-0.5">
                    by {formatEventCreator(item, whatsappJid)}
                  </p>
                )}
                {item.notes && <p className="text-sm text-gray-600 mt-1">{item.notes}</p>}
              </div>
              {item.source === "snow" && (
                <div className="flex flex-col gap-1 flex-shrink-0">
                  <button
                    type="button"
                    onClick={() => startEdit(item)}
                    className="text-xs text-blue-600 hover:underline"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(item)}
                    disabled={saving}
                    className="text-xs text-red-600 hover:underline disabled:opacity-50"
                  >
                    Delete
                  </button>
                </div>
              )}
            </li>
          ))}
        </ul>
      </div>
    </Layout>
  );
};

export default Calendar;
