import React, { useState, useRef, useEffect } from 'react';
import countryCodes from '../data/countryCodes';

/**
 * CountryCodeSelector Component
 * Searchable dropdown for selecting default country code
 */
const CountryCodeSelector = ({ selectedCode, onSelect }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef(null);

  // Find selected country
  const selectedCountry = countryCodes.find(c => c.code === selectedCode) || countryCodes[77]; // Default to India

  // Filter countries based on search
  const filteredCountries = countryCodes.filter(country =>
    country.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    country.code.includes(searchTerm)
  );

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (country) => {
    onSelect(country.code);
    setIsOpen(false);
    setSearchTerm('');
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Default Country Code
      </label>
      
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-2 bg-white border border-gray-300 rounded-lg hover:border-whatsapp-primary focus:outline-none focus:ring-2 focus:ring-whatsapp-primary"
      >
        <span className="flex items-center">
          <span className="text-2xl mr-2">{selectedCountry.flag}</span>
          <span className="font-medium">{selectedCountry.code}</span>
          <span className="ml-2 text-gray-600">{selectedCountry.name}</span>
        </span>
        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-2 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-80 overflow-hidden">
          <div className="p-2 border-b border-gray-200">
            <input
              type="text"
              placeholder="Search country..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-whatsapp-primary"
              autoFocus
            />
          </div>
          
          <div className="overflow-y-auto max-h-64">
            {filteredCountries.length > 0 ? (
              filteredCountries.map((country, index) => (
                <button
                  key={index}
                  onClick={() => handleSelect(country)}
                  className={`w-full flex items-center px-4 py-2 hover:bg-gray-100 text-left ${
                    country.code === selectedCode ? 'bg-whatsapp-light bg-opacity-20' : ''
                  }`}
                >
                  <span className="text-2xl mr-3">{country.flag}</span>
                  <span className="font-medium mr-2">{country.code}</span>
                  <span className="text-gray-600">{country.name}</span>
                </button>
              ))
            ) : (
              <div className="px-4 py-3 text-gray-500 text-center">
                No countries found
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CountryCodeSelector;
