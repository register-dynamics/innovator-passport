const router = require('express').Router()
const base = '/journeys/supplier/manage-assurance-information/version-1'
const views = 'journeys/supplier/manage-assurance-information/version-1/'

router.use((req, res, next) => {
  req.session.data.supplierProductAssurance ||= {
    documentName: 'DTAC_Moustache_v3.2.pdf',
    productVersion: '3.2',
    updatedDate: '14 January 2026'
  }
  res.locals.productAssurance = req.session.data.supplierProductAssurance
  next()
})

// Simulate a document update. No file content is uploaded or stored.
router.post('/save-dtac', (req, res) => {
  const record = res.locals.productAssurance
  const version = (req.body.supplierProductDtacVersion || '').trim() || record.productVersion
  const selectedName = (req.body.supplierProductDtacFile || '').trim()
  Object.assign(record, {
    documentName: selectedName ? selectedName.split(/[\\/]/).pop() : 'DTAC_Moustache_updated.pdf',
    productVersion: version,
    updatedDate: '3 October 2026',
    updated: true
  })
  res.redirect(base + '/confirmation')
})

router.get('/confirmation', (req, res) => {
  if (!res.locals.productAssurance.updated) return res.redirect(base + '/assurance-information')
  res.render(views + 'confirmation')
})

module.exports = router
