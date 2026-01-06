
import { UserRole } from './types';

export const COLORS = {
  brown: '#3e2420',
  beige: '#bc8f74',
  cream: '#fff8ef',
};

export const ROLE_PAGES: Record<string, string[] | 'ALL'> = {
  [UserRole.ADMIN]: 'ALL',
  [UserRole.STAFF]: [
    'dashboard',
    'vt',
    'photoshoot-user',
    'cars',
    'inventory',
    'act',
    'media'
  ],
  [UserRole.BRANCH_MANAGER]: ['dashboard']
};

export const SHOOT_ALLOWED_EMAIL = 'admin@mzjcars.com'; // Example email from requirement
export const MOVE_SUPER_EMAILS = ['coo@mzjcars.com'];

export const FIXED_LOCATIONS = [
  "المستودع : المخزون المتاح",
  "المستودع : سيارات بها ملاحظات",
  "المستودع : مباع تحت التسليم",
  "المستودع : مباع تم التسليم",
  "الوكالة : المخزون المتاح",
  "الوكالة : سيارات بها ملاحظات",
  "الوكالة : مباع تحت التسليم",
  "الوكالة : مباع تم التسليم",
  "فرع 1 الصالة : المخزون المتاح",
  "فرع 1 الصالة : سيارات بها ملاحظات",
  "فرع 1 الصالة : مباع تحت التسليم",
  "فرع 1 الصالة : مباع تم التسليم",
  "فرع 2 الملتقى : المخزون المتاح",
  "فرع 2 الملتقى : سيارات بها ملاحظات",
  "فرع 2 الملتقى : مباع تحت التسليم",
  "فرع 2 الملتقى : مباع تم التسليم",
  "فرع 3 القادسية : المخزون المتاح",
  "فرع 3 القادسية : سيارات بها ملاحظات",
  "فرع 3 القادسية : مباع تحت التسليم",
  "فرع 3 القادسية : مباع تم التسليم"
];

export const SOLD_OR_AGENCY_STATES = [
  'مباع تحت التسليم',
  'مباع تم التسليم',
  'الوكالة'
];
