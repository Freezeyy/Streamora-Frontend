import React from 'react';
import useEvent from './hooks/useEvent';
import './css/RightColumn.css';

function RightColumn() {
  const userId = localStorage.getItem("user`s Id"); // Assuming userId is stored in localStorage after login
  const { event, loading, error } = useEvent(userId);

  return (
    <div className='calendar'>
      <ul>
      {!loading && Array.isArray(event) && event.map((event, index) => (
          <div key={event.id || index}>
            <li className='event-item'>
              <div className='event-content'>
              <div className='flex flex-col relative'>
                <div className='bg-red-500 w-[66px] h-[30px] pb-1 rounded-t-xl justify-center items-center flex'>
                  {/* {event.month} */}
                  {new Date(event.date).toLocaleString('en-US', { month: 'short' })}
                </div>
                <div className='bg-white w-[66px] h-[45px] -mt-2 rounded-b-xl justify-center items-center flex'>
                  {new Date(event.date).getDate()}
                </div>
              </div>
                <div className='event-details'>
                  <div className='event-test'>{event.eventTitle}</div>
                  <div className='event-lol'>{event.eventTime}</div>
                </div>
                {/* <div className='event-hehe'>{event.notes}</div> */}
              </div>
            </li>
            {index < event.length - 1 && <div className="border-b border-gray-300 w-full mb-5" />}
          </div>
      ))}

        {loading && <div className="text-white">Loading...</div>}
        {error && <div className="text-red-500">{error}</div>}
        {!event && !loading && !error && (
          <div>No event data available</div>
        )}
      </ul>
    </div>
  );
}

export default RightColumn;