# AI_PROVIDER.md

## Vấn đề

Môi trường AI thay đổi mỗi tuần. Hôm nay dùng OpenAI, ngày mai có thể dùng Claude hoặc một model local. Không được phép gắn chặt (hardcode) API của nhà cung cấp vào UI.

## Kiến trúc Adapter (Facade Pattern)

Thiết kế một lớp trung gian (Interface) giữa Ứng dụng và API AI.

```typescript
export interface IAIVideoProvider {
  id: string;
  name: string;
  generateVideo(prompt: string, config: any): Promise<Asset>;
  checkStatus(jobId: string): Promise<JobStatus>;
}
```

## Các Provider mặc định (Ví dụ)

- **Text-to-Video**: Kling, Sora, RunwayML, Luma.
- **Text-to-Audio**: ElevenLabs, OpenAI TTS.
- **Text-to-Image**: Midjourney, Flux, DALL-E 3.
- **LLM (Script generation)**: GPT-4o, Claude 3.5 Sonnet.

## Quy trình làm việc không đồng bộ (Asynchronous Workflow)

1. User bấm "Generate".
2. UI gọi Adapter -> Dispatch Action.
3. Tạo một `Placeholder Clip` (Skeleton) đặt vào Timeline ngay lập tức.
4. Quá trình tải, polling API diễn ra trong Background (Sử dụng Event Bus để bắn tiến độ 0-100%).
5. **UI không bao giờ bị khóa (freeze)** trong quá trình chờ AI.
6. Khi hoàn thành, Placeholder được thay thế bằng Asset thực sự.
