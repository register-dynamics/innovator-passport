const router = require('express').Router()
const base = '/marias-suggestions/'
const views = 'marias-suggestions/'

// Illustrative examples from the existing Trust prototype; no live records are queried.
const available = [
  { id: 'dpia', name: 'Data protection impact assessment (DPIA)', group: 'MedTech product assurance', category: 'Information governance & data protection', template: 'NHS version 2.0', expires: '24 November 2027', updated: '21 November 2027', acceptedBy: 'Ismail County Trust (and 3 others)' },
  { id: 'paq', name: 'Pre-acquisition Questionnaire (PAQ)', group: 'MedTech product assurance', category: 'Product assurance' }
]
const organisationAvailable = [
  { id: 'cyber', name: 'Cyber Essentials certificate', group: 'Organisation level assurance', category: 'Information governance and cyber security' }
]
const allAvailable = [...available, ...organisationAvailable]
const catalogue = [
  { id: 'dcb0129', name: 'DCB 0129 Clinical Risk Management System', category: 'Clinical safety' },
  { id: 'hazard-log', name: 'Hazard log', category: 'Clinical safety' },
  { id: 'clinical-report', name: 'Clinical safety case report', category: 'Clinical safety' },
  { id: 'dtac', name: 'Digital Technology Assessment Criteria (DTAC)', category: 'MedTech product assurance' },
  { id: 'dspt', name: 'Data Security and Protection Toolkit (DSPT)', category: 'Information governance and cyber security' },
  { id: 'penetration', name: 'Penetration test report', category: 'Information governance and cyber security' }
]
const categories = [...new Set(catalogue.map(item => item.category))]
const ensureArray = value => Array.isArray(value) ? value : value ? [value] : []

router.use((req, res, next) => {
  const data = req.session.data
  data.mariasSuggestions ||= { decisions: {}, selected: [], local: [], submitted: false }
  const state = data.mariasSuggestions
  state.decisions ||= {}
  state.selected ||= []
  state.local ||= []
  state.reviewers ||= {}
  state.clarifications ||= {}
  res.locals.exploration = state
  res.locals.availableEvidence = available
  res.locals.organisationEvidence = organisationAvailable
  res.locals.allAvailableEvidence = allAvailable
  res.locals.catalogue = catalogue
  res.locals.categories = categories
  next()
})
router.get('/', (req, res) => res.redirect(base + 'available-evidence'))
router.get('/available-evidence', (req, res) => res.render(views + 'available-evidence'))
router.get('/review-evidence/:documentId', (req, res) => {
  const document = allAvailable.find(item => item.id === req.params.documentId)
  if (!document) return res.status(404).send('Document not found')
  res.render(views + 'review-evidence', { document })
})
router.get('/review-evidence/:documentId/:action', (req, res) => {
  const document = allAvailable.find(item => item.id === req.params.documentId)
  if (!document || !['assign', 'clarification'].includes(req.params.action)) return res.status(404).send('Page not found')
  res.render(views + 'evidence-action', { document, action: req.params.action })
})
router.post('/review-evidence/:documentId/:action', (req, res) => {
  const document = allAvailable.find(item => item.id === req.params.documentId)
  const action = req.params.action
  if (!document || !['assign', 'clarification'].includes(action)) return res.status(404).send('Page not found')
  const value = String(req.body._value || '').trim().slice(0, action === 'assign' ? 150 : 2000)
  if (!value) return res.status(400).render(views + 'evidence-action', { document, action, error: action === 'assign' ? 'Enter the reviewer’s name.' : 'Enter the clarification you need.' })
  const state = req.session.data.mariasSuggestions
  if (action === 'assign') state.reviewers[document.id] = value
  else state.clarifications[document.id] = value
  res.redirect(base + 'review-evidence/' + document.id)
})
router.post('/review-evidence', (req, res) => {
  const state = req.session.data.mariasSuggestions
  const id = req.body._document
  const decision = req.body._decision
  if (allAvailable.some(item => item.id === id) && ['accepted', 'not-accepted', 'later'].includes(decision)) {
    state.decisions[id] = decision
  }
  res.redirect(base + 'available-evidence')
})
router.get('/request-evidence', (req, res) => {
  const query = String(req.query._q || '').trim().slice(0, 100)
  res.render(views + 'request-evidence', { query })
})
router.post('/request-evidence', (req, res) => {
  const state = req.session.data.mariasSuggestions
  if (state.submitted) return res.redirect(base + 'review-request')
  const validIds = new Set(catalogue.map(item => item.id))
  const visible = ensureArray(req.body._visible).filter(id => validIds.has(id))
  const checked = new Set(ensureArray(req.body._selected).filter(id => validIds.has(id) && visible.includes(id)))
  const chosen = new Set(state.selected.filter(id => validIds.has(id)))
  for (const id of visible) { if (checked.has(id)) chosen.add(id); else chosen.delete(id) }
  state.selected = [...chosen]
  const action = String(req.body._action || 'update')
  let query = String(req.body._q || '').trim().slice(0, 100)
  if (action === 'back') return res.redirect(base + 'available-evidence')
  if (action === 'clear-search') query = ''
  if (action === 'add-local') {
    const name = String(req.body._localName || '').trim().replace(/\s+/g, ' ').slice(0, 150)
    if (!name) req.flash('mariasError', 'Enter a local requirement or template name.')
    else if (state.local.some(item => item.name.toLowerCase() === name.toLowerCase())) req.flash('mariasError', 'This local requirement has already been added.')
    else state.local.push({ id: require('crypto').randomUUID(), name })
  } else if (action.startsWith('remove:')) {
    const id = action.slice(7)
    state.local = state.local.filter(item => item.id !== id)
  } else if (action === 'continue') return res.redirect(base + 'review-request')
  res.redirect(base + 'request-evidence' + (query ? '?_q=' + encodeURIComponent(query) : '') + (action === 'add-local' || action.startsWith('remove:') ? '#local-needs' : ''))
})
router.get('/review-request', (req, res) => {
  const state = req.session.data.mariasSuggestions
  const snapshot = state.submitted ? state.snapshot : null
  res.render(views + 'review-request', { reviewDecisions: snapshot ? snapshot.decisions : state.decisions, reviewSelected: snapshot ? snapshot.selected : state.selected, reviewLocal: snapshot ? snapshot.local : state.local })
})
router.post('/submit-request', (req, res) => {
  const state = req.session.data.mariasSuggestions
  if (!state.submitted) {
    state.snapshot = { decisions: { ...state.decisions }, selected: [...state.selected], local: state.local.map(item => ({ ...item })) }
    state.submitted = true
  }
  res.redirect(base + 'review-request')
})
module.exports = router
