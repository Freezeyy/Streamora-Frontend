import React, { useEffect, useState, useCallback } from 'react';

const GroupAdminPanel = ({
  group,
  onRefresh,
  fetchPendingPosts,
  fetchJoinRequests,
  fetchMembers,
  approvePost,
  rejectPost,
  acceptJoinRequest,
  rejectJoinRequest,
  promoteToAdmin,
  promoteToCreator,
  removeMember,
}) => {
  const [tab, setTab] = useState('posts');
  const [pendingPosts, setPendingPosts] = useState([]);
  const [joinRequests, setJoinRequests] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [pending, requests, memberRows] = await Promise.all([
        fetchPendingPosts(group.id),
        group.is_private ? fetchJoinRequests(group.id) : Promise.resolve([]),
        fetchMembers(group.id),
      ]);
      setPendingPosts(pending);
      setJoinRequests(requests);
      setMembers(memberRows);
    } catch {
      setPendingPosts([]);
      setJoinRequests([]);
      setMembers([]);
    } finally {
      setLoading(false);
    }
  }, [group.id, group.is_private, fetchPendingPosts, fetchJoinRequests, fetchMembers]);

  useEffect(() => {
    load();
  }, [load]);

  const handleApprove = async (postId) => {
    await approvePost(group.id, postId);
    await load();
    onRefresh?.();
  };

  const handleReject = async (postId) => {
    await rejectPost(group.id, postId);
    await load();
    onRefresh?.();
  };

  const handleAcceptJoin = async (userId) => {
    await acceptJoinRequest(group.id, userId);
    await load();
    onRefresh?.();
  };

  const handleRejectJoin = async (userId) => {
    await rejectJoinRequest(group.id, userId);
    await load();
  };

  const handlePromoteAdmin = async (userId) => {
    await promoteToAdmin(group.id, userId);
    await load();
  };

  const handlePromoteCreator = async (userId) => {
    await promoteToCreator(group.id, userId);
    await load();
    onRefresh?.();
  };

  const handleRemoveMember = async (userId, name) => {
    if (!window.confirm(`Remove ${name || 'this member'} from the group?`)) return;
    await removeMember(group.id, userId);
    await load();
    onRefresh?.();
  };

  return (
    <section className="group-admin ice-card">
      <h2 className="group-admin-title">Group admin</h2>
      <div className="group-admin-tabs">
        <button type="button" className={tab === 'posts' ? 'active' : ''} onClick={() => setTab('posts')}>
          Pending posts ({pendingPosts.length})
        </button>
        {group.is_private && (
          <button type="button" className={tab === 'joins' ? 'active' : ''} onClick={() => setTab('joins')}>
            Join requests ({joinRequests.length})
          </button>
        )}
        <button type="button" className={tab === 'members' ? 'active' : ''} onClick={() => setTab('members')}>
          Members ({members.length})
        </button>
      </div>

      {loading && <p className="group-admin-status">Loading…</p>}

      {!loading && tab === 'posts' && (
        <div className="group-admin-section">
          {pendingPosts.length === 0 && (
            <p className="group-admin-status">No posts awaiting approval.</p>
          )}
          {pendingPosts.map((post) => (
            <div key={post.id} className="group-admin-post glass-inset">
              <p className="group-admin-post-author">{post.user?.name || 'User'}</p>
              <p className="group-admin-post-text">{post.content}</p>
              <div className="group-admin-post-actions">
                <button type="button" onClick={() => handleApprove(post.id)}>Approve</button>
                <button type="button" className="danger" onClick={() => handleReject(post.id)}>Reject</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && tab === 'joins' && (
        <div className="group-admin-section">
          {joinRequests.length === 0 && (
            <p className="group-admin-status">No pending join requests.</p>
          )}
          {joinRequests.map((row) => (
            <div key={row.id} className="group-admin-member glass-inset">
              <span>{row.user?.name || 'User'}</span>
              <div>
                <button type="button" onClick={() => handleAcceptJoin(row.user_id)}>Accept</button>
                <button type="button" className="danger" onClick={() => handleRejectJoin(row.user_id)}>Decline</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && tab === 'members' && (
        <div className="group-admin-section">
          {members.map((row) => (
            <div key={row.id} className="group-admin-member glass-inset">
              <div>
                <strong>{row.user?.name}</strong>
                <span className="group-admin-role">{row.role}</span>
              </div>
              <div className="group-admin-member-actions">
                {group.viewer_is_creator && row.role === 'member' && (
                  <button type="button" onClick={() => handlePromoteAdmin(row.user_id)}>Make admin</button>
                )}
                {group.viewer_is_creator && row.role === 'admin' && (
                  <button type="button" onClick={() => handlePromoteCreator(row.user_id)}>Make creator</button>
                )}
                {(group.viewer_is_creator
                  || (group.viewer_is_moderator && row.role === 'member'))
                  && Number(row.user_id) !== Number(localStorage.getItem("user`s Id")) && (
                  <button
                    type="button"
                    className="danger"
                    onClick={() => handleRemoveMember(row.user_id, row.user?.name)}
                  >
                    Remove
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

export default GroupAdminPanel;
