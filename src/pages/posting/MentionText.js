import React from 'react';
import { parseMentionSegments } from './mentionUtils';
import MentionLink from './MentionLink';

const MentionText = ({
  text,
  className = '',
  as: Component = 'p',
  onMentionClick,
}) => {
  if (!text?.trim()) return null;

  const segments = parseMentionSegments(text);

  return (
    <Component className={className}>
      {segments.map((segment, index) => {
        if (segment.type === 'mention') {
          return (
            <MentionLink
              key={`${segment.username}-${index}`}
              username={segment.username}
              label={segment.value}
              onNavigate={onMentionClick}
            />
          );
        }

        return <React.Fragment key={`text-${index}`}>{segment.value}</React.Fragment>;
      })}
    </Component>
  );
};

export default MentionText;
