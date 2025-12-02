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
    const { createdBy } = req.body;

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
   PUT — Update activity (Creator only) - WITHOUT MIDDLEWARE
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

    // Fields that can always be edited
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

    // Fields locked if event is finalized
    const lockedIfFinalized = ["eventDate", "location", "votingDate"];

    // Check locked fields first
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

    // Update allowed fields
    let hasChanges = false;
    for (const field of editableFields) {
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
        // Special handling for dates
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
          "You may delete this event only if it has been cancelled for 7+ days OR you are the only participant.",
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