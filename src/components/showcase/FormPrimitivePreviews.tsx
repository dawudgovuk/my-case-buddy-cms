import { useState } from 'react'
import { FaEnvelope } from 'react-icons/fa'
import AuthHero from '../auth/AuthHero'
import IconInputField from '../auth/IconInputField'
import PasswordField from '../auth/PasswordField'
import DirectoryFilterBar from '../directory/DirectoryFilterBar'
import DirectoryEmptyState from '../directory/DirectoryEmptyState'
import NoMatchingCasesCard from '../dashboard/NoMatchingCasesCard'
import type { DirectoryRoleFilter } from '../../utils/directoryUtils'

type FeedbackProps = { onFeedback: (msg: string) => void }

export function AuthFieldsPreview() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  return (
    <div className="auth-card overflow-hidden" style={{ maxWidth: 480 }}>
      <AuthHero title="Welcome back" subtitle="Sign in to manage your cases and hearings." />
      <div className="p-4">
        <IconInputField
          label="Email Address"
          icon={<FaEnvelope />}
          type="email"
          value={email}
          onChange={setEmail}
          placeholder="name@example.com"
        />
        <PasswordField
          value={password}
          onChange={setPassword}
          showPassword={showPassword}
          onToggleShow={() => setShowPassword((v) => !v)}
          autoComplete="new-password"
          showLengthHint
          labelToggle
        />
      </div>
    </div>
  )
}

export function DirectoryFilterBarPreview() {
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState<DirectoryRoleFilter>('all')
  return (
    <DirectoryFilterBar
      searchTerm={searchTerm}
      onSearchChange={setSearchTerm}
      searchPlaceholder="Search by name, firm or specialism"
      roleFilter={roleFilter}
      onRoleChange={setRoleFilter}
      counts={{ all: 9, mckenzie: 4, solicitors: 3, barristers: 2 }}
    />
  )
}

export function EmptyStatesPreview({ onFeedback }: FeedbackProps) {
  return (
    <div className="d-flex flex-column gap-3">
      <NoMatchingCasesCard onClearFilters={() => onFeedback('Case filters cleared')} />
      <DirectoryEmptyState onClearFilters={() => onFeedback('Directory filters cleared')} />
    </div>
  )
}
