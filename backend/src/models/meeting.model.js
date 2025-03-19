import mongoose from "mongoose"

export const meetingSchema = mongoose.model({
    code: { type: String, unique: true, required: true },
    pdfUrl: { type: String, required: true },
    annotations: { type: Array, default: [] },
    createdAt: { type: Date, default: Date.now }
})

const Meeting = mongoose.model("Meeting", meetingSchema);
export default Meeting;