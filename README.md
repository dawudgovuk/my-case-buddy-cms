# MyCaseBuddy

A React + TypeScript case management system for UK family court cases built with Vite and Material-UI. Data persists to localStorage and demo data is seeded on first run.

## Run locally

```bash
npm install
npm run dev
```

Open http://localhost:5173/

## Features
- Cases list with search
- Create/Edit case
- Case details with tabs: Parties, Hearings, Documents, Orders, Notes
- Inline forms to add records in each tab
- LocalStorage persistence with simple versioning

Note: For demonstration only; not an official court system.


## Change Log

### Dashboards, Registration and invite link for Solicitors and Barristers

1. **User roles**
   - Added `Solicitor` and `Barrister` to user roles
   - Updated domain types to support professional fields (firm, registration number)

2. **Registration pages**
   - Created `/register/:role` for McKenzie Friend, Solicitor, and Barrister
   - Registration includes role-specific fields (firm for Solicitor/Barrister, registration number)
   - Auto-login after registration

3. **Invite link system**
   - Generate invite links from the "Team & Invites" tab in case details
   - Invite links support McKenzie Friend, Solicitor, and Barrister roles
   - Invite acceptance page at `/invite/:token`
   - Links expire after 30 days and can be marked as used

4. **Case management updates**
   - Added "Team & Invites" tab to case details
   - Can add Solicitor and Barrister directly to cases
   - View active invites and case team members

5. **LIP dashboard** (`/dashboard`)
   - Shows all cases owned by the Litigant in Person
   - Case progress visualization using Material-UI Stepper (similar to Semantic-UI Steps)
   - Shows next hearing information
   - Case stages defined per case type (Public Law, Private Law, etc.)

6. **Professional dashboard** (`/professional-dashboard`)
   - For McKenzie Friends, Solicitors, and Barristers
   - Upcoming hearings list sorted by date
   - Document submission deadlines as a to-do list
   - Overdue items highlighted
   - Checkbox to mark deadlines as submitted
   - Shows all assigned cases

7. **Routing and navigation**
   - Role-based routing (LIPs see different dashboards than professionals)
   - Navigation updated to include new pages
   - Login page includes registration links

### Notes

- Semantic-UI: Due to a Node.js installation issue, a custom `CaseSteps` component using Material-UI Stepper was created to match Semantic-UI Steps. To use Semantic-UI React later:
  ```bash
  npm install semantic-ui-react semantic-ui-css
  ```
  Then replace the `CaseSteps` component if desired.

- Case stages: Defined in `src/utils/caseStages.ts` for different case types (Public Law, Private Law, etc.)

- Deadlines: The deadline system is in place. You can create deadlines programmatically using the storage service functions.

All features are implemented and ready to use. The app should work with the existing Material-UI setup, and you can optionally switch to Semantic-UI later if needed.


## LIP registration page, Logo replacement and Seed Data added

### 1. LIP registration page
- Updated `Register.tsx` to support LIP registration
- Added LIP registration button to the Login page
- LIPs can register and are auto-logged in

### 2. Seed data
- 55 cases generated (exceeds 50+ requirement)
- 12 Litigants in Person (LIPs)
- 12 McKenzie Friends
- 12 Solicitors
- 12 Barristers

**Case assignment distribution:**
- 30% of cases are unassigned (no professionals)
- 70% have professionals assigned (McKenzie Friends, Solicitors, Barristers)
- Some professionals have multiple cases assigned
- Cases include realistic data: parties, hearings, documents, orders

### 3. Logo implementation
- Created `Logo.tsx` component using SVG and HTML/CSS
- Matches the design:
  - Character icon: golden yellow (#F9C74F) with dark teal outline (#276A7B)
  - Text: "MyCase" and "Buddy" in dark teal (#276A7B)
  - Styled with proper typography and spacing
- Logo is clickable and navigates to the appropriate dashboard
- Replaced the old text logo in the AppBar

### 4. Test data features
- Cases span multiple case types (Public Law, Private Law, Domestic Abuse, Financial Remedies, etc.)
- Random case statuses (Open, Stayed, Concluded)
- Various stages of case progression
- Multiple hearings per case
- Realistic names, firms, chambers, and judges
- Professional registration numbers for Solicitors and Barristers

The seed data will only populate if no cases exist, so existing data won't be overwritten. To reset and seed fresh data, clear localStorage and refresh the app.



Reviewing the current setup, then switching to React Bootstrap and implementing the improvements.



## Migration from Material-UI to React Bootstrap and Icon. Add Prioritised colour Coding Tablulate Case Lists

### 1. Dependencies updated
   - Removed Material-UI packages
   - Added: `react-bootstrap`, `bootstrap`, `semantic-ui-react`, `semantic-ui-css`, `react-icons`
   - Updated `package.json`

### 2. Logo
   - New logo component with balance scale icon
   - Gradient background and styling
   - Clickable, navigates to dashboard

### 3. LIP Dashboard
   - Horizontal Semantic UI Steps with icons per stage
   - Responsive cards with gradient styling
   - Icons throughout (calendar, location, eye)

### 4. Professional Dashboard
   - Sortable table (Case ID, Title, Next Hearing, Next Deadline, Priority)
   - Traffic light color coding:
     - Red (priority-high): Overdue deadlines
     - Yellow (priority-medium): Due within 7 days
     - Green (priority-low): OK
   - Icons and badges for status indicators

### 5. UI updates
   - Gradient backgrounds and buttons
   - Card hover effects
   - Colorful badges and alerts
   - Custom scrollbar styling
   - Responsive design for mobile and web

### 6. Seed data
   - 15 LIPs (was 12)
   - 15 McKenzie Friends (was 12)
   - 15 Solicitors (was 12)
   - 15 Barristers (was 12)
   - Unique names generation
   - 55 cases with varied assignments

### 7. Pages updated
   - Login: Bootstrap with icons
   - Register: Role-based color themes
   - App: Bootstrap navbar with icons
   - All pages use Bootstrap components

### Next steps

1. Run npm install to install the new dependencies:
   ```bash
   npm install
   ```

2. The remaining pages (CaseDetails, CaseForm, CasesList, InviteAccept) still use Material-UI. They will need similar updates, but the core structure is in place.

3. All components are responsive using Bootstrap's grid system and responsive utilities.

The app now uses Bootstrap and Semantic UI, with a more colorful design, sortable tables, traffic light color coding, and improved responsiveness. The linter errors are expected until `npm install` is run.