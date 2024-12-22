import React, { useState } from "react";
import useUserProfile from "../../hooks/useUserProfile";
import "../css/Profile.css";

const Profile = () => {
  const [bio, setBio] = useState("This is your bio. Click edit to update it.");
  const [isEditing, setIsEditing] = useState(false);
  const [newBio, setNewBio] = useState(bio);
  const userId = localStorage.getItem("user`s Id"); // Assuming userId is stored in localStorage after login
  const { profile, loading, error } = useUserProfile(userId);

  if (error) {
    return <div className="text-red-500">Error: {error}</div>;
  }

  if (!profile) {
    return <div>No profile data available</div>;
  }

  const getInitials = (name) => {
    const initials = name
      .split(" ")
      .map((n) => n[0])
      .join("");
    return initials.toUpperCase();
  };

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleSaveClick = () => {
    setBio(newBio);
    setIsEditing(false);
  };

  const handleCancelClick = () => {
    setNewBio(bio);
    setIsEditing(false);
  };

  if (error) {
    return <div className="text-red-500">Error: {error}</div>;
  }

  if (!profile) {
    return <div>No profile data available</div>;
  }

  return (
    <div className="profile-container">
      <div className="profile-header">
        {!loading && profile && (
          <img
            src={
              profile.imageUrl
                ? profile.imageUrl // If profile image exists, use it
                : `https://ui-avatars.com/api/?name=${getInitials(
                    profile.name
                  )}&background=random&color=random&size=128`
            }
            alt="Profile"
            className="profile-pic"
          />
        )}
        <h1 className="profile-name">{profile.name}</h1>
        <div className="profile-stats">
          <span>
            <strong>150</strong> Posts
          </span>
          <span>
            <strong>200</strong> Followers
          </span>
          <span>
            <strong>180</strong> Following
          </span>
        </div>
      </div>

      <div className="profile-bio">
        {isEditing ? (
          <>
            <textarea
              value={newBio}
              onChange={(e) => setNewBio(e.target.value)}
              rows="4"
              className="bio-editor"
            />
            <div className="edit-buttons">
              <button className="save-button" onClick={handleSaveClick}>
                Save
              </button>
              <button className="cancel-button" onClick={handleCancelClick}>
                Cancel
              </button>
            </div>
          </>
        ) : (
          <>
            <p>{bio}</p>
            <button className="edit-button" onClick={handleEditClick}>
              Edit
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default Profile;
