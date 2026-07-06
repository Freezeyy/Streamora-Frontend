import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { FaLock } from "react-icons/fa";
import useOwnProfile from "../hooks/useOwnProfile";
import useUpdateBio from "../hooks/useUpdateBio";
import useFollow from "../../../components/hooks/useFollow";
import Layout from "../../../components/Layout";
import PostFeed from "../../posting/PostFeed";
import { setCachedMentionProfile } from "../../posting/mentionProfileCache";
import "../css/Profile.css";

const Profile = () => {
  const { userId: paramUserId } = useParams();
  const loggedInUserId = localStorage.getItem("user`s Id");
  const viewedUserId = paramUserId || loggedInUserId;
  const isOwnProfile = String(viewedUserId) === String(loggedInUserId);

  const [isEditing, setIsEditing] = useState(false);
  const [newBio, setNewBio] = useState("");

  const { profile, loading, error, refetch } = useOwnProfile(viewedUserId);
  const { updateBio, saving: bioSaving, error: bioError } = useUpdateBio(
    isOwnProfile ? viewedUserId : null,
  );
  const { follow, unfollow, loading: followLoading } = useFollow();

  const displayBio = profile?.bio?.trim() || "";

  useEffect(() => {
    if (profile) {
      setNewBio(profile.bio || "");
    }
  }, [profile?.id, profile?.bio]);

  const followStatus = profile?.viewerFollowStatus
    || (isOwnProfile ? "self" : "none");
  const canViewContent = isOwnProfile || profile?.canViewContent !== false;

  const getInitials = (name) => {
    if (!name) return "?";
    const initials = name
      .split(" ")
      .map((n) => n[0])
      .join("");
    return initials.toUpperCase();
  };

  const getAvatarSrc = (user) => {
    if (user?.image || user?.imageUrl) return user.image || user.imageUrl;
    if (user?.name) {
      return `https://ui-avatars.com/api/?name=${getInitials(user.name)}&background=random&color=random&size=128`;
    }
    return null;
  };

  const getFollowLabel = () => {
    if (followLoading) return "...";
    if (followStatus === "accepted") return "Unfollow";
    if (followStatus === "pending") return "Requested";
    return profile?.is_private ? "Request" : "Follow";
  };

  const handleFollowToggle = async () => {
    const result = followStatus === "accepted" || followStatus === "pending"
      ? await unfollow(Number(viewedUserId))
      : await follow(Number(viewedUserId));

    if (result.success) {
      refetch();
    }
  };

  const handleEditClick = () => {
    setNewBio(profile?.bio || "");
    setIsEditing(true);
  };

  const handleSaveClick = async () => {
    const success = await updateBio(newBio);
    if (success) {
      setIsEditing(false);
      if (profile?.username) {
        setCachedMentionProfile({
          ...profile,
          bio: newBio.trim(),
        });
      }
      refetch();
    }
  };

  const handleCancelClick = () => {
    setNewBio(profile?.bio || "");
    setIsEditing(false);
  };

  if (loading) {
    return (
      <Layout>
        <div className="profile-container ice-card">Loading profile...</div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="profile-container ice-card text-red-500">Error: {error}</div>
      </Layout>
    );
  }

  if (!profile) {
    return (
      <Layout>
        <div className="profile-container ice-card">No profile data available</div>
      </Layout>
    );
  }

  const showBioSection = isOwnProfile || displayBio;

  return (
    <Layout>
      <div className="profile-container ice-card">
        {!isOwnProfile && (
          <Link to="/profile" className="profile-back-link">
            &larr; Back to your profile
          </Link>
        )}

        <div className="profile-header">
          <img
            src={getAvatarSrc(profile)}
            alt={profile.name}
            className="profile-pic"
          />
          <h1 className="profile-name">{profile.name}</h1>

          {profile.is_private && (
            <span className="profile-private-badge">
              <FaLock /> Private account
            </span>
          )}

          <div className="profile-actions">
            {!isOwnProfile && (
              <button
                type="button"
                className={`follow-button ${followStatus === "accepted" ? "following" : ""} ${followStatus === "pending" ? "requested" : ""}`}
                onClick={handleFollowToggle}
                disabled={followLoading}
              >
                {getFollowLabel()}
              </button>
            )}
          </div>

          <div className="profile-stats">
            <span>
              <strong>{canViewContent ? (profile.posts?.length || 0) : "—"}</strong> Posts
            </span>
            <span>
              <strong>{profile.followers?.length || 0}</strong> Followers
            </span>
            <span>
              <strong>{profile.following?.length || 0}</strong> Followings
            </span>
          </div>
        </div>

        {showBioSection && (
          <div className="profile-bio">
            {isOwnProfile && isEditing ? (
              <>
                <textarea
                  value={newBio}
                  onChange={(e) => setNewBio(e.target.value)}
                  rows="4"
                  className="bio-editor glass-input"
                  placeholder="Write a short bio…"
                  disabled={bioSaving}
                />
                <div className="edit-buttons">
                  <button
                    type="button"
                    className="save-button"
                    onClick={handleSaveClick}
                    disabled={bioSaving}
                  >
                    {bioSaving ? "Saving…" : "Save"}
                  </button>
                  <button
                    type="button"
                    className="cancel-button"
                    onClick={handleCancelClick}
                    disabled={bioSaving}
                  >
                    Cancel
                  </button>
                </div>
                {bioError && <p className="profile-bio-error">{bioError}</p>}
              </>
            ) : (
              <>
                <p>{displayBio || "Add a short bio to tell people about yourself."}</p>
                {isOwnProfile && (
                  <button type="button" className="edit-button" onClick={handleEditClick}>
                    Edit
                  </button>
                )}
              </>
            )}
          </div>
        )}

        {!isOwnProfile && !canViewContent && (
          <div className="profile-private-notice glass-inset">
            <FaLock className="profile-private-notice-icon" />
            <p>
              This account is private. Follow this user and wait for them to accept your
              request to see their posts.
            </p>
          </div>
        )}
      </div>

      {canViewContent && (
        <PostFeed
          loggedInUserId={viewedUserId}
          showComposer={isOwnProfile}
          profilePosts={profile.posts}
          name={profile.name}
          onPostsMutated={refetch}
        />
      )}
    </Layout>
  );
};

export default Profile;
