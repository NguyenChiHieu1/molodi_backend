import Joi from 'joi';

const validate = (schema) => {
    return (req, res, next) => {
        const { error } = schema.validate(req.body); // Validate request body
        if (error) {
            return res.status(400).json({ message: error.details[0].message }); // Nếu có lỗi, trả về thông báo
        }
        next();
    };
};

export default validate;
