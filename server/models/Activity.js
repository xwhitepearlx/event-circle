import mongoose from "mongoose";

/* ============================================================================
   PARTICIPANT SUB-SCHEMA
============================================================================ */
const participantSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    availableTimes: {
      type: [String], // Example: ["Mon 2PM", "Fri evening"]
      default: [],
    },

    status: {
      type: String,
      enum: ["interested", "confirmed", "declined", "not_participating"],
      default: "interested",
    },

    joinedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

/* ============================================================================
   ACTIVITY SCHEMA
============================================================================ */
const activitySchema = new mongoose.Schema(
  {
    /* -------------------- Basic Info -------------------- */
    eventTitle: {
      type: String,
      required: [true, "Event title is required."],
      trim: true,
    },

    description: {
      type: String,
      default: "",
    },

    /* -------------------- Dates -------------------- */
    votingDate: {
      type: Date,
      default: null,
      validate: {
        validator: function (val) {
          // allow null OR votingDate <= eventDate
          return !val || val <= this.eventDate;
        },
        message: "Voting date cannot be after the event date.",
      },
    },

    eventDate: {
      type: Date,
      required: [true, "Event date is required."],
    },

    /* -------------------- Status Flags -------------------- */
    isFinalized: {
      type: Boolean,
      default: false,
    },

    isCancelled: {
      type: Boolean,
      default: false,
    },

    cancelledAt: {
      type: Date,
      default: null,
    },

    /* -------------------- Event Details -------------------- */
    location: {
      type: String,
      required: [true, "Location is required."],
      trim: true,
    },

    cost: {
      type: String,
      default: "TBD",
    },

    whatToBring: {
      type: [String],
      default: [],
    },

    whatsProvided: {
      type: [String],
      default: [],
    },

    agenda: {
      type: String,
      default: "",
    },

    contactInfo: {
      type: String,
      default: "",
    },

    /* -------------------- Creator -------------------- */
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Creator user ID is required."],
    },

    /* -------------------- Participants -------------------- */
    participants: {
      type: [participantSchema],
      default: [],
    },
  },
  { timestamps: true }
);

/* ============================================================================
   METHOD — Auto-cancel & auto-finalize logic
============================================================================ */
activitySchema.methods.updateStatusByDates = function () {
  const now = new Date();

  // Only update if not already cancelled
  if (!this.isCancelled) {
    // Rule 1 — If no voting date, auto-finalize
    if (!this.votingDate) {
      this.isFinalized = true;
    }

    // Rule 2 — If votingDate < now AND eventDate < now → auto-cancel
    if (this.votingDate && this.eventDate) {
      const votingDate = new Date(this.votingDate);
      const eventDate = new Date(this.eventDate);

      if (now > votingDate && now > eventDate) {
        this.isCancelled = true;
        this.isFinalized = false;
        this.cancelledAt = now;
      }
    }
  }
};


export const Activity = mongoose.model("Activity", activitySchema);