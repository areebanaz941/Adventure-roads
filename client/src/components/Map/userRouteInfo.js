// src/components/RouteInfo.js
import React from 'react';
import PropTypes from 'prop-types';
// Optional: Import Chart.js for elevation graph if needed
// import { Line } from 'react-chartjs-2';

const RouteInfo = ({ route }) => {
  if (!route) {
    return <p>No route selected</p>;
  }

  const { name, roadType, notes, stats } = route.properties;
  const { totalDistance, avgElevation, maxElevation, minElevation } = stats || {};

  // Elevation data for chart (if needed)
  // const elevationData = {
  //   labels: route.geometry.coordinates.map((_, index) => index),
  //   datasets: [
  //     {
  //       label: 'Elevation',
  //       data: route.geometry.coordinates.map(coord => coord[2] || 0), // Assuming 3rd value in coordinate is elevation
  //       fill: false,
  //       backgroundColor: 'blue',
  //       borderColor: 'blue',
  //     },
  //   ],
  // };

  return (
    <div>
      <h4 className="text-lg font-bold">{name}</h4>
      <p><strong>Type:</strong> {roadType}</p>
      <p><strong>Notes:</strong> {notes || 'No additional information'}</p>
      <p><strong>Total Distance:</strong> {totalDistance ? `${totalDistance} km` : 'N/A'}</p>

      {stats && (
        <>
          <h5 className="font-semibold mt-2">Elevation Stats</h5>
          <p><strong>Average Elevation:</strong> {avgElevation ? `${avgElevation} m` : 'N/A'}</p>
          <p><strong>Maximum Elevation:</strong> {maxElevation ? `${maxElevation} m` : 'N/A'}</p>
          <p><strong>Minimum Elevation:</strong> {minElevation ? `${minElevation} m` : 'N/A'}</p>
        </>
      )}

      {/* Elevation chart (optional) */}
      {/* 
      <div className="mt-4">
        <Line data={elevationData} options={{ maintainAspectRatio: false }} />
      </div> 
      */}
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
        avgElevation: PropTypes.number,
        maxElevation: PropTypes.number,
        minElevation: PropTypes.number,
      }),
    }),
    geometry: PropTypes.shape({
      coordinates: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.number)),
    }),
  }),
};

export default RouteInfo;
