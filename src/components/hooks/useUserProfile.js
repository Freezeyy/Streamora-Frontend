// src/hooks/useUserProfile.js
import { useState, useEffect, useRef } from "react";

const useUserProfile = (userId) => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const hasFetched = useRef(false);

  useEffect(() => {
    if (!userId || hasFetched.current) return;
    
    hasFetched.current = true; // <-- Ensures the fetch runs only once

    console.log("Fetching user profile...");
    const fetchProfile = async () => {
      try {
        const response = await fetch(
          `http://localhost:3000/api/user/${userId}?with[]=followers&with[]=followings`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) throw new Error("Failed to fetch profile");

        const data = await response.json();
        setProfile(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [userId]);

  return { profile, loading, error };
};

export default useUserProfile;
