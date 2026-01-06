
import React, { useEffect, useState, useMemo } from 'react';
import { onSnapshot, doc, collection, setDoc, query, getDocs } from 'firebase/firestore';
import { db } from '../services/firebase';
import { Car, MediaSpec, UserProfile } from '../types';
import { SOLD_OR_AGENCY_STATES } from '../constants';

interface MediaProps {
  user: UserProfile;
}

interface SpecGroup extends MediaSpec {
  docId: string;
  car: string;
  variant: string;
  extColor: string;
  intColor: string;
  modelYear: string;
  count: number;
}

const Media: React.FC<MediaProps> = ({ user }) => {
  const [stock, setStock] = useState<Car[]>([]);
  const [mediaSpecs, setMediaSpecs] = useState<Record<string, MediaSpec>>({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const unsubStock = onSnapshot(doc(db, 'mzj_admin_state', 'v1'), (snap) => {
      if (snap.exists()) setStock(snap.data().stock || []);
    });

    const loadMedia = async () => {
      const snap = await getDocs(collection(db, 'media_specs'));
      const data: Record<string, MediaSpec> = {};
      snap.forEach(d => data[d.id] = d.data() as MediaSpec);
      setMediaSpecs(data);
      setLoading(false);
    };

    loadMedia();
    return () => unsubStock();
  }, []);

  const specGroups = useMemo(() => {
    const groups: Record<string, SpecGroup> = {};
    
    stock.forEach(car => {
      // Exclude based on requirement
      if (SOLD_OR_AGENCY_STATES.some(s => car.location.includes(s))) return;

      const key = `${car.car}|${car.variant}|${car.extColor}|${car.intColor}|${car.modelYear}`;
      const docId = key.replace(/[\/\s]/g, '_'); // Safe ID

      if (!groups[docId]) {
        const media = mediaSpecs[docId] || {
          shoot: 'لا',
          edit: 'لا',
          specsReel: 'لا',
          shootDate: '',
          inAgenda: 'لا',
          agendaMonth: '',
          agendaYear: ''
        };

        groups[docId] = {
          ...media,
          docId,
          car: car.car,
          variant: car.variant,
          extColor: car.extColor,
          intColor: car.intColor,
          modelYear: car.modelYear,
          count: 0
        };
      }
      groups[docId].count++;
    });

    return Object.values(groups).filter(g => 
      g.car.toLowerCase().includes(search.toLowerCase()) || 
      g.variant.toLowerCase().includes(search.toLowerCase())
    );
  }, [stock, mediaSpecs, search]);

  const updateMedia = async (docId: string, field: keyof MediaSpec, value: string) => {
    const specRef = doc(db, 'media_specs', docId);
    await setDoc(specRef, { [field]: value }, { merge: true });
    setMediaSpecs(prev => ({
      ...prev,
      [docId]: { ...(prev[docId] || {}), [field]: value } as MediaSpec
    }));
  };

  if (loading) return <div className="p-8 text-center text-mzj-beige font-bold">جاري تجميع المواصفات...</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-mzj-brown">متابعة الميديا والتصوير</h2>
          <p className="text-sm text-gray-500">تتبع حالة التصوير والمونتاج حسب مواصفات السيارة الفريدة</p>
        </div>
        <input
          type="text"
          placeholder="بحث في الموديلات..."
          className="px-4 py-2 rounded-xl bg-white border border-mzj-beige/30 outline-none text-sm"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="bg-white rounded-3xl border border-mzj-beige/20 shadow-sm overflow-hidden">
        <table className="w-full text-right border-collapse">
          <thead>
            <tr className="bg-mzj-cream text-mzj-brown text-[11px] font-black uppercase tracking-wider">
              <th className="px-4 py-3">المواصفة</th>
              <th className="px-4 py-3">العدد</th>
              <th className="px-4 py-3">تصوير</th>
              <th className="px-4 py-3">مونتاج</th>
              <th className="px-4 py-3">ريل مواصفات</th>
              <th className="px-4 py-3">الأجندة</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {specGroups.map(group => (
              <tr key={group.docId} className="hover:bg-mzj-cream/10 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex flex-col">
                    <span className="text-sm font-black text-mzj-brown">{group.car} - {group.variant}</span>
                    <span className="text-[10px] text-gray-400 font-bold">{group.extColor} / {group.intColor} ({group.modelYear})</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm font-bold text-mzj-brown">
                  <span className="bg-mzj-cream px-2 py-1 rounded-lg">× {group.count}</span>
                </td>
                <td className="px-4 py-3">
                  <select 
                    value={group.shoot}
                    onChange={(e) => updateMedia(group.docId, 'shoot', e.target.value)}
                    className={`text-[10px] font-black px-2 py-1 rounded-lg border outline-none ${
                      group.shoot === 'نعم' ? 'bg-green-100 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-100'
                    }`}
                  >
                    <option value="لا">لا</option>
                    <option value="نعم">نعم</option>
                  </select>
                </td>
                <td className="px-4 py-3">
                  <select 
                    value={group.edit}
                    onChange={(e) => updateMedia(group.docId, 'edit', e.target.value)}
                    className={`text-[10px] font-black px-2 py-1 rounded-lg border outline-none ${
                      group.edit === 'نعم' ? 'bg-green-100 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-100'
                    }`}
                  >
                    <option value="لا">لا</option>
                    <option value="نعم">نعم</option>
                  </select>
                </td>
                <td className="px-4 py-3">
                  <select 
                    value={group.specsReel}
                    onChange={(e) => updateMedia(group.docId, 'specsReel', e.target.value)}
                    className="text-[10px] font-black px-2 py-1 rounded-lg border border-gray-100 outline-none"
                  >
                    <option value="لا">لا</option>
                    <option value="نعم">نعم</option>
                  </select>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <select 
                      value={group.inAgenda}
                      onChange={(e) => updateMedia(group.docId, 'inAgenda', e.target.value)}
                      className="text-[10px] font-black px-2 py-1 rounded-lg border border-gray-100 outline-none"
                    >
                      <option value="لا">لا</option>
                      <option value="نعم">نعم</option>
                    </select>
                    {group.inAgenda === 'نعم' && (
                      <span className="text-[10px] font-bold text-mzj-beige">{group.agendaMonth}/{group.agendaYear}</span>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Media;
