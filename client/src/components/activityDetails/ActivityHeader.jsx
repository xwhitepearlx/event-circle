const ActivityHeader = ({ activity, userId, formatDate }) => {
  if (!activity) return null;

  const isCreator = String(activity.createdBy?._id) === String(userId);

  return (
    <div className="mb-4">
      {/* Title */}
      <h2 className="mb-2">
        {activity.eventTitle}

        {/* Creator Badge */}
        {isCreator && (
          <span className="badge bg-dark text-white ms-2">Creator</span>
        )}

        {/* Cancelled Badge */}
        {activity.isCancelled && (
          <span className="badge bg-danger ms-2">Cancelled</span>
        )}

        {/* Finalized Badge */}
        {!activity.isCancelled && activity.isFinalized && (
          <span className="badge bg-success ms-2">Finalized</span>
        )}
      </h2>

      {/* Basic Info */}
      <div className="text-muted small">
        <strong>Date:</strong> {formatDate(activity.eventDate)}
        {" • "}
        <strong>Voting Deadline:</strong>{" "}
        {activity.votingDate
          ? formatDate(activity.votingDate)
          : "No voting required"}
      </div>
    </div>
  );
};

export default ActivityHeader;
