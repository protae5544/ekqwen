# คู่มือกลับมาใช้โปรเจ็คเดิม (Foreign Worker Management System)

## 📁 ที่อยู่โปรเจ็ค
```
/storage/emulated/0/000update/
```

## 🌐 GitHub Repository
```
https://github.com/protae5544/ekqwen
```

## 📋 ไฟล์สำคัญทั้งหมด

### 1. หน้าหลัก (Main Application)
- `index.html` - หน้าแรกของระบบ
- `main1-svg.html` - หน้าแสดงเอกสาร (ใช้ SVG Template)
- `admin-pdf-manager.html` - หน้าจัดการสำหรับแอดมิน

### 2. SVG Templates (หน้าตาเอกสาร PDF)
- `complete-page1.svg` - หน้าที่ 1 (ใบอนุญาตทำงาน)
- `complete-page2.svg` - หน้าที่ 2 (ใบเสร็จรับเงิน) **สำคัญ: มีการขยับบรรทัดลง 17px**

### 3. ระบบสร้าง PDF
- `js/pdf-generator.js` - Client-side PDF generator
- `netlify/functions/generate-pdf.js` - Server-side PDF generation

### 4. ข้อมูล
- `combined-data.json` - ข้อมูลพนักงานทั้งหมด

### 5. ระบบติดตามการเปลี่ยนแปลง
- `git-change-tracker.sh` - Script ตรวจสอบการเปลี่ยนแปลง
- `file-recovery-guide.md` - คู่มือกู้คืนไฟล์

## ⚠️ ปัญหาสำคัญที่ต้องจำ

### ปัญหาบรรทัดสูงเกินในหน้าที่2
- **เหตุ:** ข้อความในหน้าที่2 สูงเกิน 1 บรรทัด
- **วิธีแก้:** ใช้ฟังชั่น `shiftTextElementsDown()` ขยับข้อความลง 17px
- **ตำแหน่งแก้ไข:** `main1-svg.html` บรรทัด 98-105 และ 441-442

### การทำงานของฟังชั่น shiftTextElementsDown
```javascript
function shiftTextElementsDown(svgElement) {
  const textElements = svgElement.querySelectorAll('text');
  textElements.forEach(text => {
    const currentY = parseFloat(text.getAttribute('y')) || 0;
    text.setAttribute('y', currentY + 17); // Shift down by 17px
  });
}
```

## 🚀 วิธีเริ่มต้นใช้งาน

### 1. เข้าไปที่โปรเจ็ค
```bash
cd /storage/emulated/0/000update
```

### 2. เปิดไฟล์หลัก
```bash
# เปิดใน browser
# เข้าไปที่ file:///storage/emulated/0/000update/index.html

# หรือใช้ server
python -m http.server 8000
# แล้วเข้า http://localhost:8000
```

### 3. ตรวจสอบสถานะ
```bash
git status
git log --oneline -10
```

## 🔄 วิธีกลับมาเริ่มใหม่ถ้าลืม

### ถ้าลืมว่ามีอะไรบ้าง
1. เปิดไฟล์ `index.html` ดูว่ามี link ไหนบ้าง
2. ดูใน `main1-svg.html` ว่ามีฟังชั่นอะไรบ้าง
3. ตรวจสอบว่า `shiftTextElementsDown()` ยังอยู่ใน `main1-svg.html` หรือไม่

### ถ้าฟังชั่นหายไป
เพิ่มโค้ดนี้กลับเข้าไปใน `main1-svg.html`:
```javascript
function shiftTextElementsDown(svgElement) {
  const textElements = svgElement.querySelectorAll('text');
  textElements.forEach(text => {
    const currentY = parseFloat(text.getAttribute('y')) || 0;
    text.setAttribute('y', currentY + 17);
  });
}
```

และเรียกใช้ใน `loadSVGTemplates()`:
```javascript
shiftTextElementsDown(svgElement);
```

## 📝 สิ่งที่ต้องจำเสมอ

1. **อย่าลบฟังชั่น shiftTextElementsDown** - มันแก้ปัญหาบรรทัดสูงเกิน
2. **อย่าลืมบอกผมถ้ามีปัญหาซ้ำ** - บอกทันทีไม่ต้องรอ
3. **โปรเจ็คอยู่ที่ /storage/emulated/0/000update/** - เสมอ
4. **GitHub: protae5544/ekqwen** - ไม่ต้องจำ URL

## 🎯 สิ่งที่ระบบทำได้แล้ว
- ✅ สร้างเอกสาร PDF 2 หน้า
- ✅ แก้ไขปัญหาบรรทัดสูงเกินในหน้าที่2
- ✅ มี Admin Panel สำหรับจัดการ
- ✅ QR Code สำหรับตรวจสอบ
- ✅ Server-side PDF generation
- ✅ การเปลี่ยนแปลงเก็บไว้ใน git

---
**สร้างวันที่:** 11 กันยายน 2568  
**ผู้สร้าง:** คุณ (protae5544) + AI  
**ความสำคัญ:** อย่าลืม shiftTextElementsDown()