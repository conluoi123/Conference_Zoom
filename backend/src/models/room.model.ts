import mongoose from "mongoose";

const roomSchema = new mongoose.Schema({
  hostId: {
    type: String,
    required: true,
  },
  attendeesId: {
    type: Array,
    required: true,
  },
});

const Room = mongoose.model("Room", roomSchema);

export default Room;
