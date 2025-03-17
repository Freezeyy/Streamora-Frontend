// src/hooks/useEvent.js
import { useState, useEffect, useRef } from "react";

const useEvent = (userId) => {
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const hasFetched = useRef(false);

  useEffect(() => {
    if (!userId || hasFetched.current) return;
    
    hasFetched.current = true; // <-- Ensures the fetch runs only once

    console.log("Fetching events...");
    const fetchEvents = async () => {
      try {
        const response = await fetch(
          `http://localhost:3000/api/events?user_id=${userId}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) throw new Error("Failed to fetch event");

        const data = await response.json();
        setEvent(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [userId]);

  return { event, loading, error };
};

export default useEvent;
