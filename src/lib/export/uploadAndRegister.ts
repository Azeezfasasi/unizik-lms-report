import cloudinary from "@/lib/cloudinary/cloudinary";
import GeneratedReportFile from "@/models/GeneratedReportFile";

type CloudinaryUploadResult = {
  secure_url: string;
};

export async function uploadAndRegister(opts: {
  buffer: Buffer;
  fileName: string;
  format: "PDF" | "DOCX" | "XLSX";
  reportType: "STUDENT" | "LMS_REP" | "PG_COORDINATOR" | "EXAMINER";
  sourceId: string;
  facultyId?: string;
  generatedBy?: string;
}) {
  const uploadResult = await new Promise<CloudinaryUploadResult>((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        { resource_type: "raw", folder: "unizik-lms/generated-reports", public_id: opts.fileName },
        (err, result) => {
          if (err) reject(err);
          else if (result) resolve(result);
    else reject(new Error("Cloudinary upload did not return a result"));
        }
      )
      .end(opts.buffer);
  });

  const record = await GeneratedReportFile.create({
    reportType: opts.reportType,
    sourceId: opts.sourceId,
    format: opts.format,
    fileUrl: uploadResult.secure_url,
    fileName: opts.fileName,
    facultyId: opts.facultyId,
    generatedBy: opts.generatedBy,
  });

  return record;
}
