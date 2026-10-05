const router = require('express').Router()
const base = '/journeys/supplier/respond-to-assurance-request/version-1'
const views = 'journeys/supplier/respond-to-assurance-request/version-1/'

router.use((req, res, next) => {
  const data = req.session.data
  data.supplierAssurance ||= {}
  res.locals.assurance = data.supplierAssurance
  next()
})

const complete = state => state.clinical && state.interoperability && state.protection && state.security

// Reset this journey only, including fields copied by the kit's auto-store.
router.get('/reset', (req, res) => {
  for (const key of [
    'supplierAssurance', 'supplierClinicalNotes', 'supplierNorthshireIntegration',
    'supplierProtectionNotes', 'clinicalFiles', 'dataProtectionFile', 'supplierSecurityFile'
  ]) {
    delete req.session.data[key]
  }
  res.redirect(base + '/start')
})

// Keep completed responses read-only after submission.
router.use((req, res, next) => {
  if (res.locals.assurance.submitted &&
      (req.method === 'POST' || ['/clinical-safety', '/interoperability', '/data-protection', '/technical-security', '/check-response'].includes(req.path))) {
    return res.redirect(base + '/confirmation')
  }
  next()
})

router.post('/save-clinical', (req, res) => {
  Object.assign(res.locals.assurance, { clinical: true, differentClinical: false, clinicalNotes: '' })
  res.redirect(base + '/request-overview')
})

router.post('/save-clinical-different', (req, res) => {
  Object.assign(res.locals.assurance, {
    clinical: true,
    differentClinical: true,
    clinicalNotes: req.body.supplierClinicalNotes || ''
  })
  res.redirect(base + '/request-overview')
})

router.post('/save-interoperability', (req, res) => {
  const state = res.locals.assurance
  state.integration = (req.body.supplierNorthshireIntegration || '').trim()
  state.interoperability = true
  res.redirect(base + '/request-overview')
})

// File selection is simulated. No files are uploaded or stored.
router.post('/save-data-protection', (req, res) => {
  Object.assign(res.locals.assurance, {
    protection: true,
    protectionNotes: req.body.supplierProtectionNotes || ''
  })
  res.redirect(base + '/request-overview')
})

// Choosing a certificate explicitly completes C3 for this request only.
router.post('/save-technical-security', (req, res) => {
  Object.assign(res.locals.assurance, { security: true, differentSecurity: false, securityFile: '' })
  res.redirect(base + '/request-overview')
})

// Follow the existing simulated alternative-evidence pattern; no file is stored.
router.post('/save-technical-security-different', (req, res) => {
  Object.assign(res.locals.assurance, {
    security: true,
    differentSecurity: true,
    securityFile: req.body.supplierSecurityFile || ''
  })
  res.redirect(base + '/request-overview')
})

router.get('/check-response', (req, res) => {
  if (!complete(res.locals.assurance)) return res.redirect(base + '/request-overview')
  res.render(views + 'check-response')
})

router.post('/submit-response', (req, res) => {
  if (!complete(res.locals.assurance)) return res.redirect(base + '/request-overview')
  res.locals.assurance.submitted = true
  res.redirect(base + '/confirmation')
})

router.get('/confirmation', (req, res) => {
  if (!res.locals.assurance.submitted) return res.redirect(base + '/request-overview')
  res.render(views + 'confirmation')
})

const documents = {
  interoperability: {
    title: 'DTAC — Interoperability', date: '4 June 2026',
    content: 'The app supports exchange of patient identifiers and observations through a FHIR R4 API over HTTPS. Integration requires agreed data mappings, authentication credentials and a test environment. Local teams need to confirm the receiving system, network access, interface ownership and arrangements for monitoring failed messages.'
  }
}

router.get('/document/:id', (req, res, next) => {
  const document = documents[req.params.id]
  if (!document) return next()
  const interoperability = req.params.id === 'interoperability'
  res.render(views + 'document', {
    documentTitle: document.title,
    documentDate: document.date,
    documentContent: document.content,
    documentReturnLabel: interoperability ? 'interoperability' : 'clinical safety',
    backHref: base + (interoperability ? '/interoperability' : '/clinical-safety')
  })
})

module.exports = router
