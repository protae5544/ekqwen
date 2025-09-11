# คู่มือการใช้งานระบบเอกสารแรงงานต่างด้าว

## การติดตั้งและใช้งาน

### 1. ติดตั้ง Dependencies
```bash
npm install
```

### 2. รันในเครื่อง (Development)
```bash
npm run dev
```

### 3. สร้างไฟล์สำหรับ Production
```bash
npm run build
```

### 4.  Deploy ไปยัง Netlify
- เชื่อมต่อ GitHub repository กับ Netlify
- Netlify จะทำการ build และ deploy อัตโนมัติ

## การทำงานของระบบ

### SVG Template System
- ระบบ template ใหม่ที่ใช้ SVG ทำให้โค้ดลดลงจาก 593 บรรทัดเหลือ ~200 บรรทัด
- รองรับการแสดงผลที่ดีขึ้นบนอุปกรณ์ต่างๆ
- แก้ไขข้อมูลได้ง่ายขึ้น

### Server-side PDF Generation
- QR Code ในหน้า 2 สามารถสแกนเพื่อดาวน์โหลด PDF จาก server
- รองรับการทำงานบน Line Application โดยตรง
- ใช้ Netlify Functions ในการสร้าง PDF

### การใช้งานบน Line Application
1. เปิดหน้าเว็บหลัก (main1-new.html)
2. เลือกแรงงานที่ต้องการ
3. สแกน QR Code ในหน้า 2 (ด้านล่างซ้าย)
4. Line จะเปิดลิงก์และดาวน์โหลด PDF โดยตรง

## โครงสร้างไฟล์

```
/storage/emulated/0/000update/
├── main1-new.html           # หน้าหลัก (SVG Template System)
├── main1.html              # ไฟล์ต้นฉบับ (เก่า)
├── combined-data.json      # ข้อมูลแรงงาน
├── bg1.svg, bg2.svg        # รูปพื้นหลัง
├── test-qr.html           # หน้าทดสอบ QR Code
├── netlify/
│   └── functions/
│       └── generate-pdf.js # Netlify Function
├── package.json           # Dependencies
└── netlify.toml           # Configuration
```

## การทดสอบระบบ

1. เปิด main1-new.html ในเบราว์เซอร์
2. เลือกแรงงานจาก dropdown
3. ตรวจสอบว่าข้อมูลแสดงถูกต้อง
4. ทดสอบ QR Code โดยเปิด test-qr.html
5. สแกน QR Code เพื่อทดสอบการดาวน์โหลด PDF

## ข้อควรระวัง

- ต้อง deploy บน Netlify ถึงจะใช้ server-side PDF generation ได้
- ต้องตั้งค่า environment variables บน Netlify ถ้าจำเป็น
- ตรวจสอบให้แน่ใจว่าไฟล์ SVG และ JSON ถูกต้อง