import React from 'react';
import {
  FaFile,
  FaFileAlt,
  FaFileArchive,
  FaFileExcel,
  FaFilePdf,
  FaFilePowerpoint,
  FaFileWord,
} from 'react-icons/fa';
import {
  getDocumentKind,
  getMediaFileName,
} from './postUtils';
import './css/FileAttachmentCard.css';

const ICON_BY_KIND = {
  pdf: FaFilePdf,
  word: FaFileWord,
  excel: FaFileExcel,
  powerpoint: FaFilePowerpoint,
  text: FaFileAlt,
  archive: FaFileArchive,
  generic: FaFile,
};

const FileAttachmentCard = ({
  href,
  fileName,
  mediaPath,
  className = '',
  title,
}) => {
  const displayName = getMediaFileName({ media_path: mediaPath, file_name: fileName });
  const kind = getDocumentKind(mediaPath || fileName);
  const Icon = ICON_BY_KIND[kind] || ICON_BY_KIND.generic;
  const fullTitle = title || displayName;

  const content = (
    <>
      <span className={`file-attachment-card__icon file-attachment-card__icon--${kind}`} aria-hidden="true">
        <Icon />
      </span>
      <span className="file-attachment-card__name">{displayName}</span>
    </>
  );

  const classes = `file-attachment-card ${className}`.trim();

  if (href) {
    return (
      <a
        href={href}
        className={classes}
        target="_blank"
        rel="noopener noreferrer"
        title={fullTitle}
      >
        {content}
      </a>
    );
  }

  return (
    <div className={classes} title={fullTitle}>
      {content}
    </div>
  );
};

export default FileAttachmentCard;
