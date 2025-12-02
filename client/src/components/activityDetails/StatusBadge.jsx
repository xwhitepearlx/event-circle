const StatusBadge = ({ status }) => {
  if (!status) return null;

  const getStatusClass = (s) => {
    switch (s) {
      case "confirmed":
        return "badge bg-success";
      case "declined":
        return "badge bg-danger";
      case "interested":
        return "badge bg-primary";
      case "not_participating":
        return "badge bg-secondary";
      default:
        return "badge bg-secondary";
    }
  };

  const capitalize = (str) =>
    str.charAt(0).toUpperCase() + str.slice(1).replace("_", " ");

  return (
    <span className={`${getStatusClass(status)} ms-2`}>
      {capitalize(status)}
    </span>
  );
};

export default StatusBadge;
