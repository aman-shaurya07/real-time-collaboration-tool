

const express = require('express');
const Document = require('../models/Document');
const authMiddleware = require('../middleware/authMiddleware');
const logger = require('../utils/logger');


const router = express.Router();


router.post('/', authMiddleware, async (req, res) => {
    try {
        const { title, content } = req.body;
        const newDocument = new Document({
            title,
            content,
            collaborators: [req.user.id],
        });
        await newDocument.save();

        // Populate collaborators
        const populatedDocument = await Document.findById(newDocument._id).populate('collaborators', 'email');

        res.status(201).json(populatedDocument);
    } catch (err) {
        res.status(500).json({ message: 'Error creating document', error: err.message });
    }
});







router.get('/', authMiddleware, async (req, res) => {
    try {
        const documents = await Document.find({ collaborators: req.user.id })
            .populate('collaborators', 'email'); // Populate collaborators with their email only
        res.status(200).json(documents);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching documents', error: err.message });
    }
});




// Get a single document by ID
router.get('/:id', authMiddleware, async (req, res) => {
    try {
        const document = await Document.findById(req.params.id);
        if (!document) return res.status(404).json({ message: 'Document not found' });

        if (!document.collaborators.includes(req.user.id)) {
            return res.status(403).json({ message: 'Access denied' });
        }

        res.status(200).json(document);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching document', error: err.message });
    }
});




router.put('/:id', authMiddleware, async (req, res) => {
    try {
        const { content, label } = req.body;
        const document = await Document.findById(req.params.id);

        if (!document) return res.status(404).json({ message: 'Document not found' });
        if (!document.collaborators.includes(req.user.id)) {
            return res.status(403).json({ message: 'Access denied' });
        }

        const newVersion = { content: document.content, label };
        document.versions.push(newVersion);
        document.content = content;

        await document.save();
        // req.app.get('io').to(req.params.id).emit('version-saved', { id: document._id, version: newVersion });

        res.status(200).json(document);
    } catch (err) {
        res.status(500).json({ message: 'Error updating document', error: err.message });
    }
});








router.get('/:id/versions', authMiddleware, async (req, res) => {
    try {
        const document = await Document.findById(req.params.id);

        if (!document) return res.status(404).json({ message: 'Document not found' });
        if (!document.collaborators.includes(req.user.id)) {
            return res.status(403).json({ message: 'Access denied' });
        }

        res.status(200).json(document.versions);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching versions', error: err.message });
    }
});






// In routes/documentRoutes.js
router.get('/:id/versions/:versionId', authMiddleware, async (req, res) => {
    try {
        const document = await Document.findById(req.params.id);
        if (!document) return res.status(404).json({ message: 'Document not found' });

        const version = document.versions.id(req.params.versionId);
        if (!version) return res.status(404).json({ message: 'Version not found' });

        res.status(200).json({ content: version.content });
    } catch (err) {
        res.status(500).json({ message: 'Error fetching version', error: err.message });
    }
});





router.delete('/:id/versions/:versionId', authMiddleware, async (req, res) => {
    try {
        const document = await Document.findById(req.params.id);
        if (!document) return res.status(404).json({ message: 'Document not found' });

        // Remove the version with the specified ID
        const version = document.versions.id(req.params.versionId);
        if (!version) return res.status(404).json({ message: 'Version not found' });

        version.remove(); // Remove the version
        await document.save(); // Save the document after removal

        // Emit an event to notify clients
        req.app.get('io').to(req.params.id).emit('version-deleted', req.params.versionId);

        res.status(200).json({ message: 'Version deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Error deleting version', error: err.message });
    }
});








// Add a collaborator to a document
router.put('/:id/add-collaborator', authMiddleware, async (req, res) => {
    try {
        const { collaboratorEmail } = req.body;
        const document = await Document.findById(req.params.id);

        if (!document) return res.status(404).json({ message: 'Document not found' });
        if (!document.collaborators.includes(req.user.id)) {
            return res.status(403).json({ message: 'Access denied' });
        }

        // Validate if the collaborator exists in the User collection
        const User = require('../models/User');
        const collaborator = await User.findOne({ email: collaboratorEmail });
        if (!collaborator) {
            return res.status(404).json({ message: 'Collaborator not found' });
        }

        // Add the collaborator to the document if not already added
        if (!document.collaborators.includes(collaborator._id)) {
            document.collaborators.push(collaborator._id);
            await document.save();
        }

        res.status(200).json({ message: 'Collaborator added successfully', document });
    } catch (err) {
        res.status(500).json({ message: 'Error adding collaborator', error: err.message });
    }
});




module.exports = router;
