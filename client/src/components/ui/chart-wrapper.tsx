
import React, { ReactElement } from 'react';
import { ResponsiveContainer } from 'recharts';

interface ChartWrapperProps {
  children: ReactElement;
  height?: number | string;
  width?: number | string;
  data?: any; // Allow data to be passed through
  margin?: {
    top: number;
    right: number;
    left: number;
    bottom: number;
  };
}

const ChartWrapper = ({ 
  children, 
  height = 400, 
  width = "100%", 
  data,
  margin 
}: ChartWrapperProps) => {
  // Clone the child element and pass the data and margin to it
  const childWithProps = React.cloneElement(children, { data, margin });
  
  return (
    <div className="w-full mt-4">
      <ResponsiveContainer width={width} height={height}>
        {childWithProps}
      </ResponsiveContainer>
    </div>
  );
};

export default ChartWrapper;
