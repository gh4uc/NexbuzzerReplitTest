
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Navbar from '@/components/layout/Navbar';

const ScheduledCalls: React.FC = () => {
  return (
    <div>
      <Navbar />
      <div className="container mx-auto py-8">
        <Card>
          <CardHeader>
            <CardTitle>Scheduled Calls</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Your scheduled calls</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ScheduledCalls;
