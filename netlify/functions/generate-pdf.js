const puppeteer = require('puppeteer');
const fetch = require('node-fetch');

exports.handler = async (event, context) => {
  try {
    const workerId = event.queryStringParameters.workerId;
    const isAdmin = event.queryStringParameters.admin === 'true';
    
    if (!workerId) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ error: 'Worker ID is required' })
      };
    }

    // Fetch worker data
    const dataResponse = await fetch(`${process.env.URL}/combined-data.json`);
    const workers = await dataResponse.json();
    const worker = workers.find(w => w.requestNumber === workerId);

    if (!worker) {
      return {
        statusCode: 404,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ error: 'Worker not found' })
      };
    }

    // Generate HTML content
    const htmlContent = generateHTML(worker);

    // Launch browser
    const browser = await puppeteer.launch({
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();

    // Set content
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

    // Generate PDF
    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '0px',
        bottom: '0px',
        left: '0px',
        right: '0px'
      }
    });

    await browser.close();

    // Generate filename based on admin mode
    let filename = 'mpdf.pdf';
    if (isAdmin && worker) {
      const workerName = worker.thaiName || worker.englishName || workerId;
      const cleanName = workerName.replace(/[^a-zA-Z0-9\u0E00-\u0E7F\s]/g, '').trim();
      filename = `${cleanName}.pdf`;
    }
    
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Access-Control-Allow-Origin': '*'
      },
      body: pdf.toString('base64'),
      isBase64Encoded: true
    };

  } catch (error) {
    console.error('Error generating PDF:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ error: 'Internal server error' })
    };
  }
};

function generateHTML(worker) {
  // Read the complete-page2.svg template
  const fs = require('fs');
  const path = require('path');
  
  let svgContent;
  try {
    svgContent = fs.readFileSync(path.join(__dirname, '../../complete-page2.svg'), 'utf8');
    
    // Replace dynamic values
    svgContent = svgContent
      .replace(/id="svg-requestNumber"[^>]*>.*?</g, `id="svg-requestNumber">${worker.requestNumber || 'xxxxxxx'}`)
      .replace(/id="svg-englishName"[^>]*>.*?</g, `id="svg-englishName">${worker.englishName || 'xxxxxxxxxxxxx'}`)
      .replace(/id="svg-thaiName"[^>]*>.*?</g, `id="svg-thaiName">${worker.thaiName || 'xxxxxxx'}`)
      .replace(/id="svg-personalID"[^>]*>.*?</g, `id="svg-personalID">${worker.personalID || 'xxxxxxx'}`)
      .replace(/id="svg-workPermitNumber"[^>]*>.*?</g, `id="svg-workPermitNumber">${worker.workPermitNumber || 'xxxxxxx'}`)
      .replace(/id="svg-birthDate"[^>]*>.*?</g, `id="svg-birthDate">${worker.birthDate || 'xx/xx/xx'}`)
      .replace(/id="svg-age"[^>]*>.*?</g, `id="svg-age">${worker.age || 'xx'}`)
      .replace(/id="svg-nationality"[^>]*>.*?</g, `id="svg-nationality">${worker.nationality || 'xxxxxxx'}`)
      .replace(/id="svg-alienReferenceNumber"[^>]*>.*?</g, `id="svg-alienReferenceNumber">${worker.alienReferenceNumber || 'xxxxxxxxxxxxxx'}`)
      .replace(/id="svg-printDate"[^>]*>.*?</g, `id="svg-printDate">${new Date().toLocaleString('th-TH', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false }).replace(',', ' น.')}`);
      
  } catch (error) {
    console.error('Error reading SVG template:', error);
    // Fallback to simple HTML generation
    return generateFallbackHTML(worker);
  }
  
  return `
<!DOCTYPE html>
<html lang="th">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Worker Document - ${worker.requestNumber}</title>
    <style>
        body { 
            margin: 0; 
            padding: 0; 
            background: white;
            font-family: 'THSarabunPsk', sans-serif;
        }
        .container {
            width: 892px;
            height: 1261px;
            margin: 0 auto;
        }
    </style>
</head>
<body>
    <div class="container">
        ${svgContent}
    </div>
</body>
</html>
  `;
}

function generateFallbackHTML(worker) {
  return `
<!DOCTYPE html>
<html lang="th">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Worker Document - ${worker.requestNumber}</title>
    <style>
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
        body {
            font-family: 'THSarabunPsk', sans-serif;
            margin: 0;
            padding: 0;
            background: white;
        }
        .page {
            width: 892px;
            height: 1261px;
            position: relative;
            margin: 0 auto;
            background: white;
        }
    </style>
</head>
<body>
    <div class="page">
        <svg width="892" height="1261" xmlns="http://www.w3.org/2000/svg">
            <!-- Include complete-page2.svg content here -->
            ${generateSVGContent(worker)}
        </svg>
    </div>
</body>
</html>
  `;
}

function generateSVGContent(worker) {
  return `
    <defs>
        <style>
            @font-face {
                font-family: 'THSarabunPsk';
                src: url('https://oldqifkvaagtseibueaf.supabase.co/storage/v1/object/public/zzoo/ozz/ss-thsbn.woff2') format('woff2');
                font-weight: normal;
                font-style: normal;
                unicode-range: U+0E00-0E7F, U+0020-007F, U+00A0-00FF;
                font-display: swap;
            }
            .static-text { font-family: 'THSarabunPsk', sans-serif; fill: #000000; }
            .dynamic-text { font-family: 'THSarabunPsk', sans-serif; fill: #000000; }
            .ft00 { font-size: 19px; }
            .ft01 { font-size: 25px; font-weight: bold; }
        </style>
    </defs>
    <g transform="scale(1.593, 1.593)">
        <image width="560.425" height="792" xlink:href="${process.env.URL}/bg2.svg"/>
    </g>
    <text x="640" y="60" class="dynamic-text ft00">${worker.requestNumber || 'xxxxxxx'}</text>
    <text x="640" y="227" class="dynamic-text ft00">${worker.receiptNumber || 'xxxxxxx'}</text>
    <text x="180" y="271" class="dynamic-text ft00">${worker.requestNumber || 'xxxxxxx'}</text>
    <text x="180" y="310" class="dynamic-text ft00">${worker.englishName || 'xxxxxxxxxxxxx'}</text>
    <text x="520" y="310" class="dynamic-text ft00">${worker.nationality || 'xxxxxxx'}</text>
    <text x="180" y="354" class="dynamic-text ft00">${worker.alienReferenceNumber || 'xxxxxxxxxxxxxx'}</text>
    <text x="640" y="354" class="dynamic-text ft00">${worker.personalID || 'xxxxxxx'}</text>
  `;
}