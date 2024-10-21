import Joi from 'joi';

// Validation schema for user registration
const registerValidationSchema = Joi.object({
    username: Joi.string().min(3).trim().required().messages({
        'string.empty': 'Username cannot be empty.',
        'string.min': 'Username must have at least 3 characters.',
        'any.required': 'Username is required.',
    }),
    email: Joi.string().email().trim().required().messages({
        'string.email': 'Invalid email format.',
        'string.empty': 'Email cannot be empty.',
        'any.required': 'Email is required.',
    }),
    password: Joi.string().min(6).trim().required().messages({
        'string.min': 'Password must have at least 6 characters.',
        'string.empty': 'Password cannot be empty.',
        'any.required': 'Password is required.',
    }),
    roles: Joi.string().optional()
});

const loginValidationSchema = Joi.object({
    email: Joi.string().email().trim().required().messages({
        'string.email': 'Invalid email format.',
        'string.empty': 'Email cannot be empty.',
        'any.required': 'Email is required.',
    }),
    password: Joi.string().min(6).trim().required().messages({
        'string.min': 'Password must have at least 6 characters.',
        'string.empty': 'Password cannot be empty.',
        'any.required': 'Password is required.',
    })
});

// Validation schema for creating a song
// const createSongValidationSchema = Joi.object({
//     title: Joi.string().trim().required().messages({
//         'string.empty': 'Song title cannot be empty.',
//         'any.required': 'Song title is required.',
//     }),
//     artist: Joi.string().trim().required().messages({
//         'string.empty': 'Artist name cannot be empty.',
//         'any.required': 'Artist name is required.',
//     }),
//     album: Joi.string().trim().optional(),
//     category: Joi.string().trim().messages({
//         'string.empty': 'Song category cannot be empty.',
//         'any.required': 'Category is required.',
//     }),
//     image: Joi.string().uri().trim().required().messages({
//         'string.empty': 'File URL cannot be empty.',
//         'string.uri': 'Invalid URL format.',
//         'any.required': 'File URL is required.',
//     }),
//     image: Joi.string().uri().trim().required().messages({
//         'string.empty': 'File URL cannot be empty.',
//         'string.uri': 'Invalid URL format.',
//         'any.required': 'File URL is required.',
//     })
// });

// Validation schema for creating an album
// const addAlbumValidationSchema = Joi.object({
//     name: Joi.string().trim().required().messages({
//         'string.empty': 'Album name cannot be empty.',
//         'any.required': 'Album name is required.',
//     }),
//     artist: Joi.string().trim().required().messages({
//         'string.empty': 'Artist name cannot be empty.',
//         'any.required': 'Artist name is required.',
//     }),
//     image: Joi.string().uri().trim().optional().messages({
//         'string.uri': 'Invalid cover image URL format.',
//     }),
//     songs: Joi.array().items(Joi.string()).messages({
//         'array.base': 'Songs must be an array of song IDs.',
//     }),
// });

// Validation schema for creating a category
const createCategoryValidationSchema = Joi.object({
    name: Joi.string().trim().required().messages({
        'string.empty': 'Category name cannot be empty.',
        'any.required': 'Category name is required.',
    }),
    description: Joi.string().trim().optional(),
});

//
const createRoleValidationSchema = Joi.object({
    name: Joi.string().trim().required().messages({
        'string.empty': 'Role name cannot be empty.',
        'any.required': 'Role name is required.',
    }),
    permissions: Joi.array().items(Joi.string()).required().messages({
        'array.base': 'Permissions must be an array of permission strings.',
        'any.required': 'Permissions are required.',
    }),
});
// Export all schemas
export {
    registerValidationSchema,
    loginValidationSchema,
    // createSongValidationSchema,
    // addAlbumValidationSchema,
    createCategoryValidationSchema,
    createRoleValidationSchema
};
