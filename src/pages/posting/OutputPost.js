import React, { useEffect } from 'react';
import usePost from './hooks/usePost';
import './css/OutputPost.css';
import { FaRegThumbsUp, FaComment } from 'react-icons/fa'; // Importing icons

const OutputPost = ({ loggedInUserId }) => {
  const { fetchPosts, posts, loading, error } = usePost();


  const getInitials = (name) => {
    const initials = name
      .split(" ")
      .map((n) => n[0])
      .join("");
    return initials.toUpperCase();
  };

  // Function to determine the media type based on the file extension
  const getMediaType = (mediaPath) => {
    const extension = mediaPath.split('.').pop().toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif'].includes(extension)) {
      return 'image';
    } else if (['mp4', 'mov', 'avi'].includes(extension)) {
      return 'video';
    } else if (extension === 'pdf') {
      return 'pdf';
    }
    return null;
  };

  // Fetch posts on component mount
  useEffect(() => {
    fetchPosts(); // Fetch posts when the component mounts
  }, [fetchPosts]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  // Filter posts by logged-in user ID if userId is provided
  const filteredPosts = loggedInUserId
  ? posts.filter(post => Number(post.user_id) === Number(loggedInUserId))
  : posts;

  return (
    <div>
      {filteredPosts.length > 0 ? (
        filteredPosts.map((post) => (
          <div key={post.id} className="post">
            {/* Row 1: User Image */}
            <div className="post-image">
              <img
                src={post.user.image ? 
                      post.user.image : 
                      `https://ui-avatars.com/api/?name=${getInitials(post.user.name)}&background=random&color=random&size=128`
                }
                className="w-12 h-12 -mt-1 rounded-full"
              />
              <div className='ml-3'>
                {post.user.name}
              </div>
            </div>

            {/* Row 2: Post Content & Media */}
            <div className="post-content">
              <p>{post.content}</p>
              {post.media && post.media.length > 0 && post.media.map((file, index) => {
                const mediaType = getMediaType(file.media_path);
                const mediaUrl = `http://localhost:3000${file.media_path}`;

                return (
                  <div key={index} className="media-container">
                    {mediaType === 'image' && <img src={mediaUrl} alt="post-media" className="media-image" />}
                    {mediaType === 'video' && <video src={mediaUrl} controls className="media-video" />}
                    {mediaType === 'pdf' && <a href={mediaUrl} target="_blank" rel="noopener noreferrer">View PDF</a>}
                  </div>
                );
              })}
            </div>

            {/* Row 3: Like & Comment Buttons */}
            <div className="post-actions">
              <button className="action-button">
                <FaRegThumbsUp className="action-icon" />
                Like
              </button>
              <button className="action-button">
                <FaComment className="action-icon" />
                Comment
              </button>
            </div>
          </div>

        ))
      ) : (
        <div>No posts available.</div>
      )}
    </div>
  );
};

export default OutputPost;
