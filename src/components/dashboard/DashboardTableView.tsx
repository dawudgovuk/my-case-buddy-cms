import { Table } from "react-bootstrap";
import { format } from "date-fns";
import type { FamilyCase } from "../../types/domain";
import { getStagesForCase, getCurrentStageIndex } from "../../utils/caseStages";
import { useCaseConfigStore } from "../../store/caseConfigStore";
import {
  FaEye,
  FaEdit,
  FaCalendarAlt,
  FaClock,
  FaUsers,
  FaChild,
  FaGavel,
  FaHandshake,
} from "react-icons/fa";
import { useTranslation } from "../../hooks/useTranslation";

export interface DashboardTableViewProps {
  cases: FamilyCase[];
  onViewCase: (caseId: string) => void;
  onEditCase?: (caseId: string) => void;
  onTogglePeerSupport: (caseId: string, currentStatus: boolean) => void;
}

function formatHearingDate(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    if (!isNaN(d.getTime())) {
      return format(d, "dd MMM yyyy");
    }
  } catch {
    // fallback
  }
  return dateStr;
}

export default function DashboardTableView({
  cases,
  onViewCase,
  onEditCase,
  onTogglePeerSupport,
}: DashboardTableViewProps) {
  const caseStagesMap = useCaseConfigStore((state) => state.caseStagesMap);
  const { t } = useTranslation();

  if (cases.length === 0) {
    return (
      <div className="premium-card p-5 text-center text-muted">
        {t("dashboard.noCasesMatch")}
      </div>
    );
  }

  return (
    <div className="premium-card border-0 shadow-sm overflow-hidden w-100">
      <Table
        hover
        className="align-middle mb-0 custom-dashboard-table w-100"
        style={{ tableLayout: "fixed" }}
      >
        <colgroup>
          <col style={{ width: "21%" }} />
          <col style={{ width: "17%" }} />
          <col style={{ width: "14%" }} />
          <col style={{ width: "15%" }} />
          <col style={{ width: "7%" }} />
          <col style={{ width: "9%" }} />
          <col style={{ width: "17%" }} />
        </colgroup>
        <thead>
          <tr>
            <th className="py-2.5 px-2">{t("dashboard.colTitleParties")}</th>
            <th className="py-2.5 px-2">{t("dashboard.colTypeCourt")}</th>
            <th className="py-2.5 px-2">{t("dashboard.colStageProgress")}</th>
            <th className="py-2.5 px-2">{t("dashboard.colNextHearing")}</th>
            <th className="py-2.5 px-2 text-center">
              {t("dashboard.colStatus")}
            </th>
            <th className="py-2.5 px-2 text-center">
              {t("dashboard.colPeerSupport")}
            </th>
            <th className="py-2.5 px-2 text-end pe-3">
              {t("dashboard.colAction")}
            </th>
          </tr>
        </thead>
        <tbody>
          {cases.map((c) => {
            const stages = getStagesForCase(c, caseStagesMap);
            const currentStageIndex = getCurrentStageIndex(c, stages);
            const progressPercent = Math.min(
              100,
              Math.round(
                ((currentStageIndex + 1) / Math.max(stages.length, 1)) * 100,
              ),
            );
            const nextHearing =
              c.hearings && c.hearings.length > 0 ? c.hearings[0] : null;
            const isSeeking = Boolean(c.seekingPeerSupport);
            const partiesCount =
              c.parties?.filter((p) => p.role !== "Child").length || 0;
            const childrenCount =
              c.parties?.filter((p) => p.role === "Child").length || 0;

            const statusBadgeClass =
              c.status === "Open"
                ? "badge-soft-emerald"
                : c.status === "Stayed"
                  ? "badge-soft-amber"
                  : "badge-soft-slate";

            return (
              <tr key={c.id}>
                {/* Case Title & Parties */}
                <td className="py-2.5 px-2">
                  <div
                    className="fw-bold text-dark text-truncate cursor-pointer hover-text-primary mb-1"
                    onClick={() => onViewCase(c.id)}
                    title={c.title}
                    style={{ fontSize: "0.88rem" }}
                  >
                    {c.title}
                  </div>
                  <div className="d-flex align-items-center gap-1 text-nowrap">
                    {partiesCount > 0 && (
                      <span
                        title={`${partiesCount} ${partiesCount === 1 ? t("dashboard.partySingular") : t("dashboard.partyPlural")}`}
                        className="badge bg-primary-subtle text-primary border border-primary-subtle px-1.5 py-0.5 rounded-pill d-inline-flex align-items-center gap-1"
                        style={{ fontSize: "0.68rem", fontWeight: 600 }}
                      >
                        <FaUsers size={9} />
                        <span>
                          {partiesCount}{" "}
                          {partiesCount === 1
                            ? t("dashboard.partySingular")
                            : t("dashboard.partyPlural")}
                        </span>
                      </span>
                    )}
                    {childrenCount > 0 && (
                      <span
                        title={`${childrenCount} ${childrenCount === 1 ? t("dashboard.childSingular") : t("dashboard.childPlural")}`}
                        className="badge bg-success-subtle text-success border border-success-subtle px-1.5 py-0.5 rounded-pill d-inline-flex align-items-center gap-1"
                        style={{ fontSize: "0.68rem", fontWeight: 600 }}
                      >
                        <FaChild size={9} />
                        <span>
                          {childrenCount}{" "}
                          {childrenCount === 1
                            ? t("dashboard.childSingular")
                            : t("dashboard.childPlural")}
                        </span>
                      </span>
                    )}
                  </div>
                </td>

                {/* Type & Court */}
                <td className="py-2.5 px-2">
                  <div
                    className="text-dark small fw-semibold text-truncate"
                    title={c.caseType}
                  >
                    {c.caseType}
                  </div>
                  <div
                    className="text-muted small d-flex align-items-center gap-1 text-truncate"
                    title={c.court}
                    style={{ fontSize: "0.74rem" }}
                  >
                    <FaGavel
                      size={9}
                      className="text-secondary flex-shrink-0"
                    />
                    <span className="text-truncate">{c.court}</span>
                  </div>
                </td>

                {/* Stage Progress */}
                <td className="py-2.5 px-2">
                  <div className="d-flex justify-content-between align-items-center small mb-1">
                    <span
                      className="text-truncate text-secondary fw-medium"
                      style={{ fontSize: "0.74rem" }}
                      title={stages[currentStageIndex]?.name || "In Progress"}
                    >
                      {stages[currentStageIndex]?.name || "In Progress"}
                    </span>
                    <span
                      className="fw-bold text-dark ms-1"
                      style={{ fontSize: "0.72rem" }}
                    >
                      {progressPercent}%
                    </span>
                  </div>
                  <div
                    className="case-mini-progress mb-1"
                    style={{ width: "100%", height: 5 }}
                  >
                    <div
                      className="case-mini-progress-bar"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                  <div
                    className="text-muted text-nowrap"
                    style={{ fontSize: "0.68rem" }}
                  >
                    {t("dashboard.stageOf", {
                      current: currentStageIndex + 1,
                      total: stages.length,
                    })}
                  </div>
                </td>

                {/* Next Hearing */}
                <td className="py-2.5 px-2">
                  {nextHearing ? (
                    <div
                      className="p-1.5 px-2 rounded-2 border-start border-3 border-warning small"
                      style={{
                        backgroundColor: "#fffdf5",
                        border: "1px solid #fef3c7",
                        borderLeft: "3px solid #f59e0b",
                      }}
                    >
                      <div
                        className="fw-bold text-dark text-truncate"
                        style={{ fontSize: "0.76rem" }}
                        title={nextHearing.type}
                      >
                        {nextHearing.type}
                      </div>
                      <div
                        className="d-flex align-items-center gap-1 text-secondary text-nowrap"
                        style={{ fontSize: "0.7rem" }}
                      >
                        <FaCalendarAlt
                          size={9}
                          className="text-warning flex-shrink-0"
                        />
                        <span>{formatHearingDate(nextHearing.date)}</span>
                        {nextHearing.time && (
                          <>
                            <span className="opacity-40">•</span>
                            <FaClock
                              size={9}
                              className="text-muted flex-shrink-0"
                            />
                            <span>{nextHearing.time}</span>
                          </>
                        )}
                      </div>
                    </div>
                  ) : (
                    <span
                      className="badge bg-light text-secondary border px-2 py-1 rounded-pill d-inline-flex align-items-center gap-1 text-nowrap"
                      style={{ fontSize: "0.72rem", fontWeight: 500 }}
                    >
                      <FaCalendarAlt size={9} className="opacity-50" />
                      <span>{t("dashboard.awaitingListing")}</span>
                    </span>
                  )}
                </td>

                {/* Status */}
                <td className="py-2.5 px-2 text-center">
                  <span
                    className={`badge rounded-pill px-2 py-1 small fw-semibold text-nowrap ${statusBadgeClass}`}
                    style={{ fontSize: "0.72rem" }}
                  >
                    ● {c.status}
                  </span>
                </td>

                {/* Peer Support */}
                <td className="py-2.5 px-2 text-center">
                  <button
                    type="button"
                    className={`border shadow-none ${
                      isSeeking
                        ? "btn-table-peer-active"
                        : "btn-table-peer-inactive"
                    }`}
                    onClick={() => onTogglePeerSupport(c.id, isSeeking)}
                    title={
                      isSeeking
                        ? "Peer Support is currently active (Click to toggle)"
                        : "Request peer review assistance"
                    }
                  >
                    <FaHandshake size={11} />
                    <span>
                      {isSeeking
                        ? t("dashboard.peerActive")
                        : t("dashboard.peerRequest")}
                    </span>
                  </button>
                </td>

                {/* Action */}
                <td className="py-2.5 px-2 text-end pe-3">
                  <div className="d-inline-flex align-items-center justify-content-end gap-1.5 text-nowrap">
                    <button
                      type="button"
                      className="btn-table-view"
                      onClick={() => onViewCase(c.id)}
                      title="View Case Details"
                    >
                      <FaEye size={10} />
                      <span>{t("common.view")}</span>
                    </button>
                    {onEditCase && (
                      <button
                        type="button"
                        className="btn-table-edit"
                        onClick={() => onEditCase(c.id)}
                        title="Edit Case Details"
                        aria-label="Edit Case Details"
                      >
                        <FaEdit size={10} />
                        <span>{t("common.edit")}</span>
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </Table>
    </div>
  );
}
