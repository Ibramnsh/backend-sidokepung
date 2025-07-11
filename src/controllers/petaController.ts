import type { Request, Response } from "express";
import Rts from "../models/PetaModel";
import Pekerjaan from "../models/PekerjaanModel";

export const getPetaData = async (req: Request, res: Response) => {
  try {
    const docs = await Rts.find({ type: "FeatureCollection" }).lean();

    const dominantGenderData = await Pekerjaan.aggregate([
      {
        $group: {
          _id: { rt: "$RT", rw: "$RW", jenisKelamin: "$Jenis Kelamin" },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { "_id.rt": 1, "_id.rw": 1, count: -1 },
      },
      {
        $group: {
          _id: { rt: "$_id.rt", rw: "$_id.rw" },
          mostDominantGender: { $first: "$_id.jenisKelamin" },
          mostDominantGenderCount: { $first: "$count" },
          totalPopulation: { $sum: "$count" },
        },
      },
      {
        $project: {
          _id: 0,
          rt: "$_id.rt",
          rw: "$_id.rw",
          mostDominantGender: 1,
          mostDominantGenderCount: 1,
          totalPopulation: 1,
        },
      },
    ]);

    const genderMap = new Map();
    dominantGenderData.forEach((item) => {
      genderMap.set(`${item.rt}-${item.rw}`, {
        gender: item.mostDominantGender,
        count: item.mostDominantGenderCount,
        total: item.totalPopulation,
      });
    });

    const features = docs.flatMap((doc) => {
      if (!doc.features || !Array.isArray(doc.features)) {
        return [];
      }
      return doc.features.map((feature) => {
        const originalProps = feature.properties;
        const nmsls = originalProps.nmsls || "";
        const rtMatch = nmsls.match(/RT\s(\S+)/);
        const rwMatch = nmsls.match(/RW\s(\S+)/);
        const dusunMatch = nmsls.match(/DUSUN\s(.+)/i);

        const rtGeoJson = rtMatch ? Number.parseInt(rtMatch[1], 10) : null;
        const rwGeoJson = rwMatch ? Number.parseInt(rwMatch[1], 10) : null;
        const dusun = dusunMatch ? dusunMatch[1].trim() : "-";

        const dominantInfo =
          rtGeoJson !== null && rwGeoJson !== null
            ? genderMap.get(`${rtGeoJson}-${rwGeoJson}`)
            : null;

        return {
          ...feature,
          properties: {
            ...originalProps,
            RT: rtMatch ? rtMatch[1] : "-",
            RW: rwMatch ? rwMatch[1] : "-",
            dusun: dusun,
            kecamatan: originalProps.nmkec || "-",
            nmdesa: originalProps.nmdesa || "Data Tidak Tersedia",
            dominantGender: dominantInfo ? dominantInfo.gender : null,
            dominantGenderCount: dominantInfo ? dominantInfo.count : 0,
            totalPopulation: dominantInfo ? dominantInfo.total : 0,
          },
        };
      });
    });

    const geojson = {
      type: "FeatureCollection",
      features: features,
    };

    res.json(geojson);
  } catch (error) {
    console.error("Error fetching GeoJSON data:", error);
    res.status(500).send("Failed to fetch GeoJSON data from MongoDB.");
  }
};
