'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Plus, List, CalendarDays } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AppointmentList } from '@/components/appointments/appointment-list';
import { AppointmentCalendar } from '@/components/appointments/appointment-calendar';
import { AppointmentForm } from '@/components/appointments/appointment-form';
import { useAppointments } from '@/hooks/use-appointments';

type ViewMode = 'list' | 'calendar';

export default function AppointmentsPage() {
  const t = useTranslations('appointments');
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [isFormOpen, setIsFormOpen] = useState(false);

  const {
    appointments,
    createAppointment,
    updateStatus,
  } = useAppointments({ realtime: true });

  const handleCreateAppointment = async (data: any) => {
    await createAppointment(data);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">{t('title')}</h1>

        <div className="flex items-center gap-2">
          {/* View toggle */}
          <div className="flex rounded-md border">
            <button
              onClick={() => setViewMode('list')}
              className={cn(
                'px-3 py-2 text-sm',
                viewMode === 'list'
                  ? 'bg-primary text-primary-foreground'
                  : 'hover:bg-muted'
              )}
            >
              <List className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={cn(
                'px-3 py-2 text-sm',
                viewMode === 'calendar'
                  ? 'bg-primary text-primary-foreground'
                  : 'hover:bg-muted'
              )}
            >
              <CalendarDays className="h-4 w-4" />
            </button>
          </div>

          {/* New appointment button */}
          <button
            onClick={() => setIsFormOpen(true)}
            className={cn(
              'inline-flex items-center gap-2 px-4 py-2 rounded-md',
              'bg-primary text-primary-foreground hover:bg-primary/90'
            )}
          >
            <Plus className="h-4 w-4" />
            {t('newAppointment')}
          </button>
        </div>
      </div>

      {viewMode === 'list' ? (
        <AppointmentList />
      ) : (
        <AppointmentCalendar
          appointments={appointments}
          onConfirm={(id) => updateStatus(id, 'confirmed')}
          onCancel={(id) => updateStatus(id, 'cancelled', 'assistant')}
          onComplete={(id) => updateStatus(id, 'completed')}
          onNoShow={(id) => updateStatus(id, 'no_show')}
        />
      )}

      <AppointmentForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleCreateAppointment}
        mode="create"
      />
    </div>
  );
}
