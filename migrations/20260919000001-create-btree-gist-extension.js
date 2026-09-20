'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.query('CREATE EXTENSION IF NOT EXISTS btree_gist;');
  },

  down: async (queryInterface, Sequelize) => {
    // We typically do not drop extensions in production down migrations to prevent breaking other tables
  }
};
