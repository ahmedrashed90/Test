
import React from 'react';
import { UserProfile } from '../types';
import Inventory from './Inventory';

interface CarsProps {
  user: UserProfile;
}

const Cars: React.FC<CarsProps> = ({ user }) => {
  // Cars page typically offers a more granular view of the same data as Inventory
  // For simplicity and matching requirements, we'll use the Inventory engine with expanded details
  return (
    <div className="space-y-6">
      <header>
        <h2 className="text-2xl font-black text-mzj-brown">إدارة بيانات السيارات</h2>
        <p className="text-sm text-gray-500">عرض شامل لكافة البيانات المخزنة لكل سيارة برقم الهيكل</p>
      </header>
      
      <Inventory user={user} />
    </div>
  );
};

export default Cars;
