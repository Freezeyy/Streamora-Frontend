// src/components/MovieCard.js
import { Link } from 'react-router-dom';

function MovieCard({ movie }) {
  return (
    <div className="bg-slate-50 border border-gray-200 rounded-lg shadow-md transform transition-transform duration-300 hover:scale-110 hover:shadow-xl w-44">
      <Link 
        to={`/movie/${movie.id}`}
        state={{ movie }} // Pass the movie object as state
      >
        <img
          className="object-fill rounded-t-lg h-60 w-full"
          src={movie.posterUrl}
          alt={movie.title}
        />
        <h3 
            className="mt-2 text-xl font-semibold text-center text-ellipsis" 
            style={{
                overflow: 'hidden',
                // whiteSpace: 'nowrap',
            }}
        >
            {movie.title}
        </h3>
      </Link>
    </div>
  );
}

export default MovieCard;
