-- Seed data for Dental Clinic Management System
-- Run this after applying all migrations

-- Insert default clinic schedule
INSERT INTO clinic_schedule (day_of_week, start_time, end_time, is_active, slot_duration_minutes) VALUES
(0, '09:00', '18:00', true, 30),   -- Sunday
(1, '09:00', '18:00', true, 30),   -- Monday
(2, '09:00', '18:00', true, 30),   -- Tuesday
(3, '09:00', '18:00', true, 30),   -- Wednesday
(4, '09:00', '18:00', true, 30),   -- Thursday
(5, '09:00', '13:00', true, 30),   -- Friday (half day)
(6, '00:00', '00:00', false, 30)   -- Saturday (closed)
ON CONFLICT (day_of_week) DO NOTHING;

-- Insert default dental services
INSERT INTO services (name, name_ar, description, price, duration_minutes, is_active) VALUES
('Dental Checkup', 'فحص الأسنان', 'Comprehensive dental examination and consultation', 150.00, 30, true),
('Teeth Cleaning', 'تنظيف الأسنان', 'Professional teeth cleaning and polishing', 200.00, 45, true),
('Tooth Filling', 'حشو الأسنان', 'Dental filling for cavities', 300.00, 60, true),
('Root Canal', 'علاج العصب', 'Root canal treatment', 800.00, 90, true),
('Tooth Extraction', 'خلع الأسنان', 'Tooth removal procedure', 250.00, 30, true),
('Teeth Whitening', 'تبييض الأسنان', 'Professional teeth whitening treatment', 500.00, 60, true),
('Dental X-Ray', 'أشعة سينية', 'Dental radiograph examination', 100.00, 15, true);

-- Insert default knowledge base entries (without embeddings - to be generated via edge function)
INSERT INTO knowledge_base (title, content, category, is_active) VALUES
-- Working hours
('Working Hours', 'The clinic is open Sunday to Thursday from 9 AM to 6 PM, Friday from 9 AM to 1 PM, and closed on Saturday.', 'general', true),
('ساعات العمل', 'العيادة مفتوحة من الأحد إلى الخميس من 9 صباحاً حتى 6 مساءً، الجمعة من 9 صباحاً حتى 1 ظهراً، ومغلقة يوم السبت.', 'general', true),

-- Emergency
('Emergency Appointments', 'For dental emergencies, please call the clinic directly. We reserve slots for urgent cases.', 'policy', true),
('مواعيد الطوارئ', 'لحالات طوارئ الأسنان، يرجى الاتصال بالعيادة مباشرة. نحتفظ بمواعيد للحالات العاجلة.', 'policy', true),

-- Cancellation policy
('Cancellation Policy', 'Please cancel or reschedule your appointment at least 24 hours in advance. Late cancellations may affect future booking privileges.', 'policy', true),
('سياسة الإلغاء', 'يرجى إلغاء أو إعادة جدولة موعدك قبل 24 ساعة على الأقل. قد تؤثر الإلغاءات المتأخرة على حجوزاتك المستقبلية.', 'policy', true),

-- Payment methods
('Payment Methods', 'We accept cash, credit cards, and bank transfers. Payment is due at the time of service.', 'general', true),
('طرق الدفع', 'نقبل الدفع نقداً وببطاقات الائتمان والتحويل البنكي. الدفع مستحق وقت تقديم الخدمة.', 'general', true),

-- Location
('Clinic Location', 'Our clinic is located in the medical district. Parking is available on-site.', 'general', true),
('موقع العيادة', 'تقع عيادتنا في المنطقة الطبية. تتوفر مواقف للسيارات.', 'general', true),

-- Teeth cleaning FAQ
('What is teeth cleaning?', 'Professional teeth cleaning removes plaque and tartar buildup that regular brushing cannot remove. We recommend cleaning every 6 months.', 'faq', true),
('ما هو تنظيف الأسنان؟', 'تنظيف الأسنان الاحترافي يزيل تراكم البلاك والجير الذي لا يمكن للتنظيف العادي إزالته. ننصح بالتنظيف كل 6 أشهر.', 'faq', true),

-- Root canal FAQ
('What is a root canal?', 'A root canal is a treatment to repair and save a tooth that is badly decayed or infected. The procedure involves removing the damaged area of the tooth.', 'faq', true),
('ما هو علاج العصب؟', 'علاج العصب هو إجراء لإصلاح وإنقاذ السن المتسوس أو المصاب بشدة. يتضمن الإجراء إزالة المنطقة التالفة من السن.', 'faq', true);

-- Note: Embeddings should be generated using the edge function after seeding
