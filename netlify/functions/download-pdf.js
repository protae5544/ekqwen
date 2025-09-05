const fs = require('fs')
const path = require('path')

exports.handler = async (event, context) => {
  try {
    const { id } = event.queryStringParameters || {}
    
    if (!id) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ error: 'Missing id parameter' })
      }
    }

    // อ่านข้อมูลจาก combined-data.json
    const dataPath = path.join(process.cwd(), 'combined-data.json')
    let workerData
    
    try {
      const jsonData = fs.readFileSync(dataPath, 'utf8')
      const allData = JSON.parse(jsonData)
      workerData = allData.find(worker => worker.requestNumber === id)
    } catch (err) {
      return {
        statusCode: 500,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ error: 'Failed to read worker data' })
      }
    }

    if (!workerData) {
      return {
        statusCode: 404,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ error: `Worker with ID ${id} not found` })
      }
    }

    // สร้าง HTML สำหรับ PDF
    const getCurrentTimestamp = () => {
      const now = new Date()
      return now.toLocaleString('th-TH', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit', hour12: false
      }).replace(',', ' น.')
    }

    const timestamp = getCurrentTimestamp()
    const receiptTimestamp = `เอกสารอิเล็กทรอนิกส์ฉบับนี้ถูกสร้างจากระบบอนุญาตทำงานคนต่างด้าวที่มีสถานะการทำงานไม่ถูกต้องตามกฎหมาย ตามมติคณะรัฐมนตรีเมื่อวันที่ 24 กันยายน 2567<br/>โดยกรมการจัดหางาน กระทรวงแรงงาน<br/>พิมพ์เอกสาร วันที่ ${timestamp}`

    // อ่าน background image
    const bg2Path = path.join(process.cwd(), 'bg2.svg')
    let bg2Content = ''
    try {
      bg2Content = fs.readFileSync(bg2Path, 'utf8')
    } catch (err) {
      console.log('Could not read bg2.svg')
    }

    // สร้าง QR Code URL
    const currentDomain = event.headers.host || 'localhost'
    const protocol = event.headers['x-forwarded-proto'] || 'https'
    const receiptUrl = `${protocol}://${currentDomain}/.netlify/functions/download-pdf?id=${encodeURIComponent(workerData.requestNumber || '')}`
    const receiptQrCodeApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&ecc=H&data=${encodeURIComponent(receiptUrl)}`

    const htmlContent = `
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" lang="th" xml:lang="th">
<head>
  <title>PDF Download</title>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8"/>
  <script src="https://cdn.tailwindcss.com"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js"></script>
  <style type="text/css">
@font-face {
    font-family: 'THSarabunPsk';
    src: url('https://oldqifkvaagtseibueaf.supabase.co/storage/v1/object/public/zzoo/ozz/ss-thsbn.woff2') format('woff2');
    font-weight: normal;
    font-style: normal;
    unicode-range: U+0E00-0E7F, U+0020-007F, U+00A0-00FF;
    font-display: swap;
}
@font-face {
    font-family: 'THSarabunPsk';
    src: url('https://oldqifkvaagtseibueaf.supabase.co/storage/v1/object/public/zzoo/ozz/ss-thsbn-bold.woff2') format('woff2');
    font-weight: bold;
    font-style: normal;
    unicode-range: U+0E00-0E7F, U+0020-007F, U+00A0-00FF;
    font-display: swap;
}
* {
    text-shadow: 0 1px 0 rgba(0,0,0,0.15), 0 2px 1px rgba(0,0,0,0.08) !important;
    -webkit-text-stroke: 0.05px currentColor !important;
}
.ft00{font-size:20px;font-family:'THSarabunPsk';color:#000000;}
.ft01{font-size:25px;font-family:'THSarabunPsk';color:#000000;}
.ft02{font-size:22px;font-family:'THSarabunPsk';color:#000000;}
.ft03{font-size:22px;font-family:'THSarabunPsk';color:#000000;}
.ft04{font-size:15px;font-family:'THSarabunPsk';color:#000000;}
.ft06{font-size:15px;line-height:17px;font-family:'THSarabunPsk';color:#000000;}
  </style>
  <script>
    window.onload = function() {
      setTimeout(async function() {
        try {
          const page2Element = document.getElementById('page2-div');
          
          // Wait for images to load
          const images = document.querySelectorAll('img');
          await Promise.all(Array.from(images).map(img => {
            return new Promise(resolve => {
              if (img.complete) resolve();
              else {
                img.onload = resolve;
                img.onerror = resolve;
                setTimeout(resolve, 3000);
              }
            });
          }));

          const opt = {
            margin: [0, 0, 0, 0],
            filename: 'receipt-${workerData.requestNumber || 'unknown'}.pdf',
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 3, useCORS: true, width: 892, height: 1261, scrollX: 0, scrollY: 0 },
            jsPDF: { unit: 'px', format: [892, 1261], orientation: 'portrait', compress: true }
          };

          await html2pdf().set(opt).from(page2Element).save();
          
          // แสดงข้อความสำเร็จ
          document.body.innerHTML = \`
            <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; font-family: 'THSarabunPsk', sans-serif; background: #f0f2f5;">
              <div style="background: white; padding: 40px; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); text-align: center;">
                <h2 style="color: #27ae60; font-size: 28px; margin-bottom: 20px;">✓ ดาวน์โหลดสำเร็จ</h2>
                <p style="font-size: 20px; margin-bottom: 20px;">ไฟล์ PDF ถูกดาวน์โหลดแล้ว</p>
                <p style="font-size: 16px; color: #666; margin-bottom: 30px;">เลขที่คำขอ: ${workerData.requestNumber || 'N/A'}</p>
                <button onclick="window.close()" style="padding: 12px 24px; background: #3498db; color: white; border: none; border-radius: 5px; cursor: pointer; font-size: 18px;">ปิดหน้าต่าง</button>
              </div>
            </div>
          \`;
          
        } catch (error) {
          console.error('Error generating PDF:', error);
          document.body.innerHTML = \`
            <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; font-family: 'THSarabunPsk', sans-serif; background: #f0f2f5;">
              <div style="background: white; padding: 40px; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); text-align: center;">
                <h2 style="color: #e74c3c; font-size: 28px; margin-bottom: 20px;">⚠ เกิดข้อผิดพลาด</h2>
                <p style="font-size: 20px; margin-bottom: 20px;">ไม่สามารถสร้าง PDF ได้</p>
                <p style="font-size: 16px; color: #666; margin-bottom: 30px;">กรุณาลองใหม่อีกครั้ง</p>
                <button onclick="window.close()" style="padding: 12px 24px; background: #3498db; color: white; border: none; border-radius: 5px; cursor: pointer; font-size: 18px;">ปิดหน้าต่าง</button>
              </div>
            </div>
          \`;
        }
      }, 2000);
    };
  </script>
</head>
<body class="bg-gray-500" style="margin: 0; padding: 0;">
  <!-- Loading Screen -->
  <div id="loading" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0, 0, 0, 0.8); display: flex; flex-direction: column; align-items: center; justify-content: center; z-index: 9999; color: white; font-family: 'THSarabunPsk', sans-serif;">
    <div style="border: 4px solid #f3f3f3; border-top: 4px solid #3498db; border-radius: 50%; width: 60px; height: 60px; animation: spin 1s linear infinite; margin-bottom: 20px;"></div>
    <h2 style="font-size: 28px; margin-bottom: 10px;">กำลังเตรียม PDF...</h2>
    <p style="font-size: 18px; text-align: center;">กรุณารอสักครู่ ระบบกำลังสร้างเอกสารให้คุณ</p>
    <style>
      @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
    </style>
  </div>

  <!-- Page 2: Receipt -->
  <div id="page2-div" class="page-div relative w-[892px] h-[1261px] font-['THSarabunPSK'] text-black mx-auto bg-white" style="margin: 0;">
    <img width="892" height="1261" src="data:image/svg+xml;base64,${Buffer.from(bg2Content).toString('base64')}" alt="receipt background image"/>
    <!-- Receipt QR Code -->
    <img class="absolute top-[925px] left-[120px] w-[90px] h-[90px] object-cover" src="${receiptQrCodeApiUrl}" alt="Receipt QR Code"/>
    <!-- Department Info -->
    <p style="position:absolute;top:147px;left:86px;white-space:nowrap" class="ft00">กรมการจัดหางาน</p>
    <p style="position:absolute;top:170px;left:88px;white-space:nowrap" class="ft00">กระทรวงแรงงาน</p>
    <!-- Receipt Header -->
    <p style="position:absolute;top:90px;left:397px;white-space:nowrap" class="ft01"><b>ใบเสร็จรับเงิน</b></p>
    <p style="position:absolute;top:120px;left:418px;white-space:nowrap" class="ft01"><b>ต้นฉบับ</b></p>
    <!-- Receipt Number -->
    <p style="position:absolute;top:60px;left:598px;white-space:nowrap" class="ft00">เลขที่</p>
    <p style="position:absolute;top:60px;left:640px;white-space:nowrap" class="ft00">${workerData.receiptNumber || 'N/A'}</p>
    <!-- Office and Date -->
    <p style="position:absolute;top:149px;left:582px;white-space:nowrap" class="ft00">ที่ทำการ&#160;&#160; สำนักบริหารแรงงานต่างด้าว</p>
    <p style="position:absolute;top:188px;left:602px;white-space:nowrap" class="ft00">วันที่&#160;&#160; 19 มีนาคม 2568</p>
    <!-- Payment Number -->
    <p style="position:absolute;top:227px;left:540px;white-space:nowrap" class="ft00">เลขที่ใบชำระเงิน&#160;&#160;</p>
    <p style="position:absolute;top:227px;left:640px;white-space:nowrap" class="ft00">${workerData.paymentNumber || 'N/A'}</p>
    <!-- Payer Information -->
    <p style="position:absolute;top:271px;left:60px;white-space:nowrap" class="ft00">เลขรับคำขอที่</p>
    <p style="position:absolute;top:271px;left:180px;white-space:nowrap" class="ft00">${workerData.requestNumber || 'N/A'}</p>
    <p style="position:absolute;top:310px;left:60px;white-space:nowrap" class="ft00">ชื่อผู้ชำระเงิน</p>
    <p style="position:absolute;top:310px;left:180px;white-space:nowrap" class="ft00">${workerData.englishName || workerData.thaiName || 'N/A'}</p>
    <p style="position:absolute;top:310px;left:471px;white-space:nowrap" class="ft00">สัญชาติ</p>
    <p style="position:absolute;top:310px;left:520px;white-space:nowrap" class="ft00">${workerData.nationality || 'N/A'}</p>
    <p style="position:absolute;top:354px;left:60px;white-space:nowrap" class="ft00">เลขอ้างอิงคนต่างด้าว</p>
    <p style="position:absolute;top:354px;left:180px;white-space:nowrap" class="ft00">${workerData.alienReferenceNumber || 'N/A'}</p>
    <p style="position:absolute;top:354px;left:432px;white-space:nowrap" class="ft00">หมายเลขประจำตัวคนต่างด้าว</p>
    <p style="position:absolute;top:354px;left:640px;white-space:nowrap" class="ft00">${workerData.personalID || 'N/A'}</p>
    <!-- Employer Information -->
    <p style="position:absolute;top:399px;left:60px;white-space:nowrap" class="ft00">ชื่อนายจ้าง / สถานประกอบการ&#160;&#160; บริษัท บาน กง เอ็นจิเนียริ่ง จำกัด</p>
    <p style="position:absolute;top:438px;left:60px;white-space:nowrap" class="ft00">เลขประจำตัวนายจ้าง</p>
    <p style="position:absolute;top:437px;left:233px;white-space:nowrap" class="ft00">&#160; 0415567000061</p>
    <!-- Items Header -->
    <p style="position:absolute;top:526px;left:345px;white-space:nowrap" class="ft02"><b>รายการ</b></p>
    <p style="position:absolute;top:526px;left:688px;white-space:nowrap" class="ft02"><b>จำนวนเงิน</b></p>
    <!-- Fee Items -->
    <p style="position:absolute;top:572px;left:118px;white-space:nowrap" class="ft03">1. ค่าธรรมเนียมในการยื่นคำขอ ฉบับละ 100 บาท</p>
    <p style="position:absolute;top:572px;left:736px;white-space:nowrap" class="ft03">100.00</p>
    <p style="position:absolute;top:616px;left:118px;white-space:nowrap" class="ft03">2. ค่าธรรมเนียมใบอนุญาตทำงาน</p>
    <p style="position:absolute;top:616px;left:736px;white-space:nowrap" class="ft03">900.00</p>
    <!-- Total -->
    <p style="position:absolute;top:772px;left:174px;white-space:nowrap" class="ft02"><b>รวมเป็นเงินทั้งสิ้น (บาท)</b></p>
    <p style="position:absolute;top:799px;left:188px;white-space:nowrap" class="ft02"><b>( หนึ่งพันบาทถ้วน )</b></p>
    <p style="position:absolute;top:774px;left:722px;white-space:nowrap" class="ft02"><b>1,000.00</b></p>
    <!-- Receipt Confirmation -->
    <p style="position:absolute;top:894px;left:94px;white-space:nowrap" class="ft00">ได้รับเงินไว้เป็นการถูกต้องแล้ว</p>
    <!-- Signature -->
    <p style="position:absolute;top:977px;left:481px;white-space:nowrap" class="ft00">(ลงชื่อ)</p>
    <p style="position:absolute;top:977px;left:564px;white-space:nowrap" class="ft00">นางสาวอารีวรรณ โพธิ์นิ่มแดง</p>
    <p style="position:absolute;top:977px;left:762px;white-space:nowrap" class="ft00">(ผู้รับเงิน)</p>
    <!-- Position -->
    <p style="position:absolute;top:1017px;left:473px;white-space:nowrap" class="ft00">ตำแหน่ง</p>
    <p style="position:absolute;top:1016px;left:562px;white-space:nowrap" class="ft00">นักวิชาการแรงงานชำนาญการ</p>
    <!-- Receipt Timestamp -->
    <p style="position:absolute;top:1133px;left:55px;white-space:nowrap" class="ft06">${receiptTimestamp}</p>
  </div>
</body>
</html>`

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      },
      body: htmlContent
    }

  } catch (error) {
    console.error('Error in download-pdf function:', error)
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        error: 'Internal server error',
        message: error.message 
      })
    }
  }
}
