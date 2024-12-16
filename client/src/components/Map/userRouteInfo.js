import React from 'react';
import PropTypes from 'prop-types';
import ElevationChart from '../UserElevationCharts';
import CommentSection from '../Comments/NonComment';

const ROAD_TYPE_COLORS = {
  'Sealed Road': '#808080',
  'Gravel/Dirt Road': '#f59e0b',
  'Track/Trail': '#8b4513',
  'Sand': '#fde047',
  'Not Yet Defined': '#d9f99d'
};

const RouteInfo = ({ route }) => {
  if (!route || !route.properties) {
    return <p className="text-gray-500">Invalid route data</p>;
  }

  const { name, roadType, description, stats } = route.properties;
  const { totalDistance, maxElevation, minElevation, elevationGain } = stats || {};

  return (
    <div className="h-screen overflow-y-auto pb-16">
      <div className="space-y-4 p-4">
        <div>
          <h3 className="text-lg font-bold mb-2">{name}</h3>
          <div 
            style={{ backgroundColor: ROAD_TYPE_COLORS[roadType] }} 
            className="w-full h-1 rounded mb-2" 
          />
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <label className="font-medium text-gray-700">Road Type:</label>
            <p>{roadType}</p>
          </div>
          <div>
            <label className="font-medium text-gray-700">Description:</label>
            <p className="break-words">{description || 'No additional information'}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <label className="font-medium text-gray-700">Distance:</label>
            <p>{totalDistance} km</p>
          </div>
          <div>
            <label className="font-medium text-gray-700">Elevation Gain:</label>
            <p>{elevationGain} m</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <label className="font-medium text-gray-700">Max Elevation:</label>
            <p>{maxElevation} m</p>
          </div>
          <div>
            <label className="font-medium text-gray-700">Min Elevation:</label>
            <p>{minElevation} m</p>
          </div>
        </div>

        <div className="bg-white rounded-lg p-3 shadow-sm">
          <h4 className="font-bold mb-2">Elevation Profile</h4>
          <ElevationChart data={route.geometry.coordinates} />
        </div>
        <div className="bg-white rounded-lg p-3 shadow-sm">
          <h4 className="font-bold mb-2">Comments</h4>
          <CommentSection routeName={route.properties.name} />
        </div>
      </div>
    </div>
  );
};

RouteInfo.propTypes = {
  route: PropTypes.shape({
    properties: PropTypes.shape({
      name: PropTypes.string.isRequired,
      roadType: PropTypes.string.isRequired,
      description: PropTypes.string,
      stats: PropTypes.shape({
        totalDistance: PropTypes.number,
        maxElevation: PropTypes.number,
        minElevation: PropTypes.number,
        elevationGain: PropTypes.number,
      }),
    }).isRequired,
    geometry: PropTypes.shape({
      coordinates: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.number)),
    }).isRequired,
  }),
};

export default RouteInfo;