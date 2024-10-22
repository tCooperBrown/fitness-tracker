exports.up = async function (knex) {
  await knex.schema.createTable("users", (table) => {
    table.increments("id");
    table.string("email").notNullable().unique();
    table.string("passwordHash").notNullable();
    table.string("firstName", 50);
    table.string("lastName", 50);
    table.date("joinDate").notNullable().defaultTo(knex.fn.now());
    table.integer("height");
    table.enu("gender", ["male", "female"]);
    table.date("dateOfBirth");
    table.timestamps(true, true);
  });

  await knex.schema.createTable("scale_weight", (table) => {
    table.increments("id");
    table
      .integer("userId")
      .notNullable()
      .references("users.id")
      .onDelete("CASCADE");
    table.decimal("weight", 5, 2);
    table.datetime("createdAt").notNullable().defaultTo(knex.fn.now());
  });

  await knex.schema.createTable("goal", (table) => {
    table.increments("id");
    table
      .integer("userId")
      .notNullable()
      .references("users.id")
      .onDelete("CASCADE");
    table.decimal("goalWeight", 5, 2);
    table.date("startDate").notNullable();
    table.date("endDate");
    table.enu("goalType", ["loss", "gain", "maintain"]);
    table.date("optimisticETA");
    table.timestamps(true, true);
  });
};

exports.down = async function (knex) {
  await knex.schema.dropTable("users");
  await knex.schema.dropTable("scale_weight");
  await knex.schema.dropTable("goal");
};
