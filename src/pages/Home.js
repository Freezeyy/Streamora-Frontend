// src/pages/Home.js
import { useState, useEffect } from 'react';
import MovieCard from '../components/MovieCard';
import Navbar from '../components/Navbar';
import JujutsuKaisen from '../assets/MoviePoster/jujutsu-kaisen.avif';
import OnePunchMan from '../assets/MoviePoster/OnePunchMan.jpg';

function Home() {
  const [movies, setMovies] = useState([]);

  // Sample movie data
  useEffect(() => {
    const sampleMovies = [
        {   
            id: 1,
            title: 'Jujutsu Kaisen',
            posterUrl: JujutsuKaisen,
            description: "Yuji Itadori, a kind-hearted teenager, joins his school's Occult Club for fun, but discovers that its members are actual sorcerers who can manipulate the energy between beings for their own use. He hears about a cursed talisman - the finger of Sukuna, a demon - and its being targeted by other cursed beings."
        },
        { 
            id: 2,
            title: 'One Punch Man',
            posterUrl: OnePunchMan,
            description: "Saitama is a self-proclaimed superhero who can defeat every opponent that he encounters with a single punch. He searches for a worthy opponent after growing bored by a lack of challenge in a world filled with superheroes and villains. While fighting evil, he meets his student, Genos."
        },
    ];
    setMovies(sampleMovies);
  }, []);

  return (
    <div>
      <Navbar />
      <h1 className='font-bold text-5xl mt-10 mb-5'>Movies</h1>
      <div className='flex ml-5 gap-5'>
        {movies.map(movie => (
          <MovieCard key={movie.id} movie={movie} />
        ))}
      </div>
    </div>
  );
}

export default Home;
