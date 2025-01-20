
const mongoose = require('mongoose');

const versionSchema = new mongoose.Schema({
    content: String,
    label: { type: String, default: 'No Label' }, // Add label with default value
    timestamp: { type: Date, default: Date.now },
});

const documentSchema = new mongoose.Schema({
    title: { type: String, required: true },
    content: { type: String, default: '' },
    collaborators: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    versions: [versionSchema], // Use the updated schema here
});

module.exports = mongoose.model('Document', documentSchema);


    