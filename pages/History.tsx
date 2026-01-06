
import React, { useState, useEffect } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../services/firebase';
import { Move } from '../types';

const History = () => {
  const [moves, setMoves] = useState<Move[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'mzj_admin_state', 'v1'), (snap) => {
      if (snap.exists()) {
        setMoves(snap.data().moves || []);
      }
      setLoading(false);
    });
    return () => unsub();
  }, []);

  return (
    <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
      <h2 className="text-xl font-black text-brown mb-6">سجل حركات السيارات</h2>
      <div className="space-y-4">
        {moves.slice().reverse().map((move, i) => (
          <div key={i} className="p-4 rounded-2xl border border-gray-50 bg-gray-50/20 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-brown/5 text-brown rounded-xl flex items-center justify-center">
                <i className="fa-solid fa-right-left"></i>
              </div>
              <div>
                <h4 className="font-black text-sm text-brown">{move.car}</h4>
                <p className="text-xs text-gray-500 font-mono">{move.vin}</p>
              </div>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <div className="text-right">
                <p className="text-gray-400 font-bold uppercase tracking-tighter">من</p>
                <p className="font-black text-brown">{move.from}</p>
              </div>
              <i className="fa-solid fa-chevron-left text-beige"></i>
              <div className="text-right">
                <p className="text-gray-400 font-bold uppercase tracking-tighter">إلى</p>
                <p className="font-black text-brown">{move.to}</p>
              </div>
            </div>
            <div className="text-xs text-gray-400 font-bold">
              {move.date}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default History;
