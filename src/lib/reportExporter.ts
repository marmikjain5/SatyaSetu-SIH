/**
 * SatyaDrishti Report Export Utilities (PDF & DOCX)
 *
 * Generates:
 * 1. Professional, Government-Grade Printable PDF Documents with high-fidelity formatting,
 *    Indian National Emblem styling, official inspection seal, and page breaks.
 * 2. Fully Editable Microsoft Word (.docx) documents with tables, badges, headers, and metadata.
 */

import type { ComplianceInspectionReport } from '../types/report';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

// ─── PDF / Print HTML Generator ─────────────────────────────────

export function generateReportHtml(report: ComplianceInspectionReport): string {
  const { coverPage, productInfo, ocrSummary, ruleValidation, readabilityAnalysis, evidence, recommendations, verdict, digitalSignature } = report;

  const statusColor =
    coverPage.overallStatus === 'compliant'
      ? '#059669'
      : coverPage.overallStatus === 'warning'
      ? '#D97706'
      : '#DC2626';

  const statusBg =
    coverPage.overallStatus === 'compliant'
      ? '#ECFDF5'
      : coverPage.overallStatus === 'warning'
      ? '#FFFBEB'
      : '#FEF2F2';

  const riskColor =
    coverPage.riskTier === 'CRITICAL'
      ? '#991B1B'
      : coverPage.riskTier === 'HIGH'
      ? '#DC2626'
      : coverPage.riskTier === 'MEDIUM'
      ? '#D97706'
      : '#059669';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${report.reportId} - Compliance Inspection Report</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@400;600;700&display=swap');

    @page {
      size: A4 portrait;
      margin: 12mm 15mm 15mm 15mm;
      @bottom-right {
        content: "Page " counter(page) " of " counter(pages);
        font-family: 'Inter', sans-serif;
        font-size: 8pt;
        color: #64748b;
      }
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      font-size: 9.5pt;
      line-height: 1.5;
      color: #0f172a;
      background: #ffffff;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    .page {
      page-break-after: always;
      position: relative;
      width: 794px;
      min-height: 1120px;
      padding: 30px 35px 25px 35px;
      background: #ffffff;
      box-sizing: border-box;
    }

    .page:last-child {
      page-break-after: auto;
    }

    /* Government Header */
    .gov-header {
      border-bottom: 3px double #1e293b;
      padding-bottom: 12px;
      margin-bottom: 16px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .gov-title-block {
      text-align: center;
      flex: 1;
      padding: 0 15px;
    }

    .gov-title-block h1 {
      font-size: 12.5pt;
      font-weight: 900;
      color: #0f172a;
      letter-spacing: 0.5px;
      text-transform: uppercase;
      margin-bottom: 2px;
      line-height: 1.2;
    }

    .gov-title-block h2 {
      font-size: 9pt;
      font-weight: 700;
      color: #475569;
      text-transform: uppercase;
      letter-spacing: 0.3px;
      line-height: 1.2;
    }

    .gov-title-block p {
      font-size: 7.5pt;
      color: #64748b;
      margin-top: 2px;
      font-weight: 500;
    }

    .emblem-placeholder {
      width: 48px;
      height: 48px;
      border: 2px solid #0f172a;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 900;
      font-size: 9pt;
      color: #0f172a;
      background: #f8fafc;
      flex-shrink: 0;
    }

    /* Report Identification Bar */
    .report-id-bar {
      background: #f1f5f9;
      border: 1px solid #cbd5e1;
      border-radius: 6px;
      padding: 8px 12px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 14px;
      font-family: Arial, Helvetica, sans-serif;
      font-size: 8.5pt;
    }

    .report-id-bar .id-tag {
      font-weight: 800;
      color: #0f172a;
    }

    .report-id-bar .date-tag {
      color: #475569;
    }

    /* Status Banner */
    .status-banner {
      border: 2px solid ${statusColor};
      background: ${statusBg};
      border-radius: 8px;
      padding: 14px 16px 16px 16px;
      margin-bottom: 16px;
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 16px;
      box-sizing: border-box;
    }

    .status-banner-content {
      flex: 1;
    }

    .status-banner h3 {
      font-size: 11.5pt;
      font-weight: 900;
      color: ${statusColor};
      text-transform: uppercase;
      letter-spacing: 0.4px;
      margin-bottom: 4px;
      line-height: 1.3;
    }

    .status-banner p {
      font-size: 8.5pt;
      color: #334155;
      margin-bottom: 10px;
      line-height: 1.45;
    }

    .status-pill-wrap {
      display: block;
      margin-top: 4px;
    }

    .score-circle {
      text-align: center;
      background: #ffffff;
      border: 2px solid ${statusColor};
      border-radius: 8px;
      padding: 8px 14px;
      min-width: 90px;
      flex-shrink: 0;
      box-sizing: border-box;
    }

    .score-circle .number {
      font-family: Arial, Helvetica, sans-serif;
      font-size: 16pt;
      font-weight: 900;
      color: ${statusColor};
      line-height: 1;
    }

    .score-circle .label {
      font-size: 6.5pt;
      font-weight: 700;
      color: #64748b;
      text-transform: uppercase;
      margin-top: 3px;
    }

    /* Section Headings */
    .section-title {
      font-size: 9.5pt;
      font-weight: 800;
      color: #0f172a;
      border-bottom: 1.5px solid #0f172a;
      padding-bottom: 3px;
      margin-top: 12px;
      margin-bottom: 8px;
      text-transform: uppercase;
      letter-spacing: 0.4px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .section-title .sec-num {
      font-family: Arial, Helvetica, sans-serif;
      font-size: 8pt;
      color: #64748b;
      font-weight: 700;
    }

    /* Tables */
    table.data-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 10px;
      font-size: 8pt;
    }

    table.data-table th,
    table.data-table td {
      border: 1px solid #cbd5e1;
      padding: 5px 7px;
      text-align: left;
      vertical-align: middle;
      line-height: 1.35;
    }

    table.data-table th {
      background: #f8fafc;
      font-weight: 700;
      color: #1e293b;
      font-size: 7.5pt;
      text-transform: uppercase;
    }

    table.data-table tr:nth-child(even) td {
      background: #fafbfc;
    }

    .pill {
      display: inline-block;
      padding: 2px 7px 3px 7px;
      border-radius: 3px;
      font-size: 7.5pt;
      font-weight: 700;
      text-transform: uppercase;
      font-family: Arial, Helvetica, sans-serif;
      line-height: 1.1;
      text-align: center;
      vertical-align: middle;
    }

    .pill-pass { background: #dcfce7; color: #15803d; border: 1px solid #bbf7d0; }
    .pill-fail { background: #fee2e2; color: #b91c1c; border: 1px solid #fecaca; }
    .pill-warn { background: #fef3c7; color: #b45309; border: 1px solid #fde68a; }

    /* Metadata Grid */
    .grid-2 {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
      margin-bottom: 12px;
    }

    .meta-box {
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      padding: 8px 10px;
      background: #ffffff;
    }

    .meta-box .k {
      font-size: 7.5pt;
      font-weight: 700;
      color: #64748b;
      text-transform: uppercase;
      margin-bottom: 1px;
    }

    .meta-box .v {
      font-size: 9pt;
      font-weight: 600;
      color: #0f172a;
    }

    /* Evidence Image Block */
    .evidence-block {
      border: 1px solid #cbd5e1;
      border-radius: 6px;
      padding: 10px;
      text-align: center;
      background: #f8fafc;
      margin-bottom: 12px;
    }

    .evidence-img {
      max-height: 280px;
      max-width: 100%;
      border-radius: 4px;
      border: 1px solid #94a3b8;
    }

    /* Digital Signature Stamp */
    .signature-stamp-box {
      border: 2px solid #1e293b;
      border-radius: 8px;
      padding: 12px 16px;
      background: #fafafa;
      margin-top: 18px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .signature-details h4 {
      font-size: 9pt;
      font-weight: 800;
      color: #0f172a;
      text-transform: uppercase;
    }

    .signature-details p {
      font-size: 8pt;
      color: #475569;
    }

    .signature-hash {
      font-family: Arial, monospace;
      font-size: 6.5pt;
      color: #64748b;
      word-break: break-all;
      margin-top: 4px;
      line-height: 1.2;
    }

    .verified-seal {
      width: 70px;
      height: 70px;
      border: 2px dashed #059669;
      border-radius: 50%;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      font-weight: 900;
      font-size: 7pt;
      color: #059669;
      text-align: center;
      line-height: 1.1;
      background: #ecfdf5;
      flex-shrink: 0;
    }

    @media print {
      body {
        margin: 0;
        padding: 0;
      }
      .no-print {
        display: none !important;
      }
    }
  </style>
</head>
<body>

  <!-- ════════════════ PAGE 1: COVER & EXECUTIVE SUMMARY ════════════════ -->
  <div class="page">
    <div class="gov-header">
      <div class="emblem-placeholder">सत्य</div>
      <div class="gov-title-block">
        <h1>${coverPage.issuingAuthority}</h1>
        <h2>${coverPage.inspectionTitle}</h2>
        <p>${coverPage.subTitle}</p>
      </div>
      <div class="emblem-placeholder">BIS</div>
    </div>

    <div class="report-id-bar">
      <div>
        <span>REPORT ID: </span><span class="id-tag">${coverPage.reportId}</span>
      </div>
      <div class="date-tag">
        <span>DATE: </span><span>${coverPage.formattedDate}</span>
      </div>
    </div>

    <!-- Overall Status Banner -->
    <div class="status-banner">
      <div class="status-banner-content">
        <h3>${verdict.verdictTitle}</h3>
        <p>${verdict.summaryRemarks}</p>
        <div class="status-pill-wrap">
          <table cellpadding="0" cellspacing="0" style="display: inline-table; border-collapse: collapse; margin-top: 4px;">
            <tbody>
              <tr>
                <td style="background: ${riskColor}; color: #ffffff; font-size: 7.5pt; font-weight: bold; font-family: Arial, Helvetica, sans-serif; padding: 3px 8px; border-radius: 4px; vertical-align: middle; text-align: center; line-height: 1.2;">
                  RISK ASSESSMENT: ${coverPage.riskTier} TIER
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <div class="score-circle">
        <div class="number">${coverPage.complianceScore}</div>
        <div class="label">Compliance Score</div>
      </div>
    </div>

    <!-- Section A & B: Inspector & Product Metadata -->
    <div class="section-title">
      <span>1. Inspection Authority &amp; Packaging Identity</span>
      <span class="sec-num">SEC-01</span>
    </div>

    <div class="grid-2">
      <div class="meta-box">
        <div class="k">Inspecting Officer / Badge</div>
        <div class="v">${coverPage.inspectorName} (${coverPage.inspectorBadge})</div>
        <div class="k" style="margin-top: 4px;">Department / Jurisdiction</div>
        <div class="v" style="font-size: 8pt; font-weight: 500;">${coverPage.department}<br/>${coverPage.jurisdiction}</div>
      </div>

      <div class="meta-box">
        <div class="k">Commodity Name</div>
        <div class="v">${productInfo.productName}</div>
        <div class="k" style="margin-top: 4px;">Manufacturer / Packer</div>
        <div class="v" style="font-size: 8pt; font-weight: 500;">${productInfo.manufacturer}</div>
      </div>
    </div>

    <table class="data-table">
      <thead>
        <tr>
          <th>Statutory Field</th>
          <th>Physical Label Declaration</th>
          <th>Statutory Field</th>
          <th>Physical Label Declaration</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>Maximum Retail Price (MRP)</strong></td>
          <td>${productInfo.mrp}</td>
          <td><strong>Net Quantity</strong></td>
          <td>${productInfo.netQuantity}</td>
        </tr>
        <tr>
          <td><strong>Mfg. / Packing Date</strong></td>
          <td>${productInfo.manufacturingDate || productInfo.packingDate}</td>
          <td><strong>Expiry / Best Before</strong></td>
          <td>${productInfo.expiryDate}</td>
        </tr>
        <tr>
          <td><strong>Batch / Lot Number</strong></td>
          <td>${productInfo.batchNumber}</td>
          <td><strong>Country of Origin</strong></td>
          <td>${productInfo.countryOfOrigin}</td>
        </tr>
        <tr>
          <td><strong>FSSAI License / BIS</strong></td>
          <td>${productInfo.fssaiLicense}</td>
          <td><strong>Barcode / GTIN</strong></td>
          <td>${productInfo.barcode}</td>
        </tr>
      </tbody>
    </table>

    <!-- Section C: Rule Validation Summary -->
    <div class="section-title">
      <span>2. Legal Metrology Rule Validation Results</span>
      <span class="sec-num">SEC-02</span>
    </div>

    <table class="data-table">
      <thead>
        <tr>
          <th style="width: 14%;">Rule Code</th>
          <th style="width: 32%;">Statutory Rule &amp; Title</th>
          <th style="width: 26%;">Observed Evidence</th>
          <th style="width: 14%;">Expected Standard</th>
          <th style="width: 14%;">Status</th>
        </tr>
      </thead>
      <tbody>
        ${ruleValidation.auditTrail.slice(0, 6).map((entry) => `
          <tr>
            <td><code>${entry.ruleCode}</code></td>
            <td><strong>${entry.ruleName}</strong><br/><span style="color: #64748b; font-size: 7.5pt;">${entry.section}</span></td>
            <td><span style="font-family: monospace; font-size: 8pt;">${entry.evidence || 'Missing'}</span></td>
            <td><span style="color: #475569; font-size: 7.5pt;">${entry.expectedStandard}</span></td>
            <td style="vertical-align: middle;">
              <table cellpadding="0" cellspacing="0" style="display: inline-table; border-collapse: collapse;">
                <tbody>
                  <tr>
                    <td style="padding: 2px 7px; border-radius: 3px; font-size: 7pt; font-weight: bold; font-family: Arial, Helvetica, sans-serif; line-height: 1.2; vertical-align: middle; text-align: center; ${entry.status === 'pass' ? 'background: #dcfce7; color: #15803d; border: 1px solid #bbf7d0;' : entry.status === 'fail' ? 'background: #fee2e2; color: #b91c1c; border: 1px solid #fecaca;' : 'background: #fef3c7; color: #b45309; border: 1px solid #fde68a;'}">
                      ${entry.status.toUpperCase()}
                    </td>
                  </tr>
                </tbody>
              </table>
            </td>
          </tr>
        `).join('')}
      </tbody>
    </table>

    <div style="font-size: 8pt; color: #475569; margin-top: 4px;">
      <strong>Statutory Violations:</strong> ${ruleValidation.violationCount} | 
      <strong>Warnings:</strong> ${ruleValidation.warningCount} | 
      <strong>Estimated Fine Exposure:</strong> ${verdict.statutoryPenaltyEstimate}
    </div>
  </div>

  <!-- ════════════════ PAGE 2: READABILITY, EVIDENCE & SIGNATURE ════════════════ -->
  <div class="page">
    <!-- Section D: Font Size & Optical Readability Analysis -->
    <div class="section-title">
      <span>3. Optical Font Size &amp; Readability Analysis (Rule 9 &amp; Sched. II)</span>
      <span class="sec-num">SEC-03</span>
    </div>

    <div class="grid-2">
      <div class="meta-box">
        <div class="k">Average Estimated Font Height</div>
        <div class="v">${readabilityAnalysis.summary.avgFontSizePt} pt (${((readabilityAnalysis.summary.avgFontSizePt * 25.4) / 72).toFixed(1)} mm)</div>
        <div class="k" style="margin-top: 4px;">Optical Contrast Ratio</div>
        <div class="v">${readabilityAnalysis.summary.avgContrastRatio}:1 (WCAG 2.1 Standard)</div>
      </div>

      <div class="meta-box">
        <div class="k">Readability Prominence Score</div>
        <div class="v">${readabilityAnalysis.summary.overallScore} / 100</div>
        <div class="k" style="margin-top: 4px;">Flagged Defect Regions</div>
        <div class="v" style="color: ${readabilityAnalysis.flaggedRegions.length > 0 ? '#dc2626' : '#059669'};">
          ${readabilityAnalysis.flaggedRegions.length} Text Regions Require Remediation
        </div>
      </div>
    </div>

    <table class="data-table">
      <thead>
        <tr>
          <th>Field Name</th>
          <th>Estimated Font Size</th>
          <th>OCR Confidence</th>
          <th>Contrast Ratio</th>
          <th>Visibility Score</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        ${readabilityAnalysis.allRegions.slice(0, 7).map((region) => `
          <tr>
            <td><strong>${region.fieldName}</strong></td>
            <td>${region.fontSize.formatted}</td>
            <td>${Math.round(region.ocrConfidence)}%</td>
            <td>${region.contrast.formattedRatio}</td>
            <td>${region.visibilityScore}/100</td>
            <td style="vertical-align: middle;">
              <table cellpadding="0" cellspacing="0" style="display: inline-table; border-collapse: collapse;">
                <tbody>
                  <tr>
                    <td style="padding: 2px 7px; border-radius: 3px; font-size: 7pt; font-weight: bold; font-family: Arial, Helvetica, sans-serif; line-height: 1.2; vertical-align: middle; text-align: center; ${region.status === 'compliant' ? 'background: #dcfce7; color: #15803d; border: 1px solid #bbf7d0;' : region.status === 'non-compliant' ? 'background: #fee2e2; color: #b91c1c; border: 1px solid #fecaca;' : 'background: #fef3c7; color: #b45309; border: 1px solid #fde68a;'}">
                      ${region.status.toUpperCase()}
                    </td>
                  </tr>
                </tbody>
              </table>
            </td>
          </tr>
        `).join('')}
      </tbody>
    </table>

    <!-- Section E: Physical Evidence Snapshot -->
    <div class="section-title">
      <span>4. Packaging Photographic Evidence</span>
      <span class="sec-num">SEC-04</span>
    </div>

    <div class="evidence-block">
      <img src="${evidence.imageDataUrl}" alt="Packaging Inspection Evidence" class="evidence-img" />
      <p style="font-size: 7.5pt; color: #64748b; margin-top: 4px;">
        Physical Sample Evidence Record • ${evidence.mappedBoundingBoxesCount} Statutory Bounding Boxes Mapped
      </p>
    </div>

    <!-- Section F: Corrective Recommendations -->
    <div class="section-title">
      <span>5. Corrective Action &amp; Enforcement Directives</span>
      <span class="sec-num">SEC-05</span>
    </div>

    <div style="font-size: 8.5pt; color: #1e293b; margin-bottom: 12px;">
      <ul style="padding-left: 18px; margin-top: 4px;">
        ${recommendations.correctiveActions.map((c) => `<li>${c}</li>`).join('')}
        ${recommendations.legalEnforcementSteps.map((l) => `<li><strong>Directive:</strong> ${l}</li>`).join('')}
      </ul>
      <p style="font-size: 8pt; color: #dc2626; font-weight: 700; margin-top: 6px;">
        Action Compliance Deadline: ${verdict.recommendedActionDeadline} (under Rule 24 of Legal Metrology Enforcement Guidelines).
      </p>
    </div>

    <!-- Section G: Digital Signature & Cryptographic Stamp -->
    <div class="signature-stamp-box">
      <div class="signature-details">
        <h4>Digitally Signed &amp; Sealed by Statutory Inspector</h4>
        <p><strong>Officer:</strong> ${digitalSignature.signedBy} | <strong>Badge:</strong> ${digitalSignature.badgeNumber}</p>
        <p><strong>Designation:</strong> ${digitalSignature.designation}</p>
        <p><strong>Timestamp:</strong> ${digitalSignature.timestamp}</p>
        <div class="signature-hash">
          SHA-256 HASH: ${digitalSignature.sha256Hash}
        </div>
      </div>

      <div class="verified-seal">
        <span>✓ e-Sign</span>
        <span>VERIFIED</span>
        <span style="font-size: 6pt; font-family: monospace;">CCA-GOV</span>
      </div>
    </div>
  </div>

</body>
</html>`;
}

// ─── Direct PDF Download Generator ──────────────────────────────

export async function downloadReportAsPdf(report: ComplianceInspectionReport): Promise<void> {
  const htmlContent = generateReportHtml(report);

  // Create a temporary hidden container to render the styled report
  const container = document.createElement('div');
  container.style.position = 'fixed';
  container.style.left = '-9999px';
  container.style.top = '0';
  container.style.width = '794px'; // Standard A4 width in px at 96 DPI
  container.style.backgroundColor = '#ffffff';
  container.style.zIndex = '-1000';
  container.innerHTML = htmlContent;

  // Extract body contents for rendering
  const bodyContent = container.querySelector('body') || container;
  document.body.appendChild(container);

  try {
    if (document.fonts) {
      await document.fonts.ready;
    }

    // Small delay to ensure all DOM sub-elements and images render
    await new Promise((resolve) => setTimeout(resolve, 200));

    // Render the pages
    const pages = container.querySelectorAll('.page');
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    if (pages.length > 0) {
      for (let i = 0; i < pages.length; i++) {
        const pageEl = pages[i] as HTMLElement;
        const canvas = await html2canvas(pageEl, {
          scale: 2, // High resolution (192 DPI equivalent)
          useCORS: true,
          logging: false,
          backgroundColor: '#ffffff',
          windowWidth: 794,
        });

        const imgData = canvas.toDataURL('image/jpeg', 0.95);
        if (i > 0) {
          pdf.addPage();
        }

        // A4 page dimensions in mm: 210 x 297
        pdf.addImage(imgData, 'JPEG', 0, 0, 210, 297);
      }
    } else {
      const canvas = await html2canvas(bodyContent as HTMLElement, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        windowWidth: 794,
      });
      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      pdf.addImage(imgData, 'JPEG', 0, 0, 210, 297);
    }

    pdf.save(`${report.reportId}_Compliance_Report.pdf`);
  } catch (error) {
    console.error('Error generating direct PDF download, falling back to print dialog:', error);
    exportReportToPdf(report);
  } finally {
    if (document.body.contains(container)) {
      document.body.removeChild(container);
    }
  }
}

// ─── Direct Browser Print Trigger ───────────────────────────────

export function exportReportToPdf(report: ComplianceInspectionReport): void {
  const htmlContent = generateReportHtml(report);
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Please allow popups to generate and print the PDF report.');
    return;
  }

  printWindow.document.open();
  printWindow.document.write(htmlContent);
  printWindow.document.close();

  // Wait for images to load before printing
  printWindow.onload = () => {
    setTimeout(() => {
      printWindow.focus();
      printWindow.print();
    }, 400);
  };
}

// ─── Editable Microsoft Word DOCX Generator ─────────────────────

export function exportReportToDocx(report: ComplianceInspectionReport): void {
  const { coverPage, productInfo, ruleValidation, readabilityAnalysis, verdict, digitalSignature, recommendations } = report;

  // Generate an HTML-based OpenXML formatted document compatible with MS Word (.docx)
  const docxHtml = `
  <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
  <head>
    <meta charset="utf-8">
    <title>${report.reportId} Compliance Report</title>
    <style>
      body { font-family: Calibri, Arial, sans-serif; font-size: 11pt; color: #1E293B; line-height: 1.5; }
      h1 { font-size: 18pt; color: #0F172A; text-align: center; border-bottom: 2pt solid #0F172A; padding-bottom: 6pt; }
      h2 { font-size: 14pt; color: #1E293B; border-bottom: 1pt solid #CBD5E1; padding-bottom: 3pt; margin-top: 14pt; }
      h3 { font-size: 12pt; color: #334155; margin-top: 10pt; }
      table { width: 100%; border-collapse: collapse; margin-top: 8pt; margin-bottom: 12pt; }
      th, td { border: 1pt solid #CBD5E1; padding: 6pt 8pt; text-align: left; font-size: 10pt; }
      th { background-color: #F1F5F9; font-weight: bold; }
      .badge { font-weight: bold; text-transform: uppercase; }
      .compliant { color: #059669; }
      .non-compliant { color: #DC2626; }
      .warning { color: #D97706; }
    </style>
  </head>
  <body>
    <h1>${coverPage.issuingAuthority}</h1>
    <h2 style="text-align: center;">${coverPage.inspectionTitle}</h2>
    <p style="text-align: center; color: #64748B;">${coverPage.subTitle}</p>
    <hr/>

    <p><strong>REPORT ID:</strong> ${coverPage.reportId} &nbsp;&nbsp;|&nbsp;&nbsp; <strong>DATE:</strong> ${coverPage.formattedDate}</p>
    <p><strong>INSPECTING OFFICER:</strong> ${coverPage.inspectorName} (${coverPage.inspectorBadge}), ${coverPage.inspectorDesignation}</p>
    <p><strong>DEPARTMENT:</strong> ${coverPage.department} - ${coverPage.jurisdiction}</p>

    <h2>EXECUTIVE SUMMARY &amp; VERDICT</h2>
    <p><strong>Final Verdict:</strong> <span class="badge ${coverPage.overallStatus}">${verdict.verdictTitle}</span></p>
    <p><strong>Statutory Compliance Score:</strong> ${coverPage.complianceScore} / 100</p>
    <p><strong>Risk Assessment:</strong> ${coverPage.riskTier} TIER</p>
    <p><strong>Summary Remarks:</strong> ${verdict.summaryRemarks}</p>
    <p><strong>Estimated Financial Penalty Exposure:</strong> ${verdict.statutoryPenaltyEstimate}</p>

    <h2>1. PRODUCT &amp; STATUTORY DECLARATION DETAILS</h2>
    <table>
      <tr><th>Field</th><th>Declaration</th><th>Field</th><th>Declaration</th></tr>
      <tr><td>Product Name</td><td>${productInfo.productName}</td><td>MRP</td><td>${productInfo.mrp}</td></tr>
      <tr><td>Manufacturer</td><td>${productInfo.manufacturer}</td><td>Net Quantity</td><td>${productInfo.netQuantity}</td></tr>
      <tr><td>Address</td><td>${productInfo.address}</td><td>Mfg / Packing Date</td><td>${productInfo.manufacturingDate || productInfo.packingDate}</td></tr>
      <tr><td>Batch Number</td><td>${productInfo.batchNumber}</td><td>Expiry Date</td><td>${productInfo.expiryDate}</td></tr>
      <tr><td>Country of Origin</td><td>${productInfo.countryOfOrigin}</td><td>FSSAI License</td><td>${productInfo.fssaiLicense}</td></tr>
      <tr><td>Customer Care</td><td>${productInfo.customerCare}</td><td>Barcode / GTIN</td><td>${productInfo.barcode}</td></tr>
    </table>

    <h2>2. LEGAL METROLOGY RULE VALIDATION MATRIX</h2>
    <table>
      <tr><th>Rule Code</th><th>Rule Title</th><th>Extracted Evidence</th><th>Status</th></tr>
      ${ruleValidation.auditTrail.map((a) => `
        <tr>
          <td>${a.ruleCode}</td>
          <td>${a.ruleName}</td>
          <td>${a.evidence || 'Not Found'}</td>
          <td><strong>${a.status.toUpperCase()}</strong></td>
        </tr>
      `).join('')}
    </table>

    <h2>3. OPTICAL FONT SIZE &amp; READABILITY ANALYSIS</h2>
    <p><strong>Overall Readability Score:</strong> ${readabilityAnalysis.summary.overallScore}/100 &nbsp;|&nbsp; <strong>Avg Font Size:</strong> ${readabilityAnalysis.summary.avgFontSizePt} pt &nbsp;|&nbsp; <strong>Avg Contrast Ratio:</strong> ${readabilityAnalysis.summary.avgContrastRatio}:1</p>
    <table>
      <tr><th>Text Region</th><th>Font Size</th><th>OCR Confidence</th><th>Contrast</th><th>Status</th></tr>
      ${readabilityAnalysis.allRegions.map((r) => `
        <tr>
          <td>${r.fieldName}</td>
          <td>${r.fontSize.formatted}</td>
          <td>${Math.round(r.ocrConfidence)}%</td>
          <td>${r.contrast.formattedRatio}</td>
          <td>${r.status}</td>
        </tr>
      `).join('')}
    </table>

    <h2>4. ENFORCEMENT DIRECTIVES &amp; CORRECTIVE RECOMMENDATIONS</h2>
    <ul>
      ${recommendations.correctiveActions.map((c) => `<li>${c}</li>`).join('')}
      ${recommendations.legalEnforcementSteps.map((l) => `<li>${l}</li>`).join('')}
    </ul>
    <p><strong>Rectification Deadline:</strong> ${verdict.recommendedActionDeadline}</p>

    <hr/>
    <h2>5. DIGITAL SIGNATURE VERIFICATION STAMP</h2>
    <p><strong>Signed by:</strong> ${digitalSignature.signedBy} (${digitalSignature.badgeNumber})</p>
    <p><strong>Designation:</strong> ${digitalSignature.designation}</p>
    <p><strong>Timestamp:</strong> ${digitalSignature.timestamp}</p>
    <p><strong>SHA-256 Hash:</strong> ${digitalSignature.sha256Hash}</p>
    <p><strong>Certificate ID:</strong> ${digitalSignature.certificateId} (e-Sign Verified)</p>
  </body>
  </html>`;

  const blob = new Blob(['\ufeff', docxHtml], {
    type: 'application/msword',
  });

  const url = URL.createObjectURL(blob);
  const downloadLink = document.createElement('a');
  downloadLink.href = url;
  downloadLink.download = `${report.reportId}_Compliance_Report.doc`;
  document.body.appendChild(downloadLink);
  downloadLink.click();
  document.body.removeChild(downloadLink);
  URL.revokeObjectURL(url);
}
