import type { Request, Response } from "express"
import mongoose from "mongoose"
import Pekerjaan from "../models/PekerjaanModel"
import { connectDB } from "../config/db"

// READ
export const getPekerjaanData = async (req: Request, res: Response) => {
  try {
    console.log("🔄 Starting getPekerjaanData...")

    // Test database connection first
    await connectDB()
    console.log("✅ Database connection successful")

    const { rt, rw } = req.query
    const query: any = { "Jenis Kelamin": { $exists: true } }

    if (rt && rw) {
      query.RT = Number.parseInt(rt as string, 10)
      query.RW = Number.parseInt(rw as string, 10)
      console.log(`🔍 Filtering by RT: ${rt}, RW: ${rw}`)
    }

    console.log("📋 Query:", JSON.stringify(query))

    // Check if collection exists
    const collections = await mongoose.connection.db.listCollections().toArray()
    console.log(
      "📚 Available collections:",
      collections.map((c) => c.name),
    )

    const dataFromDb = await Pekerjaan.find(query).lean()
    console.log(`📊 Found ${dataFromDb.length} records`)

    if (dataFromDb.length === 0) {
      console.log("⚠️ No data found in database")
      return res.json({
        message: "No data found",
        query: query,
        availableCollections: collections.map((c) => c.name),
      })
    }

    const transformedData = dataFromDb.map((item) => ({
      _id: item._id,
      rt: String(item.RT),
      rw: String(item.RW),
      umur: item.Umur,
      jenis_kelamin: item["Jenis Kelamin"],
      status_pekerjaan_utama: item["Status Pekerjaan Utama"],
      nama_anggota: item["Nama Anggota"],
    }))

    console.log("✅ Data transformed successfully")
    res.json(transformedData)
  } catch (error) {
    console.error("❌ Error in getPekerjaanData:", error)
    console.error("Error stack:", error.stack)

    res.status(500).json({
      error: "Failed to fetch data from MongoDB",
      details: error.message,
      type: error.name,
      code: error.code || "UNKNOWN",
    })
  }
}

// CREATE
export const createPekerjaanData = async (req: Request, res: Response) => {
  try {
    const { rt, rw, umur, jenis_kelamin, status_pekerjaan_utama, nama_anggota } = req.body

    if (!rt || !rw || !umur || !jenis_kelamin || !status_pekerjaan_utama || !nama_anggota) {
      return res.status(400).json({ message: "All fields including dusun must be filled." })
    }

    const newData = new Pekerjaan({
      RT: Number.parseInt(rt),
      RW: Number.parseInt(rw),
      Umur: Number.parseInt(umur),
      "Jenis Kelamin": jenis_kelamin,
      "Status Pekerjaan Utama": status_pekerjaan_utama,
      "Nama Anggota": nama_anggota,
      "ID Keluarga": "KEL_BARU",
    })

    const result = await newData.save()
    res.status(201).json({
      message: "Data added successfully",
      insertedId: result._id,
    })
  } catch (error) {
    console.error("Failed to add data:", error)
    res.status(500).json({ message: "Failed to add data to the database." })
  }
}

// UPDATE
export const updatePekerjaanData = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const { rt, rw, umur, jenis_kelamin, status_pekerjaan_utama, nama_anggota } = req.body

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid ID." })
    }

    const updatedData: any = {
      RT: Number.parseInt(rt),
      RW: Number.parseInt(rw),
      Umur: Number.parseInt(umur),
      "Jenis Kelamin": jenis_kelamin,
      "Status Pekerjaan Utama": status_pekerjaan_utama,
      "Nama Anggota": nama_anggota,
    }

    const result = await Pekerjaan.findByIdAndUpdate(id, updatedData, {
      new: true,
    })

    if (!result) {
      return res.status(404).json({ message: "Data not found." })
    }

    res.json({ message: "Data updated successfully." })
  } catch (error) {
    console.error("Failed to update data:", error)
    res.status(500).json({ message: "Failed to update data in the database." })
  }
}

// DELETE
export const deletePekerjaanData = async (req: Request, res: Response) => {
  try {
    const { id } = req.params

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid ID." })
    }

    const result = await Pekerjaan.findByIdAndDelete(id)

    if (!result) {
      return res.status(404).json({ message: "Data not found." })
    }

    res.json({ message: "Data deleted successfully." })
  } catch (error) {
    console.error("Failed to delete data:", error)
    res.status(500).json({ message: "Failed to delete data from the database." })
  }
}
