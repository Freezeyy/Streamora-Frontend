// src/pages/MovieDetail.js
import { useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';

function MovieDetail() {
  const location = useLocation();
  const { movie } = location.state || {}; // Access the movie object passed via state
  const [movieDetails, setMovieDetails] = useState(movie);

  if (!movieDetails) return <div>Loading...</div>;

  return (
    <div>
        <Navbar />
            <h1 className='font-bold text-5xl mt-10 mb-5 ml-3'>{movieDetails.title}</h1>
            <div className="flex items-center justify-center w-full">
                <img
                src={movie.posterUrl}
                alt={movie.title}
                className="w-60 h-80 object-cover"
                />
            </div>
            <p className='ml-10 mt-10 mr-10'>{movieDetails.description}</p>
    </div>
  );
}

export default MovieDetail;
