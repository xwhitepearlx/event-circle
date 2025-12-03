const CreatorControls = ({
  activity,
  onEdit,
  onFinalize,
  onCancel,
  onDelete,
}) => {
  const canFinalize =
    !activity.isFinalized && !activity.isCancelled && !activity.isCompleted;

  const canEdit = !activity.isCancelled && !activity.isCompleted;

  const canCancel = !activity.isCancelled && !activity.isCompleted;

  const canDelete = () => {
    if (!activity) return false;

    // Check if creator is the only participant
    const isOnlyCreator =
      activity.participants.length === 1 &&
      String(activity.participants[0].user?._id) === String(userId);

    // Check if cancelled for 7+ days
    const isCancelledAndOneWeekPassed =
      activity.isCancelled &&
      activity.cancelledAt &&
      Date.now() - new Date(activity.cancelledAt).getTime() >=
        7 * 24 * 60 * 60 * 1000;

    return isOnlyCreator || isCancelledAndOneWeekPassed;
  };

  return (
    <div className="card p-3 shadow-sm mb-4">
      <h5>Creator Controls</h5>
      <div className="d-flex flex-wrap gap-2">
        {/* Edit Button */}
        {canEdit && (
          <button className="btn btn-outline-primary" onClick={onEdit}>
            Edit Event
          </button>
        )}

        {/* Finalize Button */}
        {canFinalize && (
          <button className="btn btn-success" onClick={onFinalize}>
            Finalize Event
          </button>
        )}

        {/* Cancel Button */}
        {canCancel && (
          <button className="btn btn-warning" onClick={onCancel}>
            Cancel Event
          </button>
        )}

        {/* Delete Button */}
        {canDelete && (
          <button className="btn btn-outline-danger" onClick={onDelete}>
            Delete Event
          </button>
        )}
      </div>
    </div>
  );
};

export default CreatorControls;
