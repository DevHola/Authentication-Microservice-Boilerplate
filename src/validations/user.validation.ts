import { body, header } from 'express-validator/check'
export const registerValidation = [
  body('name')
    .exists()
    .withMessage('name is required')
    .isString()
    .withMessage('name should be string'),
  body('email')
    .exists()
    .withMessage('email is required')
    .isEmail()
    .withMessage('Provide valid email'),
  body('password')
    .exists()
    .withMessage('password is required')
    .isString()
    .withMessage('password should be string'),
  body('usertype')
    .exists()
    .withMessage('usertype is required')
    .isNumeric()
    .withMessage('provide valid usertype')
]
export const loginValidation = [
  body('email')
    .exists()
    .withMessage('email is required')
    .isEmail()
    .withMessage('Provide valid email'),
  body('password')
    .exists()
    .withMessage('password is required')
    .isString()
    .isLength({ min: 8 })
    .withMessage('Password must be greater than 8')
]
export const forgetValidation = [
  body('email')
    .exists()
    .withMessage('email is required')
    .isEmail()
    .withMessage('Provide valid email')
]
export const authuservalidation = [
  header('authorization')
    .exists()
    .withMessage('Token is required')
]
export const resetPasswordValidation = [
  body('token')
    .exists()
    .withMessage('Token is required'),
  body('password')
    .exists()
    .withMessage('password is required')
    .isString()
    .withMessage('password should be string')
]
export const refreshAccessTokenValidation = [
  body('token')
    .exists()
    .withMessage('Token is required')
    .not().isEmpty()
    .withMessage('Token is required')
]
export const userVerifyTokenValidation = [
  body('token')
    .exists()
    .withMessage('Token is required')
]
