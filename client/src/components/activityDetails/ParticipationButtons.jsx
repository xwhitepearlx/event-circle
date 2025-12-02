const ParticipationButtons = ({
  activity,
  isCreator,
  showJoinButton,
  isActivelyParticipating,
  onJoin,
  onLeave,
  onStatusChange,
}) => {
  if (!activity || activity.isCancelled) return null;

  return (
    <div>
      {/* JOIN BUTTON */}
      {showJoinButton && (
        <button className="btn btn-success mt-3" onClick={onJoin}>
          Join Activity
        </button>
      )}

      {/* STATUS BUTTONS */}
      {isActivelyParticipating && (
        <div className="card p-3 mt-3 shadow-sm">
          <h5>Your Status</h5>
          <div className="btn-group">
            <button
              className="btn btn-outline-primary"
              onClick={() => onStatusChange("interested")}
            >
              Interested
            </button>

            <button
              className="btn btn-outline-success"
              onClick={() => onStatusChange("confirmed")}
            >
              Confirmed
            </button>

            <button
              className="btn btn-outline-danger"
              onClick={() => onStatusChange("declined")}
            >
              Declined
            </button>
          </div>
        </div>
      )}

      {/* LEAVE BUTTON */}
      {isActivelyParticipating && !isCreator && (
        <button className="btn btn-outline-danger mt-3" onClick={onLeave}>
          Leave Activity
        </button>
      )}
    </div>
  );
};

export default ParticipationButtons;
