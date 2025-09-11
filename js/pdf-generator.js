// PDF Generation Functions
class PDFGenerator {
    constructor() {
        this.functionUrl = '/.netlify/functions/generate-pdf';
    }

    async generateWorkerPDF(workerId) {
        try {
            const response = await fetch(`${this.functionUrl}?workerId=${workerId}`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            
            // Create download link
            const a = document.createElement('a');
            a.href = url;
            a.download = 'mpdf.pdf';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            
            // Clean up
            window.URL.revokeObjectURL(url);
            
            return true;
        } catch (error) {
            console.error('Error generating PDF:', error);
            alert('เกิดข้อผิดพลาดในการสร้าง PDF: ' + error.message);
            return false;
        }
    }

    async generateCustomPDF(svgContent, filename) {
        try {
            const response = await fetch(this.functionUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    svgContent: svgContent,
                    filename: filename
                })
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            
            // Create download link
            const a = document.createElement('a');
            a.href = url;
            a.download = 'mpdf.pdf';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            
            // Clean up
            window.URL.revokeObjectURL(url);
            
            return true;
        } catch (error) {
            console.error('Error generating custom PDF:', error);
            alert('เกิดข้อผิดพลาดในการสร้าง PDF: ' + error.message);
            return false;
        }
    }
}

// Initialize PDF generator
const pdfGenerator = new PDFGenerator();

// Make it available globally
window.pdfGenerator = pdfGenerator;