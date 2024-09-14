// src/components/MoviePlayer.js
import ReactPlayer from 'react-player';

function MoviePlayer({ videoUrl }) {
  return (
    <div className="movie-player">
      <ReactPlayer url={videoUrl} controls={true} />
    </div>
  );
}

export default MoviePlayer;
