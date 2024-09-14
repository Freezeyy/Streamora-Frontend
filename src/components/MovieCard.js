// src/components/MovieCard.js
import { Link } from 'react-router-dom';

function MovieCard({ movie }) {
  return (
    <div className="border border-gray-200 rounded-lg shadow-md transform transition-transform duration-300 hover:scale-105 hover:shadow-xl">
      <Link 
        to={`/movie/${movie.id}`}
        state={{ movie }} // Pass the movie object as state
      >
        <img
          className="w-44 h-60 object-cover rounded-t-lg"
          src={movie.posterUrl}
          alt={movie.title}
        />
        <h3 className="mt-2 text-xl font-semibold text-center">{movie.title}</h3>
      </Link>
    </div>
  );
}

export default MovieCard;
