"use client";

import { useState, useEffect, useRef } from 'react';

const SearchBox = ({ onSearchSelect }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const searchTimeout = useRef(null);

  const searchLocation = async (query) => {
    if (query.length < 3) {
      setResults([]);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=ir&limit=5&accept-language=fa`
      );
      const data = await response.json();
      setResults(data);
    } catch (error) {
      console.error('Error searching location:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }

    searchTimeout.current = setTimeout(() => {
      searchLocation(searchTerm);
    }, 500);

    return () => {
      if (searchTimeout.current) {
        clearTimeout(searchTimeout.current);
      }
    };
  }, [searchTerm]);

  const handleResultClick = (result) => {
    const { lat, lon, display_name } = result;
    if (onSearchSelect) {
      onSearchSelect([parseFloat(lat), parseFloat(lon)]);
    }
    setSearchTerm('');
    setResults([]);
  };

  return (
    <div 
      className="bg-white p-2 rounded-lg shadow-lg w-full" 
      onClick={(e) => e.stopPropagation()}
    >
      <div className="relative">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="جستجوی مکان..."
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          dir="rtl"
        />
        {isLoading && (
          <div className="absolute left-2 top-2.5">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
          </div>
        )}
      </div>
      {results.length > 0 && (
        <div className="mt-2 max-h-60 overflow-y-auto">
          {results.map((result, index) => (
            <div
              key={index}
              onClick={() => handleResultClick(result)}
              className="p-2 hover:bg-gray-100 cursor-pointer rounded-md text-right"
            >
              {result.display_name}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchBox; 