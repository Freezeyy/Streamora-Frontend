export const MENTION_PATTERN = /@([\w.]+)/g;

export const parseMentionSegments = (text) => {
  if (!text) return [];

  const segments = [];
  let lastIndex = 0;
  const pattern = new RegExp(MENTION_PATTERN.source, 'g');
  let match = pattern.exec(text);

  while (match) {
    if (match.index > lastIndex) {
      segments.push({ type: 'text', value: text.slice(lastIndex, match.index) });
    }
    segments.push({
      type: 'mention',
      value: match[0],
      username: match[1],
    });
    lastIndex = match.index + match[0].length;
    match = pattern.exec(text);
  }

  if (lastIndex < text.length) {
    segments.push({ type: 'text', value: text.slice(lastIndex) });
  }

  return segments;
};

export const getInitials = (name) => {
  if (!name) return '?';
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase();
};

export const getAvatarSrc = (user) => {
  if (user?.image) return user.image;
  if (user?.name) {
    return `https://ui-avatars.com/api/?name=${getInitials(user.name)}&background=random&color=random&size=128`;
  }
  return null;
};

export const getMentionToken = (user) => {
  if (user?.username) return `@${user.username}`;
  if (user?.name) return `@${user.name.replace(/\s+/g, '')}`;
  return '@user';
};

export const sortMentionResults = (users, query) => {
  const q = (query || '').trim().toLowerCase();
  if (!q) return users;

  const score = (user) => {
    const name = (user.name || '').toLowerCase();
    const username = (user.username || '').toLowerCase();

    if (username.startsWith(q)) return 0;
    if (name.startsWith(q)) return 1;
    if (username.includes(q)) return 2;
    if (name.includes(q)) return 3;
    return 4;
  };

  return [...users].sort((a, b) => {
    const diff = score(a) - score(b);
    if (diff !== 0) return diff;
    return (a.name || '').localeCompare(b.name || '');
  });
};

const CARET_MIRROR_PROPS = [
  'boxSizing',
  'width',
  'height',
  'overflowX',
  'overflowY',
  'borderTopWidth',
  'borderRightWidth',
  'borderBottomWidth',
  'borderLeftWidth',
  'paddingTop',
  'paddingRight',
  'paddingBottom',
  'paddingLeft',
  'fontStyle',
  'fontVariant',
  'fontWeight',
  'fontStretch',
  'fontSize',
  'lineHeight',
  'fontFamily',
  'textAlign',
  'textTransform',
  'textIndent',
  'textDecoration',
  'letterSpacing',
  'wordSpacing',
  'tabSize',
];

export const getTextareaCaretPosition = (textarea, position) => {
  if (!textarea) return { top: 0, left: 0, height: 20 };

  const style = window.getComputedStyle(textarea);
  const mirror = document.createElement('div');

  mirror.style.position = 'absolute';
  mirror.style.visibility = 'hidden';
  mirror.style.whiteSpace = 'pre-wrap';
  mirror.style.wordBreak = 'break-word';
  mirror.style.top = '0';
  mirror.style.left = '-9999px';

  CARET_MIRROR_PROPS.forEach((prop) => {
    mirror.style[prop] = style[prop];
  });

  mirror.style.width = `${textarea.clientWidth}px`;

  const before = textarea.value.substring(0, position);
  const after = textarea.value.substring(position);

  mirror.textContent = before;
  const marker = document.createElement('span');
  marker.textContent = after.length > 0 ? after[0] : '.';
  if (after.length === 0) marker.style.opacity = '0';
  mirror.appendChild(marker);

  document.body.appendChild(mirror);

  const top = marker.offsetTop - textarea.scrollTop;
  const left = marker.offsetLeft - textarea.scrollLeft;
  const height = marker.offsetHeight || parseFloat(style.lineHeight) || 20;

  document.body.removeChild(mirror);

  return { top, left, height };
};
