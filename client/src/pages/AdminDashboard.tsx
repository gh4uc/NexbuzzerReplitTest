
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Navbar from '@/components/layout/Navbar';

const AdminDashboard: React.FC = () => {
  return (
    <div>
      <Navbar />
      <div className="container mx-auto py-8">
        <Card>
          <CardHeader>
            <CardTitle>Admin Dashboard</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Admin dashboard for managing the platform</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
