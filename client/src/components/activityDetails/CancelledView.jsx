import StatusBadge from "./StatusBadge";

const CancelledView = ({
  activity,
  isCreator,
  editMode,
  editDescription,
  setEditMode,
  setEditDescription,
  handleSaveDescription,
  formatDate,
  onDelete,
}) => {
  if (!activity) return null;

  return (
    <div>
      {/* CANCELLED ALERT */}
      <h2>{activity.eventTitle}</h2>

      <div className="alert alert-danger mt-3">
        <strong>This event has been cancelled.</strong>
      </div>

      <div className="d-flex gap-3 mt-2">
        {/* CREATOR EDIT DESCRIPTION BUTTON */}
        {isCreator && !editMode && (
          <button
            className="btn btn-warning my-3"
            onClick={() => setEditMode(true)}
          >
            Edit Description
          </button>
        )}
        {/* DELETE BUTTON */}
        {isCreator && (
          <button
            className="btn btn-danger my-3"
            onClick={() => {
              if (confirm("Delete this activity permanently?")) {
                onDelete();
              }
            }}
          >
            Delete Activity
          </button>
        )}
      </div>
      {/* EDIT DESCRIPTION MODE */}
      {isCreator && editMode && (
        <div className="card p-3 my-3">
          <label className="form-label">Description</label>
          <textarea
            className="form-control"
            rows={3}
            value={editDescription}
            onChange={(e) => setEditDescription(e.target.value)}
          ></textarea>

          <div className="d-flex gap-3 mt-3">
            <button className="btn btn-primary" onClick={handleSaveDescription}>
              Save
            </button>
            <button
              className="btn btn-secondary"
              onClick={() => setEditMode(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* READ-ONLY INFO CARD */}
      <div className="card p-4 shadow mt-3">
        <p>
          <strong>Date:</strong> {formatDate(activity.eventDate)}
        </p>
        <p>
          <strong>Location:</strong> {activity.location}
        </p>
        <p>
          <strong>Cost:</strong> {activity.cost}
        </p>
        <p>
          <strong>Description:</strong> {activity.description}
        </p>

        {/* What to Bring */}
        {activity.whatToBring?.length > 0 && (
          <>
            <strong>What to Bring:</strong>
            <ul>
              {activity.whatToBring.map((x, i) => (
                <li key={i}>{x}</li>
              ))}
            </ul>
          </>
        )}

        {/* What's Provided */}
        {activity.whatsProvided?.length > 0 && (
          <>
            <strong>What's Provided:</strong>
            <ul>
              {activity.whatsProvided.map((x, i) => (
                <li key={i}>{x}</li>
              ))}
            </ul>
          </>
        )}
      </div>

      {/* READ-ONLY PARTICIPANTS */}
      <div className="card p-4 shadow mt-4">
        <h4>Participants</h4>

        <ul className="list-group">
          {activity.participants.map((p, i) => (
            <li key={i} className="list-group-item">
              <strong>{p.user?.name || "Unknown User"}</strong>

              {/* Creator Badge */}
              {String(activity.createdBy?._id) === String(p.user?._id) && (
                <span className="badge bg-info text-dark ms-2">Creator</span>
              )}

              {/* Status badge (hide not_participating) */}
              {p.status !== "not_participating" && (
                <StatusBadge status={p.status} />
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default CancelledView;
