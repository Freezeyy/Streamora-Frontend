import React from 'react';
import { Link } from 'react-router-dom';

const GroupPostMeta = ({ post }) => {
  if (!post?.group) return null;

  return (
    <div className="post-group-meta">
      <Link to={`/community/${post.group.slug}`} className="post-group-link">
        Posted in {post.group.name}
      </Link>
      {post.moderation_status === 'pending' && (
        <span className="post-group-badge post-group-badge--pending">Awaiting approval</span>
      )}
      {post.moderation_status === 'rejected' && (
        <span className="post-group-badge post-group-badge--rejected">Rejected</span>
      )}
      {post.group_id && post.author_is_member === false && (
        <span className="post-group-badge post-group-badge--left">No longer a member</span>
      )}
    </div>
  );
};

export default GroupPostMeta;
