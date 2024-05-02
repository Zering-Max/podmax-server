import { Model, ObjectId, Schema, model, models } from "mongoose";

interface FavoriteDocument {
  owner: ObjectId;
  items: ObjectId[];
}

const FavoriteSchema = new Schema<FavoriteDocument>({
  owner: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  items: [
    {
      type: Schema.Types.ObjectId,
      ref: "Audio",
    },
  ],
}, {
  timestamps: true
});

const Favorite = models.Favorite || model("Favorite", FavoriteSchema)

export default Favorite as Model<FavoriteDocument>
