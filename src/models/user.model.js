module.exports = (sequelize, Sequelize) => {
    const User = sequelize.define("user", {
      firstname: {
        type: Sequelize.STRING
      },
      lastname: {
        type: Sequelize.STRING
      },
      chat_id:{
        type: Sequelize.BIGINT,
        allowNull: false
      },
      codeforces: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      code_chef: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      leet_code: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      at_coder: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      hacker_rank: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      }
    },{
        freezeTableName: true
    });
  
    return User;
  };