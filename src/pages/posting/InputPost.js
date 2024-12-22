import React, { useState, useRef } from 'react';
import { FaImage, FaVideo, FaFileAlt, FaTimes } from 'react-icons/fa';
import './css/InputPost.css';
import usePost from './hooks/usePost';

const InputPost = () => {
  const [text, setText] = useState('');
  const [selectedFiles, setSelectedFiles] = useState([]);
  const { createPost, loading, error } = usePost();
  
  const imageInputRef = useRef(null);
  const videoInputRef = useRef(null);
  const fileInputRef = useRef(null);

  const handleTextChange = (e) => setText(e.target.value);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setSelectedFiles([...selectedFiles, ...files]);
  };

  const handleRemoveFile = (index) => {
    setSelectedFiles(selectedFiles.filter((_, i) => i !== index));
  };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     const result = await createPost(text, selectedFiles);
//     if (result) {
//       console.log('Post created successfully', result);
//       // Clear form after success
//       setText('');
//       setSelectedFiles([]);
//     }
//   };

    const handleSubmit = async (e) => {
        e.preventDefault();
    
        // Prevent posting if there is no text or files
        if (!text.trim() && selectedFiles.length === 0) {
        alert("Please enter some text or upload at least one file to post.");
        return;
        }
    
        const result = await createPost(text, selectedFiles);
        
        if (result) {
        console.log('Post created successfully', result);
        // Clear form after success
        setText('');
        setSelectedFiles([]);
        }
    };
  

  // Helper function to display error message
  const renderErrorMessage = (error) => {
    if (!error) return null;
    if (typeof error === 'string') return error;
    if (error.message) return error.message;
    return 'An unknown error occurred';
  };

  return (
    <form onSubmit={handleSubmit} className="post-form">
      <div className="form-group">
        <textarea
          value={text}
          onChange={handleTextChange}
          placeholder="What's on your mind?"
          rows="4"
          className="form-control text-area"
        />
      </div>

      <div className="icon-buttons">
        <FaImage className="upload-icon" onClick={() => imageInputRef.current.click()} />
        <FaVideo className="upload-icon" onClick={() => videoInputRef.current.click()} />
        <FaFileAlt className="upload-icon" onClick={() => fileInputRef.current.click()} />
        
        {/* Hidden inputs */}
        <input
          type="file"
          accept="image/*"
          ref={imageInputRef}
          onChange={handleFileChange}
          style={{ display: 'none' }}
        />
        <input
          type="file"
          accept="video/*"
          ref={videoInputRef}
          onChange={handleFileChange}
          style={{ display: 'none' }}
        />
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          style={{ display: 'none' }}
        />
      </div>

      {selectedFiles.length > 0 && (
        <div className="file-preview-container">
          {selectedFiles.map((file, index) => (
            <div key={index} className="file-preview-item">
              <span>{file.name}</span>
              <FaTimes className="remove-icon" onClick={() => handleRemoveFile(index)} />
            </div>
          ))}
        </div>
      )}

      <button type="submit" className="submit-btn" disabled={loading}>
        {loading ? 'Posting...' : 'Post'}
      </button>

      {/* Display error message if any */}
      {error && <div className="error-message">{renderErrorMessage(error)}</div>}
    </form>
  );
};

export default InputPost;
