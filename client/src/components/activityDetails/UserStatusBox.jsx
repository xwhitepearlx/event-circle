import StatusBadge from "./StatusBadge";

const UserStatusBox = ({ userEntry }) => {
  if (!userEntry) return null;

  const isNotParticipating = userEntry.status === "not_participating";

  return (
    <div className="mb-3 p-3 border rounded bg-light shadow-sm">
      <h5>Your Status</h5>

      {/* Status badge (if participating) */}
      {userEntry.status !== "not_participating" && (
        <StatusBadge status={userEntry.status} />
      )}

      {/* Not participating text */}
      {isNotParticipating && (
        <span className="text-muted ms-2">(You are not participating)</span>
      )}

      {/* Availability */}
      <div className="mt-1 small">
        <strong>Availability:</strong>{" "}
        {userEntry.availableTimes?.length > 0
          ? userEntry.availableTimes.join(", ")
          : "Available Anytime"}
      </div>
    </div>
  );
};

export default UserStatusBox;
