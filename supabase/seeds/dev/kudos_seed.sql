-- Dev seed data for Kudos Live Board + Compose dialog local testing.
-- Applied after migrations via `supabase db reset`.

-- =====================================================================
-- Seed 20 sample Sunners — shadows of auth.users. Real auth.users are
-- created via Supabase Auth; for local dev we keep the shadow rows only.
-- =====================================================================
INSERT INTO public.profiles (id, display_name, avatar_url, department) VALUES
  ('11111111-1111-1111-1111-111111111111', 'Đỗ Hoàng Hiệp',     null, 'Engineering'),
  ('22222222-2222-2222-2222-222222222222', 'Dương Thúy An',     null, 'Engineering'),
  ('33333333-3333-3333-3333-333333333333', 'Mai Phương Thúy',   null, 'Design'),
  ('44444444-4444-4444-4444-444444444444', 'Lê Kiều Trang',     null, 'Design'),
  ('55555555-5555-5555-5555-555555555555', 'Nguyễn Văn Quy',    null, 'Product'),
  ('66666666-6666-6666-6666-666666666666', 'Nguyễn Bá Chức',    null, 'Product'),
  ('77777777-7777-7777-7777-777777777777', 'Nguyễn Hoàng Linh', null, 'Operations'),
  ('88888888-8888-8888-8888-888888888888', 'Trần Minh Quân',    null, 'Operations'),
  ('99999999-9999-9999-9999-999999999999', 'Phạm Hải Yến',      null, 'Marketing'),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Vũ Thanh Tùng',     null, 'Marketing'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Bùi Quốc Trung',    null, 'Engineering'),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'Ngô Thị Hương',     null, 'Engineering'),
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', 'Hoàng Minh Tuấn',   null, 'Design'),
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'Đinh Kim Oanh',     null, 'Product'),
  ('ffffffff-ffff-ffff-ffff-ffffffffffff', 'Lý Đức Bảo',        null, 'Product'),
  ('12121212-1212-1212-1212-121212121212', 'Trịnh Mỹ Linh',     null, 'Operations'),
  ('13131313-1313-1313-1313-131313131313', 'Võ Anh Dũng',       null, 'Operations'),
  ('14141414-1414-1414-1414-141414141414', 'Chu Phương Anh',    null, 'Marketing'),
  ('15151515-1515-1515-1515-151515151515', 'Tống Văn Khang',    null, 'Engineering'),
  ('16161616-1616-1616-1616-161616161616', 'Đặng Thu Hà',       null, 'Design')
ON CONFLICT (id) DO NOTHING;

-- =====================================================================
-- 50 legacy-shape kudos (no title, no anonymous) — exercises fallback
-- chip render path (hashtags[0]) on Live Board cards.
-- =====================================================================
WITH senders AS (
  SELECT ARRAY[
    '11111111-1111-1111-1111-111111111111',
    '22222222-2222-2222-2222-222222222222',
    '33333333-3333-3333-3333-333333333333',
    '44444444-4444-4444-4444-444444444444',
    '55555555-5555-5555-5555-555555555555',
    '66666666-6666-6666-6666-666666666666',
    '77777777-7777-7777-7777-777777777777',
    '88888888-8888-8888-8888-888888888888',
    '99999999-9999-9999-9999-999999999999',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    'cccccccc-cccc-cccc-cccc-cccccccccccc',
    'dddddddd-dddd-dddd-dddd-dddddddddddd',
    'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee',
    'ffffffff-ffff-ffff-ffff-ffffffffffff',
    '12121212-1212-1212-1212-121212121212',
    '13131313-1313-1313-1313-131313131313',
    '14141414-1414-1414-1414-141414141414',
    '15151515-1515-1515-1515-151515151515',
    '16161616-1616-1616-1616-161616161616'
  ]::uuid[] AS ids
)
INSERT INTO public.kudos (id, sender_id, recipient_id, message, hashtags, created_at, heart_count)
SELECT
  gen_random_uuid(),
  (SELECT ids[1 + ((gs - 1) % 20)] FROM senders),
  (SELECT ids[1 + (((gs - 1) + 7) % 20)] FROM senders),
  'Cảm ơn bạn vì đã hỗ trợ tuyệt vời trong dự án tuần qua. Tinh thần #' || gs || ' thật sự truyền cảm hứng cho cả team.',
  CASE ((gs - 1) % 5)
    WHEN 0 THEN ARRAY['IDOL GIỚI TRẺ', 'Dedicated', 'Inspiring']::text[]
    WHEN 1 THEN ARRAY['TEAMWORK', 'Supportive']::text[]
    WHEN 2 THEN ARRAY['CREATOR', 'Innovative']::text[]
    WHEN 3 THEN ARRAY['MENTOR', 'Patient']::text[]
    ELSE       ARRAY['PROBLEM SOLVER', 'Sharp']::text[]
  END,
  now() - (gs * interval '5 hours'),
  (50 - gs) + (gs * 3) % 17
FROM generate_series(1, 50) AS gs;

-- =====================================================================
-- 15 compose-shape kudos (with title + is_anonymous). Mix of named + anon.
-- =====================================================================
INSERT INTO public.kudos
  (id, sender_id, recipient_id, title, is_anonymous, message, hashtags, created_at, heart_count)
VALUES
  (gen_random_uuid(), '11111111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333333',
   'Người truyền động lực cho tôi', false,
   'Cảm ơn Thúy vì đã luôn động viên cả team trong những ngày sprint căng thẳng. Sự nhiệt huyết của bạn là liều thuốc tinh thần cho mình.',
   ARRAY['motivator', 'teamwork']::text[], now() - interval '2 hours', 23),
  (gen_random_uuid(), '22222222-2222-2222-2222-222222222222', '44444444-4444-4444-4444-444444444444',
   'Cô nàng visual của team', false,
   'Nhờ Trang mà design system của dự án trở nên gọn gàng và dễ dùng hơn rất nhiều. Bạn là người hùng thầm lặng!',
   ARRAY['design-system', 'hero']::text[], now() - interval '6 hours', 18),
  (gen_random_uuid(), '55555555-5555-5555-5555-555555555555', '66666666-6666-6666-6666-666666666666',
   'Problem Solver đỉnh nhất tháng', false,
   'Chức đã giải quyết bug production quan trọng trong vòng chưa đến 30 phút. Cảm ơn bạn vì sự cứu nguy kịp thời!',
   ARRAY['problem-solver', 'quick-fix']::text[], now() - interval '12 hours', 34),
  (gen_random_uuid(), '77777777-7777-7777-7777-777777777777', '88888888-8888-8888-8888-888888888888',
   'Người giữ nhịp team', false,
   'Anh Quân luôn theo sát tiến độ và nhắc nhở nhẹ nhàng để team không bị miss deadline. Cảm ơn anh nhiều!',
   ARRAY['ops', 'reliable']::text[], now() - interval '1 day', 12),
  (gen_random_uuid(), '99999999-9999-9999-9999-999999999999', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
   'Sếp truyền lửa', true,
   'Cảm ơn anh vì những buổi 1-1 thẳng thắn và động viên đúng lúc. Điều đó thực sự giúp em tự tin hơn rất nhiều.',
   ARRAY['leadership', 'mentor']::text[], now() - interval '1 day 3 hours', 27),
  (gen_random_uuid(), 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'cccccccc-cccc-cccc-cccc-cccccccccccc',
   'Review code tận tình nhất', false,
   'Review của chị Hương luôn chi tiết và mang tính xây dựng. Em học được rất nhiều từ mỗi PR được bạn duyệt.',
   ARRAY['code-review', 'mentor']::text[], now() - interval '1 day 8 hours', 21),
  (gen_random_uuid(), 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee',
   'Champion của UX research', false,
   'Oanh đã dẫn dắt một phiên user testing vô cùng hiệu quả. Insight bạn mang về giúp team định hướng lại sản phẩm.',
   ARRAY['ux-research', 'insight']::text[], now() - interval '1 day 18 hours', 15),
  (gen_random_uuid(), 'ffffffff-ffff-ffff-ffff-ffffffffffff', '12121212-1212-1212-1212-121212121212',
   'Linh hồn của team Ops', true,
   'Không có Linh thì chắc team đã loạn từ lâu. Cảm ơn bạn vì mọi thứ bạn âm thầm xử lý phía sau hậu trường.',
   ARRAY['ops', 'unsung-hero']::text[], now() - interval '2 days', 40),
  (gen_random_uuid(), '13131313-1313-1313-1313-131313131313', '14141414-1414-1414-1414-141414141414',
   'Người thắp lửa cho campaign', false,
   'Anh Dũng đã đề xuất ý tưởng campaign hoàn toàn mới và team đã triển khai thành công rực rỡ. Cảm ơn anh!',
   ARRAY['marketing', 'creative']::text[], now() - interval '2 days 5 hours', 29),
  (gen_random_uuid(), '15151515-1515-1515-1515-151515151515', '16161616-1616-1616-1616-161616161616',
   'Đồng đội đáng tin nhất', false,
   'Cảm ơn Hà vì đã pair lập trình cùng mình suốt tuần trước. Nhờ bạn mà tính năng khó nhằn đã xong đúng hạn.',
   ARRAY['pair-programming', 'teamwork']::text[], now() - interval '2 days 11 hours', 17),
  (gen_random_uuid(), '33333333-3333-3333-3333-333333333333', '11111111-1111-1111-1111-111111111111',
   'Leader quan tâm', true,
   'Hiệp đã dành thời gian lắng nghe khó khăn của mình và đưa ra hướng giải quyết thực tế. Biết ơn bạn nhiều.',
   ARRAY['leadership', 'care']::text[], now() - interval '3 days', 31),
  (gen_random_uuid(), '44444444-4444-4444-4444-444444444444', '22222222-2222-2222-2222-222222222222',
   'Chuyên gia dọn dẹp kỹ thuật', false,
   'Cảm ơn An vì đã refactor module auth đã "tồn tại từ kỷ Jura". Code giờ dễ đọc và dễ bảo trì hơn hẳn.',
   ARRAY['refactor', 'clean-code']::text[], now() - interval '3 days 4 hours', 22),
  (gen_random_uuid(), '66666666-6666-6666-6666-666666666666', '55555555-5555-5555-5555-555555555555',
   'Người giữ lửa cho đồng đội', false,
   'Cảm ơn Quy vì những lời động viên đúng lúc trước ngày release. Cảm giác cả team được tiếp thêm sức mạnh.',
   ARRAY['motivator', 'encourage']::text[], now() - interval '3 days 10 hours', 19),
  (gen_random_uuid(), '88888888-8888-8888-8888-888888888888', '99999999-9999-9999-9999-999999999999',
   'Người chuyên nghiệp đến từng chi tiết', false,
   'Yến đã chuẩn bị tài liệu họp chỉn chu đến từng slide. Cảm ơn bạn vì sự chu đáo ấy.',
   ARRAY['detail-oriented', 'professional']::text[], now() - interval '4 days', 14),
  (gen_random_uuid(), 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'dddddddd-dddd-dddd-dddd-dddddddddddd',
   'Đồng nghiệp trong mơ', true,
   'Tuấn luôn sẵn sàng giúp đỡ bất kể thời gian nào. Làm việc với bạn như có chỗ dựa vững chắc.',
   ARRAY['helper', 'reliable']::text[], now() - interval '4 days 9 hours', 25);
