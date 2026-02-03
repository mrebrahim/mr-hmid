'use client';

import { useTranslations } from 'next-intl';
import { PatientList } from '@/components/patients/patient-list';

export default function PatientsPage() {
  const t = useTranslations('patients');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">{t('title')}</h1>
      </div>

      <PatientList />
    </div>
  );
}
