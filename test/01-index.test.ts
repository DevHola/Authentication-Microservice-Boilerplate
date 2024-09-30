import request from 'supertest'
import app from '../src/app'
import {beforeAll, describe, expect, it} from '@jest/globals';
let authToken: string;
let realToken: string;
beforeAll(async () => {
    const res_register = await request(app)
        .post('/api/v1/auth/public/register')
        .send({
            email:'fawaz0633@gmail.com',
            password:'12345678',
            name: 'TEST',
            usertype: 1
        })
        expect(res_register.statusCode).toBe(200)
        expect(res_register.body).toHaveProperty('message')
        expect(res_register.body.message).toBe("Registration successful. A verification mail has been sent to fawaz0633@gmail.com");

        const res_login = await request(app)
        .post('/api/v1/auth/public/login')
        .send({
            email: 'fawaz0633@gmail.com',
            password:'12345678'
        })
        expect(res_login.statusCode).toBe(403)
        expect(res_login.body.status).toBe(false)
        expect(res_login.body.message).toBe('Your email address is not verified. A verification mail has been sent to your mail.')
        authToken = res_login.body.token;
    })
describe('VERIFY & LOGIN - ENDPOINT', () => {

    it('verify', async () => {
        const verify = await request(app)
        .post('/api/v1/auth/public/verification')
        .send({
            token: authToken
        })
        expect(verify.statusCode).toBe(200)
    })
    it('login', async() => {
        //login after verify
        const afterverify_login = await request(app)
        .post('/api/v1/auth/public/login')
        .send({
            email: 'fawaz0633@gmail.com',
            password:'12345678'
        })
        expect(afterverify_login.statusCode).toBe(200)
        expect(afterverify_login.body.status).toBe(true)
        realToken = afterverify_login.body.token;
    })
})
let resettoken: string
describe('AUTH USER - FORGET & RESET PASSWORD - Endpoint', () => {
    it('Auth user', async () => {
        const verify = await request(app)
        .post('/api/v1/auth/protected/token')
        .set('authorization', `Bearer ${realToken}`)
        expect(verify.statusCode).toBe(200)
        
    })
    it('Forget Password - Endpoint', async () => {
        const forget = await request(app)
        .post('/api/v1/auth/public/forget')
        .send({
            email: 'fawaz0633@gmail.com'
        })
        expect(forget.statusCode).toBe(200)
        expect(forget.body.message).toBe('Reset Code has been sent to your mail')
        resettoken = forget.body.token
    })
    it('Forget Password - Endpoint', async () => {
        const forget = await request(app)
        .post('/api/v1/auth/public/forget')
        .send({
            email: 'fawaz06343@gmail.com'
        })
        expect(forget.statusCode).toBe(409)
        expect(forget.body.message).toBe('User does not exist')

    })
    it('Password Reset', async () => {
        const reset = await request(app)
        .post('/api/v1/auth/public/password/reset')
        .send({
            password:'123456789',
            token: resettoken
        })
        expect(reset.statusCode).toBe(200)
        expect(reset.body.message).toBe('Password Reset Successful')

    })
})
let refresh: string
let realToken1: string
describe('REFRESH TOKEN - AUTH USER - LOGOUT - Endpoint', ()=> {
    it('Login', async() => {
        //login after verify
        const allverify_login = await request(app)
        .post('/api/v1/auth/public/login')
        .send({
            email: 'fawaz0633@gmail.com',
            password:'123456789'
        })
        expect(allverify_login.statusCode).toBe(200)
        expect(allverify_login.body.status).toBe(true)
        realToken1 = allverify_login.body.token;
    })
    it('Refreshtoken', async () => {
        const token = await request(app)
        .post('/api/v1/auth/public/refresh')
        .send({
            token: realToken1
        })
        expect(token.statusCode).toBe(200)
        refresh = token.body.token;
    })
    it('Authenticated User', async () => {
        const verify = await request(app)
        .post('/api/v1/auth/protected/token')
        .set('authorization', `Bearer ${refresh}`)
        expect(verify.statusCode).toBe(200)
        
    })

    it('Logout', async () => {
        const logout = await request(app)
        .post('/api/v1/auth/protected/logout')
        .set('authorization', `Bearer ${refresh}`)
        expect(logout.statusCode).toBe(200)
        expect(logout.body.message).toBe('Logged out')
    })
})
describe('ALREADT REGISTERED & MISSING DATA ENDPOINT', () => {
    it('Already registered', async () => {
        const res_register = await request(app)
        .post('/api/v1/auth/public/register')
        .send({
            email:'fawaz0633@gmail.com',
            password:'12345678',
            name: 'TEST',
            usertype: 1
        })
        expect(res_register.statusCode).toBe(409)
        expect(res_register.body.error).toBeDefined()
        expect(res_register.body.error).toBe("User already exists");
    })
    it('REGISTER - Missing Datas', async () => {
        const res_register = await request(app)
        .post('/api/v1/auth/public/register')
        .send({
            email:'fawaz0633@gmail.com',
            password:'12345678',
            name: '',
            usertype: ''
        })
        expect(res_register.statusCode).toBe(404)
        expect(res_register.body.errors).toBeDefined()
       
    })
    it('LOGIN - Missing Datas', async () => {
        const res_login = await request(app)
        .post('/api/v1/auth/public/login')
        .send({
            email:'fawaz0633@gmail.com',
            password:'',
        })
        expect(res_login.statusCode).toBe(404)
        expect(res_login.body.errors).toBeDefined()
    })
    it('LOGIN - User not found', async () => {
        const res_login = await request(app)
        .post('/api/v1/auth/public/login')
        .send({
            email:'fawaz07633@gmail.com',
            password:'1234567808',
        })
        expect(res_login.statusCode).toBe(404)
        expect(res_login.body.error).toBeDefined()
        expect(res_login.body.error).toBe('User not found')
    })
    it('LOGIN - wrong password', async () => {
        const res_login = await request(app)
        .post('/api/v1/auth/public/login')
        .send({
            email:'fawaz0633@gmail.com',
            password:'1234567808',
        })
        expect(res_login.statusCode).toBe(401)
        expect(res_login.body.error).toBeDefined()
        expect(res_login.body.error).toBe('Invalid Credentials')
    })
    it('Forget Password - missing data', async () => {
        const forget = await request(app)
        .post('/api/v1/auth/public/forget')
        .send({
            email: ''
        })
        expect(forget.statusCode).toBe(404)
        expect(forget.body.error).toBeDefined()
    })
    // FOR UN-AUTHORISED USER & MISSING DATA
    // FOR REFRESH MISSING DATA & AUTH FAILED
    // FOR VERIFY USER MISSING DATA & AUTH FAILED
    // FOR RESETPASSWORD MISSING DATA & ERROR
})
