const fs = require('fs')
const path = require('path')
const puppeteer = require('puppeteer')

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
    
    // เพิ่มส่วนตรวจสอบ User-Agent
    const userAgent = event.headers['user-agent'] || ''
    const isLineApp = /Line\//i.test(userAgent)
    const isAndroid = /Android/i.test(userAgent)
    
    // สร้าง URL สำหรับเปิดใน browser ภายนอก
    const currentDomain = event.headers.host || 'localhost'
    const protocol = event.headers['x-forwarded-proto'] || 'https'
    const externalUrl = `${protocol}://${currentDomain}/.netlify/functions/download-pdf?id=${encodeURIComponent(id)}&force_external=1`
    
    // กรณีใช้งานใน LINE Android ให้ redirect ออกไป browser ภายนอก
    if (isLineApp && isAndroid && !event.queryStringParameters.force_external) {
      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
        },
        body: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="UTF-8">
            <title>Redirecting...</title>
            <style>
              body { font-family: 'THSarabunNew', sans-serif; text-align: center; margin-top: 50px; }
            </style>
          </head>
          <body>
            <p>กำลังเปิดเบราว์เซอร์ภายนอก...</p>
            <script>
              setTimeout(function() {
                window.location.href = 'line://externalBrowser/?url=${encodeURIComponent(externalUrl)}';
              }, 100);
            </script>
          </body>
          </html>
        `
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
    
    // อ่าน background image
    const bg2Path = path.join(process.cwd(), 'bg2.svg')
    let bg2Content = ''
    try {
      bg2Content = fs.readFileSync(bg2Path, 'utf8')
    } catch (err) {
      console.log('Could not read bg2.svg')
    }
    
    // อ่านไฟล์ฟอนต์และแปลงเป็น base64
    const fontNormalPath = path.join(process.cwd(), 'THSarabunNew.ttf')
    const fontBoldPath = path.join(process.cwd(), 'THSarabunNew Bold.ttf')
    
    let fontNormalBase64 = ''
    let fontBoldBase64 = ''
    
    try {
      fontNormalBase64 = fs.readFileSync(fontNormalPath, 'base64')
      fontBoldBase64 = fs.readFileSync(fontBoldPath, 'base64')
    } catch (err) {
      console.log('Could not read font files, using fallback fonts')
    }
    
    // สร้าง QR Code URL
    const receiptUrl = `${protocol}://${currentDomain}/.netlify/functions/download-pdf?id=${encodeURIComponent(workerData.requestNumber || '')}`
    const receiptQrCodeApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&ecc=H&data=${encodeURIComponent(receiptUrl)}`
    
    // สร้าง timestamp
    const getCurrentTimestamp = () => {
      const now = new Date()
      return now.toLocaleString('th-TH', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit', hour12: false
      }).replace(',', ' น.')
    }
    const timestamp = getCurrentTimestamp()
    const receiptTimestamp = `เอกสารอิเล็กทรอนิกส์ฉบับนี้ถูกสร้างจากระบบอนุญาตทำงานคนต่างด้าวที่มีสถานะการทำงานไม่ถูกต้องตามกฎหมาย ตามมติคณะรัฐมนตรีเมื่อวันที่ 24 กันยายน 2567<br/>โดยกรมการจัดหางาน กระทรวงแรงงาน<br/>พิมพ์เอกสาร วันที่ ${timestamp}`
    
    // สร้าง CSS ที่มีฟอนต์ฝังอยู่ (ใช้ไฟล์ ttf)
    const cssContent = `
@font-face {
    font-family: 'THSarabunPsk';
    src: url('data:font/truetype;base64,${fontNormalBase64}') format('truetype');
    font-weight: normal;
    font-style: normal;
    unicode-range: U+0E00-0E7F, U+0020-007F, U+00A0-00FF;
    font-display: swap;
}
@font-face {
    font-family: 'THSarabunPsk';
    src: url('data:font/truetype;base64,${fontBoldBase64}') format('truetype');
    font-weight: bold;
    font-style: normal;
    unicode-range: U+0E00-0E7F, U+0020-007F, U+00A0-00FF;
    font-display: swap;
}
* {
    text-shadow: 0 1px 0 rgba(0,0,0,0.15), 0 2px 1px rgba(0,0,0,0.08) !important;
    -webkit-text-stroke: 0.05px currentColor !important;
}
.ft00{font-size:20px;font-family:'THSarabunPsk', sans-serif;color:#000000;}
.ft01{font-size:25px;font-family:'THSarabunPsk', sans-serif;color:#000000;}
.ft02{font-size:22px;font-family:'THSarabunPsk', sans-serif;color:#000000;}
.ft03{font-size:22px;font-family:'THSarabunPsk', sans-serif;color:#000000;}
.ft04{font-size:15px;font-family:'THSarabunPsk', sans-serif;color:#000000;}
.ft06{font-size:15px;line-height:17px;font-family:'THSarabunPsk', sans-serif;color:#000000;}
body {
  margin: 0;
  padding: 0;
  background: #fff;
  font-family: 'THSarabunPsk', sans-serif;
}
.page-div {
  position: relative;
  width: 892px;
  height: 1261px;
  font-family: 'THSarabunPsk', sans-serif;
  color: #000000;
  margin: 0 auto;
  background: white;
}
`
    
    // สร้าง HTML template เหมือนเดิม
    const htmlContent = `
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" lang="th" xml:lang="th">
<head>
  <title>PDF Download</title>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8"/>
  <style type="text/css">
${cssContent}
  </style>
</head>
<body>
  <div id="page2-div" class="page-div">
    <img width="892" height="1261" src="data:image/svg+xml;base64,${Buffer.from(bg2Content).toString('base64')}" alt="receipt background image"/>
    <!-- Receipt QR Code -->
    <img style="position:absolute;top:925px;left:120px;width:90px;height:90px;object-fit:cover" src="${receiptQrCodeApiUrl}" alt="Receipt QR Code"/>
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

    // ใช้ Puppeteer สร้าง PDF จาก HTML
    const browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu'
      ]
    })
    
    const page = await browser.newPage()
    
    // ตั้งค่า viewport ให้ตรงกับขนาด PDF
    await page.setViewport({ width: 892, height: 1261 })
    
    // ตั้งค่า timeout ให้สูงขึ้นสำหรับการโหลดฟอนต์
    await page.setDefaultNavigationTimeout(30000)
    
    await page.setContent(htmlContent, { 
      waitUntil: 'networkidle0',
      timeout: 30000
    })
    
    // รอให้ภาพโหลดเสร็จ
    try {
      await page.waitForSelector('img', { timeout: 10000 })
    } catch (e) {
      console.log('Images not loaded, continuing anyway')
    }
    
    // รอให้ฟอนต์โหลดเสร็จ
    await page.evaluate(() => {
      return new Promise((resolve) => {
        setTimeout(resolve, 2000)
      })
    })
    
    // สร้าง PDF
    const pdfBuffer = await page.pdf({
      width: '892px',
      height: '1261px',
      printBackground: true,
      margin: {
        top: 0,
        bottom: 0,
        left: 0,
        right: 0
      },
      preferCSSPageSize: true
    })
    
    await browser.close()
    
    // ส่ง PDF กลับไปให้ client
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="receipt-${workerData.requestNumber || 'unknown'}.pdf"`,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      },
      body: pdfBuffer.toString('base64'),
      isBase64Encoded: true
    }
    
  } catch (error) {
    // เพิ่มการบันทึก error log
    console.error('ERROR:', {
      timestamp: new Date().toISOString(),
      userAgent: event.headers['user-agent'],
      error: error.stack,
      queryParams: event.queryStringParameters
    })
    
    // กรณีเกิด error ให้แสดงหน้าแจ้งเตือน
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
      },
      body: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>เกิดข้อผิดพลาด</title>
          <style>
            body { 
              font-family: 'THSarabunNew', sans-serif; 
              text-align: center; 
              padding: 50px 20px; 
              background: #f5f5f5;
            }
            .error-container {
              background: white;
              padding: 40px;
              border-radius: 10px;
              box-shadow: 0 4px 6px rgba(0,0,0,0.1);
              max-width: 500px;
              margin: 0 auto;
            }
            .error-title {
              color: #e74c3c;
              font-size: 28px;
              margin-bottom: 20px;
            }
            .error-message {
              font-size: 18px;
              margin-bottom: 30px;
            }
            .error-detail {
              font-size: 14px;
              color: #666;
              margin-bottom: 30px;
            }
            .retry-button {
              background: #3498db;
              color: white;
              border: none;
              padding: 12px 24px;
              border-radius: 5px;
              cursor: pointer;
              font-size: 16px;
              text-decoration: none;
              display: inline-block;
            }
          </style>
        </head>
        <body>
          <div class="error-container">
            <h1 class="error-title">⚠️ เกิดข้อผิดพลาด</h1>
            <p class="error-message">ไม่สามารถสร้างเอกสาร PDF ได้</p>
            <p class="error-detail">กรุณาลองใหม่อีกครั้งหรือติดต่อ 02-123-4567</p>
            <a href="${externalUrl}" class="retry-button">ลองใหม่</a>
          </div>
        </body>
        </html>
      `
    }
  }
}