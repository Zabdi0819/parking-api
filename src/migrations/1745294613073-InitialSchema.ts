import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1745294613073 implements MigrationInterface {
    name = 'InitialSchema1745294613073'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."user_usertype_enum" AS ENUM('corporate', 'provider', 'visitor')`);
        await queryRunner.query(`ALTER TABLE "user" ADD "userType" "public"."user_usertype_enum" NOT NULL DEFAULT 'visitor'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "userType"`);
        await queryRunner.query(`DROP TYPE "public"."user_usertype_enum"`);
    }

}
