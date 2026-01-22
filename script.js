const CONTACTS = {
  test: {
    firstName: "Vardenis",
    lastName: "Pavardenis",
    org: "Groward Group",
    title: "Sales manager",
    phoneMobile: "+37060000000",
    email: "vardenis@example.com",
    website: "https://example.com",
    note: "Hello 👋",
    photoUrl: "https://raw.githubusercontent.com/groward/business-card/v0.1/images/ggavatar.png"
  },
  laimonas: {
    firstName: "Laimonas",
    lastName: "Stanaitis",
    org: "Groward Group",
    title: "Sales manager",
    phoneMobile: "+37061358922",
    email: "laimonas.stanaitis@groward.eu",
    website: "https://www.groward.eu/en",
    note: "Hello 👋",
    photoUrl: "https://raw.githubusercontent.com/groward/business-card/v0.1/images/ggavatar.png"
  },
}

const DEFAULT_KEY = "test";

function getContactFromButton() {
  const btn = document.getElementById("downloadBtn");
  const key = btn?.dataset.contact;
  return CONTACTS[key] ?? null;
}

function escapeVCardValue(value) {
  return String(value ?? "")
    .replace(/\\/g, "\\\\")
    .replace(/,/g, "\\,")
    .replace(/;/g, "\\;")
    .replace(/\r?\n/g, "\\n");
}

async function fetchImageBase64(url) {
  const response = await fetch(url);
  const blob = await response.blob();
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result.split(",")[1]);
    reader.readAsDataURL(blob);
  });
}

async function buildVCard(c) {
  const fn = `${c.firstName} ${c.lastName}`.trim();
  let photoLine = null;
  if (c.photoUrl) {
    const base64 = await fetchImageBase64(c.photoUrl);
    photoLine = `PHOTO;ENCODING=b;TYPE=PNG:${base64}`;
  }
  const lines = [
    "BEGIN:VCARD",
    "VERSION:3.0",
    `N:${escapeVCardValue(c.lastName)};${escapeVCardValue(c.firstName)};;;`,
    `FN:${escapeVCardValue(fn)}`,
    c.org ? `ORG:${escapeVCardValue(c.org)}` : null,
    c.title ? `TITLE:${escapeVCardValue(c.title)}` : null,
    c.phoneMobile ? `TEL;TYPE=CELL:${escapeVCardValue(c.phoneMobile)}` : null,
    c.email ? `EMAIL;TYPE=INTERNET:${escapeVCardValue(c.email)}` : null,
    c.website ? `URL:${escapeVCardValue(c.website)}` : null,
    c.note ? `NOTE:${escapeVCardValue(c.note)}` : null,
    photoLine,
    "END:VCARD"
  ].filter(Boolean);
  return lines.join("\r\n") + "\r\n";
}

function downloadVCF(vcfText, filename = "contact.vcf") {
  const blob = new Blob([vcfText], { type: "text/vcard;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

document.getElementById("downloadBtn").addEventListener("click", async () => {
  const contact = getContactFromButton();
  if (!contact) {
    alert("Contact not configured.");
    return;
  }

  const vcf = await buildVCard(contact);
  const safeName = `${contact.firstName}_${contact.lastName}`
    .trim()
    .replace(/\s+/g, "_");

  downloadVCF(vcf, `${safeName}.vcf`);
});


