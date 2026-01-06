
import React, { useState, useEffect } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../services/firebase';
import { Car } from '../types';

const Vehicles = () => {
  const [stock, setStock] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'mzj_admin_state', 'v1'), (snap) => {
      if (snap.exists()) {
        setStock(snap.data().stock || []);
      }
      setLoading(false);
    });
    return () => unsub();
  }, []);

  return (
    <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
      <h2 className="text-xl font-black text-brown mb-6">كل السيارات المسجلة</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stock.map((car, i) => (
          <div key={i} className="p-4 rounded-2xl border border-gray-100 bg-gray-50/30">
            <h4 className="font-black text-brown text-sm truncate">{car.car}</h4>
            <p className="text-xs text-gray-500 mt-1">{car.variant}</p>
            <div className="mt-3 flex justify-between items-center">
              <span className="font-mono text-xs text-beige font-bold">{car.vin?.slice(-6)}</span>
              <span className="text-[10px] bg-white px-2 py-1 rounded-md border border-gray-200">{car.modelYear}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Vehicles;
