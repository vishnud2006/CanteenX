import { College } from '../types';

export const DEMO_COLLEGES: College[] = [
  {
    collegeId: 'BCE001',
    collegeName: 'Brindavan College of Engineering',
    shortName: 'Brindavan Engg',
    location: 'Bengaluru, Karnataka',
    logo: '🏛️',
    isActive: true
  },
  {
    collegeId: 'ABC001',
    collegeName: 'ABC Engineering College',
    shortName: 'ABC College',
    location: 'Bengaluru, Karnataka',
    logo: '🎓',
    isActive: true
  },
  {
    collegeId: 'XYZ001',
    collegeName: 'XYZ Institute of Technology',
    shortName: 'XYZ Tech',
    location: 'Hyderabad, Telangana',
    logo: '⚡',
    isActive: true
  }
];

export function getCollegeById(collegeId: string): College | undefined {
  if (!collegeId) return undefined;
  const cleanId = collegeId.trim().toUpperCase();
  return DEMO_COLLEGES.find(c => c.collegeId === cleanId);
}

export function searchColleges(query: string): College[] {
  if (!query || !query.trim()) return DEMO_COLLEGES;
  const lower = query.toLowerCase().trim();
  return DEMO_COLLEGES.filter(c =>
    c.collegeName.toLowerCase().includes(lower) ||
    c.shortName.toLowerCase().includes(lower) ||
    c.collegeId.toLowerCase().includes(lower) ||
    c.location.toLowerCase().includes(lower)
  );
}
