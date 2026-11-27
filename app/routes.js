// External dependencies
const express = require("express");

const router = express.Router();

// Add your routes here - above the module.exports line

const organisationEvidenceTypes = {
  "employers-liability": { name: "Employers' liability insurance", category: "Insurance" },
  "professional-indemnity": { name: "Professional indemnity insurance", category: "Insurance" },
  "modern-slavery": { name: "Modern Slavery statement", category: "Governance" },
  "financial-accounts": { name: "Financial accounts or statements", category: "Financial assurance" },
  "information-security": { name: "Information security policy", category: "Information governance and cyber security" },
  "carbon-reduction": { name: "Carbon Reduction Plan", category: "Sustainability" },
  "other": { name: "Other organisation assurance evidence", category: "Other organisation assurance evidence" }
};
const organisationBase = "/prototypes/ur_prototypes/ver_3/supplier/";

router.post("/prototypes/ur_prototypes/ver_3/supplier/choose-organisation-evidence", function (req, res) {
  const data = req.session.data;
  let destination = "add-assurance-evidence";
  if (req.body.evidenceType === "public-liability") {
    destination = data.publicLiabilityAdded === "true" ? "public-liability-insurance-details" : "add-public-liability-insurance";
  } else if (req.body.evidenceType === "iso-9001") {
    destination = data.iso9001Added === "true" ? "iso9001-details" : "iso9001-manual-upload";
  } else if (Object.hasOwn(organisationEvidenceTypes, req.body.evidenceType)) {
    const type = req.body.evidenceType;
    const records = Array.isArray(data.organisationEvidenceRecords) ? data.organisationEvidenceRecords : [];
    const existing = type === "other" ? null : records.find(record => record.type === type);
    if (existing) return res.redirect(organisationBase + "organisation-evidence-details/" + existing.id);
    data.organisationEvidenceType = type;
    data.organisationEvidenceName = organisationEvidenceTypes[type].name;
    data.organisationEvidenceDescription = "";
    data.organisationEvidenceAccess = "";
    destination = "add-organisation-evidence";
  }
  res.redirect(organisationBase + destination);
});

router.post(organisationBase + "save-organisation-evidence", function (req, res) {
  const data = req.session.data;
  const type = data.organisationEvidenceType;
  const config = organisationEvidenceTypes[type];
  if (!config || !["available", "request"].includes(data.organisationEvidenceAccess)) {
    return res.redirect(organisationBase + "add-organisation-evidence");
  }
  const name = type === "other" ? String(data.organisationEvidenceName || "").trim().replace(/\s+/g, " ") : config.name;
  if (!name || name.length > 150) {
    req.flash("organisationEvidenceError", "Enter an evidence name of 150 characters or fewer.");
    return res.redirect(organisationBase + "add-organisation-evidence");
  }
  const records = Array.isArray(data.organisationEvidenceRecords) ? data.organisationEvidenceRecords : [];
  const normalise = value => value.trim().replace(/\s+/g, " ").toLocaleLowerCase("en-GB");
  const reserved = ["Public liability insurance", "ISO 9001 certification", "ISO 9001", ...Object.entries(organisationEvidenceTypes).filter(([key]) => key !== "other").map(([, value]) => value.name)];
  const isDuplicate = records.some(record => (type !== "other" && record.type === type) || normalise(record.name) === normalise(name)) || (type === "other" && reserved.some(value => normalise(value) === normalise(name)));
  if (isDuplicate) {
    req.flash("organisationEvidenceError", "Evidence with this name has already been added or has its own evidence type. Choose another name or view the existing evidence.");
    return res.redirect(organisationBase + "add-organisation-evidence");
  }
  records.push({ id: require("crypto").randomUUID(), type, name, category: config.category, description: String(data.organisationEvidenceDescription || "").trim(), access: data.organisationEvidenceAccess });
  data.organisationEvidenceRecords = records;
  data.organisationEvidenceType = "";
  req.flash("organisationEvidenceAdded", "true");
  res.redirect(organisationBase + "organisation-information");
});

router.get([organisationBase + "organisation-evidence-details/:id", organisationBase + "manage-assurance-information/organisation/organisation-evidence-details/:id"], function (req, res) {
  const records = Array.isArray(req.session.data.organisationEvidenceRecords) ? req.session.data.organisationEvidenceRecords : [];
  const record = records.find(item => item.id === req.params.id);
  if (!record) return res.status(404).render("404");
  res.render("prototypes/ur_prototypes/ver_3/supplier/manage-assurance-information/organisation/organisation-evidence-details", { record });
});

router.post("/prototypes/ur_prototypes/ver_3/supplier/confirm-public-liability-insurance", function (req, res) {
  req.session.data.publicLiabilityAdded = "true";
  req.flash("publicLiabilityAdded", "true");
  res.redirect("/prototypes/ur_prototypes/ver_3/supplier/organisation-information");
});

router.post("/prototypes/ur_prototypes/ver_3/supplier/confirm-iso9001", function (req, res) {
  req.session.data.iso9001Added = "true";
  req.session.data.iso9001SavedBody = req.session.data.iso9001ManualBody || "";
  req.session.data.iso9001SavedNumber = req.session.data.iso9001ManualNumber || "";
  req.flash("iso9001Added", "true");
  res.redirect("/prototypes/ur_prototypes/ver_3/supplier/organisation-information");
});

router.post("/prototypes/ur_prototypes/ver_3/supplier/choose-product-evidence", function (req, res) {
  const destinations = { paq: "add-paq", clinical: "add-clinical-safety", penetration: req.session.data.penetrationAdded === "true" ? "penetration-testing-details" : "add-penetration-testing" };
  const destination = destinations[req.session.data.productEvidenceType] || "add-product-assurance-evidence";
  res.redirect("/prototypes/ur_prototypes/ver_3/supplier/" + destination);
});

router.post("/prototypes/ur_prototypes/ver_3/supplier/save-paq", function (req, res) {
  const data = req.session.data;
  for (const field of ["Version", "Day", "Month", "Year", "Additional", "Access"]) {
    data["paqSaved" + field] = data["paq" + field] || "";
  }
  data.paqAdded = "true";
  req.flash("paqAdded", "true");
  res.redirect("/prototypes/ur_prototypes/ver_3/supplier/product-assurance-information");
});

router.post("/prototypes/ur_prototypes/ver_3/supplier/choose-clinical-sharing", function (req, res) {
  const data = req.session.data;
  const access = req.body.clinicalAccess;
  const location = req.body.clinicalDocumentHeld;
  if (!["available", "request"].includes(access)) {
    req.flash("clinicalError", "Select how you would like to share this evidence.");
    return res.redirect(organisationBase + "add-clinical-safety");
  }
  if (access === "request" && !["service", "supplier"].includes(location)) {
    data.clinicalDocumentHeld = "";
    req.flash("clinicalError", "Select where the full report will be held.");
    return res.redirect(organisationBase + "add-clinical-safety");
  }
  data.clinicalAccess = access;
  data.clinicalDocumentHeld = access === "available" ? "service" : location;
  data.clinicalSummary = access === "request" ? (req.body.clinicalSummary || "") : "";
  res.redirect(organisationBase + "check-clinical-safety");
});

router.post("/prototypes/ur_prototypes/ver_3/supplier/choose-clinical-location", function (req, res) {
  const data = req.session.data;
  if (data.clinicalAccess !== "request" || !["service", "supplier"].includes(req.body.clinicalDocumentHeld)) {
    return res.redirect(organisationBase + "clinical-safety-location");
  }
  res.redirect(organisationBase + (req.body.clinicalDocumentHeld === "service" ? "clinical-safety-document" : "check-clinical-safety"));
});

router.post("/prototypes/ur_prototypes/ver_3/supplier/save-clinical-safety", function (req, res) {
  const data = req.session.data;
  const valid = (data.clinicalAccess === "available" && data.clinicalDocumentHeld === "service") ||
    (data.clinicalAccess === "request" && ["service", "supplier"].includes(data.clinicalDocumentHeld));
  if (!valid) return res.redirect(organisationBase + "add-clinical-safety");
  data.clinicalSavedAccess = data.clinicalAccess;
  data.clinicalSavedDocumentHeld = data.clinicalDocumentHeld;
  data.clinicalSavedSummary = data.clinicalAccess === "request" ? (data.clinicalSummary || "") : "";
  data.clinicalSafetyAdded = "true";
  req.flash("clinicalSafetyAdded", "true");
  res.redirect(organisationBase + "product-assurance-information");
});

router.post(organisationBase + "choose-penetration-sharing", function (req, res) {
  const data = req.session.data;
  if (data.penetrationAdded === "true") return res.redirect(organisationBase + "penetration-testing-details");
  if (req.body.penetrationAccess === "available") {
    data.penetrationLocation = "service";
    data.penetrationSummary = "";
    return res.redirect(organisationBase + "penetration-testing-document");
  }
  if (req.body.penetrationAccess === "request") return res.redirect(organisationBase + "penetration-testing-location");
  res.redirect(organisationBase + "add-penetration-testing");
});

router.post(organisationBase + "choose-penetration-location", function (req, res) {
  const data = req.session.data;
  if (data.penetrationAdded === "true") return res.redirect(organisationBase + "penetration-testing-details");
  if (data.penetrationAccess !== "request" || !["service", "supplier"].includes(req.body.penetrationLocation)) return res.redirect(organisationBase + "penetration-testing-location");
  res.redirect(organisationBase + (req.body.penetrationLocation === "service" ? "penetration-testing-document" : "check-penetration-testing"));
});

router.post(organisationBase + "save-penetration-testing", function (req, res) {
  const data = req.session.data;
  if (data.penetrationAdded === "true") return res.redirect(organisationBase + "penetration-testing-details");
  const validChoice = (data.penetrationAccess === "available" && data.penetrationLocation === "service") || (data.penetrationAccess === "request" && ["service", "supplier"].includes(data.penetrationLocation));
  const day = Number(data.penetrationDay), month = Number(data.penetrationMonth), year = Number(data.penetrationYear);
  const date = new Date(Date.UTC(year, month - 1, day));
  const validDate = /^\d{1,2}$/.test(data.penetrationDay || "") && /^\d{1,2}$/.test(data.penetrationMonth || "") && /^\d{4}$/.test(data.penetrationYear || "") && year >= 1000 && date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
  if (!validChoice || !validDate || !String(data.penetrationScope || "").trim()) {
    req.flash("penetrationError", "Enter a valid report date, product version or scope, and sharing choice.");
    return res.redirect(organisationBase + "add-penetration-testing");
  }
  for (const field of ["Day", "Month", "Year", "Scope", "Access", "Location"]) data["penetrationSaved" + field] = data["penetration" + field];
  data.penetrationSavedSummary = data.penetrationAccess === "request" ? (data.penetrationSummary || "") : "";
  data.penetrationAdded = "true";
  req.flash("penetrationAdded", "true");
  res.redirect(organisationBase + "product-assurance-information");
});

const paqRequestBase = organisationBase + "respond-to-assurance-request/";
function validPaqRequestDate(data) {
  const d = (data.worthingtonPaqDay || "").trim(), m = (data.worthingtonPaqMonth || "").trim(), y = (data.worthingtonPaqYear || "").trim();
  if (!d && !m && !y) return true;
  if (!/^\d{1,2}$/.test(d) || !/^\d{1,2}$/.test(m) || !/^\d{4}$/.test(y) || Number(y) < 1000) return false;
  const date = new Date(Date.UTC(Number(y), Number(m) - 1, Number(d)));
  return date.getUTCFullYear() === Number(y) && date.getUTCMonth() === Number(m) - 1 && date.getUTCDate() === Number(d);
}
router.post(paqRequestBase + "review-paq-response", function (req, res) {
  if (req.session.data.worthingtonPaqResponded === "true") return res.redirect(paqRequestBase + "request-paq-details");
  if (!validPaqRequestDate(req.session.data)) {
    req.flash("worthingtonPaqError", "PAQ completion date must be a real date with a day, month and year.");
    return res.redirect(paqRequestBase + "provide-paq");
  }
  res.redirect(paqRequestBase + "check-paq-response");
});
router.post(paqRequestBase + "send-paq-response", function (req, res) {
  const data = req.session.data;
  if (data.worthingtonPaqResponded === "true") return res.redirect(organisationBase + "start");
  if (!validPaqRequestDate(data)) {
    req.flash("worthingtonPaqError", "PAQ completion date must be a real date with a day, month and year.");
    return res.redirect(paqRequestBase + "provide-paq");
  }
  data.worthingtonPaqResponse = {
    recipient: "Greater Worthington and Bryce Trust",
    product: "Moustache Health Monitor",
    productVersion: "3.1.4",
    evidence: "Pre-Acquisition Questionnaire (PAQ)",
    completionDay: data.worthingtonPaqDay,
    completionMonth: data.worthingtonPaqMonth,
    completionYear: data.worthingtonPaqYear,
    scope: "This assessment only",
    simulated: true
  };
  data.worthingtonPaqResponded = "true";
  req.flash("worthingtonPaqResponseSubmitted", "true");
  res.redirect(organisationBase + "start");
});

router.post(organisationBase + "respond-to-assurance-request/submit-clinical-access-response", function (req, res) {
  const data = req.session.data;
  if (data.northshireClinicalSafetyAccessResponded !== "true") {
    data.northshireClinicalSafetyAccessResponse = {
      message: String(data.clinicalAccessMessage || "").trim(),
      evidence: "Clinical Safety Case Report",
      product: "Moustache Health Monitor",
      recipient: "Northshire NHS Trust",
      scope: "This assessment only",
      simulated: true
    };
    data.northshireClinicalSafetyAccessResponded = "true";
    req.flash("northshireClinicalResponseSubmitted", "true");
  }
  res.redirect(organisationBase + "start");
});

router.post("/additional-request-choice", function (req, res) {
  const choice = req.session.data.additionalAssurance;
  console.log(`choice is ${choice}`);

  if (choice === "uploadFile") {
    console.log(`choice is ${choice}...redirecting`);
    res.redirect("/prototypes/ur_prototypes/ver_2/trust/request_additional_assurance/upload_file/submit_question_files");
  }
  else if (choice === "Add questions individually") {
    console.log(`choice is ${choice}...redirecting`);
    res.redirect("/prototypes/ur_prototypes/ver_2/trust/request_additional_assurance/ask_individual_questions/question_wizard");
  }
    else if (choice === "questionBank") {
    console.log(`choice is ${choice}...redirecting`);
    res.redirect("/prototypes/ur_prototypes/ver_2/trust/request_additional_assurance/question_bank/question_bank");
  }
});

router.post(
  "/journeys/trust/ver_2/supplier_search_result",
  function (req, res) {
    const data = req.session.data;

    // convert the answer from a string into a number
    const supplierSearchField = data.supplierSearch;
    const deviceSearchField = data.deviceSearch;
    console.log(supplierSearchField);
    console.log(deviceSearchField);

    //If both fields have text
    if (supplierSearchField && deviceSearchField) {
      res.redirect("./search_supplier_and_device");
    }

    //If searching by device
    else if (!supplierSearchField && deviceSearchField) {
      res.redirect("./search_for_device");
    }
  },
);

router.use(
  "/journeys/supplier/respond-to-assurance-request/version-1",
  require("./routes/supplier-assurance"),
);

router.use(
  "/journeys/supplier/manage-assurance-information/version-1",
  require("./routes/supplier-product-assurance"),
);

router.use("/marias-suggestions", require("./routes/marias-suggestions"));

// Compatibility for existing supplier template URLs and form submissions.
const supplierTemplateLocations = {
  'organisation-information': 'manage-assurance-information/organisation',
  'cyber-essentials': 'manage-assurance-information/organisation',
  'report-problem': 'manage-assurance-information/organisation',
  'add-assurance-evidence': 'manage-assurance-information/organisation',
  'add-organisation-evidence': 'manage-assurance-information/organisation',
  'organisation-evidence-details': 'manage-assurance-information/organisation',
  'add-public-liability-insurance': 'manage-assurance-information/organisation',
  'public-liability-insurance-details': 'manage-assurance-information/organisation',
  'evidence-access': 'manage-assurance-information/organisation',
  'check-public-liability-insurance': 'manage-assurance-information/organisation',
  'iso9001-manual-upload': 'manage-assurance-information/organisation',
  'check-iso9001': 'manage-assurance-information/organisation',
  'iso9001-details': 'manage-assurance-information/organisation',
  'products': 'manage-assurance-information/product',
  'product-connect': 'manage-assurance-information/product',
  'product-assurance-information': 'manage-assurance-information/product',
  'add-product-assurance-evidence': 'manage-assurance-information/product',
  'product-evidence-unavailable': 'manage-assurance-information/product',
  'dtac-details': 'manage-assurance-information/product',
  'add-paq': 'manage-assurance-information/product',
  'paq-evidence-access': 'manage-assurance-information/product',
  'check-paq': 'manage-assurance-information/product',
  'paq-details': 'manage-assurance-information/product',
  'add-clinical-safety': 'manage-assurance-information/product',
  'check-clinical-safety': 'manage-assurance-information/product',
  'clinical-safety-details': 'manage-assurance-information/product',
  'add-penetration-testing': 'manage-assurance-information/product',
  'penetration-testing-location': 'manage-assurance-information/product',
  'penetration-testing-document': 'manage-assurance-information/product',
  'check-penetration-testing': 'manage-assurance-information/product',
  'penetration-testing-details': 'manage-assurance-information/product',
  'clinical-safety-document': 'legacy',
  'clinical-safety-location': 'legacy',
  'iso9001-manual-confirmation': 'legacy',
  'iso9001-no-record': 'legacy',
  'iso9001-review': 'legacy',
  'request-paq-details': 'respond-to-assurance-request'
};
router.use((req, res, next) => {
  const prefix = organisationBase;
  if (!req.path.startsWith(prefix)) return next();
  const relative = req.path.slice(prefix.length);
  const match = relative.match(/^([a-z0-9-]+)(\.html)?$/);
  if (!match || !Object.hasOwn(supplierTemplateLocations, match[1])) return next();
  const target = prefix + supplierTemplateLocations[match[1]] + "/" + match[1] + (match[2] || "");
  const query = req.originalUrl.includes("?") ? req.originalUrl.slice(req.originalUrl.indexOf("?")) : "";
  return res.redirect(req.method === "GET" || req.method === "HEAD" ? 302 : 307, target + query);
});

module.exports = router;
