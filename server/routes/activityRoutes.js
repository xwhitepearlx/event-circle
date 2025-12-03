import express from "express";
import { Activity } from "../models/Activity.js";

const router = express.Router();

/* ============================================================================
   Helper: consistent populate
============================================================================ */
const populateActivity = (query) =>
  query
    .populate("createdBy", "name email")
    .populate("participants.user", "name email");

/* ============================================================================
   GET — All activities
============================================================================ */
router.get("/", async (req, res) => {
  try {
    const data = await populateActivity(Activity.find()).exec();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ============================================================================
   GET — Single activity
============================================================================ */
router.get("/:id", async (req, res) => {
  try {
    const activity = await populateActivity(
      Activity.findById(req.params.id)
    ).exec();

    if (!activity)
      return res.status(404).json({ error: "Activity not found." });

    res.json(activity);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ============================================================================
   POST — Create activity
============================================================================ */
router.post("/", async (req, res) => {
  try {
    const { createdBy, isFinalized } = req.body;

    const newActivity = new Activity({
      ...req.body,
      participants: [
        {
          user: createdBy,
          status: "interested",
          availableTimes: [],
        },
      ],
    });

    // If finalized, explicitly set votingDate to null to bypass validation
    if (isFinalized) {
      newActivity.votingDate = null;
      newActivity.isFinalized = true;
    }
    // If not finalized and votingDate is empty string, set to null
    else if (req.body.votingDate === "" || req.body.votingDate === undefined) {
      newActivity.votingDate = null;
    }

    // Call updateStatusByDates AFTER setting votingDate
    newActivity.updateStatusByDates();

    await newActivity.save();

    const populated = await populateActivity(
      Activity.findById(newActivity._id)
    ).exec();

    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ============================================================================
   PUT — Update activity (Creator only)
============================================================================ */
router.put("/:id", async (req, res) => {
  const { userId } = req.body;

  try {
    const activity = await Activity.findById(req.params.id);
    if (!activity) {
      return res.status(404).json({ error: "Activity not found" });
    }

    // Only creator can edit
    if (String(activity.createdBy) !== String(userId)) {
      return res
        .status(403)
        .json({ error: "Only the creator can edit the event" });
    }

    // Check if event is completed (finalized AND event date passed)
    const now = new Date();
    const eventDate = new Date(activity.eventDate);
    const isCompleted = activity.isFinalized && eventDate < now;

    // If event is completed, NO editing allowed
    if (isCompleted) {
      return res.status(400).json({
        error: "This event has been completed and cannot be edited.",
      });
    }

    // Allow to edit description after cancelling
    if (activity.isCancelled) {
      const allowedAfterCancel = ["description", "userId"];
      for (const key of Object.keys(req.body)) {
        if (!allowedAfterCancel.includes(key) && key !== "userId") {
          return res.status(400).json({
            error:
              "This event has been cancelled. Only the description may be edited.",
          });
        }
      }
    }

    // Fields locked if event is finalized (but not completed)
    const lockedIfFinalized = ["eventDate", "location", "votingDate"];

    // Check locked fields if finalized
    if (activity.isFinalized) {
      for (const field of lockedIfFinalized) {
        if (req.body[field] !== undefined) {
          // Convert both to strings for comparison
          const newValue = String(req.body[field]);
          const currentValue = String(activity[field]);

          if (newValue !== currentValue) {
            return res.status(400).json({
              error: `${field} cannot be changed after the event is finalized.`,
            });
          }
        }
      }
    }

    // Validate event date/time if being changed (and allowed)
    if (req.body.eventDate !== undefined && !activity.isFinalized) {
      const newEventDate = new Date(req.body.eventDate);

      // Event date cannot be in the past
      if (newEventDate < now) {
        return res.status(400).json({
          error: "Event date/time cannot be in the past.",
        });
      }

      // If voting date exists, it must be before event date
      if (req.body.votingDate !== undefined) {
        const newVotingDate = new Date(req.body.votingDate);
        if (newVotingDate > newEventDate) {
          return res.status(400).json({
            error: "Voting deadline cannot be after the event date/time.",
          });
        }
      } else if (activity.votingDate) {
        // Check existing voting date against new event date
        const existingVotingDate = new Date(activity.votingDate);
        if (existingVotingDate > newEventDate) {
          return res.status(400).json({
            error:
              "Existing voting deadline would be after the new event date/time.",
          });
        }
      }
    }

    // Validate voting date/time if being changed (and allowed)
    if (req.body.votingDate !== undefined && !activity.isFinalized) {
      if (req.body.votingDate === null || req.body.votingDate === "") {
        // Allow clearing voting date
        req.body.votingDate = null;
      } else {
        const newVotingDate = new Date(req.body.votingDate);

        // Voting date cannot be in the past
        if (newVotingDate < now) {
          return res.status(400).json({
            error: "Voting deadline cannot be in the past.",
          });
        }

        // Voting date must be before event date
        const eventDate = req.body.eventDate
          ? new Date(req.body.eventDate)
          : new Date(activity.eventDate);

        if (newVotingDate > eventDate) {
          return res.status(400).json({
            error: "Voting deadline cannot be after the event date/time.",
          });
        }
      }
    }

    // Fields that can always be edited (depending the status)
    const editableFields = [
      "eventTitle",
      "description",
      "votingDate", 
      "eventDate",   
      "location", 
      "cost",
      "agenda",
      "contactInfo",
      "whatToBring",
      "whatsProvided",
    ];

    // Filter out locked fields if finalized
    const fieldsToCheck = activity.isFinalized
      ? editableFields.filter((field) => !lockedIfFinalized.includes(field))
      : editableFields;

    // Update allowed fields
    let hasChanges = false;
    for (const field of fieldsToCheck) {
      if (req.body[field] !== undefined) {
        const newValue = req.body[field];
        const currentValue = activity[field];

        let valuesDiffer = false;

        // Special handling for arrays
        if (Array.isArray(currentValue)) {
          const newArray = Array.isArray(newValue) ? newValue : [newValue];
          const sortedNew = [...newArray].sort();
          const sortedCurrent = [...currentValue].sort();
          valuesDiffer =
            JSON.stringify(sortedNew) !== JSON.stringify(sortedCurrent);
        }
        // Special handling for dates (allow null)
        else if (field.includes("Date")) {
          const newDate = newValue ? new Date(newValue).toISOString() : null;
          const currentDate = currentValue
            ? new Date(currentValue).toISOString()
            : null;
          valuesDiffer = newDate !== currentDate;
        }
        // Regular fields
        else {
          valuesDiffer =
            String(newValue).trim() !== String(currentValue).trim();
        }

        if (valuesDiffer) {
          activity[field] = newValue;
          hasChanges = true;
        }
      }
    }

    // Only save if there were actual changes
    if (hasChanges) {
      activity.updateStatusByDates();
      await activity.save();
    }

    const updated = await populateActivity(
      Activity.findById(req.params.id)
    ).exec();

    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ============================================================================
   DELETE — Delete activity
============================================================================ */
router.delete("/:id", async (req, res) => {
  const { userId } = req.body;

  try {
    const activity = await Activity.findById(req.params.id);
    if (!activity) return res.status(404).json({ error: "Activity not found" });

    if (String(activity.createdBy) !== String(userId))
      return res
        .status(403)
        .json({ error: "Only the creator can delete this activity" });

    const now = Date.now();
    const oneWeekMs = 7 * 24 * 60 * 60 * 1000;

    const isOnlyCreator =
      activity.participants.length === 1 &&
      String(activity.participants[0].user) === String(userId);

    const isCancelledAndOneWeekPassed =
      activity.isCancelled &&
      activity.cancelledAt &&
      now - new Date(activity.cancelledAt).getTime() >= oneWeekMs;

    if (!isOnlyCreator && !isCancelledAndOneWeekPassed) {
      return res.status(400).json({
        error:
          "You may delete this event only if it has been cancelled for 7+ days or you are the only participant.",
      });
    }

    await Activity.findByIdAndDelete(req.params.id);

    res.json({ message: "Activity deleted successfully." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ============================================================================
   PATCH — Join
============================================================================ */
router.patch("/:id/join", async (req, res) => {
  const { userId } = req.body;

  try {
    const activity = await Activity.findById(req.params.id);
    if (!activity) return res.status(404).json({ error: "Activity not found" });

    const existing = activity.participants.find(
      (p) => p.user.toString() === userId
    );

    if (existing && existing.status !== "not_participating")
      return res.status(400).json({ error: "Already participating" });

    if (existing) {
      existing.status = "interested";
      existing.availableTimes = [];
    } else {
      activity.participants.push({
        user: userId,
        status: "interested",
        availableTimes: [],
      });
    }

    await activity.save();

    const updated = await populateActivity(
      Activity.findById(req.params.id)
    ).exec();

    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ============================================================================
   PATCH — Update status
============================================================================ */
router.patch("/:id/status", async (req, res) => {
  const { userId, status } = req.body;

  try {
    const activity = await Activity.findById(req.params.id);
    if (!activity) return res.status(404).json({ error: "Activity not found" });

    const participant = activity.participants.find(
      (p) => p.user.toString() === userId
    );

    if (!participant)
      return res.status(404).json({ error: "User not a participant" });

    participant.status = status;
    await activity.save();

    const updated = await populateActivity(
      Activity.findById(req.params.id)
    ).exec();

    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ============================================================================
   PATCH — Update availability
============================================================================ */
router.patch("/:id/availability", async (req, res) => {
  const { userId, availableTimes } = req.body;

  try {
    const activity = await Activity.findById(req.params.id);
    if (!activity) return res.status(404).json({ error: "Activity not found" });

    const participant = activity.participants.find(
      (p) => p.user.toString() === userId
    );

    if (!participant)
      return res.status(404).json({ error: "User not a participant" });

    participant.availableTimes = availableTimes || [];
    await activity.save();

    const updated = await populateActivity(
      Activity.findById(req.params.id)
    ).exec();

    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ============================================================================
   PATCH — Finalize
============================================================================ */
router.patch("/:id/finalize", async (req, res) => {
  const { userId } = req.body;

  try {
    const activity = await Activity.findById(req.params.id);
    if (!activity) return res.status(404).json({ error: "Activity not found" });

    if (String(activity.createdBy) !== String(userId))
      return res.status(403).json({ error: "Only the creator can finalize" });

    activity.isFinalized = true;
    await activity.save();

    const updated = await populateActivity(
      Activity.findById(req.params.id)
    ).exec();

    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ============================================================================
   PATCH — Leave
============================================================================ */
router.patch("/:id/leave", async (req, res) => {
  const { userId } = req.body;

  try {
    const activity = await Activity.findById(req.params.id);
    if (!activity)
      return res.status(404).json({ error: "Activity not found." });

    const isCreator = activity.createdBy.toString() === userId;

    if (isCreator) {
      // Creator cannot be removed but can set status
      const entry = activity.participants.find(
        (p) => p.user.toString() === userId
      );
      if (entry) {
        entry.status = "not_participating";
        entry.availableTimes = [];
      }
    } else {
      activity.participants = activity.participants.filter(
        (p) => p.user.toString() !== userId
      );
    }

    await activity.save();

    const updated = await populateActivity(
      Activity.findById(req.params.id)
    ).exec();

    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ============================================================================
   PATCH — Cancel
============================================================================ */
router.patch("/:id/cancel", async (req, res) => {
  const { userId } = req.body;

  try {
    const activity = await Activity.findById(req.params.id);
    if (!activity) return res.status(404).json({ error: "Activity not found" });

    if (String(activity.createdBy) !== String(userId))
      return res
        .status(403)
        .json({ error: "Only the creator can cancel this event" });

    if (activity.isCancelled)
      return res
        .status(400)
        .json({ error: "This event is already cancelled." });

    // Mark activity as cancelled
    activity.isCancelled = true;
    activity.cancelledAt = new Date();
    activity.isFinalized = false;

    // Change all participants status
    activity.participants = activity.participants.map((p) => ({
      ...p.toObject(),
      status: "not_participating",
      availableTimes: [],
    }));

    await activity.save();

    const updated = await populateActivity(
      Activity.findById(req.params.id)
    ).exec();

    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
