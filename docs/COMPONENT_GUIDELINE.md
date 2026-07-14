# COMPONENT_GUIDELINE.md

## Nguyên tắc chung

1. **Không Duplicate Code**: Kiểm tra thư mục `src/components` trước khi tạo mới. Tái sử dụng tối đa.
2. **Single Responsibility**: Mỗi component chỉ làm một việc duy nhất. Nếu component quá phức tạp (>250 lines), hãy tách nhỏ.
3. **Typescript Tương Thích**: Mọi component phải export type của Props.
4. **Không Hardcode**: Sử dụng CSS Variables, Design Tokens cho màu sắc, kích thước, spacing.

## Cấu trúc một Component

```tsx
import React, { memo } from 'react';
import clsx from 'clsx';
// Import styles, hooks, types

export interface MyComponentProps {
  /** Giải thích rõ ràng mục đích của prop này */
  title: string;
  isActive?: boolean;
  onClick?: () => void;
  className?: string;
}

/**
 * Component mô tả ngắn gọn chức năng.
 */
export const MyComponent: React.FC<MyComponentProps> = memo(
  ({ title, isActive = false, onClick, className }) => {
    return (
      <div
        className={clsx('base-classes', isActive && 'active-classes', className)}
        onClick={onClick}
        role="button"
      >
        {title}
      </div>
    );
  },
);

MyComponent.displayName = 'MyComponent';
```

## Tách biệt UI và Logic

- **Presentational Components**: Chỉ nhận props và render UI. Không gọi API, không đọc trực tiếp từ Global Store (trừ khi là tính năng đặc thù không thể tránh).
- **Container Components / Features**: Bọc các UI component, connect với Store, gọi API, xử lý logic business.

## Hiệu năng (Performance)

- Sử dụng `React.memo` cho các component nằm trong Timeline, Asset List để tránh re-render không cần thiết.
- Sử dụng `useCallback`, `useMemo` cẩn thận cho các props truyền vào child components.
- Hạn chế inline functions trong render.
