import StatusBadge from "./StatusBadge";

const ParticipantItem = ({ participant, activity }) => {
  const user = participant.user;
  const isCreator = String(activity.createdBy?._id) === String(user?._id);

  return (
    <li className="list-group-item">
      <strong>
        {user?.name || "Unknown User"}

        {/* Creator Badge */}
        {isCreator && (
          <span className="badge bg-dark text-white ms-2">Creator</span>
        )}

        {/* Not Participating Badge */}
        {participant.status === "not_participating" && (
          <span className="badge bg-secondary ms-2">Not Participating</span>
        )}
      </strong>

      {/* Status Badge (only if participating) */}
      {participant.status !== "not_participating" && (
        <StatusBadge status={participant.status} />
      )}

      {/* Availability */}
      <div className="mt-1 small">
        <strong>Availability:</strong>{" "}
        {participant.availableTimes?.length > 0
          ? participant.availableTimes.join(", ")
          : "Available Anytime"}
      </div>
    </li>
  );
};

export default ParticipantItem;
