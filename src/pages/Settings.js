import React from "react";
import { Link } from "react-router-dom";
import Layout from "../components/Layout";
import useLogout from "../components/hooks/useLogout";
import usePrivacySettings from "../components/hooks/usePrivacySettings";
import useFollowRequests from "../components/hooks/useFollowRequests";
import useWhatsAppLink from "../components/hooks/useWhatsAppLink";
import WhatsAppEventsGuide from "../components/WhatsAppEventsGuide";
import "./css/Settings.css";

const getInitials = (name) => {
  if (!name) return "?";
  return name.split(" ").map((n) => n[0]).join("").toUpperCase();
};

const Settings = () => {
  const { logout } = useLogout();
  const [whatsappInput, setWhatsappInput] = React.useState('');
  const {
    isPrivate,
    loading: privacyLoading,
    saving,
    error: privacyError,
    updatePrivacy,
  } = usePrivacySettings();
  const {
    requests,
    loading: requestsLoading,
    error: requestsError,
    actionId,
    acceptRequest,
    rejectRequest,
  } = useFollowRequests();
  const {
    phone,
    whatsappJid,
    loading: whatsappLoading,
    saving: whatsappSaving,
    error: whatsappError,
    success: whatsappSuccess,
    saveWhatsAppLink,
  } = useWhatsAppLink();

  React.useEffect(() => {
    if (whatsappJid) {
      setWhatsappInput(whatsappJid);
    } else if (phone) {
      setWhatsappInput(phone);
    }
  }, [whatsappJid, phone]);

  const handlePrivacyToggle = async () => {
    await updatePrivacy(!isPrivate);
  };

  const handleWhatsAppSave = async (e) => {
    e.preventDefault();
    await saveWhatsAppLink(whatsappInput.trim());
  };

  return (
    <Layout>
      <div className="settings-page">
        <h1 className="snow-page-title">Settings</h1>

        <section className="settings-section ice-card">
          <h2 className="settings-section-title">Privacy</h2>
          <p className="settings-section-desc">
            When your account is private, only people you approve can see your posts.
            Public accounts can be followed instantly by anyone.
          </p>

          {privacyError && <p className="settings-error">{privacyError}</p>}

          <label className="settings-toggle">
            <input
              type="checkbox"
              checked={isPrivate}
              onChange={handlePrivacyToggle}
              disabled={privacyLoading || saving}
            />
            <span>Private account</span>
            {saving && <span className="settings-saving">Saving…</span>}
          </label>
        </section>

        <section className="settings-section ice-card settings-whatsapp-section">
          <h2 className="settings-section-title">WhatsApp events</h2>
          <p className="settings-section-desc">
            Link your number to pull events from WhatsApp into your SNOW calendar.
          </p>

          {whatsappError && <p className="settings-error">{whatsappError}</p>}
          {whatsappSuccess && (
            <p className="settings-success">WhatsApp linked successfully.</p>
          )}

          <form className="settings-whatsapp-form" onSubmit={handleWhatsAppSave}>
            <input
              type="text"
              className="settings-whatsapp-input glass-input"
              placeholder="+60123456789 or your JID"
              value={whatsappInput}
              onChange={(e) => setWhatsappInput(e.target.value)}
              disabled={whatsappLoading || whatsappSaving}
            />
            <button
              type="submit"
              className="settings-btn settings-btn--accept"
              disabled={whatsappLoading || whatsappSaving || !whatsappInput.trim()}
            >
              {whatsappSaving ? 'Saving…' : 'Save'}
            </button>
          </form>

          {whatsappJid && (
            <p className="settings-muted settings-jid-display">
              Linked: <code>{whatsappJid}</code>
            </p>
          )}

          <WhatsAppEventsGuide variant="settings" showSettingsLink={false} />
        </section>

        <section className="settings-section ice-card">
          <h2 className="settings-section-title">Follow requests</h2>
          <p className="settings-section-desc">
            Approve or decline people who want to follow your private account.
          </p>

          {requestsError && <p className="settings-error">{requestsError}</p>}
          {requestsLoading && <p className="settings-muted">Loading requests…</p>}

          {!requestsLoading && requests.length === 0 && (
            <p className="settings-muted">No pending follow requests.</p>
          )}

          {!requestsLoading && requests.length > 0 && (
            <ul className="settings-requests-list">
              {requests.map((request) => {
                const user = request.follower;
                const avatar = user?.image
                  || `https://ui-avatars.com/api/?name=${getInitials(user?.name)}&background=random&color=random&size=128`;

                return (
                  <li key={request.id} className="settings-request-item">
                    <img src={avatar} alt={user?.name} className="settings-request-avatar" />
                    <div className="settings-request-info">
                      <span className="settings-request-name">{user?.name || "Unknown"}</span>
                      {user?.username && (
                        <span className="settings-request-username">@{user.username}</span>
                      )}
                    </div>
                    <div className="settings-request-actions">
                      <button
                        type="button"
                        className="settings-btn settings-btn--accept"
                        disabled={actionId === request.follower_id}
                        onClick={() => acceptRequest(request.follower_id)}
                      >
                        Accept
                      </button>
                      <button
                        type="button"
                        className="settings-btn settings-btn--reject"
                        disabled={actionId === request.follower_id}
                        onClick={() => rejectRequest(request.follower_id)}
                      >
                        Decline
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <div className="settings-section ice-card divide-y overflow-hidden">
          <Link
            to="/profile"
            className="block px-4 py-3 text-gray-800 hover:bg-blue-50 transition-colors"
          >
            Edit Profile
          </Link>
          <button
            type="button"
            onClick={logout}
            className="block w-full text-left px-4 py-3 text-red-600 hover:bg-red-50 transition-colors"
          >
            Log out
          </button>
        </div>
      </div>
    </Layout>
  );
};

export default Settings;
