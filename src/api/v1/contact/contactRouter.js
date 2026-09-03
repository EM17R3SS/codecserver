const express = require('express');
const router = express.Router();
const contactController = require('./contactController');
const validate = require('../../middlewares/validate');
const { contactSchema, bulkDeleteSchema } = require('./contactValidation');
const auth = require('../../middlewares/auth');
const rbac = require('../../middlewares/rbac');

router.post(
    '/',
    validate(contactSchema),
    contactController.submitContact,
);

router.use(auth);

router.get(
    '/admin/stats',
    rbac('admin'),
    contactController.getStats,
);

router.get(
    '/admin/messages',
    rbac('admin'),
    contactController.getAllMessages,
);

router.get(
    '/admin/messages/:id',
    rbac('admin'),
    contactController.getMessage,
);

router.patch(
    '/admin/messages/:id/read',
    rbac('admin'),
    contactController.markAsRead,
);

router.patch(
    '/admin/messages/:id/replied',
    rbac('admin'),
    contactController.markAsReplied,
);

router.post(
    '/admin/messages/delete-bulk',
    rbac('admin'),
    validate(bulkDeleteSchema),
    contactController.deleteMessages,
);

router.delete(
    '/admin/messages/:id',
    rbac('admin'),
    contactController.deleteMessage,
);

module.exports = router;
