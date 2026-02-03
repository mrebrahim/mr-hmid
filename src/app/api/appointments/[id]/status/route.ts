import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendWhatsAppMessage } from '@/lib/evolution/client';
import { formatTime, formatDateShort } from '@/lib/utils/date';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { status, cancelledBy } = await request.json();
    const appointmentId = params.id;

    // Get current appointment data
    const { data: appointment, error: fetchError } = await supabase
      .from('appointments')
      .select('*, patient:patients(name, phone), service:services(name_ar)')
      .eq('id', appointmentId)
      .single();

    if (fetchError || !appointment) {
      return NextResponse.json(
        { success: false, error: 'Appointment not found' },
        { status: 404 }
      );
    }

    // Update appointment status
    const updateData: Record<string, unknown> = {
      status,
      updated_at: new Date().toISOString()
    };

    if (status === 'confirmed') {
      updateData.confirmed_at = new Date().toISOString();
    } else if (status === 'cancelled') {
      updateData.cancelled_at = new Date().toISOString();
      if (cancelledBy) {
        updateData.cancelled_by = cancelledBy;
      }
    }

    const { error: updateError } = await supabase
      .from('appointments')
      .update(updateData)
      .eq('id', appointmentId);

    if (updateError) {
      return NextResponse.json(
        { success: false, error: updateError.message },
        { status: 500 }
      );
    }

    // Get patient phone - from relation or direct field
    const patientPhone = appointment.patient?.phone || appointment.patient_phone;
    const patientName = appointment.patient?.name || appointment.patient_name || '';
    const serviceName = appointment.service?.name_ar || appointment.purpose || 'الخدمة';

    // Send WhatsApp notification
    if (patientPhone) {
      let message = '';

      if (status === 'confirmed') {
        message = `✅ مرحباً ${patientName}

تم تأكيد موعدك بنجاح!

📅 التاريخ: ${formatDateShort(appointment.appointment_date)}
⏰ الوقت: ${formatTime(appointment.appointment_time, 'ar')}
🏥 الخدمة: ${serviceName}

نتطلع لزيارتك!

للإلغاء أو إعادة الجدولة، راسلنا هنا.`;
      } else if (status === 'cancelled') {
        message = `نعتذر ${patientName}،

تم إلغاء موعدك يوم ${formatDateShort(appointment.appointment_date)}

هل تريد حجز موعد آخر؟ راسلنا هنا وسنساعدك في اختيار موعد مناسب.`;
      }

      if (message) {
        const whatsappResult = await sendWhatsAppMessage(patientPhone, message);

        if (!whatsappResult.success) {
          console.error('[Status Update] WhatsApp failed:', whatsappResult.error);
          // Don't fail the request, just log the error
        } else {
          console.log('[Status Update] WhatsApp sent to:', patientPhone);
        }
      }
    }

    return NextResponse.json({
      success: true,
      status,
      whatsappSent: !!patientPhone
    });
  } catch (error) {
    console.error('[Status Update] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
