# 🔄 คู่มีการคืนไฟล์ด้วย Git

## 📋 สถานการณ์ปัจจุบัน:
- **Commit ล่าสุด:** `8b70a1e` - Fix SVG entity errors
- **Commit ก่อนหน้า:** `95793df` - เริ่มต้นโปรเจคในเครื่อง
- **ไฟล์ที่ถูกลบ:** main1.html, pdf.html, worker.html, data.db
- **ไฟล์ใหม่:** main1-svg.html, complete-page1.svg, complete-page2.svg, etc.

## 🛠️ วิธีคืนไฟล์:

### 1. ดูไฟล์ที่ถูกลบ:
```bash
git show HEAD~1:main1.html
git show HEAD~1:pdf.html
git show HEAD~1:worker.html
```

### 2. คืนไฟล์เดิม (ถ้าต้องการ):
```bash
git checkout HEAD~1 -- main1.html
git checkout HEAD~1 -- pdf.html
git checkout HEAD~1 -- worker.html
```

### 3. ดูการเปลี่ยนแปลงก่อนลบ:
```bash
git diff HEAD~1 HEAD -- main1.html
```

### 4. ยกเลิกการลบ (restore deleted files):
```bash
git checkout HEAD~1 -- main1.html pdf.html worker.html data.db
```

## 📊 ติดตามการเปลี่ยนแปลง:
```bash
./git-change-tracker.sh
```

## 🎯 คำแนะนำ:
- **ถ้าต้องการไฟล์เดิม:** ใช้ `git checkout HEAD~1 -- <filename>`
- **ถ้าต้องการดูเนื้อหา:** ใช้ `git show HEAD~1:<filename>`
- **ถ้าต้องการเปรียบเทียบ:** ใช้ `git diff HEAD~1 HEAD -- <filename>`

## 🔍 สถานะไฟล์สำคัญ:
- `main1.html` - ถูกลบ (สามารถคืนได้)
- `main1-svg.html` - มีอยู่ (ไฟล์ใหม่)
- `complete-page1.svg` - มีอยู่ (ไฟล์ใหม่)
- `complete-page2.svg` - มีอยู่ (ไฟล์ใหม่)
- `combined-data.json` - ถูกแก้ไข

คุณสามารถตัดสินใจได้เลยว่าต้องการคืนไฟล์อะไร ผมจะช่วยเป็นผู้ช่วยสังเกตุการณ์ 🙏