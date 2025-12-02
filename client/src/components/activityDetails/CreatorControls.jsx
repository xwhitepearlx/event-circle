const CreatorControls = ({ activity, onEdit, onFinalize, onCancel, onDelete }) => {
  if (!activity) return null;

  return (
    <div className="card p-3 mt-3 mb-4 shadow-sm border-primary">
      <h5>Creator Controls</h5>

      <div className="d-flex gap-3 mt-2">
        {/* Edit Activity Button */}
        {!activity.isCancelled && (
          <button className="btn btn-warning" onClick={onEdit}>
            Edit Activity
          </button>
        )}

        {/* Finalize Button */}
        {!activity.isCancelled &&
          !activity.isFinalized &&
          activity.votingDate && (
            <button className="btn btn-success" onClick={onFinalize}>
              Finalize Event
            </button>
          )}

        {/* Cancel Button */}
        {!activity.isCancelled && (
          <button className="btn btn-outline-danger" onClick={onCancel}>
            Cancel Event
          </button>
        )}

        {/* Delete Button */}
        {(activity.isCancelled || activity.participants.length === 1) && (
          <button className="btn btn-danger" onClick={onDelete}>
            Delete Activity
          </button>
        )}

        {/* Status Indicators */}
        {activity.isFinalized && !activity.isCancelled && (
          <span className="badge bg-success align-self-center">Finalized</span>
        )}

        {activity.isCancelled && (
          <span className="badge bg-danger align-self-center">Cancelled</span>
        )}
      </div>
    </div>
  );
};

export default CreatorControls;
