import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  getActivityById,
  joinActivity,
  leaveActivity,
  updateStatus,
  updateAvailability,
  finalizeActivity,
  cancelActivity,
  editActivity,
  deleteActivity,
} from "../api/services/activities";

import ActivityHeader from "../components/activityDetails/ActivityHeader";
import ActivityInfoCard from "../components/activityDetails/ActivityInfoCard";
import CancelledView from "../components/activityDetails/CancelledView";
import CreatorControls from "../components/activityDetails/CreatorControls";
import ParticipantsList from "../components/activityDetails/ParticipantsList";
import UserStatusBox from "../components/activityDetails/UserStatusBox";
import ParticipationButtons from "../components/activityDetails/ParticipationButtons";
import AvailabilityEditor from "../components/activityDetails/AvailabilityEditor";
import ActivityEditForm from "../components/activityDetails/ActivityEditForm";

const ActivityDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const userId = localStorage.getItem("userId");

  const [activity, setActivity] = useState(null);
  const [loading, setLoading] = useState(true);

  // Edit mode state
  const [editMode, setEditMode] = useState(false);
  const [editForm, setEditForm] = useState({});

  // Cancelled description edit (creator only)
  const [editDescription, setEditDescription] = useState("");

  // Availability
  const [availability, setAvailability] = useState("");

  // Fetch activity details
  const loadActivity = async () => {
    try {
      const { data } = await getActivityById(id);
      setActivity(data);
      setLoading(false);
    } catch (err) {
      console.error("Error loading activity:", err);
    }
  };

  useEffect(() => {
    loadActivity();
  }, [id]);

  if (loading) return <p>Loading…</p>;
  if (!activity) return <p>Activity not found.</p>;

  // Helpers
  const formatDate = (dateStr, includeTime = true) => {
    if (!dateStr) return "Not set";

    const date = new Date(dateStr);
    const options = {
      year: "numeric",
      month: "long",
      day: "2-digit",
    };

    if (includeTime) {
      options.hour = "2-digit";
      options.minute = "2-digit";
      options.hour12 = true;
    }

    return date.toLocaleDateString("en-US", options);
  };

  const isCreator = String(activity.createdBy?._id) === String(userId);

  const userEntry = activity.participants.find(
    (p) => String(p.user?._id) === String(userId)
  );

  const showJoinButton = !userEntry || userEntry.status === "not_participating";

  const isActivelyParticipating =
    userEntry && userEntry.status !== "not_participating";

  // -----------------------------
  // BACKEND ACTION HANDLERS
  // -----------------------------

  const handleJoin = async () => {
    try {
      await joinActivity(id, userId);
      await loadActivity();
    } catch (err) {
      console.error("Join error:", err);
    }
  };

  const handleLeave = async () => {
    try {
      await leaveActivity(id, userId);
      await loadActivity();
    } catch (err) {
      console.error("Leave error:", err);
    }
  };

  const handleStatusChange = async (status) => {
    try {
      await updateStatus(id, userId, status);
      await loadActivity();
    } catch (err) {
      console.error("Status error:", err);
    }
  };

  const handleAvailabilityUpdate = async () => {
    try {
      const availableTimes =
        availability.length > 0
          ? availability.split(",").map((s) => s.trim())
          : [];

      await updateAvailability(id, userId, availableTimes);
      await loadActivity();
    } catch (err) {
      console.error("Availability error:", err);
    }
  };

  const handleFinalize = async () => {
    if (!window.confirm("Are you sure you want to finalize this event?"))
      return;
    try {
      await finalizeActivity(id, userId);
      await loadActivity();
    } catch (err) {
      console.error("Finalize error:", err);
    }
  };

  const handleCancelEvent = async () => {
    if (!window.confirm("Cancel this event? This action is permanent.")) return;
    try {
      await cancelActivity(id, userId);
      await loadActivity();
    } catch (err) {
      console.error("Cancel error:", err);
    }
  };

  // Save description (cancelled mode only)
  const handleSaveDescription = async () => {
    try {
      await editActivity(id, {
        description: editDescription,
        userId,
      });
      setEditMode(false);
      await loadActivity();
    } catch (err) {
      console.error("Save description error:", err);
    }
  };

  // Save edit form (normal edit mode)
  const handleSaveEdit = async () => {
    try {
      // Create payload with ONLY the fields that user actually edited
      const payload = { userId };

      // Helper to combine date and time
      const combineDateTime = (dateStr, timeStr) => {
        if (!dateStr) return null;
        return new Date(`${dateStr}T${timeStr || "00:00"}`).toISOString();
      };

      // Helper to extract date from ISO
      const extractDate = (isoString) => {
        if (!isoString) return "";
        return isoString.split("T")[0];
      };

      // Helper to extract time from ISO
      const extractTime = (isoString) => {
        if (!isoString) return "18:00";
        const date = new Date(isoString);
        const hours = String(date.getHours()).padStart(2, "0");
        const minutes = String(date.getMinutes()).padStart(2, "0");
        return `${hours}:${minutes}`;
      };

      // Get current time for validation
      const now = new Date();

      // Check each field against the original activity
      const fieldsToCheck = [
        {
          key: "eventTitle",
          value: editForm.eventTitle,
          original: activity.eventTitle,
        },
        {
          key: "description",
          value: editForm.description,
          original: activity.description,
        },
        { key: "agenda", value: editForm.agenda, original: activity.agenda },
        { key: "cost", value: editForm.cost, original: activity.cost },
        {
          key: "contactInfo",
          value: editForm.contactInfo,
          original: activity.contactInfo,
        },
      ];

      fieldsToCheck.forEach(({ key, value, original }) => {
        if (value !== original) {
          payload[key] = value;
        }
      });

      // Handle event datetime
      const originalEventDate = extractDate(activity.eventDate);
      const originalEventTime = extractTime(activity.eventDate);
      const newEventDateTime = combineDateTime(
        editForm.eventDate,
        editForm.eventTime
      );

      if (
        editForm.eventDate !== originalEventDate ||
        editForm.eventTime !== originalEventTime
      ) {
        // Validate event datetime is not in the past
        if (new Date(newEventDateTime) < now) {
          alert("Event date/time cannot be in the past.");
          return;
        }
        payload.eventDate = newEventDateTime;
      }

      // Handle voting datetime
      const originalVotingDate = activity.votingDate
        ? extractDate(activity.votingDate)
        : "";
      const originalVotingTime = activity.votingDate
        ? extractTime(activity.votingDate)
        : "18:00";
      let newVotingDateTime = null;

      if (editForm.votingDate || activity.votingDate) {
        if (
          editForm.votingDate !== originalVotingDate ||
          editForm.votingTime !== originalVotingTime
        ) {
          if (editForm.votingDate) {
            newVotingDateTime = combineDateTime(
              editForm.votingDate,
              editForm.votingTime
            );

            // Validate voting datetime is not after event datetime
            const eventDateTime = newEventDateTime || activity.eventDate;
            if (new Date(newVotingDateTime) > new Date(eventDateTime)) {
              alert("Voting deadline cannot be after the event date/time.");
              return;
            }

            // Validate voting datetime is not in the past
            if (new Date(newVotingDateTime) < now) {
              alert("Voting deadline cannot be in the past.");
              return;
            }

            payload.votingDate = newVotingDateTime;
          } else {
            // Voting date cleared - set to null
            payload.votingDate = null;
          }
        }
      }

      // Handle trimmed location
      const cleanLocation = editForm.location?.trim();
      const originalLocation = activity.location?.trim();
      if (cleanLocation !== originalLocation) {
        payload.location = cleanLocation;
      }

      // Handle array fields
      const parseArrayFromString = (str) =>
        str
          ?.split(",")
          .map((s) => s.trim())
          .filter((s) => s.length > 0) || [];

      const compareArrays = (arr1, arr2) =>
        JSON.stringify([...arr1].sort()) !== JSON.stringify([...arr2].sort());

      const whatToBringArray = parseArrayFromString(editForm.whatToBring);
      const originalWhatToBring = activity.whatToBring || [];
      if (compareArrays(whatToBringArray, originalWhatToBring)) {
        payload.whatToBring = whatToBringArray;
      }

      const whatsProvidedArray = parseArrayFromString(editForm.whatsProvided);
      const originalWhatsProvided = activity.whatsProvided || [];
      if (compareArrays(whatsProvidedArray, originalWhatsProvided)) {
        payload.whatsProvided = whatsProvidedArray;
      }

      // If only userId is in payload, nothing changed
      if (Object.keys(payload).length === 1) {
        alert("No changes were made.");
        setEditMode(false);
        return;
      }

      await editActivity(id, payload);
      setEditMode(false);
      await loadActivity();
    } catch (err) {
      console.error("Save edit error:", err);
      alert("Failed to save: " + (err.response?.data?.error || err.message));
    }
  };

  const handleDelete = async () => {
    // First check if deletion is allowed
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

    // Show different confirmation messages based on reason
    let confirmMessage = "Delete this activity? This cannot be undone.";
    let deleteReason = "";

    if (
      activity.participants.length === 1 &&
      String(activity.participants[0].user?._id) === String(userId)
    ) {
      confirmMessage = "You are the only participant. Delete this activity?";
      deleteReason = "only_participant";
    } else if (activity.isCancelled && activity.cancelledAt) {
      const daysSinceCancel = Math.floor(
        (Date.now() - new Date(activity.cancelledAt).getTime()) /
          (24 * 60 * 60 * 1000)
      );
      confirmMessage = `This event was cancelled ${daysSinceCancel} days ago. Delete permanently?`;
      deleteReason = "cancelled_week_old";
    }

    // Frontend check
    if (!canDelete()) {
      alert(
        "You cannot delete this event.\n\n" +
          "You may delete an event only if:\n" +
          "• You are the only participant, OR\n" +
          "• The event has been cancelled for 7+ days\n\n" +
          `Current status: ${activity.participants.length} participants, ` +
          `${activity.isCancelled ? `Cancelled` : `Active`}`
      );
      return;
    }

    if (!window.confirm(confirmMessage)) return;

    try {
      await deleteActivity(id, userId);

      // Show success message
      alert("Activity deleted successfully!");
      navigate("/activities");
    } catch (err) {
      console.error("Delete error:", err);

      if (err.response?.status === 400) {
        // Backend validation failed
        alert(`Cannot delete: ${err.response.data.error}`);
      } else if (err.response?.status === 403) {
        alert("You are not authorized to delete this activity.");
      } else if (err.response?.status === 404) {
        alert("Activity not found. It may have already been deleted.");
      } else {
        alert("Failed to delete activity. Please try again.");
      }
    }
  };

  // -----------------------------
  // CANCELLED MODE
  // -----------------------------
  if (activity.isCancelled) {
    return (
      <CancelledView
        activity={activity}
        isCreator={isCreator}
        editMode={editMode}
        editDescription={editDescription}
        setEditMode={setEditMode}
        setEditDescription={setEditDescription}
        handleSaveDescription={handleSaveDescription}
        formatDate={formatDate}
        onDelete={handleDelete}
      />
    );
  }

  // -----------------------------
  // EDIT MODE
  // -----------------------------
  if (editMode) {
    return (
      <ActivityEditForm
        activity={activity}
        editForm={editForm}
        setEditForm={setEditForm}
        onSave={handleSaveEdit}
        onCancel={() => setEditMode(false)}
      />
    );
  }

  // -----------------------------
  // VIEW MODE
  // -----------------------------
  return (
    <div className="container mt-4">
      {/* HEADER */}
      <ActivityHeader
        activity={activity}
        userId={userId}
        formatDate={formatDate}
      />

      {/* INFO CARD */}
      <ActivityInfoCard activity={activity} formatDate={formatDate} />

      {/* CREATOR CONTROLS */}
      {isCreator && !activity.isCompleted && (
        <CreatorControls
          activity={activity}
          onEdit={() => {
            setEditMode(true);

            // Helper to extract date part
            const extractDate = (isoString) => {
              if (!isoString) return "";
              return isoString.split("T")[0];
            };

            // Helper to extract time part
            const extractTime = (isoString) => {
              if (!isoString) return "18:00";
              const date = new Date(isoString);
              const hours = String(date.getHours()).padStart(2, "0");
              const minutes = String(date.getMinutes()).padStart(2, "0");
              return `${hours}:${minutes}`;
            };

            setEditForm({
              eventTitle: activity.eventTitle || "",
              eventDate: extractDate(activity.eventDate),
              eventTime: extractTime(activity.eventDate),
              votingDate: extractDate(activity.votingDate),
              votingTime: extractTime(activity.votingDate),
              location: activity.location || "",
              cost: activity.cost || "",
              description: activity.description || "",
              agenda: activity.agenda || "",
              whatToBring: activity.whatToBring?.join(", ") || "",
              whatsProvided: activity.whatsProvided?.join(", ") || "",
              contactInfo: activity.contactInfo || "",
            });
          }}
          onFinalize={handleFinalize}
          onCancel={handleCancelEvent}
          onDelete={handleDelete}
        />
      )}

      {/* USER STATUS BOX */}
      <UserStatusBox userEntry={userEntry} />

      {/* PARTICIPATION BUTTONS */}
      <ParticipationButtons
        activity={activity}
        isCreator={isCreator}
        showJoinButton={showJoinButton}
        isActivelyParticipating={isActivelyParticipating}
        onJoin={handleJoin}
        onLeave={handleLeave}
        onStatusChange={handleStatusChange}
      />

      {/* AVAILABILITY EDITOR */}
      <AvailabilityEditor
        availability={availability}
        setAvailability={setAvailability}
        isActivelyParticipating={isActivelyParticipating}
        onSaveAvailability={handleAvailabilityUpdate}
      />

      {/* PARTICIPANTS LIST */}
      <div className="mt-4">
        <ParticipantsList activity={activity} />
      </div>
    </div>
  );
};

export default ActivityDetails;
