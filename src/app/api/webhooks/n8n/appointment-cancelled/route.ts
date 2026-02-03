import { NextRequest, NextResponse } from 'next/server';
import { sendWhatsAppMessage } from '@/lib/evolution/client';
import { formatDateShort } from '@/lib/utils/date';

/**
 * Handles appointment cancellation
 * Sends WhatsApp notification to the patient
 */
export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();
    const { record, old_record } = payload;

    // Validate payload
    if (!record) {
      return NextResponse.json(
        { success: false, error: 'Missing record in payload' },
        { status: 400 }
      );
    }

    // Only process if status is cancelled
    if (record.status !== 'cancelled') {
      return NextResponse.json({ success: true, message: 'No action needed' });
    }

    // Get patient phone from the record
    const patientPhone = record.patient?.phone || old_record?.patient?.phone;
    if (!patientPhone) {
      console.warn('[Cancellation] No patient phone found');
      return NextResponse.json({ success: true, warning: 'No patient phone' });
    }

    // Format the cancellation message in Arabic
    const appointmentDate = record.appointment_date || old_record?.appointment_date;
    const message = `نعتذر، تم إلغاء موعدك يوم ${formatDateShort(appointmentDate)}

هل تريد حجز موعد آخر؟ راسلنا هنا وسنساعدك في اختيار موعد مناسب.`;

    // Send WhatsApp message
    const result = await sendWhatsAppMessage(patientPhone, message);

    if (!result.success) {
      console.error('[Cancellation] Failed to send WhatsApp:', result.error);
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      );
    }

    console.log('[Cancellation] WhatsApp notification sent to:', patientPhone);
    return NextResponse.json({ success: true, messageId: result.data?.key?.id });
  } catch (error) {
    console.error('[Cancellation] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
