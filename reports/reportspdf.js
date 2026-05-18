// reportspdf.js – Advanced PDF with Graphs & Punjabi Explanations (html2canvas version)
// Fixed: proper font loading, table rendering, container position.
// Developed by Arshdeep Singh

async function generateReportsPDF() {
    console.log("generateReportsPDF started");
    try {
        // 1. Load settings
        let settings = {
            dairyName: '', dairyOwner: '', dairyAddress: '', dairyPhone: '',
            defaultFarmerName: '', defaultFarmerPhone: ''
        };
        const storedSettings = localStorage.getItem('pakkaSettings');
        if (storedSettings) {
            try { settings = JSON.parse(storedSettings); } catch (e) { console.warn("Settings parse error", e); }
        }

        // 2. Farmer details
        const farmerName = prompt('ਕਿਸਾਨ ਦਾ ਨਾਮ ਦਰਜ ਕਰੋ:', settings.defaultFarmerName || '_____________');
        if (farmerName === null) return;
        const farmerPhone = prompt('ਕਿਸਾਨ ਦਾ ਫ਼ੋਨ ਨੰਬਰ:', settings.defaultFarmerPhone || '_____________');
        if (farmerPhone === null) return;

        // 3. Filters
        const startDate = document.getElementById('startDate')?.value || '';
        const endDate = document.getElementById('endDate')?.value || '';
        const includeBuffalo = document.getElementById('filterBuffalo')?.checked ?? true;
        const includeCow = document.getElementById('filterCow')?.checked ?? true;

        // 4. Load pakka entries
        let pakkaEntries = [];
        const stored = localStorage.getItem('pakkaEntries');
        if (stored) {
            try { pakkaEntries = JSON.parse(stored); } catch (e) { console.warn("Pakka entries parse error", e); }
        }

        // 5. Filter
        let filtered = pakkaEntries.filter(e => {
            if (startDate && e.date < startDate) return false;
            if (endDate && e.date > endDate) return false;
            if (e.animal === 'buffalo' && !includeBuffalo) return false;
            if (e.animal === 'cow' && !includeCow) return false;
            return true;
        });
        filtered.sort((a, b) => a.date.localeCompare(b.date));

        if (filtered.length === 0) {
            alert('ਚੁਣੀ ਰੇਂਜ ਵਿੱਚ ਕੋਈ ਐਂਟਰੀ ਨਹੀਂ ਹੈ।');
            return;
        }

        // Totals
        const totalMilk = filtered.reduce((sum, e) => sum + (e.milk || 0), 0).toFixed(2);
        const totalIncome = filtered.reduce((sum, e) => sum + (e.total || 0), 0).toFixed(2);
        let dateRangeText = startDate === endDate
            ? startDate.split('-').reverse().join('/')
            : `${startDate.split('-').reverse().join('/')} ਤੋਂ ${endDate.split('-').reverse().join('/')}`;

        // 6. Create temporary container for HTML content (off‑screen but visible)
        const reportContainer = document.createElement('div');
        reportContainer.style.position = 'absolute';
        reportContainer.style.top = '0';
        reportContainer.style.left = '-9999px';
        reportContainer.style.width = '800px';
        reportContainer.style.padding = '20px';
        reportContainer.style.backgroundColor = '#ffffff';
        reportContainer.style.fontFamily = '"Noto Sans Gurmukhi", "Arial Unicode MS", "Poppins", "Arial", sans-serif';
        reportContainer.style.fontSize = '12px';
        reportContainer.style.lineHeight = '1.4';
        document.body.appendChild(reportContainer);

        // Load Punjabi font – ensure it's ready
        if (!document.querySelector('link[href*="Noto+Sans+Gurmukhi"]')) {
            const link = document.createElement('link');
            link.href = 'https://fonts.googleapis.com/css2?family=Noto+Sans+Gurmukhi:wght@400;500;700&display=swap';
            link.rel = 'stylesheet';
            document.head.appendChild(link);
        }
        // Wait for font to load
        await document.fonts.ready;
        await new Promise(r => setTimeout(r, 200)); // extra safety

        const style = document.createElement('style');
        style.textContent = `
            #pdf-report-container, #pdf-report-container * {
                font-family: 'Noto Sans Gurmukhi', 'Arial Unicode MS', 'Poppins', 'Arial', sans-serif !important;
            }
            table {
                width: 100%;
                border-collapse: collapse;
                margin-top: 10px;
            }
            th, td {
                padding: 8px;
                border: 1px solid #aaa;
                text-align: left;
                vertical-align: top;
            }
            th {
                background: #2a9d8f;
                color: white;
            }
            .text-right {
                text-align: right;
            }
        `;
        reportContainer.id = 'pdf-report-container';
        document.head.appendChild(style);

        // 7. Create charts (off-screen) and convert to images
        const chartContainer = document.createElement('div');
        chartContainer.style.position = 'absolute';
        chartContainer.style.top = '-9999px';
        chartContainer.style.left = '0';
        chartContainer.style.width = '800px';
        chartContainer.style.padding = '20px';
        chartContainer.style.backgroundColor = '#ffffff';
        document.body.appendChild(chartContainer);

        // ਗਲੋਬਲ ਐਰੇ ਆਰਜ਼ੀ ਚਾਰਟਸ ਨੂੰ ਟਰੈਕ ਕਰਨ ਲਈ
        let tempCharts = [];

        function createChartCanvas(type, data, options, width = 600, height = 300) {
            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            chartContainer.appendChild(canvas);
            const ctx = canvas.getContext('2d');

            const newChartInstance = new Chart(ctx, { type, data, options });
            tempCharts.push(newChartInstance); // ਆਰਜ਼ੀ ਚਾਰਟ ਨੂੰ ਐਰੇ ਵਿੱਚ ਟਰੈਕ ਰੱਖੋ
            return newChartInstance;
        }

        // Prepare data
        const dailyMilk = {};
        filtered.forEach(e => { dailyMilk[e.date] = (dailyMilk[e.date] || 0) + e.milk; });
        const dailyDates = Object.keys(dailyMilk).sort();
        const dailyValues = dailyDates.map(d => dailyMilk[d]);

        let buffaloTotal = 0, cowTotal = 0;
        filtered.forEach(e => {
            if (e.animal === 'buffalo') buffaloTotal += e.milk;
            else cowTotal += e.milk;
        });

        const monthly = {};
        filtered.forEach(e => {
            const month = e.date.substring(0, 7);
            monthly[month] = (monthly[month] || 0) + e.milk;
        });
        const months = Object.keys(monthly).sort().slice(-6);
        const monthlyValues = months.map(m => monthly[m]);

        const dailyChart = createChartCanvas('line', {
            labels: dailyDates,
            datasets: [{ label: 'ਦੁੱਧ (L)', data: dailyValues, borderColor: '#2d6a4f', backgroundColor: 'rgba(45,106,79,0.1)', fill: true, tension: 0.1 }]
        }, { responsive: false, maintainAspectRatio: true, plugins: { legend: { display: false } } });

        const animalChart = createChartCanvas('bar', {
            labels: ['ਮੱਝ', 'ਗਾਂ'],
            datasets: [{ label: 'ਕੁੱਲ ਦੁੱਧ (L)', data: [buffaloTotal, cowTotal], backgroundColor: ['#2d6a4f', '#ffb703'] }]
        }, { responsive: false, maintainAspectRatio: true, plugins: { legend: { display: false } } });

        const monthlyChart = createChartCanvas('line', {
            labels: months,
            datasets: [{
                label: 'ਦੁੱਧ (L)',
                data: monthlyValues,
                borderColor: '#ffb703',
                backgroundColor: 'rgba(255,183,3,0.1)',
                fill: true,
                tension: 0.1,
                pointRadius: 5, // ਬਿੰਦੂ ਦਾ ਸਾਈਜ਼ ਵੱਡਾ ਕੀਤਾ ਤਾਂ ਜੋ ਸਿੰਗਲ ਮਹੀਨਾ ਸਾਫ਼ ਦਿਖੇ
                pointBackgroundColor: '#ffb703'
            }]
        }, {
            responsive: false,
            maintainAspectRatio: true,
            plugins: { legend: { display: false } },
            scales: { y: { beginAtZero: true } } // ਇਹ ਸਕੇਲ 0 ਤੋਂ ਸ਼ੁਰੂ ਕਰੇਗਾ, ਜਿਸ ਨਾਲ ਗ੍ਰਾਫ਼ ਟੁੱਟੇਗਾ ਨਹੀਂ
        });

        await new Promise(r => setTimeout(r, 1000));
        const dailyImg = await html2canvas(dailyChart.canvas, { scale: 2 });
        const animalImg = await html2canvas(animalChart.canvas, { scale: 2 });
        const monthlyImg = await html2canvas(monthlyChart.canvas, { scale: 2 });
        document.body.removeChild(chartContainer);

        // ਆਰਜ਼ੀ ਚਾਰਟ ਇੰਸਟਾਂਸ ਸਾਫ਼ ਕਰੋ ਤਾਂ ਜੋ ਮੈਮੋਰੀ ਕਲੀਅਰ ਹੋਵੇ ਅਤੇ Chart.js ਕ੍ਰੈਸ਼ ਨਾ ਹੋਵੇ
        tempCharts.forEach(chart => chart.destroy());
        tempCharts = [];

        // 8. Build HTML content for PDF
        // Build HTML content for PDF (Fixed typos & duplication)
        const displayDairyName = settings.dairyName || 'DairyCare Pro';
        const ownerAddr = `ਮਾਲਕ: ${settings.dairyOwner || ''} | ਪਤਾ: ${settings.dairyAddress || ''} | 📞 ${settings.dairyPhone || ''}`;

        const dailyImgData = dailyImg.toDataURL('image/jpeg', 0.9);
        const animalImgData = animalImg.toDataURL('image/jpeg', 0.9);
        const monthlyImgData = monthlyImg.toDataURL('image/jpeg', 0.9);

        const includeEntries = document.getElementById('includeEntriesList')?.checked ?? true;

        let html = `
                <div style="text-align: center; margin-bottom: 10px;">
        <h1 style="color: #2a9d8f; margin: 0;">${displayDairyName}</h1>
        <p style="font-size: 12px; margin: 2px 0;">${ownerAddr}</p>
        <hr style="border: 1px solid #2a9d8f; width: 80%;">
        <p style="font-size: 12px; margin: 2px 0;"><strong>ਕਿਸਾਨ:</strong> ${farmerName} | <strong>ਫ਼ੋਨ:</strong> ${farmerPhone}</p>
        <p style="font-size: 12px; margin: 2px 0;"><strong>ਮਿਤੀ ਰੇਂਜ:</strong> ${dateRangeText}</p>
        <h2 style="color: #2c3e50; margin: 5px 0;">ਰਿਪੋਰਟ (ਗ੍ਰਾਫ਼ + ਵੇਰਵਾ)</h2>
        </div>

            <div style="margin: 15px 0;">
                <img src="${dailyImgData}" style="width:100%; max-width:600px; display:block; margin:0 auto;">
                <p style="font-size:10px; text-align:center;">✍️ ਰੋਜ਼ਾਨਾ ਦੁੱਧ (ਲੀਟਰ) – ਹਰ ਰੋਜ਼ ਦਾ ਦੁੱਧ। ਉੱਚੀ ਲਕੀਰ = ਵੱਧ ਦੁੱਧ।</p>
            </div>
            <div style="margin: 15px 0;">
                <img src="${animalImgData}" style="width:100%; max-width:600px; display:block; margin:0 auto;">
                <p style="font-size:10px; text-align:center;">✍️ ਮੱਝ ਬਨਾਮ ਗਾਂ: ਕੁੱਲ ਦੁੱਧ ਤੁਲਨਾ। ਮੱਝ: ${buffaloTotal.toFixed(2)} L, ਗਾਂ: ${cowTotal.toFixed(2)} L</p>
            </div>
            <div style="margin: 15px 0;">
                <img src="${monthlyImgData}" style="width:100%; max-width:600px; display:block; margin:0 auto;">
                <p style="font-size:10px; text-align:center;">✍️ ਮਹੀਨੇਵਾਰ ਰੁਝਾਨ: ਪਿਛਲੇ 6 ਮਹੀਨਿਆਂ ਦਾ ਦੁੱਧ। ਵਧਦੀ ਲਕੀਰ = ਵਧੀਆ ਕਾਰੋਬਾਰ।</p>
            </div>
        `;

        if (includeEntries) {
            html += `<h3 style="margin-top:15px;">📋 ਐਂਟਰੀਆਂ ਦੀ ਸੂਚੀ</h3>
            <table>
                <thead>
                    <tr>
                        <th>📅 ਮਿਤੀ</th><th>🐄 ਕਿਸਮ</th><th>🥛 ਦੁੱਧ (L)</th><th>💰 ਰੇਟ (₹)</th><th>💵 ਕੁੱਲ (₹)</th>
                    </tr>
                </thead>
                <tbody>`;
            filtered.forEach(e => {
                const displayDate = e.date.split('-').reverse().join('/');
                const animal = e.animal === 'buffalo' ? 'ਮੱਝ' : 'ਗਾਂ';
                html += `<tr>
                        <td>${displayDate}</td>
                        <td>${animal}</td>
                        <td class="text-right">${e.milk.toFixed(2)} L</td>
                        <td class="text-right">₹${e.rate.toFixed(2)}</td>
                        <td class="text-right"><strong>₹${e.total.toFixed(2)}</strong></td>
                    </tr>`;
            });
            html += `
                    <tr style="background:#e8f5f3; font-weight:bold;">
                        <td colspan="2" style="text-align:center;">ਕੁੱਲ</td>
                        <td class="text-right">${totalMilk} L</td>
                        <td>-</td>
                        <td class="text-right">₹${totalIncome}</td>
                    </tr>
                </tbody>
            </table>
        `;
        } else {
            html += `<p style="margin-top: 20px; text-align: center;"><i>✍️ ਵਿਸਤ੍ਰਿਤ ਐਂਟਰੀਆਂ ਦੀ ਸੂਚੀ ਸ਼ਾਮਲ ਨਹੀਂ ਕੀਤੀ ਗਈ।</i></p>`;
        }

        html += `
            <div style="margin-top: 15px; display: flex; justify-content: space-between;">
                <div style="width: 45%;">
                    <h3>ਸੰਖੇਪ</h3>
                    <p><strong>ਕੁੱਲ ਦੁੱਧ:</strong> ${totalMilk} L</p>
                    <p><strong>ਕੁੱਲ ਕਮਾਈ:</strong> ₹${totalIncome}</p>
                </div>
                <div style="width: 45%; text-align: right;">
                    <div style="border: 1px solid #ccc; width: 220px; height: 130px; margin-left: auto; padding: 8px; text-align: left;">
                        <p><strong>ਤਾਰੀਖ਼:</strong> ______________</p>
                        <p><strong>ਡੇਅਰੀ ਮਾਲਕ ਦੇ ਦਸਤਖ਼ਤ:</strong> ________________</p>
                        <p><strong>ਕਿਸਾਨ ਦੇ ਦਸਤਖ਼ਤ:</strong> ________________</p>
                        <p><strong>ਡੇਅਰੀ ਮੋਹਰ:</strong></p>
                        <div style="border: 1px dashed #aaa; width: 100px; height: 40px; margin-top: 5px; text-align: center; line-height: 40px;">(ਮੋਹਰ)</div>
                    </div>
                </div>
            </div >
            <div style="text-align: center; margin-top: 10px; font-size: 9px; color: #666;">
                ⚡ ਇਹ ਰਿਪੋਰਟ ਕੰਪਿਊਟਰ ਦੁਆਰਾ ਤਿਆਰ ਕੀਤੀ ਗਈ ਹੈ, ਬਿਨਾਂ ਦਸਤਖਤ ਅਤੇ ਮੋਹਰ ਦੇ ਵੈਧ ਨਹੀਂ।
            </div>
        `;

        reportContainer.innerHTML = html;
        await new Promise(r => setTimeout(r, 300)); // allow styles to apply

        // Capture the container
        const canvas = await html2canvas(reportContainer, { scale: 2, backgroundColor: '#ffffff', logging: false, useCORS: true });
        const imgData = canvas.toDataURL('image/jpeg', 0.9);

        const { jsPDF } = window.jspdf;
        const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        const leftMargin = 10;
        const rightMargin = 10;
        const topMargin = 3;
        const contentWidth = pageWidth - leftMargin - rightMargin;
        const contentHeight = (canvas.height * contentWidth) / canvas.width;

        let heightLeft = contentHeight;
        let position = -topMargin;
        let pageNum = 1;
        while (heightLeft > 0) {
            if (pageNum > 1) {
                doc.addPage();
                position = -topMargin - (pageNum - 1) * pageHeight;
            }
            doc.addImage(imgData, 'JPEG', leftMargin, position, contentWidth, contentHeight, undefined, 'FAST');
            heightLeft -= pageHeight;
            pageNum++;
        }

        const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
        const fileName = `${farmerName.replace(/\s+/g, '_')}_${timestamp} _reports_graphs.pdf`;
        doc.save(fileName);
        document.body.removeChild(reportContainer);
        console.log("PDF saved successfully");
    } catch (error) {
        console.error("PDF generation error:", error);
        alert('PDF ਬਣਾਉਣ ਵਿੱਚ ਸਮੱਸਿਆ: ' + error.message);
    }
}

window.generateReportsPDF = generateReportsPDF;

