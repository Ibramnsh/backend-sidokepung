import { Schema, model, Document } from "mongoose";

export interface Ipekerjaan extends Document {
  RT: number;
  RW: number;
  Umur: number;
  "Jenis Kelamin": "Laki-laki" | "Perempuan";
  "Status Pekerjaan Utama": string;
  "Nama Anggota": string;
  "ID Keluarga"?: string;
  Timestamp?: Date;
}

const PekerjaanSchema = new Schema<Ipekerjaan>({
  RT: { type: Number, required: true },
  RW: { type: Number, required: true },
  Umur: { type: Number, required: true },
  "Jenis Kelamin": {
    type: String,
    enum: ["Laki-laki", "Perempuan"],
    required: true,
  },
  "Status Pekerjaan Utama": { type: String, required: true },
  "Nama Anggota": { type: String, required: true },
  "ID Keluarga": { type: String },
  Timestamp: { type: Date, default: Date.now },
});

// Nama model 'Contoh' akan mengarah ke koleksi 'contoh' di MongoDB
const Pekerjaan = model<Ipekerjaan>("pekerjaan", PekerjaanSchema, "pekerjaan");

export default Pekerjaan;
