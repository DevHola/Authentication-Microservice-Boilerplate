export interface UserType {
  name: string
  description: string
}
export interface User {
  user_id?: string
  name?: string
  email: string
  isverified?: boolean
  password: string
  usertype?: number
  token?: string[] | null
}
export interface mail {
  to: string
  content: string
  subject: string
  from: string
}

// export interface InnerUser extends User {
//   user_id?: string
// }
