import { Link } from "react-router-dom";
import StatusBadge from "../activityDetails/StatusBadge";

const ActivityItem = ({
  activity,
  userId,
  onDelete,
  canDelete,
  formatDate,
}) => {
  const isCreator = String(activity.createdBy?._id) === String(userId);

  // Find logged-in user's status
  const userEntry = activity.participants.find(
    (p) => String(p.user?._id) === String(userId)
  );

  const isParticipating = userEntry && userEntry.status !== "not_participating";

  return (
    <div className="col-md-6 mb-4">
      <div className="card shadow-sm h-100">
        <div className="card-body">
          {/* Title + Creator Badge */}
          <h4 className="card-title">
            <div className="d-flex justify-content-between align-items-start mb-2">
              <div>
                <h4 className="card-title mb-0">
                  {activity.eventTitle}
                  {isCreator && (
                    <span className="badge bg-dark text-white ms-2">
                      Creator
                    </span>
                  )}
                </h4>
              </div>
              {/* User Participation Badge */}
              {isParticipating && <StatusBadge status={userEntry.status} />}
            </div>
            
          </h4>

          {/* Event Date */}
          <p className="text-muted mb-1">
            <strong>Date:</strong> {formatDate(activity.eventDate)}
          </p>

          {/* Voting Deadline */}
          <p className="text-muted mb-1">
            <strong>Voting:</strong>{" "}
            {activity.votingDate
              ? formatDate(activity.votingDate)
              : activity.isFinalized
              ? "Finalized"
              : "No voting deadline"}
          </p>

          {/* Status Badges */}
          {activity.isCancelled && (
            <span className="badge bg-danger me-2">Cancelled</span>
          )}

          {activity.isCompleted && (
            <span className="badge bg-info me-2">Completed</span>
          )}

          {activity.isFinalized &&
            !activity.isCancelled &&
            !activity.isCompleted && (
              <span className="badge bg-success me-2">Finalized</span>
            )}

          {/* Buttons */}
          <div className="d-flex justify-content-between align-items-center mt-3">
            <Link
              to={`/activities/${activity._id}`}
              className="btn btn-primary"
            >
              View Details
            </Link>

            {/* Delete only if allowed */}
            {isCreator && canDelete && (
              <button
                className="btn btn-outline-danger"
                onClick={() => onDelete(activity._id)}
              >
                Delete
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActivityItem;
