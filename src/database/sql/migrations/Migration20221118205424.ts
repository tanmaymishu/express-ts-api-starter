import { Migration } from '@mikro-orm/migrations'

export class Migration20221118205424 extends Migration {
  async up (): Promise<void> {
    this.addSql('create table "users" ("id" serial primary key, "first_name" varchar(255) not null, "last_name" varchar(255) not null, "email" varchar(255) not null, "password" varchar(255) not null, "created_at" timestamptz(0) not null, "updated_at" timestamptz(0) not null);')
    this.addSql('alter table "users" add constraint "users_email_unique" unique ("email");')
  }

  async down (): Promise<void> {
    this.addSql('drop table if exists "users" cascade;')
  }
}
