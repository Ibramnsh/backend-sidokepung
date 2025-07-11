import type { Request, Response } from "express"
import mongoose from "mongoose"
import Pekerjaan from "../models/PekerjaanModel"
import connectDB from "../config/db"

// READ
export const getPekerjaanData = async (req: Request, res: Response) => {
  try {
    console.log("🔄 Starting getPekerjaanData...")

    // Ensure database connection
    await connectDB()

    // Wait a bit for connection to stabilize
    if (mongoose.connection.readyState !== 1) {
      console.log("⏳ Waiting for database connection...")
      await new Promise((resolve) => setTimeout(resolve, 1000))
    }

    if (mongoose.connection.readyState !== 1) {
      throw new Error("Database not connected after waiting")
    }

    console.log("✅ Database connection confirmed")

    const { rt, rw } = req.query
    const query: any = { "Jenis Kelamin": { $exists: true } }

    if (rt && rw) {
      query.RT = Number.parseInt(rt as string, 10)
      query.RW = Number.parseInt(rw as string, 10)
      console.log(`🔍 Filtering by RT: ${rt}, RW: ${rw}`)
    }

    console.log("📋 Query:", JSON.stringify(query))

    // Try to get data with timeout
    const dataFromDb = (await Promise.race([
      Pekerjaan.find(query).lean().exec(),
      new Promise((_, reject) => setTimeout(() => reject(new Error("Query timeout")), 8000)),
    ])) as any[]

    console.log(`📊 Found ${dataFromDb.length} records`)

    if (dataFromDb.length === 0) {
      // Try to get any data to check if collection exists
      const anyData = await Pekerjaan.findOne().lean().exec()
      console.log("🔍 Any data exists:", !!anyData)

      return res.json({
        message: "No data found with current query",
        query: query,
        hasAnyData: !!anyData,
        totalCount: await Pekerjaan.countDocuments(),
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

    res.status(500).json({
      error: "Failed to fetch data from MongoDB",
      details: error.message,
      type: error.name,
      mongooseState: mongoose.connection.readyState,
      dbHost: mongoose.connection.host,
      dbName: mongoose.connection.name,
    })
  }
}

// CREATE
export const createPekerjaanData = async (req: Request, res: Response) => {
  try {
    await connectDB()

    const { rt, rw, umur, jenis_kelamin, status_pekerjaan_utama, nama_anggota } = req.body

    if (!rt || !rw || !umur || !jenis_kelamin || !status_pekerjaan_utama || !nama_anggota) {
      return res.status(400).json({ message: "All fields must be filled." })
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
    res.status(500).json({
      message: "Failed to add data to the database.",
      error: error.message,
    })
  }
}

// UPDATE
export const updatePekerjaanData = async (req: Request, res: Response) => {
  try {
    await connectDB()

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
    await connectDB()

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
