import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const featureName = process.argv[2];

if (!featureName) {
  console.error('Vui lòng cung cấp tên feature. Ví dụ: npm run gen:feature timeline');
  process.exit(1);
}

const sourceDir = path.join(__dirname, '../templates/feature-template');
const targetDir = path.join(__dirname, '../src/features', featureName);

if (fs.existsSync(targetDir)) {
  console.error(`Feature '${featureName}' đã tồn tại!`);
  process.exit(1);
}

function copyRecursiveSync(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (let entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyRecursiveSync(srcPath, destPath);
    } else {
      let content = fs.readFileSync(srcPath, 'utf8');
      content = content.replace(/__FEATURE_NAME__/g, featureName);
      fs.writeFileSync(destPath, content);
    }
  }
}

try {
  copyRecursiveSync(sourceDir, targetDir);
  console.log(`✅ Khởi tạo feature '${featureName}' thành công tại src/features/${featureName}`);
} catch (err) {
  console.error('Lỗi khi tạo feature:', err);
}
