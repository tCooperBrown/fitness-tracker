exports.up = async function (knex) {
  await knex.schema.alterTable("goal", function (table) {
    table.dropColumn("goalWeight");
  });

  await knex.schema.alterTable("goal", function (table) {
    table
      .integer("goalWeight")
      .unsigned()
      .checkPositive()
      .checkBetween([35, 150]);
  });
};

exports.down = async function (knex) {
  await knex.schema.alterTable("goal", function (table) {
    table.dropColumn("goalWeight");
  });

  await knex.schema.alterTable("goal", function (table) {
    table.decimal("goalWeight", 5, 2);
  });
};
