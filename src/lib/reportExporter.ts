/**
 * SatyaDrishti Report Export Utilities (PDF & DOCX)
 *
 * Generates:
 * 1. Professional, Government-Grade Printable PDF Documents with high-fidelity formatting,
 *    Indian National Emblem styling, official inspection seal, and page breaks.
 *    Isolated via <iframe> to prevent dark-mode stylesheet contamination.
 * 2. Multi-Product Inspection Session Reports and Single-Product Compliance Reports.
 * 3. Fully Editable Microsoft Word (.docx) documents with tables, badges, headers, and metadata.
 */

import type { ComplianceInspectionReport } from '../types/report';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

// ─── PDF / Print HTML Generator ─────────────────────────────────

export function generateReportHtml(report: ComplianceInspectionReport): string {
  const isSessionReport = report.reportType === 'inspection-session' && !!report.auditedProducts;
  
  if (isSessionReport) {
    return generateSessionReportHtml(report);
  }
  return generateSingleProductReportHtml(report);
}

// ─── Single-Product HTML Template ────────────────────────────────

function generateSingleProductReportHtml(report: ComplianceInspectionReport): string {
  const { coverPage, productInfo, ruleValidation, readabilityAnalysis, evidence, recommendations, verdict, digitalSignature } = report;

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
  <title>${report.reportId} - Packaging Compliance Report</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');

    :root {
      color-scheme: light !important;
    }

    @page {
      size: A4 portrait;
      margin: 12mm 15mm 15mm 15mm;
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
      color: #0f172a;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      font-size: 9.5pt;
      line-height: 1.5;
      color: #0f172a !important;
      background-color: #ffffff !important;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    .page {
      page-break-after: always;
      position: relative;
      width: 794px;
      min-height: 1120px;
      padding: 30px 35px 25px 35px;
      background-color: #ffffff !important;
      color: #0f172a !important;
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
      color: #0f172a !important;
      letter-spacing: 0.5px;
      text-transform: uppercase;
      margin-bottom: 2px;
      line-height: 1.2;
    }

    .gov-title-block h2 {
      font-size: 9pt;
      font-weight: 700;
      color: #475569 !important;
      text-transform: uppercase;
      letter-spacing: 0.3px;
      line-height: 1.2;
    }

    .gov-title-block p {
      font-size: 7.5pt;
      color: #64748b !important;
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
      color: #0f172a !important;
      background-color: #f8fafc !important;
      flex-shrink: 0;
    }

    /* Report Identification Bar */
    .report-id-bar {
      background-color: #f1f5f9 !important;
      border: 1px solid #cbd5e1;
      border-radius: 6px;
      padding: 8px 12px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 14px;
      font-family: Arial, Helvetica, sans-serif;
      font-size: 8.5pt;
      color: #0f172a !important;
    }

    .report-id-bar .id-tag {
      font-weight: 800;
      color: #0f172a !important;
    }

    .report-id-bar .date-tag {
      color: #475569 !important;
    }

    /* Status Banner */
    .status-banner {
      border: 2px solid ${statusColor};
      background-color: ${statusBg} !important;
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
      color: ${statusColor} !important;
      text-transform: uppercase;
      letter-spacing: 0.4px;
      margin-bottom: 4px;
      line-height: 1.3;
    }

    .status-banner p {
      font-size: 8.5pt;
      color: #334155 !important;
      margin-bottom: 10px;
      line-height: 1.45;
    }

    .status-pill-wrap {
      display: block;
      margin-top: 4px;
    }

    .score-circle {
      text-align: center;
      background-color: #ffffff !important;
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
      color: ${statusColor} !important;
      line-height: 1;
    }

    .score-circle .label {
      font-size: 6.5pt;
      font-weight: 700;
      color: #64748b !important;
      text-transform: uppercase;
      margin-top: 3px;
    }

    /* Section Headings */
    .section-title {
      font-size: 9.5pt;
      font-weight: 800;
      color: #0f172a !important;
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
      color: #64748b !important;
      font-weight: 700;
    }

    /* Tables */
    table.data-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 10px;
      font-size: 8pt;
      color: #0f172a !important;
    }

    table.data-table th,
    table.data-table td {
      border: 1px solid #cbd5e1;
      padding: 5px 7px;
      text-align: left;
      vertical-align: middle;
      line-height: 1.35;
      color: #0f172a !important;
    }

    table.data-table th {
      background-color: #f8fafc !important;
      font-weight: 700;
      color: #1e293b !important;
      font-size: 7.5pt;
      text-transform: uppercase;
    }

    table.data-table tr:nth-child(even) td {
      background-color: #fafbfc !important;
    }

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
      background-color: #ffffff !important;
    }

    .meta-box .k {
      font-size: 7.5pt;
      font-weight: 700;
      color: #64748b !important;
      text-transform: uppercase;
      margin-bottom: 1px;
    }

    .meta-box .v {
      font-size: 9pt;
      font-weight: 600;
      color: #0f172a !important;
    }

    /* Evidence Image Block */
    .evidence-block {
      border: 1px solid #cbd5e1;
      border-radius: 6px;
      padding: 10px;
      text-align: center;
      background-color: #f8fafc !important;
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
      background-color: #f8fafc !important;
      margin-top: 14px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .signature-details h4 {
      font-size: 9pt;
      font-weight: 800;
      color: #0f172a !important;
      text-transform: uppercase;
    }

    .signature-details p {
      font-size: 8pt;
      color: #475569 !important;
    }

    .signature-hash {
      font-family: Arial, monospace;
      font-size: 6.5pt;
      color: #64748b !important;
      word-break: break-all;
      margin-top: 4px;
      line-height: 1.2;
    }

    .verified-seal {
      width: 65px;
      height: 65px;
      border: 2px dashed #059669;
      border-radius: 50%;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      font-weight: 900;
      font-size: 6.5pt;
      color: #059669 !important;
      text-align: center;
      line-height: 1.1;
      background-color: #ecfdf5 !important;
      flex-shrink: 0;
    }

    @media print {
      body {
        margin: 0;
        padding: 0;
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
        <span style="color: #64748b !important;">REPORT ID: </span><span class="id-tag">${coverPage.reportId}</span>
      </div>
      <div class="date-tag">
        <span style="color: #64748b !important;">DATE: </span><span>${coverPage.formattedDate}</span>
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
                <td style="background-color: ${riskColor} !important; color: #ffffff !important; font-size: 7.5pt; font-weight: bold; font-family: Arial, Helvetica, sans-serif; padding: 3px 8px; border-radius: 4px; vertical-align: middle; text-align: center; line-height: 1.2;">
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

    <!-- Section 1: Inspector & Product Metadata -->
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

    <!-- Section 2: Rule Validation Summary -->
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
            <td><strong>${entry.ruleName}</strong><br/><span style="color: #64748b !important; font-size: 7.5pt;">${entry.section}</span></td>
            <td><span style="font-family: monospace; font-size: 8pt;">${entry.evidence || 'Missing'}</span></td>
            <td><span style="color: #475569 !important; font-size: 7.5pt;">${entry.expectedStandard}</span></td>
            <td style="vertical-align: middle;">
              <table cellpadding="0" cellspacing="0" style="display: inline-table; border-collapse: collapse;">
                <tbody>
                  <tr>
                    <td style="padding: 2px 7px; border-radius: 3px; font-size: 7pt; font-weight: bold; font-family: Arial, Helvetica, sans-serif; line-height: 1.2; vertical-align: middle; text-align: center; ${entry.status === 'pass' ? 'background-color: #dcfce7 !important; color: #15803d !important; border: 1px solid #bbf7d0;' : entry.status === 'fail' ? 'background-color: #fee2e2 !important; color: #b91c1c !important; border: 1px solid #fecaca;' : 'background-color: #fef3c7 !important; color: #b45309 !important; border: 1px solid #fde68a;'}">
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

    <div style="font-size: 8pt; color: #475569 !important; margin-top: 4px;">
      <strong>Statutory Violations:</strong> ${ruleValidation.violationCount} | 
      <strong>Warnings:</strong> ${ruleValidation.warningCount} | 
      <strong>Estimated Fine Exposure:</strong> ${verdict.statutoryPenaltyEstimate}
    </div>
  </div>

  <!-- ════════════════ PAGE 2: READABILITY, EVIDENCE & SIGNATURE ════════════════ -->
  <div class="page">
    <!-- Section 3: Font Size & Optical Readability Analysis -->
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
        <div class="v" style="color: ${readabilityAnalysis.flaggedRegions.length > 0 ? '#dc2626' : '#059669'} !important;">
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
                    <td style="padding: 2px 7px; border-radius: 3px; font-size: 7pt; font-weight: bold; font-family: Arial, Helvetica, sans-serif; line-height: 1.2; vertical-align: middle; text-align: center; ${region.status === 'compliant' ? 'background-color: #dcfce7 !important; color: #15803d !important; border: 1px solid #bbf7d0;' : region.status === 'non-compliant' ? 'background-color: #fee2e2 !important; color: #b91c1c !important; border: 1px solid #fecaca;' : 'background-color: #fef3c7 !important; color: #b45309 !important; border: 1px solid #fde68a;'}">
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

    <!-- Section 4: Physical Evidence Snapshot -->
    <div class="section-title">
      <span>4. Packaging Photographic Evidence</span>
      <span class="sec-num">SEC-04</span>
    </div>

    <div class="evidence-block">
      <img src="${evidence.imageDataUrl}" alt="Packaging Inspection Evidence" class="evidence-img" />
      <p style="font-size: 7.5pt; color: #64748b !important; margin-top: 4px;">
        Physical Sample Evidence Record • ${evidence.mappedBoundingBoxesCount} Statutory Bounding Boxes Mapped
      </p>
    </div>

    <!-- Section 5: Corrective Recommendations -->
    <div class="section-title">
      <span>5. Corrective Action &amp; Enforcement Directives</span>
      <span class="sec-num">SEC-05</span>
    </div>

    <div style="font-size: 8.5pt; color: #1e293b !important; margin-bottom: 12px;">
      <ul style="padding-left: 18px; margin-top: 4px;">
        ${recommendations.correctiveActions.map((c) => `<li style="color: #1e293b !important;">${c}</li>`).join('')}
        ${recommendations.legalEnforcementSteps.map((l) => `<li style="color: #1e293b !important;"><strong>Directive:</strong> ${l}</li>`).join('')}
      </ul>
      <p style="font-size: 8pt; color: #dc2626 !important; font-weight: 700; margin-top: 6px;">
        Action Compliance Deadline: ${verdict.recommendedActionDeadline} (under Rule 24 of Legal Metrology Enforcement Guidelines).
      </p>
    </div>

    <!-- Section 6: Digital Signature -->
    <div class="signature-stamp-box">
      <div class="signature-details">
        <h4>Digitally Signed by Inspecting Officer</h4>
        <p><strong>Name:</strong> ${digitalSignature.signedBy} (${digitalSignature.badgeNumber})</p>
        <p><strong>Designation:</strong> ${digitalSignature.designation}</p>
        <p><strong>Authority:</strong> ${digitalSignature.department}</p>
        <p><strong>Timestamp:</strong> ${digitalSignature.timestamp}</p>
        <p class="signature-hash"><strong>e-Sign SHA-256:</strong> ${digitalSignature.sha256Hash}</p>
      </div>
      <div class="verified-seal">
        <div>GOVT OF INDIA</div>
        <div style="font-size: 11pt; font-weight: 900; margin: 1px 0;">✓</div>
        <div>VERIFIED</div>
      </div>
    </div>
  </div>

</body>
</html>`;
}

// ─── Multi-Product Inspection Session HTML Template ──────────────

function generateSessionReportHtml(report: ComplianceInspectionReport): string {
  const { coverPage, sessionSummary, auditedProducts = [], consolidatedViolations = [], recommendations, verdict, digitalSignature, readabilityAnalysis } = report;

  const totalProducts = sessionSummary?.totalProductsScanned || auditedProducts.length;
  const compliantCount = sessionSummary?.compliantCount || 0;
  const nonCompliantCount = sessionSummary?.nonCompliantCount || 0;
  const warningCount = sessionSummary?.warningCount || 0;
  const totalViolations = sessionSummary?.totalViolationsCount || consolidatedViolations.length;

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
  <title>${report.reportId} - Multi-Product Inspection Session Report</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');

    :root {
      color-scheme: light !important;
    }

    @page {
      size: A4 portrait;
      margin: 12mm 15mm 15mm 15mm;
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
      color: #0f172a;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      font-size: 9pt;
      line-height: 1.45;
      color: #0f172a !important;
      background-color: #ffffff !important;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    .page {
      page-break-after: always;
      position: relative;
      width: 794px;
      min-height: 1120px;
      padding: 28px 34px 24px 34px;
      background-color: #ffffff !important;
      color: #0f172a !important;
      box-sizing: border-box;
    }

    .page:last-child {
      page-break-after: auto;
    }

    /* Government Header */
    .gov-header {
      border-bottom: 3px double #1e293b;
      padding-bottom: 10px;
      margin-bottom: 12px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .gov-title-block {
      text-align: center;
      flex: 1;
      padding: 0 12px;
    }

    .gov-title-block h1 {
      font-size: 12pt;
      font-weight: 900;
      color: #0f172a !important;
      letter-spacing: 0.5px;
      text-transform: uppercase;
      margin-bottom: 2px;
      line-height: 1.2;
    }

    .gov-title-block h2 {
      font-size: 8.5pt;
      font-weight: 700;
      color: #475569 !important;
      text-transform: uppercase;
      letter-spacing: 0.3px;
      line-height: 1.2;
    }

    .gov-title-block p {
      font-size: 7pt;
      color: #64748b !important;
      margin-top: 1px;
      font-weight: 500;
    }

    .emblem-placeholder {
      width: 44px;
      height: 44px;
      border: 2px solid #0f172a;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 900;
      font-size: 8.5pt;
      color: #0f172a !important;
      background-color: #f8fafc !important;
      flex-shrink: 0;
    }

    /* Report Identification Bar */
    .report-id-bar {
      background-color: #f1f5f9 !important;
      border: 1px solid #cbd5e1;
      border-radius: 6px;
      padding: 7px 12px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 12px;
      font-family: Arial, Helvetica, sans-serif;
      font-size: 8pt;
      color: #0f172a !important;
    }

    .report-id-bar .id-tag {
      font-weight: 800;
      color: #0f172a !important;
    }

    /* Status Banner */
    .status-banner {
      border: 2px solid ${statusColor};
      background-color: ${statusBg} !important;
      border-radius: 8px;
      padding: 12px 14px;
      margin-bottom: 14px;
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 14px;
      box-sizing: border-box;
    }

    .status-banner-content {
      flex: 1;
    }

    .status-banner h3 {
      font-size: 11pt;
      font-weight: 900;
      color: ${statusColor} !important;
      text-transform: uppercase;
      letter-spacing: 0.4px;
      margin-bottom: 3px;
      line-height: 1.25;
    }

    .status-banner p {
      font-size: 8pt;
      color: #334155 !important;
      margin-bottom: 8px;
      line-height: 1.4;
    }

    .kpi-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 8px;
      margin-bottom: 12px;
    }

    .kpi-card {
      border: 1px solid #cbd5e1;
      border-radius: 6px;
      padding: 8px;
      background-color: #f8fafc !important;
      text-align: center;
    }

    .kpi-card .kpi-num {
      font-family: Arial, Helvetica, sans-serif;
      font-size: 14pt;
      font-weight: 900;
      line-height: 1.1;
      color: #0f172a !important;
    }

    .kpi-card .kpi-lbl {
      font-size: 6.5pt;
      font-weight: 700;
      color: #64748b !important;
      text-transform: uppercase;
      margin-top: 2px;
    }

    /* Section Headings */
    .section-title {
      font-size: 9pt;
      font-weight: 800;
      color: #0f172a !important;
      border-bottom: 1.5px solid #0f172a;
      padding-bottom: 3px;
      margin-top: 10px;
      margin-bottom: 8px;
      text-transform: uppercase;
      letter-spacing: 0.4px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .section-title .sec-num {
      font-family: Arial, Helvetica, sans-serif;
      font-size: 7.5pt;
      color: #64748b !important;
      font-weight: 700;
    }

    /* Tables */
    table.data-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 10px;
      font-size: 7.5pt;
      color: #0f172a !important;
    }

    table.data-table th,
    table.data-table td {
      border: 1px solid #cbd5e1;
      padding: 4px 6px;
      text-align: left;
      vertical-align: middle;
      line-height: 1.3;
      color: #0f172a !important;
    }

    table.data-table th {
      background-color: #f8fafc !important;
      font-weight: 700;
      color: #1e293b !important;
      font-size: 7pt;
      text-transform: uppercase;
    }

    table.data-table tr:nth-child(even) td {
      background-color: #fafbfc !important;
    }

    .grid-2 {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
      margin-bottom: 10px;
    }

    .meta-box {
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      padding: 7px 9px;
      background-color: #ffffff !important;
    }

    .meta-box .k {
      font-size: 7pt;
      font-weight: 700;
      color: #64748b !important;
      text-transform: uppercase;
      margin-bottom: 1px;
    }

    .meta-box .v {
      font-size: 8.5pt;
      font-weight: 600;
      color: #0f172a !important;
    }

    /* Digital Signature Stamp */
    .signature-stamp-box {
      border: 2px solid #1e293b;
      border-radius: 8px;
      padding: 10px 14px;
      background-color: #f8fafc !important;
      margin-top: 14px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .signature-details h4 {
      font-size: 8.5pt;
      font-weight: 800;
      color: #0f172a !important;
      text-transform: uppercase;
    }

    .signature-details p {
      font-size: 7.5pt;
      color: #475569 !important;
    }

    .signature-hash {
      font-family: Arial, monospace;
      font-size: 6pt;
      color: #64748b !important;
      word-break: break-all;
      margin-top: 3px;
      line-height: 1.2;
    }

    .verified-seal {
      width: 60px;
      height: 60px;
      border: 2px dashed #059669;
      border-radius: 50%;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      font-weight: 900;
      font-size: 6pt;
      color: #059669 !important;
      text-align: center;
      line-height: 1.1;
      background-color: #ecfdf5 !important;
      flex-shrink: 0;
    }

    @media print {
      body {
        margin: 0;
        padding: 0;
      }
    }
  </style>
</head>
<body>

  <!-- ════════════════ PAGE 1: SESSION EXECUTIVE SUMMARY & AUDITED PRODUCTS ════════════════ -->
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
        <span style="color: #64748b !important;">INSPECTION SESSION ID: </span><span class="id-tag">${coverPage.reportId}</span>
      </div>
      <div>
        <span style="color: #64748b !important;">SESSION DATE: </span><span class="id-tag">${coverPage.formattedDate}</span>
      </div>
    </div>

    <!-- Overall Status Banner -->
    <div class="status-banner">
      <div class="status-banner-content">
        <h3>${verdict.verdictTitle}</h3>
        <p>${verdict.summaryRemarks}</p>
        <table cellpadding="0" cellspacing="0" style="display: inline-table; border-collapse: collapse; margin-top: 2px;">
          <tbody>
            <tr>
              <td style="background-color: ${riskColor} !important; color: #ffffff !important; font-size: 7pt; font-weight: bold; font-family: Arial, Helvetica, sans-serif; padding: 2px 7px; border-radius: 4px; vertical-align: middle; text-align: center; line-height: 1.2;">
                SESSION RISK ASSESSMENT: ${coverPage.riskTier} TIER
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- KPI Grid -->
    <div class="kpi-grid">
      <div class="kpi-card">
        <div class="kpi-num">${totalProducts}</div>
        <div class="kpi-lbl">Total Products Audited</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-num" style="color: #15803d !important;">${compliantCount}</div>
        <div class="kpi-lbl">Fully Compliant</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-num" style="color: ${nonCompliantCount > 0 ? '#b91c1c' : '#15803d'} !important;">${nonCompliantCount}</div>
        <div class="kpi-lbl">Non-Compliant / Flagged</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-num" style="color: ${totalViolations > 0 ? '#b91c1c' : '#15803d'} !important;">${totalViolations}</div>
        <div class="kpi-lbl">Total Violations Flagged</div>
      </div>
    </div>

    <!-- Section 1: Inspector Authority -->
    <div class="section-title">
      <span>1. Inspecting Authority &amp; Sweep Jurisdiction</span>
      <span class="sec-num">SEC-01</span>
    </div>

    <div class="grid-2">
      <div class="meta-box">
        <div class="k">Inspecting Officer / Badge</div>
        <div class="v">${coverPage.inspectorName} (${coverPage.inspectorBadge})</div>
        <div class="k" style="margin-top: 3px;">Designation</div>
        <div class="v" style="font-size: 8pt; font-weight: 500;">${coverPage.inspectorDesignation}</div>
      </div>

      <div class="meta-box">
        <div class="k">Department &amp; Authority</div>
        <div class="v" style="font-size: 8pt;">${coverPage.department}</div>
        <div class="k" style="margin-top: 3px;">Jurisdiction / Inspection Location</div>
        <div class="v" style="font-size: 8pt; font-weight: 500;">${coverPage.jurisdiction} • ${coverPage.inspectionLocation}</div>
      </div>
    </div>

    <!-- Section 2: Audited Products Master Ledger Table -->
    <div class="section-title">
      <span>2. Audited Products Master Ledger (${auditedProducts.length} Packaged Commodities)</span>
      <span class="sec-num">SEC-02</span>
    </div>

    <table class="data-table">
      <thead>
        <tr>
          <th style="width: 5%;">#</th>
          <th style="width: 28%;">Product / Commodity Name</th>
          <th style="width: 25%;">Manufacturer / Brand</th>
          <th style="width: 14%;">MRP &amp; Net Qty</th>
          <th style="width: 10%;">Score</th>
          <th style="width: 18%;">Inspection Status</th>
        </tr>
      </thead>
      <tbody>
        ${auditedProducts.map((p, idx) => `
          <tr>
            <td style="font-weight: bold; text-align: center;">${idx + 1}</td>
            <td><strong>${p.productName}</strong><br/><span style="color: #64748b !important; font-size: 6.5pt;">Batch: ${p.batchNumber}</span></td>
            <td><span style="font-size: 7.5pt;">${p.manufacturer}</span></td>
            <td><strong>${p.mrp}</strong><br/><span style="color: #475569 !important; font-size: 7pt;">${p.netQuantity}</span></td>
            <td style="font-weight: 900; font-family: Arial, Helvetica, sans-serif; text-align: center; color: ${p.complianceScore >= 80 ? '#15803d' : p.complianceScore >= 60 ? '#b45309' : '#b91c1c'} !important;">
              ${p.complianceScore}
            </td>
            <td>
              <table cellpadding="0" cellspacing="0" style="display: inline-table; border-collapse: collapse;">
                <tbody>
                  <tr>
                    <td style="padding: 2px 6px; border-radius: 3px; font-size: 6.5pt; font-weight: bold; font-family: Arial, Helvetica, sans-serif; line-height: 1.1; vertical-align: middle; text-align: center; ${p.status === 'compliant' ? 'background-color: #dcfce7 !important; color: #15803d !important; border: 1px solid #bbf7d0;' : p.status === 'non-compliant' ? 'background-color: #fee2e2 !important; color: #b91c1c !important; border: 1px solid #fecaca;' : 'background-color: #fef3c7 !important; color: #b45309 !important; border: 1px solid #fde68a;'}">
                      ${p.status === 'compliant' ? 'COMPLIANT' : `${p.violationCount} VIOLATION(S)`}
                    </td>
                  </tr>
                </tbody>
              </table>
            </td>
          </tr>
        `).join('')}
      </tbody>
    </table>

    <div style="font-size: 7.5pt; color: #475569 !important; margin-top: 3px;">
      <strong>Cumulative Session Penalty Exposure:</strong> ${verdict.statutoryPenaltyEstimate}
    </div>
  </div>

  <!-- ════════════════ PAGE 2: CONSOLIDATED VIOLATIONS MATRIX & READABILITY ════════════════ -->
  <div class="page">
    <div class="section-title">
      <span>3. Consolidated Legal Metrology &amp; FSSAI Violations Matrix</span>
      <span class="sec-num">SEC-03</span>
    </div>

    ${consolidatedViolations.length > 0 ? `
      <table class="data-table">
        <thead>
          <tr>
            <th style="width: 22%;">Product &amp; Manufacturer</th>
            <th style="width: 14%;">Rule Code</th>
            <th style="width: 24%;">Statutory Act &amp; Section</th>
            <th style="width: 26%;">Observed Packaging Deficiency</th>
            <th style="width: 14%;">Statutory Penalty</th>
          </tr>
        </thead>
        <tbody>
          ${consolidatedViolations.map((v) => `
            <tr>
              <td><strong>${v.productName}</strong><br/><span style="color: #64748b !important; font-size: 6.5pt;">${v.manufacturer}</span></td>
              <td><code>${v.ruleCode}</code></td>
              <td><strong>${v.ruleName}</strong><br/><span style="color: #475569 !important; font-size: 6.5pt;">${v.section}</span></td>
              <td><span style="font-size: 7pt; color: #b91c1c !important;">${v.evidence}</span></td>
              <td style="font-weight: 700; font-family: monospace; font-size: 7pt; color: #991b1b !important;">${v.penaltyRange}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    ` : `
      <div style="padding: 12px; background-color: #ecfdf5 !important; border: 1px solid #bbf7d0; border-radius: 6px; text-align: center; color: #15803d !important; font-size: 8pt; margin-bottom: 12px;">
        <strong>✓ ZERO STATUTORY VIOLATIONS DETECTED</strong><br/>
        All ${auditedProducts.length} scanned packaged commodities in this session adhere fully to mandatory packaging and labelling rules.
      </div>
    `}

    <!-- Section 4: Optical Readability Summary -->
    <div class="section-title">
      <span>4. Optical Readability &amp; Print Typography Summary</span>
      <span class="sec-num">SEC-04</span>
    </div>

    <div class="grid-2">
      <div class="meta-box">
        <div class="k">Avg Font Height Across All Labels</div>
        <div class="v">${readabilityAnalysis.summary.avgFontSizePt} pt (${((readabilityAnalysis.summary.avgFontSizePt * 25.4) / 72).toFixed(1)} mm)</div>
        <div class="k" style="margin-top: 3px;">Average Optical Contrast</div>
        <div class="v">${readabilityAnalysis.summary.avgContrastRatio}:1 (WCAG 2.1 Standard)</div>
      </div>

      <div class="meta-box">
        <div class="k">Overall Readability Index</div>
        <div class="v">${readabilityAnalysis.summary.overallScore} / 100</div>
        <div class="k" style="margin-top: 3px;">Defect Regions Flagged</div>
        <div class="v" style="color: ${readabilityAnalysis.flaggedRegions.length > 0 ? '#dc2626' : '#059669'} !important;">
          ${readabilityAnalysis.flaggedRegions.length} Regions Require Typography Remediation
        </div>
      </div>
    </div>

    <!-- Section 5: Enforcement Directives -->
    <div class="section-title">
      <span>5. Corrective Action Directives &amp; Compounding Notice Requisitions</span>
      <span class="sec-num">SEC-05</span>
    </div>

    <div style="font-size: 8pt; color: #1e293b !important; margin-bottom: 12px;">
      <ul style="padding-left: 16px; margin-top: 4px;">
        ${recommendations.correctiveActions.map((c) => `<li style="color: #1e293b !important; margin-bottom: 3px;">${c}</li>`).join('')}
        ${recommendations.legalEnforcementSteps.map((l) => `<li style="color: #1e293b !important; margin-bottom: 3px;"><strong>Statutory Notice:</strong> ${l}</li>`).join('')}
      </ul>
      <p style="font-size: 8pt; color: #dc2626 !important; font-weight: 700; margin-top: 6px;">
        Compounding &amp; Rectification Deadline: ${verdict.recommendedActionDeadline} (under Rule 24 of Legal Metrology Guidelines).
      </p>
    </div>

    <!-- Section 6: Digital Signature -->
    <div class="signature-stamp-box">
      <div class="signature-details">
        <h4>Digitally Signed Inspection Session Seal</h4>
        <p><strong>Inspecting Officer:</strong> ${digitalSignature.signedBy} (${digitalSignature.badgeNumber})</p>
        <p><strong>Designation:</strong> ${digitalSignature.designation} • ${digitalSignature.department}</p>
        <p><strong>Session Timestamp:</strong> ${digitalSignature.timestamp}</p>
        <p class="signature-hash"><strong>e-Sign Cryptographic Hash:</strong> ${digitalSignature.sha256Hash}</p>
      </div>
      <div class="verified-seal">
        <div>GOVT OF INDIA</div>
        <div style="font-size: 11pt; font-weight: 900; margin: 1px 0;">✓</div>
        <div>VERIFIED</div>
      </div>
    </div>
  </div>

</body>
</html>`;
}

// ─── Direct PDF Download Generator (Fixed for Dark Mode) ─────────

export async function downloadReportAsPdf(report: ComplianceInspectionReport): Promise<void> {
  const htmlContent = generateReportHtml(report);

  // Create an isolated hidden iframe so no parent dark-mode CSS styles leak in
  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.left = '-9999px';
  iframe.style.top = '0';
  iframe.style.width = '794px';
  iframe.style.height = '1123px';
  iframe.style.border = 'none';
  iframe.style.zIndex = '-9999';
  iframe.style.backgroundColor = '#ffffff';
  document.body.appendChild(iframe);

  const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
  if (!iframeDoc || !iframe.contentWindow) {
    throw new Error('Unable to access isolated iframe document for PDF export.');
  }

  iframeDoc.open();
  iframeDoc.write(htmlContent);
  iframeDoc.close();

  try {
    if (iframeDoc.fonts) {
      await iframeDoc.fonts.ready;
    }

    // Small delay to ensure all DOM sub-elements and images render inside the iframe
    await new Promise((resolve) => setTimeout(resolve, 300));

    // Render the pages inside the isolated iframe
    const pages = iframeDoc.querySelectorAll('.page');
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
      const canvas = await html2canvas(iframeDoc.body as HTMLElement, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        windowWidth: 794,
      });
      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      pdf.addImage(imgData, 'JPEG', 0, 0, 210, 297);
    }


    const filename = report.reportType === 'inspection-session'
      ? `${report.reportId}_MultiProduct_Inspection_Session_Report.pdf`
      : `${report.reportId}_Compliance_Report.pdf`;

    pdf.save(filename);
  } catch (error) {
    console.error('Error generating direct PDF download via isolated iframe, falling back to print dialog:', error);
    exportReportToPdf(report);
  } finally {
    if (document.body.contains(iframe)) {
      document.body.removeChild(iframe);
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
  const { coverPage, productInfo, ruleValidation, readabilityAnalysis, verdict, digitalSignature, recommendations, auditedProducts, consolidatedViolations } = report;

  const isSessionReport = report.reportType === 'inspection-session' && !!auditedProducts;

  const docxHtml = `
  <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
  <head>
    <meta charset="utf-8">
    <title>${report.reportId} Compliance Report</title>
    <style>
      body { font-family: Calibri, Arial, sans-serif; font-size: 11pt; color: #1E293B; line-height: 1.5; }
      h1 { font-size: 18pt; color: #0F172A; text-align: center; border-bottom: 2pt solid #0F172A; padding-bottom: 6pt; }
      h2 { font-size: 13pt; color: #1E293B; border-bottom: 1pt solid #CBD5E1; padding-bottom: 3pt; margin-top: 14pt; }
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

    ${isSessionReport ? `
      <h2>1. AUDITED PRODUCTS MASTER LEDGER (${auditedProducts.length} Packaged Commodities)</h2>
      <table>
        <tr><th>#</th><th>Product Name</th><th>Manufacturer</th><th>MRP</th><th>Net Qty</th><th>Score</th><th>Status</th></tr>
        ${auditedProducts.map((p, idx) => `
          <tr>
            <td>${idx + 1}</td>
            <td><strong>${p.productName}</strong></td>
            <td>${p.manufacturer}</td>
            <td>${p.mrp}</td>
            <td>${p.netQuantity}</td>
            <td>${p.complianceScore}/100</td>
            <td><strong>${p.status.toUpperCase()}</strong> (${p.violationCount} Violations)</td>
          </tr>
        `).join('')}
      </table>

      <h2>2. CONSOLIDATED STATUTORY VIOLATIONS MATRIX</h2>
      <table>
        <tr><th>Product</th><th>Manufacturer</th><th>Rule Code</th><th>Deficiency Finding</th><th>Penalty</th></tr>
        ${(consolidatedViolations || []).map((v) => `
          <tr>
            <td><strong>${v.productName}</strong></td>
            <td>${v.manufacturer}</td>
            <td>${v.ruleCode} (${v.section})</td>
            <td>${v.evidence}</td>
            <td>${v.penaltyRange}</td>
          </tr>
        `).join('')}
      </table>
    ` : `
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
    `}

    <h2>3. OPTICAL FONT SIZE &amp; READABILITY ANALYSIS</h2>
    <p><strong>Overall Readability Score:</strong> ${readabilityAnalysis.summary.overallScore}/100 &nbsp;|&nbsp; <strong>Avg Font Size:</strong> ${readabilityAnalysis.summary.avgFontSizePt} pt &nbsp;|&nbsp; <strong>Avg Contrast Ratio:</strong> ${readabilityAnalysis.summary.avgContrastRatio}:1</p>

    <h2>4. ENFORCEMENT DIRECTIVES &amp; CORRECTIVE RECOMMENDATIONS</h2>
    <ul>
      ${recommendations.correctiveActions.map((c) => `<li>${c}</li>`).join('')}
      ${recommendations.legalEnforcementSteps.map((l) => `<li>${l}</li>`).join('')}
    </ul>
    <p><strong>Rectification Deadline:</strong> ${verdict.recommendedActionDeadline}</p>

    <hr/>
    <h2>5. DIGITAL SIGNATURE</h2>
    <p><strong>Digitally signed by:</strong> ${digitalSignature.signedBy} (${digitalSignature.designation})</p>
    <p><strong>Timestamp:</strong> ${digitalSignature.timestamp}</p>
    <p><strong>e-Sign SHA-256:</strong> ${digitalSignature.sha256Hash}</p>
  </body>
  </html>`;

  const blob = new Blob(['\ufeff', docxHtml], {
    type: 'application/msword',
  });

  const url = URL.createObjectURL(blob);
  const downloadLink = document.createElement('a');
  downloadLink.href = url;
  downloadLink.download = isSessionReport
    ? `${report.reportId}_Inspection_Session_Report.doc`
    : `${report.reportId}_Compliance_Report.doc`;
  document.body.appendChild(downloadLink);
  downloadLink.click();
  document.body.removeChild(downloadLink);
  URL.revokeObjectURL(url);
}
