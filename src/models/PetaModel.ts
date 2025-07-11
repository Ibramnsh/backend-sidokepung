import { Schema, model, Document } from "mongoose";

interface IFeature extends Document {
  type: string;
  properties: { [key: string]: any };
  geometry: {
    type: string;
    coordinates: any[];
  };
}

interface IFeatureCollection extends Document {
  type: string;
  features: IFeature[];
}

const FeatureSchema = new Schema(
  {
    type: { type: String, required: true, default: "Feature" },
    properties: { type: Schema.Types.Mixed, required: true },
    geometry: {
      type: { type: String, required: true },
      coordinates: { type: Schema.Types.Mixed, required: true },
    },
  },
  { _id: false }
);

const FeatureCollectionSchema = new Schema<IFeatureCollection>({
  type: { type: String, required: true, default: "FeatureCollection" },
  features: [FeatureSchema],
});

// Nama model 'Rts' akan mengarah ke koleksi 'rts' di MongoDB
const Rts = model<IFeatureCollection>("Rts", FeatureCollectionSchema, "rts");

export default Rts;
