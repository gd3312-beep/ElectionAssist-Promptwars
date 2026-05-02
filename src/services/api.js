// Frontend API client — routes all service calls through the Express backend
const BASE = import.meta.env.DEV ? 'http://localhost:8080' : ''

const post = (url, body) =>
  fetch(`${BASE}${url}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }).then(r => r.json())

const get = (url) => fetch(`${BASE}${url}`).then(r => r.json())

export const apiLogin          = (data)            => post('/api/login', data)
export const apiApplyVoterId   = (data)            => post('/api/apply-voter-id', data)
export const apiGetApplication = (id)              => get(`/api/application/${id}`)
export const apiGetCandidates  = ()               => get('/api/candidates')
export const apiChat           = (message, systemPrompt) => post('/api/chat', { message, systemPrompt })
