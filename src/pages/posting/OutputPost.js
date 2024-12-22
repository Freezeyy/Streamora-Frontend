import React, { useEffect } from 'react';
import usePost from './hooks/usePost';
import './css/OutputPost.css';
import { FaRegThumbsUp, FaComment } from 'react-icons/fa'; // Importing icons

const OutputPost = () => {
  const { fetchPosts, posts, loading, error } = usePost();

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

  return (
    <div>
      {posts.length > 0 ? (
        posts.map((post) => (
          <div key={post.id} className="post">
            <p>{post.content}</p>
            {post.media && post.media.length > 0 && post.media.map((file, index) => {
              const mediaType = getMediaType(file.media_path);
              const mediaUrl = `http://localhost:3000${file.media_path}`; // Prepend correct backend URL

              return (
                <div key={index} className="media-container">
                  {mediaType === 'image' && <img src={mediaUrl} alt="post-media" className="media-image" />}
                  {mediaType === 'video' && <video src={mediaUrl} controls className="media-video" />}
                  {mediaType === 'pdf' && <a href={mediaUrl} target="_blank" rel="noopener noreferrer">View PDF</a>}
                </div>
              );
            })}
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
