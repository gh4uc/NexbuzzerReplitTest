
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Navbar from '@/components/layout/Navbar';

const Discover: React.FC = () => {
  return (
    <div>
      <Navbar />
      <div className="container mx-auto py-8">
        <Card>
          <CardHeader>
            <CardTitle>Discover Models</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Browse and discover amazing models for calls</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Discover;
