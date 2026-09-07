const contactService = require('../../../core/services/contactServices');
const catchAsync = require('../../../lib/catchAsync');
const logger = require('../../../config/logger');

const submitContact = catchAsync(async (req, res) => {
    const { name, email, message } = req.body;

    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.get('user-agent') || null;

    const savedMessage = await contactService.submitMessage({
        name,
        email,
        message,
        ipAddress,
        userAgent,
    });

    logger.info(
        `Contact form submission: ${email} (${name}) - ID: ${savedMessage._id}`,
    );

    res.status(201).json({
        success: true,
        message: 'Message submitted successfully. We will get back to you soon.',
        data: {
            id: savedMessage._id,
        },
    });
});

const getAllMessages = catchAsync(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const status = req.query.status || null;

    const result = await contactService.getAllMessages(page, limit, status);

    res.json({
        success: true,
        data: result.messages,
        pagination: {
            page: result.page,
            pages: result.pages,
            total: result.total,
        },
    });
});

const getMessage = catchAsync(async (req, res) => {
    const message = await contactService.getMessageById(req.params.id);

    if (message.status === 'new') {
        await contactService.markAsRead(req.params.id);
    }

    res.json({
        success: true,
        data: message,
    });
});

const markAsRead = catchAsync(async (req, res) => {
    const message = await contactService.markAsRead(req.params.id);

    logger.info(`Contact message marked as read: ${req.params.id}`);

    res.json({
        success: true,
        message: 'Message marked as read',
        data: message,
    });
});

const markAsReplied = catchAsync(async (req, res) => {
    const message = await contactService.markAsReplied(req.params.id);

    logger.info(`Contact message marked as replied: ${req.params.id}`);

    res.json({
        success: true,
        message: 'Message marked as replied',
        data: message,
    });
});

const deleteMessage = catchAsync(async (req, res) => {
    await contactService.deleteMessage(req.params.id);

    logger.warn(`Contact message deleted: ${req.params.id}`);

    res.json({
        success: true,
        message: 'Message deleted',
    });
});

const deleteMessages = catchAsync(async (req, res) => {
    const { ids } = req.body;

    await contactService.deleteMessages(ids);

    logger.warn(`Contact messages deleted: ${ids.join(', ')}`);

    res.json({
        success: true,
        message: `Deleted ${ids.length} messages`,
    });
});

const getStats = catchAsync(async (req, res) => {
    const stats = await contactService.getStats();

    res.json({
        success: true,
        data: stats,
    });
});

module.exports = {
    submitContact,
    getAllMessages,
    getMessage,
    markAsRead,
    markAsReplied,
    deleteMessage,
    deleteMessages,
    getStats,
};
