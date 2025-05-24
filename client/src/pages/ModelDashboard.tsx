
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Navbar from '@/components/layout/Navbar';

const ModelDashboard: React.FC = () => {
  return (
    <div>
      <Navbar />
      <div className="container mx-auto py-8">
        <Card>
          <CardHeader>
            <CardTitle>Model Dashboard</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Your model dashboard</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ModelDashboard;
