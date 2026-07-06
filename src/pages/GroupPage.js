import React, { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Layout from '../components/Layout';
import useGroup from '../components/hooks/useGroup';
import PostFeed from './posting/PostFeed';
import GroupAdminPanel from './GroupAdminPanel';
import './css/GroupPage.css';

const GroupPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const {
    getGroupBySlug,
    fetchGroupPosts,
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
    joinGroup,
    leaveGroup,
    deleteGroup,
    createGroupPost,
    error: groupError,
  } = useGroup();

  const [group, setGroup] = useState(null);
  const [posts, setPosts] = useState([]);
  const [pageLoading, setPageLoading] = useState(true);
  const [postsLoading, setPostsLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);

  const loadPosts = useCallback(async (groupId) => {
    if (!groupId) return;
    setPostsLoading(true);
    try {
      const data = await fetchGroupPosts(groupId);
      setPosts(data);
    } catch {
      setPosts([]);
    } finally {
      setPostsLoading(false);
    }
  }, [fetchGroupPosts]);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setPageLoading(true);
      try {
        const data = await getGroupBySlug(slug);
        if (cancelled) return;

        setGroup(data);
        if (data && !data.locked && data.id) {
          setPostsLoading(true);
          try {
            const postsData = await fetchGroupPosts(data.id);
            if (!cancelled) setPosts(postsData);
          } catch {
            if (!cancelled) setPosts([]);
          } finally {
            if (!cancelled) setPostsLoading(false);
          }
        } else if (!cancelled) {
          setPosts([]);
        }
      } finally {
        if (!cancelled) setPageLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [slug, getGroupBySlug, fetchGroupPosts]);

  const refresh = useCallback(async () => {
    const data = await getGroupBySlug(slug);
    setGroup(data);
    if (data?.id && !data.locked) {
      await loadPosts(data.id);
    }
  }, [slug, getGroupBySlug, loadPosts]);

  const membership = group?.membership;
  const isMember = membership?.status === 'accepted';
  const isModerator = group?.viewer_is_moderator;
  const isCreator = group?.viewer_is_creator;

  const handleJoin = async () => {
    if (!group?.id) return;
    setActionLoading(true);
    try {
      await joinGroup(group.id);
      await refresh();
    } catch (err) {
      window.alert(err.response?.data?.error || 'Failed to join');
    } finally {
      setActionLoading(false);
    }
  };

  const handleLeave = async () => {
    if (!group?.id) return;
    if (!window.confirm('Leave this group?')) return;
    setActionLoading(true);
    try {
      await leaveGroup(group.id);
      await refresh();
    } catch (err) {
      window.alert(err.response?.data?.error || 'Failed to leave');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteGroup = async () => {
    if (!group?.id || !window.confirm('Delete this group permanently? All posts will be removed.')) return;
    setActionLoading(true);
    try {
      await deleteGroup(group.id);
      navigate('/community');
    } catch (err) {
      window.alert(err.response?.data?.error || 'Failed to delete group');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCreateGroupPost = async (text, files) => {
    const created = await createGroupPost(group.id, text, files);
    if (created) {
      await loadPosts(group.id);
    }
    return created;
  };

  const handlePostsRefresh = useCallback(() => {
    if (group?.id) loadPosts(group.id);
  }, [group?.id, loadPosts]);

  if (pageLoading && !group) {
    return (
      <Layout>
        <div className="group-page-status ice-card">Loading group…</div>
      </Layout>
    );
  }

  if (!group) {
    return (
      <Layout>
        <div className="group-page-status ice-card">
          {groupError || 'Group not found'}
          <br />
          <Link to="/community">Back to Community</Link>
        </div>
      </Layout>
    );
  }

  if (group.locked) {
    return (
      <Layout>
        <div className="group-page group-page--locked">
          <Link to="/community" className="group-back-link">← Community</Link>
          <div className="group-hero ice-card">
            <h1 className="snow-page-title">{group.name}</h1>
            <p className="group-private-badge">Private group</p>
            <p className="group-hero-desc">Request to join to see posts and participate.</p>
            {membership?.status === 'pending' ? (
              <p className="group-action-status">Your join request is pending approval.</p>
            ) : (
              <button
                type="button"
                className="group-action-btn"
                onClick={handleJoin}
                disabled={actionLoading}
              >
                Request to join
              </button>
            )}
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout showRightColumn={false}>
      <div className="group-page">
        <Link to="/community" className="group-back-link">← Community</Link>

        <header className="group-hero ice-card">
          <div className="group-hero-top">
            <div>
              <h1 className="snow-page-title group-hero-title">{group.name}</h1>
              <p className="group-hero-meta">
                {group.member_count} members
                {group.is_private ? ' · Private' : ' · Public'}
              </p>
            </div>
            <div className="group-hero-actions">
              {isMember ? (
                <button
                  type="button"
                  className="group-action-btn group-action-btn--ghost"
                  onClick={handleLeave}
                  disabled={actionLoading}
                >
                  Leave
                </button>
              ) : (
                <button
                  type="button"
                  className="group-action-btn"
                  onClick={handleJoin}
                  disabled={actionLoading}
                >
                  {group.is_private ? 'Request to join' : 'Follow group'}
                </button>
              )}
              {isModerator && (
                <button
                  type="button"
                  className="group-action-btn group-action-btn--ghost"
                  onClick={() => setShowAdmin((v) => !v)}
                >
                  {showAdmin ? 'Hide admin' : 'Admin'}
                </button>
              )}
              {isCreator && (
                <button
                  type="button"
                  className="group-action-btn group-action-btn--danger"
                  onClick={handleDeleteGroup}
                  disabled={actionLoading}
                >
                  Delete group
                </button>
              )}
            </div>
          </div>
          {group.description && (
            <p className="group-hero-desc">{group.description}</p>
          )}
          {!group.is_private && !isMember && (
            <p className="group-hero-hint">
              Anyone can view posts here. Follow the group to post and see updates in your Feed.
            </p>
          )}
        </header>

        {showAdmin && isModerator && (
          <GroupAdminPanel
            group={group}
            onRefresh={refresh}
            fetchPendingPosts={fetchPendingPosts}
            fetchJoinRequests={fetchJoinRequests}
            fetchMembers={fetchMembers}
            approvePost={approvePost}
            rejectPost={rejectPost}
            acceptJoinRequest={acceptJoinRequest}
            rejectJoinRequest={rejectJoinRequest}
            promoteToAdmin={promoteToAdmin}
            promoteToCreator={promoteToCreator}
            removeMember={removeMember}
          />
        )}

        {isMember ? (
          <PostFeed
            groupId={group.id}
            groupPosts={posts}
            postsLoading={postsLoading}
            createGroupPost={handleCreateGroupPost}
            onPostsRefresh={handlePostsRefresh}
            canModerateGroup={isModerator}
            showComposer
          />
        ) : (
          <PostFeed
            groupId={group.id}
            groupPosts={posts}
            postsLoading={postsLoading}
            canModerateGroup={isModerator}
            showComposer={false}
          />
        )}
      </div>
    </Layout>
  );
};

export default GroupPage;
