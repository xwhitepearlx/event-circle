const ActivityInfoCard = ({ activity, formatDate }) => {
  if (!activity) return null;

  return (
    <div className="card p-4 shadow mb-4">
      {/* Event Date */}
      <p>
        <strong>Event Date:</strong> {formatDate(activity.eventDate)}
      </p>

      {/* Voting Deadline */}
      <p>
        <strong>Voting Deadline:</strong>{" "}
        {activity.votingDate
          ? formatDate(activity.votingDate)
          : "No deadline (auto-finalized)"}
      </p>

      {/* Finalized badge inside card */}
      {activity.isFinalized && !activity.isCancelled && (
        <p>
          <span className="badge bg-success">Finalized</span>
        </p>
      )}

      {/* Location */}
      <p>
        <strong>Location:</strong> {activity.location}
      </p>

      {/* Cost */}
      <p>
        <strong>Cost:</strong> {activity.cost || "TBD"}
      </p>

      {/* Description */}
      <p>
        <strong>Description:</strong> {activity.description}
      </p>

      {/* Agenda */}
      <p>
        <strong>Agenda:</strong> {activity.agenda}
      </p>

      {/* Contact Info */}
      <p>
        <strong>Contact Info:</strong> {activity.contactInfo}
      </p>

      {/* What to Bring */}
      {activity.whatToBring?.length > 0 && (
        <div className="mt-3">
          <strong>What to Bring:</strong>
          <ul>
            {activity.whatToBring.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        </div>
      )}

      {/* What's Provided */}
      {activity.whatsProvided?.length > 0 && (
        <div className="mt-3">
          <strong>What's Provided:</strong>
          <ul>
            {activity.whatsProvided.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default ActivityInfoCard;
