const router = require('express').Router()
const base = '/journeys/supplier/manage-assurance-information/version-1'
const views = 'journeys/supplier/manage-assurance-information/version-1/'

router.use((req, res, next) => {
  req.session.data.supplierProductAssurance ||= {
    productVersion: '3.2',
  }
  // Initialise section information for both new and existing prototype sessions.
  req.session.data.supplierProductAssurance.c4 ||= {
    api: 'Yes',
    standards: 'Moustache provides REST APIs for exchanging patient information with external clinical systems. The APIs use HL7 FHIR where supported by the receiving system. API documentation is available to integration partners.',
    updatedDate: '14 January 2026'
  }
  res.locals.productAssurance = req.session.data.supplierProductAssurance
  next()
})

// Reuse the existing save endpoint for the two editable C4 answers.
router.post('/save-dtac', (req, res) => {
  const record = res.locals.productAssurance.c4
  Object.assign(record, {
    api: req.body.supplierProductC4Api === 'No' ? 'No' : 'Yes',
    standards: req.body.supplierProductC4Standards || '',
    updatedDate: '3 October 2026',
    updated: true
  })
  res.redirect(base + '/confirmation')
})

router.get('/confirmation', (req, res) => {
  if (!res.locals.productAssurance.c4.updated) return res.redirect(base + '/dtac')
  res.render(views + 'confirmation')
})

module.exports = router
