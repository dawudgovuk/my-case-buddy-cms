import { loadSnapshot, upsertCase, generateId } from './services/storage'
import { saveUsers, listUsers } from './services/auth'
import type { FamilyCase, CaseType, CourtType, CaseStatus, Party, Hearing, HearingType, OrderRecord, OrderType, DocumentRecord } from './types/domain'

const firstNames = [
  'Alice', 'Bob', 'Charlie', 'Diana', 'Edward', 'Fiona', 'George', 'Hannah', 'Ian', 'Julia',
  'Kevin', 'Laura', 'Michael', 'Nina', 'Oliver', 'Patricia', 'Quentin', 'Rachel', 'Samuel', 'Tina',
  'Victor', 'Wendy', 'Xavier', 'Yvonne', 'Zachary', 'Amanda', 'Brian', 'Claire', 'David', 'Emma'
]

const lastNames = [
  'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez',
  'Wilson', 'Anderson', 'Taylor', 'Thomas', 'Hernandez', 'Moore', 'Martin', 'Jackson', 'Thompson', 'White',
  'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson', 'Walker', 'Young', 'Allen', 'King'
]

const firms = [
  'Smith & Associates', 'Johnson Legal Group', 'Williams & Partners', 'Brown & Co', 'Jones Law Firm',
  'Garcia Solicitors', 'Miller Legal', 'Davis & Associates', 'Rodriguez Law', 'Martinez Chambers',
  'Wilson Solicitors', 'Anderson Legal Group', 'Taylor & Partners', 'Thomas Law', 'Hernandez Solicitors'
]

const chambers = [
  'Garden Court Chambers', 'Matrix Chambers', 'Doughty Street Chambers', '3PB Barristers', 'Crown Office Row',
  'Brick Court Chambers', 'Blackstone Chambers', 'Fountain Court', 'Essex Court Chambers', 'One Essex Court'
]

const caseTitles = [
  'Child arrangements application', 'Contact dispute', 'Residence order application', 'Care proceedings', 'Supervision order',
  'Non-molestation order', 'Prohibited steps order', 'Specific issue order', 'Financial remedies', 'Maintenance dispute',
  'Property division', 'Adoption application', 'Special guardianship', 'Parental responsibility', 'Child protection',
  'Domestic abuse proceedings', 'Forced marriage protection', 'FGM protection order', 'Divorce proceedings', 'Separation agreement',
  'Prenuptial agreement', 'Postnuptial agreement', 'Financial settlement', 'Child maintenance', 'Pension sharing',
  'Asset division', 'Spousal maintenance', 'Child support', 'Visitation rights', 'Custody dispute'
]

const judges = [
  'HHJ Smith', 'HHJ Johnson', 'HHJ Williams', 'HHJ Brown', 'HHJ Jones', 'HHJ Garcia', 'HHJ Miller', 'HHJ Davis',
  'HHJ Rodriguez', 'HHJ Martinez', 'HHJ Wilson', 'HHJ Anderson', 'HHJ Taylor', 'HHJ Thomas', 'HHJ Hernandez'
]

const stages = ['application', 'first-hearing', 'directions', 'fact-finding', 'welfare', 'final']

function randomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)]
}

function randomDate(start: Date, end: Date): string {
  const date = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()))
  return date.toISOString().slice(0, 10)
}

function randomCaseType(): CaseType {
  const types: CaseType[] = [
    'Public Law (Care Proceedings)',
    'Private Law (Child Arrangements)',
    'Domestic Abuse (Non-Molestation)',
    'Financial Remedies',
    'Adoption',
    'Other'
  ]
  return randomElement(types)
}

function randomCourtType(): CourtType {
  return Math.random() > 0.7 ? 'High Court Family Division' : 'Family Court'
}

function randomStatus(): CaseStatus {
  const rand = Math.random()
  if (rand < 0.7) return 'Open'
  if (rand < 0.9) return 'Stayed'
  return 'Concluded'
}

function generateUsers() {
  const users: any[] = []
  const usedNames = new Set<string>()
  
  function getUniqueName(): { firstName: string; lastName: string } {
    let firstName = randomElement(firstNames)
    let lastName = randomElement(lastNames)
    let key = `${firstName} ${lastName}`
    let attempts = 0
    while (usedNames.has(key) && attempts < 100) {
      firstName = randomElement(firstNames)
      lastName = randomElement(lastNames)
      key = `${firstName} ${lastName}`
      attempts++
    }
    usedNames.add(key)
    return { firstName, lastName }
  }
  
  // Generate 15 LIPs
  for (let i = 0; i < 15; i++) {
    const { firstName, lastName } = getUniqueName()
    users.push({
      id: `u_lip_${i + 1}`,
      name: `${firstName} ${lastName}`,
      email: `lip.${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@example.com`,
      role: 'LIP'
    })
  }
  
  // Generate 15 McKenzie Friends
  for (let i = 0; i < 15; i++) {
    const { firstName, lastName } = getUniqueName()
    users.push({
      id: `u_mf_${i + 1}`,
      name: `${firstName} ${lastName}`,
      email: `mf.${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@example.com`,
      role: 'McKenzieFriend'
    })
  }
  
  // Generate 15 Solicitors
  for (let i = 0; i < 15; i++) {
    const { firstName, lastName } = getUniqueName()
    users.push({
      id: `u_sol_${i + 1}`,
      name: `${firstName} ${lastName}`,
      email: `solicitor.${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@example.com`,
      role: 'Solicitor',
      firm: randomElement(firms),
      registrationNumber: `SOL-${String(i + 1).padStart(6, '0')}`
    })
  }
  
  // Generate 15 Barristers
  for (let i = 0; i < 15; i++) {
    const { firstName, lastName } = getUniqueName()
    users.push({
      id: `u_bar_${i + 1}`,
      name: `${firstName} ${lastName}`,
      email: `barrister.${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@example.com`,
      role: 'Barrister',
      firm: randomElement(chambers),
      registrationNumber: `BAR-${String(i + 1).padStart(6, '0')}`
    })
  }
  
  return users
}

function generateCases(userIds: {
  lips: string[],
  mckenzieFriends: string[],
  solicitors: string[],
  barristers: string[]
}): FamilyCase[] {
  const cases: FamilyCase[] = []
  const startDate = new Date(2023, 0, 1)
  const endDate = new Date()
  
  // Generate 55 cases
  for (let i = 0; i < 55; i++) {
    const caseType = randomCaseType()
    const status = randomStatus()
    const year = 2023 + Math.floor(Math.random() * 2)
    const caseNum = String(i + 1).padStart(6, '0')
    const caseId = `FC-${year.toString().slice(2)}-${caseNum}`
    
    const startedAt = randomDate(startDate, endDate)
    const currentStage = randomElement(stages)
    
    // Determine case ownership and assignments
    const owner = randomElement(userIds.lips)
    const members: any[] = [{ userId: owner, role: 'Owner' }]
    
    // 30% of cases have no additional members (unassigned)
    // 70% have professionals assigned
    if (Math.random() > 0.3) {
      // Some cases have McKenzie Friends
      if (Math.random() > 0.4) {
        const mf = randomElement(userIds.mckenzieFriends)
        members.push({ userId: mf, role: 'McKenzieFriend', invitedAt: startedAt, invitedBy: owner })
      }
      
      // Some cases have Solicitors
      if (Math.random() > 0.5) {
        const sol = randomElement(userIds.solicitors)
        members.push({ userId: sol, role: 'Solicitor', invitedAt: startedAt, invitedBy: owner })
      }
      
      // Some cases have Barristers
      if (Math.random() > 0.6) {
        const bar = randomElement(userIds.barristers)
        members.push({ userId: bar, role: 'Barrister', invitedAt: startedAt, invitedBy: owner })
      }
    }
    
    // Generate parties
    const parties: Party[] = []
    const applicantFirstName = randomElement(firstNames)
    const applicantLastName = randomElement(lastNames)
    parties.push({
      id: generateId('PTY'),
      role: 'Applicant',
      firstName: applicantFirstName,
      lastName: applicantLastName,
      dateOfBirth: randomDate(new Date(1970, 0, 1), new Date(2000, 0, 1)),
      address: `${Math.floor(Math.random()*200+1)} ${randomElement(['Main St','High St','Park Ave','Station Rd','Church St'])}, London`,
      contactEmail: `applicant.${applicantFirstName.toLowerCase()}.${applicantLastName.toLowerCase()}@example.com`,
      contactPhone: `07${Math.floor(Math.random()*900000000+100000000)}`
    })
    
    if (Math.random() > 0.2) {
      const respondentFirstName = randomElement(firstNames)
      const respondentLastName = randomElement(lastNames)
      parties.push({
        id: generateId('PTY'),
        role: 'Respondent',
        firstName: respondentFirstName,
        lastName: respondentLastName,
        dateOfBirth: randomDate(new Date(1970, 0, 1), new Date(2000, 0, 1)),
        address: `${Math.floor(Math.random()*200+1)} ${randomElement(['Main St','High St','Park Ave','Station Rd','Church St'])}, London`,
        contactEmail: `respondent.${respondentFirstName.toLowerCase()}.${respondentLastName.toLowerCase()}@example.com`,
        contactPhone: `07${Math.floor(Math.random()*900000000+100000000)}`
      })
    }
    
    if (caseType === 'Public Law (Care Proceedings)' || caseType === 'Private Law (Child Arrangements)') {
      const numChildren = Math.floor(Math.random() * 3) + 1
      for (let j = 0; j < numChildren; j++) {
        const childFirstName = randomElement(firstNames)
        parties.push({
          id: generateId('PTY'),
          role: 'Child',
          firstName: childFirstName,
          lastName: applicantLastName,
          dateOfBirth: randomDate(new Date(2010, 0, 1), new Date(2022, 0, 1)),
          address: `${Math.floor(Math.random()*200+1)} ${randomElement(['Main St','High St','Park Ave','Station Rd','Church St'])}, London`,
          contactEmail: `child.${childFirstName.toLowerCase()}.${applicantLastName.toLowerCase()}@example.com`,
          contactPhone: `07${Math.floor(Math.random()*900000000+100000000)}`
        })
      }
    }
    
    // Generate hearings
    const hearingTypes: HearingType[] = ['Case Management', 'Directions', 'Fact-Finding', 'Final', 'Other']
    const hearings: Hearing[] = []
    const numHearings = Math.floor(Math.random() * 4) + 1
    for (let j = 0; j < numHearings; j++) {
      const hearingDate = randomDate(new Date(startedAt), endDate)
      hearings.push({
        id: generateId('HRG'),
        type: randomElement(hearingTypes),
        date: hearingDate,
        time: `${9 + Math.floor(Math.random() * 8)}:${Math.random() > 0.5 ? '00' : '30'}`,
        location: `Courtroom ${Math.floor(Math.random() * 10) + 1}`,
        judge: randomElement(judges),
        notes: j === 0 ? 'Initial hearing scheduled' : undefined
      })
    }
    
    // Generate documents
    const docTypes: DocumentRecord['type'][] = ['Application', 'Statement', 'Medical', 'Expert Report', 'Bundle', 'Order', 'Other']
    const documents: DocumentRecord[] = []
    const numDocs = Math.floor(Math.random() * 5)
    for (let j = 0; j < numDocs; j++) {
      documents.push({
        id: generateId('DOC'),
        title: randomElement(['Application Form', 'Witness Statement', 'Medical Report', 'Expert Report', 'Bundle', 'Order']),
        type: randomElement(docTypes),
        uploadedAt: randomDate(new Date(startedAt), endDate),
        url: '#',
        notes: undefined
      })
    }
    
    // Generate orders
    const orderTypes: OrderType[] = ['Child Arrangements Order', 'Care Order', 'Supervision Order', 'Non-Molestation Order', 'Prohibited Steps Order', 'Specific Issue Order', 'Financial Remedies Order', 'Other']
    const orders: OrderRecord[] = []
    if (status !== 'Open' && Math.random() > 0.5) {
      orders.push({
        id: generateId('ORD'),
        type: randomElement(orderTypes),
        dateMade: randomDate(new Date(startedAt), endDate),
        summary: 'Order made by the court',
        expiresOn: undefined,
        documentUrl: undefined
      })
    }
    
    cases.push({
      id: caseId,
      title: randomElement(caseTitles),
      court: randomCourtType(),
      caseType,
      status,
      startedAt,
      allocatedJudge: randomElement(judges),
      childrenInvolved: parties.filter(p => p.role === 'Child').length || undefined,
      parties,
      hearings,
      orders,
      documents,
      notes: [{
        id: generateId('NOTE'),
        createdAt: startedAt,
        author: 'System',
        text: 'Case created and allocated.'
      }],
      members,
      currentStage,
      lastUpdatedAt: new Date().toISOString()
    })
  }
  
  return cases
}

export function seedIfEmpty() {
  const snap = loadSnapshot()
  const existingUsers = listUsers()
  
  // Only seed if no cases exist
  if (snap.cases.length > 0) return
  
  // Generate users if none exist
  if (existingUsers.length === 0) {
    const users = generateUsers()
    saveUsers(users)
  } else {
    // If users exist, add more if needed
    const users = generateUsers()
    const existingIds = new Set(existingUsers.map(u => u.id))
    const newUsers = users.filter(u => !existingIds.has(u.id))
    if (newUsers.length > 0) {
      saveUsers([...existingUsers, ...newUsers])
    }
  }
  
  // Get all user IDs by role
  const allUsers = listUsers()
  const userIds = {
    lips: allUsers.filter(u => u.role === 'LIP').map(u => u.id),
    mckenzieFriends: allUsers.filter(u => u.role === 'McKenzieFriend').map(u => u.id),
    solicitors: allUsers.filter(u => u.role === 'Solicitor').map(u => u.id),
    barristers: allUsers.filter(u => u.role === 'Barrister').map(u => u.id)
  }
  
  // Generate cases
  const cases = generateCases(userIds)
  
  // Save all cases
  cases.forEach(c => upsertCase(c))
}
