
const Support = require('../models/support.model');
const excludedUserFields = '-firstName -lastName -balance -password -dateofBirth -friends -followers -version -permissions -address -teams -socials -updatedAt -requests -purchasedItems -stats -gameAccounts -badgeRef -parties -mobileNumber -__v';

const getMySupportTicketsService = async (id) => {
    const support = await Support.find({ issuedBy: id })
                                .sort({createdAt: -1})
                                .populate({
                                    path: 'issuedBy',
                                    select: excludedUserFields
                                })
                                .select('-thread')
                                .lean();
    return support;
}

const getAllSupportTicketsService = async (id) => {
    const support = await Support.find({})
                                .sort({createdAt: -1})
                                .populate({
                                    path: 'issuedBy',
                                    select: excludedUserFields
                                })
                                .select('-thread')
                                .lean();
    return support;
}

const getSupportTicketDetailsService = async (id) => {
    const support = await Support.findOne({ _id: id })
                                .populate({
                                    path: 'issuedBy',
                                    select: excludedUserFields
                                })
                                .populate({
                                    path: 'solvedBy',
                                    select: excludedUserFields
                                })
                                .populate({
                                    path: 'thread.author', 
                                    select: excludedUserFields
                                })
                                .lean();
    return support;
}

const createSupportTicketService = async (data) => {
    const newComment = { comment: data.desc,  author: data.issuedBy};
    console.log(newComment);

    const support = await Support.create({
        issuedBy: data.issuedBy,
        title: data.title,
        tag: data.tag,
        thread: [newComment] // Add the new thread to the thread array
    });

    console.log(support);
    return support;
}

const createSupportCommentService = async (id, data) => {
    const support = await Support.findOneAndUpdate(
        { _id: id },
        { $inc: { version: 1 }, $push: { 'thread': data } },
        { new: true }
    );

    return support;
};

const updateSupportStatusService = async (id, solvedBy) => {
    const currentSupport = await Support.findById(id);

    const updatedSupport = {
        ...currentSupport.toObject(),
        solvedBy: solvedBy,
        status: 'solved',
        version: currentSupport.version + 1 // increment the version field
    };

    const result = await Support.findByIdAndUpdate({ _id: id }, updatedSupport, {
      new: true,
      runValidators: true
    });
    return result;
}

module.exports = {
    getMySupportTicketsService,
    getAllSupportTicketsService,
    getSupportTicketDetailsService,
    createSupportTicketService,
    createSupportCommentService,
    updateSupportStatusService
}