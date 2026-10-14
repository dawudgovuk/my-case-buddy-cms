import React, { useState, useEffect } from 'react';
import { Modal, Button, Badge, ProgressBar, Alert, Form } from 'react-bootstrap';
import { FaDatabase, FaCheckCircle, FaExclamationTriangle, FaSync, FaServer } from 'react-icons/fa';
import {
  getStrapiApiUrl,
  checkStrapiHealth,
  type StrapiHealthResult,
} from '../../services/strapi/strapiConfig';
import {
  migrateLocalStorageToStrapi,
  type MigrationProgress,
  type MigrationResult,
} from '../../services/strapi/migrationService';
import { useCasesStore } from '../../store/casesStore';

export interface StrapiSyncModalProps {
  show: boolean;
  onHide: () => void;
}

export const StrapiSyncModal: React.FC<StrapiSyncModalProps> = ({ show, onHide }) => {
  const { cases, isStrapiMode, setStrapiMode, syncWithStrapi, isLoadingStrapi } = useCasesStore();
  const [health, setHealth] = useState<StrapiHealthResult | null>(null);
  const [isChecking, setIsChecking] = useState<boolean>(false);
  const [migrationProgress, setMigrationProgress] = useState<MigrationProgress | null>(null);
  const [migrationResult, setMigrationResult] = useState<MigrationResult | null>(null);
  const [isMigrating, setIsMigrating] = useState<boolean>(false);

  const testConnection = async () => {
    setIsChecking(true);
    const result = await checkStrapiHealth();
    setHealth(result);
    setIsChecking(false);
  };

  useEffect(() => {
    if (show) {
      void testConnection();
    }
  }, [show]);

  const handleStartMigration = async () => {
    setIsMigrating(true);
    setMigrationResult(null);
    try {
      const result = await migrateLocalStorageToStrapi((progress) => {
        setMigrationProgress(progress);
      });
      setMigrationResult(result);
      if (result.success && isStrapiMode) {
        await syncWithStrapi();
      }
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : String(err);
      setMigrationResult({
        success: false,
        totalMigrated: 0,
        failedCount: cases.length,
        errors: [errMsg],
      });
    } finally {
      setIsMigrating(false);
    }
  };

  const progressPercent = migrationProgress && migrationProgress.total > 0
    ? Math.round((migrationProgress.current / migrationProgress.total) * 100)
    : 0;

  return (
    <Modal show={show} onHide={onHide} centered size="lg">
      <Modal.Header closeButton className="border-bottom pb-3">
        <Modal.Title className="d-flex align-items-center gap-2 fs-5">
          <FaDatabase className="text-primary" />
          <span>Strapi CMS & Backend Synchronization</span>
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="pt-3">
        {/* Backend Topology Summary */}
        <div className="bg-light p-3 rounded mb-3 border">
          <div className="d-flex justify-content-between align-items-center mb-2">
            <span className="fw-semibold text-secondary">
              <FaServer className="me-2" />
              API Server URL:
            </span>
            <code className="bg-white px-2 py-1 rounded border">{getStrapiApiUrl()}</code>
          </div>
          <div className="d-flex justify-content-between align-items-center mb-2">
            <span className="fw-semibold text-secondary">PostgreSQL Database:</span>
            <Badge bg="info" className="text-dark">Neon Serverless (Postgres 16)</Badge>
          </div>
          <div className="d-flex justify-content-between align-items-center">
            <span className="fw-semibold text-secondary">Auth & Subscriptions:</span>
            <Badge bg="dark">Clerk Webhook Sync</Badge>
          </div>
        </div>

        {/* Server Connection Status */}
        <div className="d-flex align-items-center justify-content-between p-3 border rounded mb-3">
          <div>
            <div className="fw-bold mb-1">Strapi Server Health</div>
            {health ? (
              health.ok ? (
                <div className="text-success small d-flex align-items-center gap-1">
                  <FaCheckCircle /> {health.message}
                </div>
              ) : (
                <div className="text-danger small d-flex align-items-center gap-1">
                  <FaExclamationTriangle /> {health.message}
                </div>
              )
            ) : (
              <div className="text-muted small">Checking connection...</div>
            )}
          </div>
          <Button
            variant="outline-primary"
            size="sm"
            onClick={testConnection}
            disabled={isChecking}
          >
            <FaSync className={isChecking ? 'fa-spin me-1' : 'me-1'} />
            {isChecking ? 'Pinging...' : 'Test Connection'}
          </Button>
        </div>

        {/* Backend Mode Switch */}
        <div className="p-3 border rounded mb-3">
          <Form.Check
            type="switch"
            id="strapi-backend-toggle"
            label={
              <div>
                <span className="fw-bold">Enable Live Strapi Mode</span>
                <div className="text-muted small">
                  When enabled, changes persist directly to Strapi. LocalStorage is maintained as an offline cache.
                </div>
              </div>
            }
            checked={isStrapiMode}
            onChange={(e) => setStrapiMode(e.target.checked)}
          />
        </div>

        {/* LocalStorage to Strapi Migration Section */}
        <div className="p-3 border rounded bg-white">
          <div className="d-flex justify-content-between align-items-center mb-2">
            <div>
              <div className="fw-bold">Migrate Local Cases to Strapi</div>
              <div className="text-muted small">
                Transfer all {cases.length} local cases and their court hearings, orders, and parties to Strapi.
              </div>
            </div>
            <Button
              variant="success"
              size="sm"
              onClick={handleStartMigration}
              disabled={isMigrating || isLoadingStrapi}
            >
              <FaSync className={isMigrating ? 'fa-spin me-1' : 'me-1'} />
              {isMigrating ? 'Migrating...' : 'Start Migration'}
            </Button>
          </div>

          {migrationProgress && isMigrating && (
            <div className="mt-3">
              <div className="d-flex justify-content-between small text-muted mb-1">
                <span>Migrating: {migrationProgress.currentCaseTitle}</span>
                <span>{migrationProgress.current} / {migrationProgress.total} ({progressPercent}%)</span>
              </div>
              <ProgressBar now={progressPercent} animated variant="success" />
            </div>
          )}

          {migrationResult && (
            <Alert variant={migrationResult.success ? 'success' : 'warning'} className="mt-3 mb-0 py-2">
              <div className="fw-bold">
                {migrationResult.success ? 'Migration Successful!' : 'Migration Finished with Warnings'}
              </div>
              <div className="small">
                Successfully migrated {migrationResult.totalMigrated} cases.
                {migrationResult.failedCount > 0 && ` (${migrationResult.failedCount} items had issues)`}
              </div>
              {migrationResult.errors.length > 0 && (
                <ul className="mb-0 mt-2 small ps-3">
                  {migrationResult.errors.slice(0, 3).map((err, idx) => (
                    <li key={idx}>{err}</li>
                  ))}
                </ul>
              )}
            </Alert>
          )}
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>Close</Button>
      </Modal.Footer>
    </Modal>
  );
};
