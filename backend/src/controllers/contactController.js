const AppError = require('../utils/appError');

exports.sendMessage = async (req, res, next) => {
    try {
        const { name, email, subject, message } = req.body;

        if (!name || !email || !subject || !message) {
            return next(new AppError('Veuillez remplir tous les champs', 400));
        }

        // TODO: Send email using sendGrid or similar
        // TODO: Save to database if you want to keep logs of messages

        res.status(200).json({
            status: 'success',
            message: 'Votre message a été envoyé avec succès'
        });
    } catch (err) {
        next(err);
    }
};
