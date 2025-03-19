import Meeting from "../models/meeting.model";

export const createMeeting = async (req,res) => {
    try {
        const { pdfUrl } = await req.body;
        const code = uuidv4();  // Generate unique meeting code
        const meeting = new Meeting({ code, pdfUrl });
        await meeting.save();
        res.json({ code });
    }
    catch (error) {
        console.log("Error in signup controller", error.message);
        res.status(500).json({ message: "Internal Server ERROR!!" });   
    }
}

export const joinMeeting = async (req,res) => {
    try {
        const meeting = await Meeting.findOne({ code: req.params.code });
        if (!meeting) return res.status(404).json({ error: "Meeting not found" });
        res.json(meeting);
    } catch (error) {
        console.log("Error in joinMeeting controller: "+error);
        res.status(500).json({message: "Internal Server ERROR!!"})
    }
}