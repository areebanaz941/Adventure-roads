// src/components/RouteInfo.js
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import ElevationChart from '../UserElevationCharts';

const RouteInfo = ({ route }) => {
  const [comment, setComment] = useState('');

  if (!route) {
    return <p className="text-gray-500">Select a route to see details</p>;
  }

  const { name, roadType, notes, stats } = route.properties;
  const { totalDistance, maxElevation, minElevation, elevationGain } = stats || {};

  const handleCommentChange = (e) => {
    setComment(e.target.value);
  };

  const handleCommentSubmit = (e) => {
    e.preventDefault();
    // Handle comment submission logic here
    console.log('Comment submitted:', comment);
    setComment('');
  };

  return (
    <div className="bg-white shadow rounded-lg p-4">
      <h3 className="text-xl font-bold mb-4">Route Info</h3>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Name:</label>
          <p className="text-lg font-bold">{name}</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Road Type:</label>
            <p className="text-lg">{roadType}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Notes:</label>
            <p className="text-lg">{notes || 'No additional information'}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Distance:</label>
            <p className="text-lg">{totalDistance} km</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Elevation Gain:</label>
            <p className="text-lg">{elevationGain} m</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Max Elevation:</label>
            <p className="text-lg">{maxElevation} m</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Min Elevation:</label>
            <p className="text-lg">{minElevation} m</p>
          </div>
        </div>

        <div>
          <h4 className="font-bold mb-2">Elevation Profile</h4>
          <div className="bg-white rounded">
            <ElevationChart data={route.geometry.coordinates} />
          </div>
        </div>

        <div>
          <h4 className="font-bold mb-2">Comments</h4>
          <form onSubmit={handleCommentSubmit}>
            <textarea
              className="w-full p-2 border rounded-md text-sm mb-2"
              rows="3"
              placeholder="Add your comments here..."
              value={comment}
              onChange={handleCommentChange}
            />
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Submit Comment
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

RouteInfo.propTypes = {
  route: PropTypes.shape({
    properties: PropTypes.shape({
      name: PropTypes.string,
      roadType: PropTypes.string,
      notes: PropTypes.string,
      stats: PropTypes.shape({
        totalDistance: PropTypes.number,
        maxElevation: PropTypes.number,
        minElevation: PropTypes.number,
        elevationGain: PropTypes.number,
      }),
    }),
    geometry: PropTypes.shape({
      coordinates: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.number)),
    }),
  }),
};

export default RouteInfo;