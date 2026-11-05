import mongoose from "mongoose";

const projectSchema = new mongoose.Schema({
    projectId: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        index: true,
    },

    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true,
    },

    sandboxId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Sandbox',
        required: true,
        index: true,
    },



    name: {
        type: String,
        required: true,
        trim: true,
        default:" "
    },

    description: {
        type: String,
        trim: true,
        default:" "
    },

    status:{
        type: String,
        enum: ['running', 'stopped'],
        default: 'stopped',
    },

    createdAt: {
        type: Date,
        default: Date.now,
    },



});


const ProjectModel = mongoose.model("Project", projectSchema);

export default ProjectModel;