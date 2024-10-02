import { body, header } from 'express-validator'
export const registerValidation = [
  body('name')
    .exists({ checkNull: true, checkFalsy: true })
    .withMessage('name is required')
    .not().isEmpty().withMessage('name should not be empty')
    .isString()
    .withMessage('name should be string'),
  body('email')
    .exists({ checkNull: true, checkFalsy: true })
    .withMessage('email is required')
    .not().isEmpty().withMessage('email should not be empty')
    .isEmail()
    .withMessage('Provide valid email'),
  body('password')
    .exists({ checkNull: true, checkFalsy: true })
    .withMessage('password is required')
    .not().isEmpty().withMessage('password should not be empty')
    .isString()
    .withMessage('password should be string')
    .isLength({ min: 8 })
    .withMessage('password should be 8 characters above'),
  body('usertype')
    .exists({ checkNull: true, checkFalsy: true })
    .withMessage('usertype is required')
    .not().isEmpty().withMessage('usertype should not be empty')
    .isNumeric()
    .withMessage('provide valid usertype')
]
export const loginValidation = [
  body('email')
    .exists({ checkNull: true, checkFalsy: true })
    .withMessage('email is required')
    .isEmail()
    .withMessage('Provide valid email'),
  body('password')
    .exists({ checkNull: true, checkFalsy: true })
    .withMessage('password is required')
    .isString()
    .withMessage('password must be string')
    .isLength({ min: 8 })
    .withMessage('Password must be greater than 8')
]
export const forgetValidation = [
  body('email')
    .exists({ checkNull: true, checkFalsy: true })
    .withMessage('email is required')
    .isEmail()
    .withMessage('Provide valid email')
    .not().isEmpty().withMessage('email is required')
]
export const authuservalidation = [
  header('authorization')
    .exists({ checkNull: true, checkFalsy: true })
    .withMessage('Token is required')
    .not().isEmpty().withMessage('token is required')
]
export const resetPasswordValidation = [
  body('token')
    .exists({ checkNull: true, checkFalsy: true })
    .withMessage('Token is required'),
  body('password')
    .exists({ checkNull: true, checkFalsy: true })
    .withMessage('password is required')
    .isString()
    .withMessage('password should be string')
]
export const refreshAccessTokenValidation = [
  body('token')
    .exists({ checkNull: true, checkFalsy: true })
    .withMessage('Token is required')
    .not().isEmpty().withMessage('Token should not be empty')
]
export const userVerifyTokenValidation = [
  body('token')
    .exists({ checkNull: true, checkFalsy: true })
    .withMessage('Token is required')
    .not().isEmpty().withMessage('Token should not be empty')
]
