# Agentic Coding Hands-on

[![Vietnamese](https://img.shields.io/badge/Vietnamese-green.svg)](https://github.com/sun-asterisk-internal/agentic-coding-hands-on/blob/main/README.md) [![Japanese](https://img.shields.io/badge/Japanese-yellow.svg)](https://github.com/sun-asterisk-internal/agentic-coding-hands-on/blob/main/README_ja.md) [![English](https://img.shields.io/badge/English-blue.svg)](https://github.com/sun-asterisk-internal/agentic-coding-hands-on/blob/main/README_en.md)

Repository phục vụ khóa thực hành **Agentic Coding** nội bộ Sun\*. Học viên sẽ sử dụng **MoMorph + Claude Code** để generate code từ Figma design. Ngoài Claude Code, bạn cũng có thể sử dụng các AI coding agent khác như **Copilot**, **Gemini**, **Windsurf**,... với các bước và cách dùng tương tự. Trong bài thực hành này, chúng tôi giả định bạn dùng **Claude Code**.

tham khảo: https://github.com/sun-asterisk-internal/agentic-coding-hands-on

### Bước 1: Gencode theo các step sau (thay link ví dụ và tên màn hình bằng link momorph màn hình thực tế)

**1. `/momorph.constitution`** — Tạo các quy tắc phát triển cần tuân thủ trong project:

```
/momorph.constitution Viết clean code, tổ chức source code rõ ràng, ngắn gọn. Áp dụng các best practices cho tech stack đã chọn và Supabase. Ứng dụng cần tuân theo UI patterns và guidelines phù hợp với platform (Material Design cho Android, Human Interface Guidelines cho iOS, responsive web design cho web). Tuân thủ các tiêu chuẩn bảo mật OWASP secure coding practices.
```

**2. `/momorph.specify`** — Tạo local specs + tổng hợp thông tin về figma design:

```
/momorph.specify Tạo specs cho màn hình Login sau:
https://momorph.ai/files/Z9KFZ0aAoOfkVEIPuwwkZl/frames/662:14387
```

**3. `/momorph.reviewspecify`** — Review spec đã sinh:

```
/momorph.reviewspecify Review specs cho màn hình Login sau:
https://momorph.ai/files/Z9KFZ0aAoOfkVEIPuwwkZl/frames/662:14387
```

> Nên chạy lệnh này 2–3 lần để spec được review kỹ hơn, trả lời các câu hỏi khi có nghi vấn.

**4. `/momorph.plan`** — Tạo implementation plan:

```
/momorph.plan Sử dụng Supabase Auth. Hãy tạo kế hoạch phát triển màn hình Login:
https://momorph.ai/files/Z9KFZ0aAoOfkVEIPuwwkZl/frames/662:14387
```

**5. `/momorph.reviewplan`** — Review plan đã sinh:

```
/momorph.reviewplan Hãy review lại plan của màn hình Login:
https://momorph.ai/files/Z9KFZ0aAoOfkVEIPuwwkZl/frames/662:14387
```

> Nên chạy lệnh này 2–3 lần để plan được review kỹ hơn.

**6. `/momorph.tasks`** — Chia plan thành danh sách tasks:

```
/momorph.tasks Hãy phân chia công việc phát triển màn Login:
https://momorph.ai/files/Z9KFZ0aAoOfkVEIPuwwkZl/frames/662:14387
```

**7. `/momorph.implement`** — Thực thi tasks, sinh code:

```
/momorph.implement Tiến hành phát triển màn Login:
https://momorph.ai/files/Z9KFZ0aAoOfkVEIPuwwkZl/frames/662:14387
```

**8. Fix bug sau khi implement hết các tasks:**

Khuyến nghị tiếp tục sử dụng command `/momorph.implement` để fix bug:
```
/momorph.implement Thêm task fix bug sai font chữ ở footer. Hãy review lại một lượt xem font chữ các các item đã đúng theo design chưa.
```

### Bước 8: Chạy project

Chạy project theo platform bạn đang sử dụng:

```sh
# Supabase local (chung cho tất cả platforms):
npx supabase start    # Khởi động Supabase local
npx supabase stop     # Dừng Supabase local
```

```sh
# Web (Next.js):
yarn dev              # hoặc npm run dev
```

### Kết quả:


Login:
<img width="1457" height="957" alt="image" src="https://github.com/user-attachments/assets/90956813-ad7a-4329-90c9-5a1c65c5087e" />

Login bằng google (chỉ cho domain sun mới có quyền login)
<img width="1457" height="957" alt="image" src="https://github.com/user-attachments/assets/cfb7de01-c464-4327-b0fd-2354e23661da" />

hệ thống giải:
<img width="1457" height="957" alt="image" src="https://github.com/user-attachments/assets/92817155-c3f5-4ce9-b707-aee35b60eb26" />

Kudo:
<img width="1457" height="957" alt="image" src="https://github.com/user-attachments/assets/476733dc-6303-4c54-95ac-7900a82b7871" />
<img width="1457" height="957" alt="image" src="https://github.com/user-attachments/assets/e3996e19-dd4d-4408-bf1b-b40a5e28f294" />

Send Kudo qua form thông qua api create
<img width="1457" height="957" alt="image" src="https://github.com/user-attachments/assets/ad9471f4-aec0-4469-beb5-79be6c028236" />
record được tạo:
<img width="522" height="576" alt="image" src="https://github.com/user-attachments/assets/9f2bdef2-037d-4ed8-9267-1cf363654bcc" />

Like kudo thông qua api reaction
<img width="522" height="576" alt="image" src="https://github.com/user-attachments/assets/9f2bdef2-037d-4ed8-9267-1cf363654bcc" />
