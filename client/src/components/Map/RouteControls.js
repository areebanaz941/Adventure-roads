import React from 'react';
import { useMapContext } from './MapContext';
import UploadGPXButton from './AdminButtons/UploadGPXButton';
import SaveDatabaseButton from './AdminButtons/SaveDatabaseButton';
import { SplitLineToChunksButton, SplitLineAtPointButton } from './AdminButtons/SplitLineButtons';
import CalculateRouteButton from './AdminButtons/CalculateRouteButton';

const RouteControls = () => {
  return (
    <div className="flex space-x-2">
      <UploadGPXButton />
      <SaveDatabaseButton />
      <SplitLineToChunksButton />
      <SplitLineAtPointButton />
      <CalculateRouteButton />
    </div>
  );
};

export default RouteControls;