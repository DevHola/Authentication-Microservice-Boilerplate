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
export interface token {
  token_id?: string
  hash: string
  token_type_id: number
  user_id: string
  issued_at: string
}
export interface token_type {
  token_type_id?: string
  name: string

}
// export interface InnerUser extends User {
//   user_id?: string
// }
