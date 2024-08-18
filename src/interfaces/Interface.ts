export interface UserType {
  name: string
  description: string
}
export interface User {
  user_id?: string
  name?: string
  email: string
  password: string
  usertype?: number
  token?: string[] | null
}
// export interface InnerUser extends User {
//   user_id?: string
// }
