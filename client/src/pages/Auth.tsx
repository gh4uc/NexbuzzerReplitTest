
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Navbar from '@/components/layout/Navbar';

const Auth: React.FC = () => {
  return (
    <div>
      <Navbar />
      <div className="container mx-auto py-8">
        <Card>
          <CardHeader>
            <CardTitle>Authentication</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Login or Register</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Auth;
