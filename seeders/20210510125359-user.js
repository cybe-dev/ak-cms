"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    /**
     * Add seed commands here.
     *
     * Example:
     * await queryInterface.bulkInsert('People', [{
     *   name: 'John Doe',
     *   isBetaMember: false
     * }], {});
     */
    await queryInterface.bulkInsert("users", [
      {
        fullname: "Admin",
        password:
          "$2y$12$0ixpgn.fCRfOi/ep7CMTrOM6kJbbK57BbDRcFVH2R1Lh2O.mQIsxG",
        email: "admin@example.com",
      },
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */

    await queryInterface.bulkDelete("users", {
      id: 1,
    });
  },
};
