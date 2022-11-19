import { Entity, Property, PrimaryKey } from '@mikro-orm/core'

@Entity({ tableName: 'users' })
export class User {
  @PrimaryKey()
    id!: number

  @Property()
    firstName!: string

  @Property()
    lastName!: string

  @Property({
    unique: true
  })
    email!: string

  @Property()
    password!: string

  @Property()
    createdAt: Date = new Date()

  @Property({ onUpdate: () => new Date() })
    updatedAt: Date = new Date()
}
