import { NextRequest, NextResponse } from 'next/server';
import { sendWhatsAppMessage } from '@/lib/evolution/client';
import { formatTime, formatDateShort } from '@/lib/utils/date';

/**
 * Handles appointment confirmation
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

    // Only process if status changed to confirmed
    if (record.status !== 'confirmed' || old_record?.status === 'confirmed') {
      return NextResponse.json({ success: true, message: 'No action needed' });
    }

    // Get patient phone from the record
    const patientPhone = record.patient?.phone;
    if (!patientPhone) {
      console.warn('[Confirmation] No patient phone found');
      return NextResponse.json({ success: true, warning: 'No patient phone' });
    }

    // Get service name (Arabic)
    const serviceName = record.service?.name_ar || record.service?.name || 'الخدمة';

    // Format the confirmation message in Arabic
    const message = `✅ تم تأكيد موعدك

📅 التاريخ: ${formatDateShort(record.appointment_date)}
⏰ الوقت: ${formatTime(record.appointment_time, 'ar')}
🏥 الخدمة: ${serviceName}

نتطلع لزيارتك!

للإلغاء أو إعادة الجدولة، راسلنا هنا.`;

    // Send WhatsApp message
    const result = await sendWhatsAppMessage(patientPhone, message);

    if (!result.success) {
      console.error('[Confirmation] Failed to send WhatsApp:', result.error);
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      );
    }

    console.log('[Confirmation] WhatsApp notification sent to:', patientPhone);
    return NextResponse.json({ success: true, messageId: result.data?.key?.id });
  } catch (error) {
    console.error('[Confirmation] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
