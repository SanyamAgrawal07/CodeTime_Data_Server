module.exports = (sequelize, Sequelize) => {
    const apidata = sequelize.define("apidata", {
      codeforces: {
        type: Sequelize.ARRAY(Sequelize.JSON),
      },
      code_chef: {
        type: Sequelize.ARRAY(Sequelize.JSON) 
      },
      leet_code: {
        type: Sequelize.ARRAY(Sequelize.JSON)
      },
      at_coder: {
        type: Sequelize.ARRAY(Sequelize.JSON)
      },
      hacker_rank: {
        type: Sequelize.ARRAY(Sequelize.JSON)
      }
    },{
        freezeTableName: true
    });
  
    return apidata;
  };