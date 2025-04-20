import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1745119255044 implements MigrationInterface {
    name = 'InitialSchema1745119255044'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."check_in_usertype_enum" AS ENUM('corporate', 'provider', 'visitor')`);
        await queryRunner.query(`CREATE TABLE "check_in" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "userType" "public"."check_in_usertype_enum" NOT NULL DEFAULT 'visitor', "accessGranted" boolean NOT NULL DEFAULT false, "reason" character varying, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "userId" uuid, "parkingId" uuid, CONSTRAINT "PK_9c026e16735aea10812a3888d6c" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "user" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "username" character varying NOT NULL, "password" character varying NOT NULL, CONSTRAINT "UQ_78a916df40e02a9deb1c4b75edb" UNIQUE ("username"), CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "check_in" ADD CONSTRAINT "FK_bf6f31f3f4c20b7cd20b6e674f6" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "check_in" ADD CONSTRAINT "FK_c088c1e754dae89be73eca578c7" FOREIGN KEY ("parkingId") REFERENCES "parking"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "check_in" DROP CONSTRAINT "FK_c088c1e754dae89be73eca578c7"`);
        await queryRunner.query(`ALTER TABLE "check_in" DROP CONSTRAINT "FK_bf6f31f3f4c20b7cd20b6e674f6"`);
        await queryRunner.query(`DROP TABLE "user"`);
        await queryRunner.query(`DROP TABLE "check_in"`);
        await queryRunner.query(`DROP TYPE "public"."check_in_usertype_enum"`);
    }

}
