import React from 'react';
import { Link } from 'react-router-dom';
import useEvent from './hooks/useEvent';
import WhatsAppSyncHint from './WhatsAppSyncHint';
import './css/RightColumn.css';

function RightColumn() {
  const {
    event, loading, error, bot,
  } = useEvent({ limit: 3 });

  return (
    <div className="right-column-stack">
      <div className="right-column-card ice-card">
        <div className="right-column-header">
          <h2 className="right-column-title">Upcoming Events</h2>
          <WhatsAppSyncHint bot={bot} />
        </div>
        <div className="calendar">
          <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
            {!loading && Array.isArray(event) && event.map((item, index) => (
              <div key={`${item.id}-${item.chatId || index}`}>
                <li className="event-item glass-inset">
                  <div className="event-content">
                    <div className="flex flex-col relative flex-shrink-0">
                      <div className="event-date-month">
                        {new Date(item.date).toLocaleString('en-US', { month: 'short' })}
                      </div>
                      <div className="event-date-day">
                        {new Date(item.date).getDate()}
                      </div>
                    </div>
                    <div className="event-details">
                      <div className="event-test">{item.eventTitle}</div>
                      <div className="event-lol">{item.eventTime}</div>
                      {item.groupName && (
                        <div className="event-group">{item.groupName}</div>
                      )}
                    </div>
                  </div>
                </li>
                {index < event.length - 1 && (
                  <div className="event-divider" />
                )}
              </div>
            ))}

            {loading && <div className="right-column-status">Loading events...</div>}
            {error && <div className="right-column-status right-column-error">{error}</div>}
            {!loading && (!event || event.length === 0) && !error && (
              <div className="right-column-status">No upcoming events</div>
            )}
          </ul>
        </div>
        {!loading && Array.isArray(event) && event.length > 0 && (
          <Link to="/calendar" className="right-column-view-all">
            View all events
          </Link>
        )}
      </div>

      <div className="right-column-card ice-card">
        <h2 className="right-column-title">Sponsored</h2>
        <p className="right-column-sponsored glass-inset sponsored-placeholder">Ad space — coming soon</p>
      </div>
    </div>
  );
}

export default RightColumn;
