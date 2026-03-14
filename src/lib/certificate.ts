import jsPDF from "jspdf";

export function generateCertificate(memberName: string, planName: string) {
  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });

  const w = doc.internal.pageSize.getWidth();
  const h = doc.internal.pageSize.getHeight();

  // Background
  doc.setFillColor(20, 30, 55);
  doc.rect(0, 0, w, h, "F");

  // Gold border
  doc.setDrawColor(210, 170, 60);
  doc.setLineWidth(2);
  doc.rect(12, 12, w - 24, h - 24);
  doc.setLineWidth(0.5);
  doc.rect(16, 16, w - 32, h - 32);

  // Header ornament
  doc.setFillColor(210, 170, 60);
  doc.circle(w / 2, 35, 10, "F");
  doc.setFontSize(16);
  doc.setTextColor(20, 30, 55);
  doc.setFont("helvetica", "bold");
  doc.text("MV", w / 2, 38, { align: "center" });

  // Title
  doc.setTextColor(210, 170, 60);
  doc.setFontSize(36);
  doc.setFont("helvetica", "bold");
  doc.text("CERTIFICATE", w / 2, 65, { align: "center" });

  doc.setFontSize(14);
  doc.setTextColor(180, 180, 190);
  doc.setFont("helvetica", "normal");
  doc.text("OF MEMBERSHIP", w / 2, 75, { align: "center" });

  // Body
  doc.setFontSize(12);
  doc.setTextColor(200, 200, 210);
  doc.text("This is to certify that", w / 2, 95, { align: "center" });

  doc.setFontSize(28);
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.text(memberName, w / 2, 115, { align: "center" });

  // Gold line
  doc.setDrawColor(210, 170, 60);
  doc.setLineWidth(0.8);
  doc.line(w / 2 - 60, 122, w / 2 + 60, 122);

  doc.setFontSize(12);
  doc.setTextColor(200, 200, 210);
  doc.setFont("helvetica", "normal");
  doc.text(
    `is a valued ${planName} member of MemberVault.`,
    w / 2,
    135,
    { align: "center" }
  );

  doc.text(
    `Issued on ${new Date().toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" })}`,
    w / 2,
    148,
    { align: "center" }
  );

  // Signature area
  doc.setDrawColor(180, 180, 190);
  doc.setLineWidth(0.3);
  doc.line(w / 2 - 40, 175, w / 2 + 40, 175);
  doc.setFontSize(10);
  doc.text("MemberVault Administration", w / 2, 182, { align: "center" });

  // Certificate ID
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 120);
  const certId = `MV-${Date.now().toString(36).toUpperCase()}`;
  doc.text(`Certificate ID: ${certId}`, w / 2, h - 20, { align: "center" });

  doc.save(`MemberVault_Certificate_${memberName.replace(/\s+/g, "_")}.pdf`);
}
