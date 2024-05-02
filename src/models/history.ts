import { Model, ObjectId, Schema, model, models } from "mongoose";

export type historyType = { audioId: ObjectId; progress: number; date: Date };

interface HistoryDocument {
  owner: ObjectId;
  last: historyType;
  all: historyType[];
}

const HistorySchema = new Schema<HistoryDocument>(
  {
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    last: {
      audioId: { type: Schema.Types.ObjectId, ref: "Audio" },
      progress: Number,
      date: {
        type: Date,
        required: true,
      },
    },
    all: [
      {
        audioId: { type: Schema.Types.ObjectId, ref: "Audio" },
        progress: Number,
        date: {
          type: Date,
          required: true,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

const History = models.History || model("History", HistorySchema);

export default History as Model<HistoryDocument>;
