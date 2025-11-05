import { loadSnapshot, upsertCase, generateId } from './services/storage'
import { saveUsers, listUsers } from './services/auth'

export function seedIfEmpty() {
  const snap = loadSnapshot()
  if (snap.cases.length > 0) return
  // Seed demo users if none
  if (listUsers().length === 0) {
    saveUsers([
      { id: 'u_lip_alice', name: 'Alice Brown', email: 'alice@example.com', role: 'LIP' },
      { id: 'u_lip_bob', name: 'Bob Green', email: 'bob@example.com', role: 'LIP' },
      { id: 'u_mf_jordan', name: 'Jordan Clerk', email: 'jordan@example.com', role: 'McKenzieFriend' },
    ])
  }
  const id = 'FC-' + new Date().getFullYear().toString().slice(2) + '-000123'
  upsertCase({
    id,
    title: 'Child arrangements application',
    court: 'Family Court',
    caseType: 'Private Law (Child Arrangements)',
    status: 'Open',
    startedAt: new Date().toISOString().slice(0, 10),
    allocatedJudge: 'HHJ Smith',
    childrenInvolved: 2,
    parties: [
      { id: generateId('PTY'), role: 'Applicant', firstName: 'Alice', lastName: 'Brown', solicitorFirm: 'Brown & Co' },
      { id: generateId('PTY'), role: 'Respondent', firstName: 'Bob', lastName: 'Green' },
      { id: generateId('PTY'), role: 'Child', firstName: 'Charlie', lastName: 'Green' },
    ],
    hearings: [
      { id: generateId('HRG'), type: 'Case Management', date: new Date().toISOString().slice(0, 10), time: '10:00', location: 'Courtroom 2', judge: 'HHJ Smith', notes: 'Case management directions' },
    ],
    orders: [],
    documents: [],
    notes: [
      { id: generateId('NOTE'), createdAt: new Date().toISOString(), author: 'Clerk', text: 'Case opened and allocated.' },
    ],
    members: [
      { userId: 'u_lip_alice', role: 'Owner' },
      { userId: 'u_mf_jordan', role: 'Collaborator' },
    ],
    lastUpdatedAt: new Date().toISOString(),
  })
}


