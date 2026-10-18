import { Container, Row, Col, Alert } from 'react-bootstrap'
import { useTranslation } from '../hooks/useTranslation'
import { usePeerDirectory } from '../hooks/usePeerDirectory'
import { FaHandshake } from 'react-icons/fa'
import PeerSupporterCard from '../components/directory/PeerSupporterCard'
import PeerSupportRequestModal from '../components/directory/PeerSupportRequestModal'
import DirectoryHeader from '../components/directory/DirectoryHeader'
import DirectoryFilterBar from '../components/directory/DirectoryFilterBar'
import DirectoryEmptyState from '../components/directory/DirectoryEmptyState'

export default function PeerDirectory() {
  const { t } = useTranslation()
  const {
    user,
    roleFilter,
    setRoleFilter,
    specialismFilter,
    setSpecialismFilter,
    searchTerm,
    setSearchTerm,
    requestTargetUser,
    successMessage,
    dismissSuccessMessage,
    isLoadingPros,
    counts,
    filtered,
    targetProfessional,
    myCases,
    refreshProfessionals,
    handleOpenRequestModal,
    handleCloseRequestModal,
    handleSendRequest,
    handleClearFilters,
  } = usePeerDirectory()

  return (
    <Container fluid className="px-lg-4 py-3" style={{ maxWidth: '1360px', margin: '0 auto' }}>
      {/* 1. Executive Hero Header */}
      <DirectoryHeader
        title={t('peerDirectory.title')}
        subtitle={t('peerDirectory.subtitle')}
        counts={counts}
        isLoading={isLoadingPros}
        onRefresh={refreshProfessionals}
      />

      {/* Success Alert Banner */}
      {successMessage && (
        <Alert
          variant="success"
          dismissible
          onClose={dismissSuccessMessage}
          className="mb-4 shadow-sm border-0 d-flex align-items-center gap-2"
        >
          <FaHandshake size={18} className="text-success flex-shrink-0" />
          <span>{successMessage}</span>
        </Alert>
      )}

      {/* 2. Elevated Search & Filter Bar */}
      <DirectoryFilterBar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder={t('peerDirectory.searchPlaceholder')}
        roleFilter={roleFilter}
        onRoleChange={setRoleFilter}
        specialismFilter={specialismFilter}
        onSpecialismChange={setSpecialismFilter}
        counts={counts}
      />

      {/* 3. Grid of Cards or Empty State */}
      {filtered.length === 0 ? (
        <DirectoryEmptyState onClearFilters={handleClearFilters} />
      ) : (
        <Row className="g-4">
          {filtered.map((pro) => (
            <Col key={pro.id} xs={12} md={6} lg={4} className="d-flex">
              <PeerSupporterCard
                professional={pro}
                onRequestSupport={user ? handleOpenRequestModal : undefined}
                showRequestButton={Boolean(user && user.id !== pro.id)}
              />
            </Col>
          ))}
        </Row>
      )}

      {/* 4. Peer Support Request Modal */}
      <PeerSupportRequestModal
        show={Boolean(requestTargetUser)}
        targetUserId={requestTargetUser}
        targetProfessional={targetProfessional}
        cases={myCases}
        onSendRequest={handleSendRequest}
        onCancel={handleCloseRequestModal}
      />
    </Container>
  )
}
