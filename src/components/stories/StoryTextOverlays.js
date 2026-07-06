import { getTextOverlays } from './storyOverlays';

const StoryTextOverlays = ({ overlays }) => {
  const items = getTextOverlays(overlays);

  if (items.length === 0) return null;

  return (
    <>
      {items.map((overlay) => (
        <div
          key={overlay.id}
          className="story-text-overlay"
          style={{
            left: `${overlay.x ?? 50}%`,
            top: `${overlay.y ?? 50}%`,
          }}
        >
          {overlay.text}
        </div>
      ))}
    </>
  );
};

export default StoryTextOverlays;
